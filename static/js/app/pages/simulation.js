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
  'app/views/controls',
  'app/views/chart'
], function ($, _, Backbone, Bootstrap, d3, Charts, Utils, SimModel, SoilTheoryChart, GWTheoryChart, Diagram, ControlsView, ChartView) {
  'use strict';

  var SimulationPage = Backbone.View.extend({
    charts: [],

    formats: {
      'number': d3.format("4.2f")
    },

    events: {
      'click #btn-add-chart-ok': 'addChartFromModal'
    },

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

    addChartFromModal: function(e) {
      // console.log(e, this);
      var that = this;

      var variables = [];
      this.$("#select-add-chart").children(":selected").each(function(i, option) {
        variables.push(option.value);
      });
      
      if (variables.length > 0) {
        this.addChart(variables);
      }
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
      this.simModel.setInput(this.model.get('input'), this.model.get('latitude'));
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

        var sumPrecip = Utils.sum(_.pluck(output, 'P'));
        var sumFlow = Utils.sum(_.pluck(output, 'Q'));
        var sumEvap = Utils.sum(_.pluck(output, 'ET'));
        var sumOut = sumFlow+sumEvap;
        var initSoil = this.model.get('S0');
        var endSoil = output[output.length-1]['S'];
        var initGW = this.model.get('G0');
        var endGW = output[output.length-1]['G'];
        var initSnow = this.model.get('A0');
        var endSnow = output[output.length-1]['At'];
        var netStorage = (endSoil+endGW+endSnow) - (initSoil+initGW+initSnow);
        var err = netStorage+sumOut-sumPrecip;

        d3.select('#sum-in').text(this.formats.number(sumPrecip));
        d3.select('#sum-out').text(this.formats.number(sumOut));
        d3.select('#sum-net').text(this.formats.number(netStorage));
        d3.select('#sum-error').text(this.formats.number(err));

        d3.select('#chart-flow').call(this.chartFlow.data(output));
        this.charts.forEach(function(chart) {
          chart.update(output);
        });
      }

      var attrs = _.without(d3.keys(this.model.changedAttributes()), 'PET');
      if (!this.model.isNew() && this.model.hasChanged() && attrs.length > 0) {
        this.dispatcher.trigger('status', 'Unsaved changes...');
      } else {
        this.dispatcher.trigger('status', 'Ready!');
      }
    },

    zoomCharts: function(translate, scale) {
      this.charts.forEach(function(chart) {
        chart.zoom(translate, scale);
      });
    },

    addChart: function(variables) {
      console.log("Add Chart", variables);
      var newChart = new ChartView({variables: variables, dispatcher: this.dispatcher});
      this.$('.chart-container').append(newChart.render().el);
      this.charts.push(newChart);
      this.render();
    },

    initCharts: function() {
      console.log('Init charts');
      var that = this;
      
      this.chartFlow = new Charts.ZoomableTimeseriesLineChart()
        .id(this.cid)
        .x(function(d) { return d.Date; })
        .width(550)
        .height(200)
        .yDomain([0.001, 2])
        .yScale(d3.scale.log())
        .color(this.model.colors)
        .yVariables(['obsQ', 'Q'])
        .yLabel('Observed and Simulated (Red) Streamflow (in/day)')
        .onMousemove(function(x) { this.dispatcher.trigger('focus', x); }.bind(this))
        .onMouseout(function(x) { this.dispatcher.trigger('focus'); }.bind(this))
        .onZoom(function(translate, scale) { this.zoomCharts(translate, scale); }.bind(this));

      this.addChart(['Pe']);
    }

  });

  return SimulationPage;
});
