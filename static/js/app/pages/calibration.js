define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'app/charts',
  'app/utils',
  'app/sim',
  'app/views/soil_theory_chart',
  'app/views/gw_theory_chart',
  'app/views/controls'
], function ($, _, Backbone, d3, Charts, Utils, SimModel, SoilTheoryChart, GWTheoryChart, ControlsView) {
  'use strict';
  
  var CalibrationPage = Backbone.View.extend({
    charts: {},

    events: {},

    initialize: function(options) {
      console.log('Initialize: CalibrationPage');
      
      this.dispatcher = options.dispatcher;

      this.controlsView = new ControlsView({model: this.model, el: this.$('#controls'), dispatcher: this.dispatcher});

      this.soilChart = new SoilTheoryChart({
        model: this.model, 
        id: 'chart-soil', 
        width: 270, 
        height: 200,
        yLabel: ' '
      });

      this.gwChart = new GWTheoryChart({
        model: this.model,
        id: 'chart-gw', 
        width: 270, 
        height: 200,
        yLabel: ' '
      });

      this.simModel = new SimModel();

      this.initCharts();
      this.initSliders();

      this.render();

      this.listenToOnce(this.model, 'sync', this.checkInput);
      this.listenTo(this.model, 'change:input', this.checkInput);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change', this.updateSliders);

      this.dispatcher.on('focus', this.focusTheory.bind(this));
      
      this.dispatcher.trigger('status', 'Ready!');
    },

    focusTheory: function(x) {      
      if (x !== undefined) {
        var input = this.model.get('input');
        var i = 0, len = input.length;
        
        var output = this.simModel.run(this.model);

        for (; i < (len-1); i++) {
          if (input[i+1].Date > x) {
            break;
          }
        }

        this.model.set("PET", input[i].PET_in);

        this.soilChart.focus(output[i].W);
        this.gwChart.focus(output[i].W);
      } else {
        this.soilChart.focus();
        this.gwChart.focus();
      }
    },

    checkInput: function(model, response, options) {
      model = model || this.model;
      if (model.get('input') && model.get('input').length === 0) {
        this.dispatcher.trigger('alert', 'No input data found, go to Data tab and load new data', 'danger', 5000);
      }
      this.simModel.setInput(this.model.get('input'));
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
      if (this.model.get('input') && this.model.get('input').length > 0) {
        var output = this.simModel.run(this.model);
        
        var stats = this.computeStats(output, 'Flow_in', 'Q');
        
        d3.select("#chart-line").call(this.charts.Line.data(output));
        d3.select("#chart-scatter").call(this.charts.Scatter.data(output));
        // d3.select("#chart-cdf").call(this.charts.CDF.data(this.simModel.output));

        this.$("#stat-rmse").text(numberFormat(stats.rmse));
        this.$("#stat-nse").text(numberFormat(stats.nse));

        
        var attrs = _.without(d3.keys(this.model.changedAttributes()), 'PET');
        if (!this.model.isNew() && this.model.hasChanged() && attrs.length > 0) {
          this.dispatcher.trigger('status', 'Unsaved changes...');
        } else {
          this.dispatcher.trigger('status', 'Ready!');
        }
      }
    },

    computeStats: function(data, obs, sim) {
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

    initCharts: function() {
      console.log(Charts);
      var that = this;
      this.charts.Line = Charts.ZoomableTimeseriesLineChart()
        .x(function(d) { return d.Date; })
        .width(570)
        .height(200)
        .yVariables(['Flow_in', 'Q'])
        .yDomain([0.001, 2])
        .yScale(d3.scale.log())
        .color(this.model.colors)
        .yLabel('Observed and Simulated (Red) Streamflow (in/day)')
        .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
        .onMouseout(function(x) { that.dispatcher.trigger('focus'); });

      this.charts.Scatter = Charts.ScatterChart()
        .x(function(d) { return d.Flow_in; })
        .y(function(d) { return d.Q; })
        .width(285)
        .height(305)
        .r(2)
        .opacity(0.5)
        .yDomain([0.001, 2])
        .xDomain([0.001, 2])
        .xScale(d3.scale.log())
        .yScale(d3.scale.log())
        .one2one(true)
        .yLabel('Simulated Streamflow (in/d)')
        .xLabel('Observed Streamflow (in/d)');

      // this.charts.CDF = Charts.CDFChart()
      //   .width(285)
      //   .height(305)
      //   .yScale(d3.scale.log())
      //   .yDomain([0.001, 2])
      //   .yVariables(['Flow_in', 'Q'])
      //   .color(this.model.colors)
      //   .yLabel('CDF of Obs. and Sim. (Red) Streamflow')
      //   .xLabel('Cumulative Frequency');

    }

  });

  return CalibrationPage;
});
