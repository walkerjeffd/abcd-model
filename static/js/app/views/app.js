define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'app/utils',
  'app/sim',
  'app/pages/theory',
  'app/pages/data',
  'app/pages/simulation',
  'app/pages/calibration',
  'app/pages/optimization'
], function ($, _, Backbone, d3, Utils, SimModel, TheoryPage, DataPage, SimulationPage, CalibrationPage, OptimizationPage) {
  'use strict';

  var AppView = Backbone.View.extend({
    views: {
      'theory': TheoryPage,
      'data': DataPage,
      'simulation': SimulationPage,
      'calibration': CalibrationPage,
      'optimization': OptimizationPage
    },

    initialize: function (options) {
      console.log('AppView: initialize');
      var page = options.page;
      this.dispatcher = options.dispatcher;

      this.$alert = this.$('#alert');
      this.$status = this.$('#status');
      this.dispatcher.on('alert', this.showAlert, this);
      this.dispatcher.on('status', this.showStatus, this);
      this.dispatcher.on('export', this.export, this);
      this.dispatcher.on('exportOutput', this.exportOutput, this);
      this.dispatcher.on('exportModel', this.exportModel, this);

      if (this.views[page]) {
        this.pageView = new this.views[page]({
          model: this.model, 
          el: this.$('#page-view'), 
          dispatcher: this.dispatcher
        });
        // this.listenTo(this.model, 'all', function(event, model, response, options) {
        //   console.log('AppModel Event:', event, '|', response);
        // });
      }

      this.listenTo(this.model, 'sync', function(model) {
        model.isNewModel = false;
      });

    },

    showStatus: function(message) {
      this.$status.text(message);
    },

    showAlert: function(message, statusType, delay) {
      statusType = statusType || 'danger';
      delay = delay || 3000;
      this.$alert.clearQueue();
      this.$alert.removeClass().addClass('alert alert-' + statusType);
      this.$alert.children('#message').text(message);
      this.$alert.slideDown(300);
      this.$alert.delay(delay).fadeOut();
    },

    export: function() {
      this.dispatcher.trigger('exportModel');
      this.dispatcher.trigger('exportOutput');
    },

    exportModel: function() {
      Utils.saveToJSONFile(this.model.toJSON(), 'model.json');
    },

    exportOutput: function() {
      var dateFormat = d3.time.format('%Y-%m-%d');
      var simModel = new SimModel();
      simModel.setInput(this.model.get('input'), this.model.get('latitude'));
      simModel.run(this.model);
      var outputObj = simModel.output.map(function(d) {
        return {
          Date: dateFormat(d.Date),
          Tmin_degC: d.Tmin,
          Tmax_degC: d.Tmax,
          Precip_in: d.P,
          Obs_Flow_in: d.obsQ,
          Tavg_degC: d.Tavg,
          Trng_degC: d.Trng,
          JulianDay: d.Jday,
          Solar_in: d.SR,
          PET_in: d.PET,
          AvailableWater_in: d.W,
          ETOpportunity_in: d.Y,
          SoilMoisture_in: d.S,
          ET_in: d.ET,
          Runoff_in: d.DR,
          GWRecharge_in: d.GR,
          Groundwater_in: d.G,
          GWDischarge_in: d.dG,
          Flow_in: d.Q,
          EffectivePrecip_in: d.Pe,
          Rainfall_in: d.RF,
          Snowfall_in: d.SF,
          Snowdepth_in: d.At,
          Snowmelt_in: d.mt
        };
      });
      Utils.saveToCSVFile(outputObj, 'output.csv');
    }
  });

  return AppView;
});