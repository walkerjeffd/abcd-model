define([
  'jquery',
  'backbone',
  'd3',
  'app/charts',
  'app/equations',
  'app/views/soil_theory_chart',
  'app/views/gw_theory_chart',
  'app/views/diagram'
], function ($, Backbone, d3, Charts, Equations, SoilTheoryChart, GwTheoryChart, Diagram) {
  'use strict';

  var TheoryPage = Backbone.View.extend({
    charts: {},

    initialize: function(options) {
      console.log('Initialize: TheoryPage');

      this.dispatcher = options.dispatcher;

      this.diagram = new Diagram({model: this.model, el: this.$('#diagram')});
      this.soilChart = new SoilTheoryChart({model: this.model, id: 'chart-soil', height: 300, width: 390});
      this.gwChart = new GwTheoryChart({model: this.model, id: 'chart-gw', height: 300, width: 390});

      this.initSliders();
      
      this.render();

      this.dispatcher.trigger('status', 'Ready!');

    },

    updateSliders: function() {
      var that = this;
      this.$(".slider").each(function() {
        this.value = +that.model.get(this.name);
        that.$("#param-"+this.name).text(this.value);
      });
    },
    
    initSliders: function() {
      var that = this;
      this.$(".slider").change(function() {
        that.$("#param-"+this.name).text(this.value);
        that.model.set(this.name, +this.value);
      });
    },

    render: function() {
      var that = this;
      this.$(".slider").each(function() {
        this.value = +that.model.get(this.name);
        that.$("#param-"+this.name).text(this.value);
      });
    }

  });

  return TheoryPage;
});