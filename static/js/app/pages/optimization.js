define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'app/charts',
  'app/utils',
  'app/sim',
  'app/views/controls'
], function ($, _, Backbone, d3, Charts, Utils, SimModel, ControlsView) {
  'use strict';
  
  var OptimizationPage = Backbone.View.extend({
    charts: {},

    events: {
      'click #btn-track': 'toggleTracker',
      'click #btn-random': 'randomize',
      'click #btn-clear': 'clearHistory',
      'click #btn-start': 'startLoop',
      'click #btn-stop': 'stopLoop',
      'click #btn-optimal': 'loadOptimal'
    },

    initialize: function(options) {
      console.log('Initialize: OptimizationPage');
      
      this.dispatcher = options.dispatcher;

      this.controlsView = new ControlsView({model: this.model, el: this.$('#controls'), dispatcher: this.dispatcher});

      this.simModel = new SimModel();

      this.isRunning = false;
      this.tracking = false;
      this.optimalSimIndex = null;
      this.optimalParams = {};
      this.history = [];
      this.loadingExisting = false;
      this.simModelReady = false;

      this.initSliders();
      this.initCharts();
      
      this.listenTo(this.model, 'change:input', this.setInput);
      this.listenTo(this.model, 'change', this.updateSliders);
      this.listenTo(this.model, 'change', this.render);

      this.render();

      this.dispatcher.trigger('status', 'Ready!');
    },

    setInput: function(model, response, options) {
      this.simModelReady = true;
      this.simModel.setInput(this.model.get('input'), this.model.get('latitude'));
    },

    clearHistory: function() {
      this.history.length = 0;
      this.optimalSimIndex = null;
      this.optimalParams = {};
      this.render();
    },

    randomize: function() {
      var $a = this.$('param-a'),
          $b = this.$('param-b'),
          $c = this.$('param-c'),
          $d = this.$('param-d');

      var params = {
        a: Math.random()*0.02 + 0.98,
        b: Math.random()*9 + 1,
        c: Math.random(),
        d: Math.random()*0.2
      };

      this.setParams(params);
    },

    setParams: function(params) {
      this.model.set(params);
    },

    startLoop: function() {
      var that = this;
      if (!this.loopId) {
        console.log('Starting monte carlo');
        this.isRunning = true;
        this.loopId = setInterval(function() {
          that.randomize();
        }, 1);
        this.dispatcher.trigger('status', 'Running...');
      }
    },

    stopLoop: function() {
      if (this.loopId) {
        console.log('Stopping monte carlo');
        this.isRunning = false;
        clearInterval(this.loopId);
        this.loopId = null;
        
        if (!this.isRunning) {
          if (!this.model.isNew() && this.model.hasChanged()) {
            this.dispatcher.trigger('status', 'Unsaved changes...');
          } else {
            this.dispatcher.trigger('status', 'Ready!');
          }  
        }
      }
    },

    loadOptimal: function() {
      if (this.optimalSimIndex !== null) {
        console.log('Loading optimal: ', this.optimalSimIndex);
        this.loadSimulation(_.omit(this.history[this.optimalSimIndex], 'rmse'));
      }
    },

    toggleTracker: function() {
      // console.log('toggle tracker');
      var that = this;
      
      this.tracking = !this.tracking;
      
      d3.select("#btn-track").classed("btn-success", this.tracking).classed("btn-danger", !this.tracking);
      d3.select("#btn-track").text(function() {
        if (that.tracking) {
          return "Tracking On";
        } else {
          return "Tracking Off";
        }
      });
    },

    initSliders: function() {
      var that = this;     
      this.updateSliders();
      this.$(".slider").change(function() {
        that.$("#param-"+this.name).text(this.value);
        that.model.set(this.name, +this.value);
      });
    },

    updateSliders: function() {
      var that = this;
      this.$(".slider").each(function() {
        this.value = +that.model.get(this.name);
        that.$("#param-"+this.name).text(this.value);
      });
    },

    render: function() {
      var numberFormat = d3.format("4.4f");
      if (this.simModelReady) {
        // run the model
        this.simModel.run(this.model);

        // compute stats of current run
        var stats = Utils.statsGOF(this.simModel.output, 'obsQ', 'Q');

        // create object for current simulation
        var currentSim = {
            a: this.model.get('a'),
            b: this.model.get('b'),
            c: this.model.get('c'),
            d: this.model.get('d'),
            A0: this.model.get('A0'),
            S0: this.model.get('S0'),
            G0: this.model.get('G0'),
            e: this.model.get('e'),
            rmse: stats.rmse
          };

        if (this.tracking && !this.loadingExisting) {
          // tracking is on and not loading an existing simulation

          // add current run to history
          this.history.push(currentSim);

          if (this.history.length === 1 || currentSim.rmse < this.history[this.optimalSimIndex].rmse) {
            // console.log('Setting optimal: ', this.history.length-1);
            // if this is the only run so far
            // or if current rmse is less than existing optimal rmse

            // update optimal index 
            this.optimalSimIndex = this.history.length-1;

            // update optimal parameter set
            this.optimalParams = this.history[this.optimalSimIndex];

            // update optimal flow in simModel output data
            this.simModel.output.forEach(function(d) {
              d.optQ = d.Q;
            });
          }
        }

        if (!this.tracking && this.history.length === 0) {
          // if not tracking
          // update optimal parameter set
          this.optimalParams = currentSim;

          this.simModel.output.forEach(function(d) {
            d.optQ = d.Q;
          });
        }

        d3.select("#chart-line").call(this.charts.Line.data(this.simModel.output));

        if (this.loadingExisting) {
          // toggle loadingExisting if it is on
          this.loadingExisting = false;
        }
        
        d3.select("#chart-a").call(this.charts.A
          .data(this.history)
          .optimal([this.optimalParams])
          .highlight([currentSim]));
        d3.select("#chart-b").call(this.charts.B
          .data(this.history)
          .optimal([this.optimalParams])
          .highlight([currentSim]));
        d3.select("#chart-c").call(this.charts.C
          .data(this.history)
          .optimal([this.optimalParams])
          .highlight([currentSim]));
        d3.select("#chart-d").call(this.charts.D
          .data(this.history)
          .optimal([this.optimalParams])
          .highlight([currentSim]));

        this.$("#stat-n").text(this.history.length);
        this.$("#stat-rmse").text(numberFormat(stats.rmse));
        this.$("#stat-nse").text(numberFormat(stats.nse));
      }

      if (!this.isRunning) {
        if (!this.model.isNew() && this.model.hasChanged()) {
          this.dispatcher.trigger('status', 'Unsaved changes...');
        } else {
          this.dispatcher.trigger('status', 'Ready!');
        }  
      }
    },

    loadSimulation: function (params) {
      this.loadingExisting = true;
      this.setParams(params);
    },

    initCharts: function() {
      // var circleFill = function(d, i) {
      //   return (i === this.tracker.optimal) ? 'red' : 'black';
      // }
      var that = this;
      
      var circleClick = function(d, i) {
        that.loadSimulation(_.omit(d, 'rmse'));
      };

      this.charts.Line = Charts.ZoomableTimeseriesLineChart()
          .x(function(d) { return d.Date; })
          .width(580)
          .height(200)
          .yVariables(['obsQ', 'optQ', 'Q'])
          .yVariableLabels({
            'obsQ': 'Obs Flow (in/d)',
            'optQ': 'Optimal Sim Flow (in/d)',
            'Q': 'Current Sim Flow (in/d)'
          })
          .yDomain([0.001, 2])
          .yScale(d3.scale.log())
          .color(this.model.colors);

        this.charts.A = Charts.DottyChart()
          .x(function(d) { return d.a; })
          .y(function(d) { return d.rmse; })
          .width(280)
          .height(200)
          .r(2)
          .opacity(0.5)
          .click(circleClick)
          .xDomain([0.98, 1])
          .yLabel('RMSE')
          .xLabel('Parameter a');

        this.charts.B = Charts.DottyChart()
          .x(function(d) { return d.b; })
          .y(function(d) { return d.rmse; })
          .width(280)
          .height(200)
          .r(2)
          .opacity(0.5)
          .click(circleClick)
          .xDomain([1, 10])
          .yLabel('RMSE')
          .xLabel('Parameter b');

        this.charts.C = Charts.DottyChart()
          .x(function(d) { return d.c; })
          .y(function(d) { return d.rmse; })
          .width(280)
          .height(200)
          .r(2)
          .opacity(0.5)
          .click(circleClick)
          .xDomain([0, 1])
          .yLabel('RMSE')
          .xLabel('Parameter c');

        this.charts.D = Charts.DottyChart()
          .x(function(d) { return d.d; })
          .y(function(d) { return d.rmse; })
          .width(280)
          .height(200)
          .r(2)
          .opacity(0.5)
          .click(circleClick)
          .xDomain([0, 0.2])
          .yLabel('RMSE')
          .xLabel('Parameter d');
    }

  });

  return OptimizationPage;
});
