define([
  'jquery',
  'backbone',
  'd3',
  'app/charts',
  'app/equations'
], function ($, Backbone, d3, Charts, Equations) {
  'use strict';
  
  var GwTheoryChart = Backbone.View.extend({
    initialize: function(options) {
      console.log('Initialize: GwTheoryChart');

      var width = options.width || 390,
          height = options.height || 300,
          yLabel = options.yLabel || 'Groundwater[t] + Qdischarge[t]';
      
      this.colors = this.model.colors;
      
      this.equations = new Equations(this.model);

      this.chart = Charts.ComponentChart()
        .width(width)
        .height(height)
        .funcs([
          {label: 'Groundwater', name: 'G', func: this.equations.G },
          {label: 'Discharge', name: 'Qdischarge', func: this.equations.Qdischarge }
        ])
        .colors(this.colors)
        .xLabel('Groundwater[t-1] + Qrecharge[t]')
        .yLabel(yLabel)
        .xDomain([0, 10])
        .yDomain([0, 10]);

      this.listenTo(this.model, 'change:d', this.render);

      this.render();
    },

    render: function() {
      d3.select('#' + this.id).call(this.chart);
    },

    
    focus: function(x) {
      this.chart.focus(x);
    }


  });

  return GwTheoryChart;
});