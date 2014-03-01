define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'd3',
  'app/charts',
  'app/utils',
  'app/sim',
  'app/views/soil_theory_chart',
  'app/views/gw_theory_chart',
  'app/views/diagram',
  'app/views/controls'
], function ($, _, Backbone, Bootstrap, d3, Charts, Utils, SimModel, SoilTheoryChart, GWTheoryChart, Diagram, ControlsView) {
  'use strict';

  var SimulationPage = Backbone.View.extend({
    charts: {},

    events: {},

    initialize: function(options) {
      console.log('Initialize: SimulationPage');
      
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

      this.diagram = new Diagram({model: this.model, el: this.$('#diagram')});

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
      $(".slider").change(function() {
        // console.log('change: ', this.name);
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
      if (this.model.get('input') && this.model.get('input').length > 0) {
        var output = this.simModel.run(this.model);

        d3.select('#chart-flow').call(this.charts.Flow.data(output));
        d3.select('#chart-storage').call(this.charts.Storage.data(output));
      }

      if (!this.model.isNew() && this.model.hasChanged()) {
        this.dispatcher.trigger('status', 'Unsaved changes...');
      } else {
        this.dispatcher.trigger('status', 'Ready!');
      }

    },

    initCharts: function() {
      var that = this;
      this.charts.Flow = Charts.ZoomableTimeseriesLineChart()
        .x(function(d) { return d.Date; })
        .width(550)
        .height(200)
        .yVariables(['Flow_in', 'Q'])
        .yDomain([0.001, 2])
        .yScale(d3.scale.log())
        .color(this.model.colors)
        .yLabel('Observed and Simulated (Red) Streamflow (in/day)')
        .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
        .onMouseout(function(x) { that.dispatcher.trigger('focus'); });

      this.charts.Storage = Charts.TimeseriesAreaChart()
        .x(function(d) { return d.Date; })
        .width(550)
        .height(200)
        .yVariables(['G', 'S'])
        .yScale(d3.scale.linear())
        .color(this.model.colors);
    }

  });

  return SimulationPage;
});
