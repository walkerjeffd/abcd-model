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

      this.listenToOnce(this.model, 'sync', this.checkInput);
      this.listenTo(this.model, 'change:input', this.setInput);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change', this.updateSliders);

      this.dispatcher.on('focus', this.focusTheory.bind(this));
      
      this.dispatcher.trigger('status', 'Ready!');
    },

    focusTheory: function(x) {
      if (x !== undefined) {
        var input = this.model.get('input');
        var i = 0, len = input.length;
        
        // find date of current mouse position
        for (; i < (len-1); i++) {
          if (input[i+1].Date > x) {
            break;
          }
        }

        this.model.set("PET", this.simModel.output[i].PET);

        this.soilChart.focus(this.simModel.output[i].W);
        this.gwChart.focus(this.simModel.output[i].WGW);
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
    },

    setInput: function(model, response, options) {
      this.simModel.setInput(this.model.get('input'), this.model.get('latitude'));
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
      if (this.model.get('input') && this.model.get('input').length > 0 && _.without(d3.keys(this.model.changedAttributes()), 'PET').length > 0) {
        this.simModel.run(this.model);
        
        var stats = Utils.statsGOF(this.simModel.output, 'obsQ', 'Q');
        
        d3.select("#chart-line").call(this.charts.Line.data(this.simModel.output));
        d3.select("#chart-scatter").call(this.charts.Scatter.data(this.simModel.output));
        d3.select("#chart-cdf").call(this.charts.CDF.data(this.simModel.output));

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

    initCharts: function() {
      var that = this;
      this.charts.Line = Charts.ZoomableTimeseriesLineChart()
        .x(function(d) { return d.Date; })
        .width(570)
        .height(200)
        .yVariables(['obsQ', 'Q'])
        .yVariableLabels(this.model.variableLabels)
        .yDomain([0.001, 2])
        .yScale(d3.scale.log())
        .color(this.model.colors)
        .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
        .onMouseout(function(x) { that.dispatcher.trigger('focus'); });

      this.charts.Scatter = Charts.ScatterChart()
        .x(function(d) { return d.obsQ; })
        .y(function(d) { return d.Q; })
        .width(275)
        .height(295)
        .r(2)
        .opacity(0.5)
        .yDomain([0.001, 2])
        .xDomain([0.001, 2])
        .xScale(d3.scale.log())
        .yScale(d3.scale.log())
        .one2one(true)
        .yLabel('Sim Flow (in/d)')
        .xLabel('Obs Flow (in/d)');

      this.charts.CDF = Charts.CDFChart()
        .width(275)
        .height(295)
        .yScale(d3.scale.log())
        .yDomain([0.001, 2])
        .yVariables(['obsQ', 'Q'])
        // .yVariableLabels(this.model.variableLabels)        
        .color(this.model.colors)
        .yLabel('Flow (in/d)')
        .xLabel('Cumulative Frequency');

    }

  });

  return CalibrationPage;
});
