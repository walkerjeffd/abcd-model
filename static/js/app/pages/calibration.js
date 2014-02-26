define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'app/charts',
  'app/utils',
  'app/sim',
  'app/views/soil_theory_chart'
], function ($, _, Backbone, d3, Charts, Utils, SimModel, SoilTheoryChart) {
  var CalibrationPage = Backbone.View.extend({
    charts: {},

    events: {},

    initialize: function(options) {
      console.log('Initialize: CalibrationPage');
      
      this.dispatcher = options.dispatcher;

      this.colors = d3.scale.ordinal()
        .range([this.model.colors('Q'), "black"])
        .domain(['Q', 'Flow_in']);

      this.soilChart = new SoilTheoryChart({
        model: this.model, 
        id: 'chart-soil', 
        width: 270, 
        height: 200,
        yLabel: ' '
      });

      this.initSliders();
      this.initCharts();

      this.listenToOnce(this.model, 'sync', this.checkInput);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change', this.updateSliders);
      
      this.render();

      this.dispatcher.trigger('status', 'Ready!');
    },

    checkInput: function(model, response, options) {
      var model = model || this.model;
      if (model.get('input') && model.get('input').length === 0) {
        this.dispatcher.trigger('alert', 'No input data found, go to Data tab and load new data', 'danger', 5000);
      }
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
      if (this.model.get('input') && this.model.get('input').length) {
        var simModel = SimModel(this.model.get('input'));
        simModel.run(this.model);

        var stats = this.computeStats(simModel.output, 'Flow_in', 'Q');

        d3.select("#chart-line").call(this.charts['Line'].data(simModel.output));
        d3.select("#chart-scatter").call(this.charts['Scatter'].data(simModel.output));
        // d3.select("#chart-cdf").call(this.charts['CDF'].data(simModel.output));

        this.$("#stat-rmse").text(numberFormat(stats.rmse));
        this.$("#stat-nse").text(numberFormat(stats.nse));

        
        if (!this.model.isNew() && this.model.hasChanged()) {
          this.dispatcher.trigger('status', 'Unsaved changes...')
        } else {
          this.dispatcher.trigger('status', 'Ready!')
        }
      }
    },

    computeStats: function(data, obs, sim) {
      var log10 = function(x) {
        return Math.log(x)*Math.LOG10E;
      }

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
      }
    },


    initCharts: function() {
      this.charts['Line'] = Charts.TimeseriesLineChart()
        .x(function(d) { return d.Date; })
        .width(570)
        .height(200)
        .yVariables(['Flow_in', 'Q'])
        .yDomain([0.001, 2])
        .yScale(d3.scale.log())
        .color(this.colors)
        .yLabel('Observed and Simulated (Red) Streamflow (in/day)');

      this.charts['Scatter'] = Charts.ScatterChart()
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

      // this.charts['CDF'] = Charts.CDFChart()
      //   .width(285)
      //   .height(305)
      //   .yScale(d3.scale.log())
      //   .yDomain([0.001, 2])
      //   .yVariables(['Flow_in', 'Q'])
      //   .color(this.colors)
      //   .yLabel('CDF of Obs. and Sim. (Red) Streamflow')
      //   .xLabel('Cumulative Frequency');

    }

  });

  return CalibrationPage;
});
