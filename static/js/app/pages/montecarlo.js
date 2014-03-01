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
  
  var MonteCarloPage = Backbone.View.extend({
    charts: {},

    events: {
      'click #btn-track': 'toggleTracker',
      'click #btn-random': 'randomize',
      'click #btn-reset': 'resetHistory',
      'click #btn-start': 'startLoop',
      'click #btn-stop': 'stopLoop',
      'click #btn-optimal': 'loadOptimal'
    },

    initialize: function(options) {
      console.log('Initialize: MonteCarloPage');
      
      this.dispatcher = options.dispatcher;

      this.controlsView = new ControlsView({model: this.model, el: this.$('#controls'), dispatcher: this.dispatcher});

      this.isRunning = false;
      this.tracking = false;
      this.optimal = 0;
      this.history = [];
      this.loadingExisting = false;

      this.colors = d3.scale.ordinal()
        .range([this.model.colors('Q'), "black"])
        .domain(['Q', 'Flow_in']);

      this.initSliders();
      this.initCharts();

      this.listenToOnce(this.model, 'sync', this.checkInput);
      this.listenTo(this.model, 'change', this.updateSliders);
      this.listenTo(this.model, 'change', this.render);

      this.listenToOnce(this.model, 'change:input', this.initSim);

      this.render();
      // this.randomize();

      this.dispatcher.trigger('status', 'Ready!');
    },

    checkInput: function(model, response, options) {
      model = model || this.model;
      if (model.get('input') && model.get('input').length === 0) {
        this.dispatcher.trigger('alert', 'No input data found, go to Data tab and load new data', 'danger', 5000);
      }
    },

    resetHistory: function() {
      this.history.length = 0;
      this.optimal = 0;
      this.render();
    },

    initSim: function() {
      this.simModel = new SimModel(this.model.get('input'));
    },

    randomize: function() {
      var $a = this.$('param-a'),
          $b = this.$('param-b'),
          $c = this.$('param-c'),
          $d = this.$('param-d');

      // console.log($a);

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
      if (this.optimal) {
        this.loadSimulation(_.omit(this.history[this.optimal], 'rmse'));
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
      // console.log('Rendering...');
      var numberFormat = d3.format("4.4f");
      if (this.model.get('input') && this.model.get('input').length) {
        this.simModel.run(this.model);

        var stats = this.compute_stats(this.simModel.output, 'Flow_in', 'Q');

        d3.select("#chart-line").call(this.charts.Line.data(this.simModel.output));

        var currentSim = {
            a: this.model.get('a'),
            b: this.model.get('b'),
            c: this.model.get('c'),
            d: this.model.get('d'),
            rmse: stats.rmse
          };

        if (this.tracking && !this.loadingExisting) {
          this.history.push(currentSim);

          if (stats.rmse < this.history[this.optimal].rmse) {
            this.optimal = this.history.length-1;
          }
        }

        if (this.loadingExisting) {
          this.loadingExisting = false;
        }

        this.optimalParams = this.history.length > 0 ? [this.history[this.optimal]] : [];
        
        d3.select("#chart-a").call(this.charts.A
          .data(this.history)
          .optimal(this.optimalParams)
          .highlight([currentSim]));
        d3.select("#chart-b").call(this.charts.B
          .data(this.history)
          .optimal(this.optimalParams)
          .highlight([currentSim]));
        d3.select("#chart-c").call(this.charts.C
          .data(this.history)
          .optimal(this.optimalParams)
          .highlight([currentSim]));
        d3.select("#chart-d").call(this.charts.D
          .data(this.history)
          .optimal(this.optimalParams)
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

    compute_stats: function(data, obs, sim) {
      var log10 = function(x) {
        return Math.log(x)*Math.LOG10E;
      };

      var log_resid2 = data.map(function(d) {
        return Math.pow(log10(d[obs]) - log10(d[sim]), 2);
      });

      var log_obs = _.pluck(data, obs).map(function(d) {
        return log10(d);
      });

      var mse = Utils.mean(log_resid2);

      return {
        rmse: Math.sqrt(mse),
        nse: 1 - mse / Utils.variance(log_obs)
      };
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
        console.log(d);
        that.loadSimulation(_.omit(d, 'rmse'));
      };

      this.charts.Line = Charts.ZoomableTimeseriesLineChart()
          .x(function(d) { return d.Date; })
          .width(800)
          .height(200)
          .yVariables(['Flow_in', 'Q'])
          .yDomain([0.001, 2])
          .yScale(d3.scale.log())
          .color(this.colors)
          .yLabel('Observed (Black), Simulated (Red), and Optimal (blue) Streamflow (in/day)');


        this.charts.A = Charts.DottyChart()
          .x(function(d) { return d.a; })
          .y(function(d) { return d.rmse; })
          .width(200)
          .height(185)
          .r(2)
          .opacity(0.5)
          // .fill(circleFill)
          .click(circleClick)
          .xDomain([0.98, 1])
          .yLabel('RMSE')
          .xLabel('Parameter a');

        this.charts.B = Charts.DottyChart()
          .x(function(d) { return d.b; })
          .y(function(d) { return d.rmse; })
          .width(200)
          .height(185)
          .r(2)
          .opacity(0.5)
          // .fill(circleFill)
          .click(circleClick)
          .xDomain([1, 10])
          .yLabel('RMSE')
          .xLabel('Parameter b');

        this.charts.C = Charts.DottyChart()
          .x(function(d) { return d.c; })
          .y(function(d) { return d.rmse; })
          .width(200)
          .height(185)
          .r(2)
          .opacity(0.5)
          // .fill(circleFill)
          .click(circleClick)
          .xDomain([0, 1])
          .yLabel('RMSE')
          .xLabel('Parameter c');

        this.charts.D = Charts.DottyChart()
          .x(function(d) { return d.d; })
          .y(function(d) { return d.rmse; })
          .width(200)
          .height(185)
          .r(2)
          .opacity(0.5)
          // .fill(circleFill)
          .click(circleClick)
          .xDomain([0, 0.2])
          .yLabel('RMSE')
          .xLabel('Parameter d');
    }

  });

  return MonteCarloPage;
});
