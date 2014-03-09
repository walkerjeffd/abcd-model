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
    charts: [],

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
      console.log(variables);
      
      if (variables.length > 0) {
        var $el = d3.selectAll('.chart-container').append('div')[0];
        console.log($el);
        this.addChart({
          el: $el,
          key: 'Precip',
          primary: false,
          variables: variables,
          chart: new Charts.ZoomableTimeseriesLineChart()
                            .x(function(d) { return d.Date; })
                            .width(550)
                            .height(200)
                            // .color(this.model.colors)
                            .yLabel('')
                            .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
                            .onMouseout(function(x) { that.dispatcher.trigger('focus'); })
        });
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
        console.log(output[0]);

        this.charts.forEach(function(chart) {
          // console.log(chart.el);
          d3.select(chart.el[0]).call(chart.chart.data(output));
        });
      }

      if (!this.model.isNew() && this.model.hasChanged()) {
        this.dispatcher.trigger('status', 'Unsaved changes...');
      } else {
        this.dispatcher.trigger('status', 'Ready!');
      }

    },

    zoomCharts: function(translate, scale) {
      // this.charts.Flow.zoomX(translate, scale);
      this.charts.forEach(function(chart) {
        if (!chart.chart.onZoom()) {
          chart.chart.zoomX(translate, scale);
        }
      });
      // this.charts.Precip.zoomX(translate, scale);
      // this.charts.Storage.zoomX(translate, scale);
    },

    addChart: function(chart) {
      chart.chart.yVariables(chart.variables);
      this.charts.push(chart);
    },

    initCharts: function() {
      var that = this;
      this.addChart({
        el: d3.selectAll('#chart-flow')[0],
        key: 'Flow',
        primary: true,
        variables: ['Flow_in', 'Q'],
        chart: new Charts.ZoomableTimeseriesLineChart()
                      .x(function(d) { return d.Date; })
                      .width(550)
                      .height(200)
                      .yDomain([0.001, 2])
                      .yScale(d3.scale.log())
                      .color(this.model.colors)
                      .yLabel('Observed and Simulated (Red) Streamflow (in/day)')
                      .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
                      .onMouseout(function(x) { that.dispatcher.trigger('focus'); })
                      .onZoom(function(translate, scale) { this.zoomCharts(translate, scale); }.bind(this))
      });

      this.addChart({
        el: d3.selectAll('#chart-precip')[0],
        key: 'Precip',
        primary: false,
        variables: ['Pe'],
        chart: new Charts.ZoomableTimeseriesLineChart()
                          .x(function(d) { return d.Date; })
                          .width(550)
                          .height(200)
                          .color(this.model.colors)
                          .yLabel('')
                          .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
                          .onMouseout(function(x) { that.dispatcher.trigger('focus'); })
      });

      // this.charts.forEach(function(chart) {
      //   chart.chart.yVariables(chart.variables);
      // });

      // this.charts.Storage = new Charts.TimeseriesAreaChart()
      //   .x(function(d) { return d.Date; })
      //   .width(550)
      //   .height(200)
      //   .yVariables(['G', 'S'])
      //   .yScale(d3.scale.linear())
      //   .color(this.model.colors);
    }

  });

  return SimulationPage;
});
