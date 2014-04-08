define([
  'jquery',
  'backbone',
  'd3',
  'app/charts',
  'app/equations'
], function ($, Backbone, d3, Charts, Equations) {
  'use strict';

  var SoilTheoryChart = Backbone.View.extend({
    initialize: function(options) {
      console.log('Initialize: SoilTheoryChart');

      var width = options.width || 390,
          height = options.height || 300,
          yLabel = options.yLabel || '';
          // yLabel = options.yLabel || 'Soil Moisture[t] + ET[t] + Recharge[t] + Runoff[t]';
      
      this.colors = this.model.colors;
      
      this.equations = new Equations(this.model);

      this.chart = Charts.ComponentChart()
        .width(width)
        .height(height)
        .funcs([
          {label: 'Soil Moisture[t]', name: 'S', func: this.equations.S },
          {label: 'ET[t]', name: 'ET', func: this.equations.ET },
          {label: 'Runoff[t]', name: 'DR', func: this.equations.DR },
          {label: 'Recharge[t]', name: 'GR', func: this.equations.GR }
        ])
        .colors(this.colors)
        .xLabel('Soil Moisture[t-1] + Precip[t]')
        .yLabel(yLabel)
        .xDomain([0, 10])
        .yDomain([0, 10]);

      this.listenTo(this.model, 'change:a change:b change:c change:PET', this.render);

      this.render();
    },

    render: function() {
      d3.select('#' + this.id).call(this.chart);
    },

    focus: function(x) {
      this.chart.focus(x);
    }

  });

  return SoilTheoryChart;
});