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
  'app/views/diagram'
], function ($, _, Backbone, Bootstrap, d3, Charts, Utils, SimModel, SoilTheoryChart, Diagram) {
  'use strict';

  var SimulationPage = Backbone.View.extend({
    charts: {},

    events: {},

    initialize: function(options) {
      console.log('Initialize: SimulationPage');
      
      this.dispatcher = options.dispatcher;

      this.soilChart = new SoilTheoryChart({
        model: this.model, 
        id: 'chart-theory', 
        width: 270, 
        height: 200,
        yLabel: ' '
      });

      this.diagram = new Diagram({model: this.model, el: this.$('#diagram')});

      this.initCharts();
      this.initSliders();
      this.render();

      this.listenToOnce(this.model, 'sync', this.checkInput);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change', this.updateSliders);

      this.dispatcher.trigger('status', 'Ready!');
    },

    checkInput: function(model, response, options) {
      model = model || this.model;

      if (model.get('input') && model.get('input').length === 0) {
        this.dispatcher.trigger('alert', 'No input data found, go to Data tab and load new data', 'danger', 5000);
      }
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
      if (this.model.get('input') && this.model.get('input').length) {
        var simModel = SimModel(this.model.get('input'));
        simModel.run(this.model);
        d3.select('#chart-flow').call(this.charts.Flow.data(simModel.output));
        d3.select('#chart-storage').call(this.charts.Storage.data(simModel.output));
      }

      if (!this.model.isNew() && this.model.hasChanged()) {
        this.dispatcher.trigger('status', 'Unsaved changes...');
      } else {
        this.dispatcher.trigger('status', 'Ready!');
      }

    },

    initCharts: function() {
      this.charts.Flow = Charts.Timeseries()
        .x(function(d) { return d.Date; })
        .width(550)
        .height(200)
        .xVariable('Date')
        .yVariable('Q')
        .yDomain([0.001, 2])
        .yScale(d3.scale.log())
        .color(this.model.colors);

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
