define([
  'jquery',
  'backbone',
  'd3',
  'app/charts',
  'app/equations'
], function ($, Backbone, d3, Charts, Equations) {
  var SoilTheoryChart = Backbone.View.extend({
    initialize: function(options) {
      console.log('Initialize: SoilTheoryChart');

      var width = options.width || 390,
          height = options.height || 300,
          yLabel = options.yLabel || 'Soil Moisture[t] + ET[t] + Recharge[t] + Runoff[t]';
      
      this.colors = this.model.colors;
      
      this.equations = Equations(this.model);

      this.chart = Charts.ComponentChart()
        .width(width)
        .height(height)
        .funcs([
          {label: 'Soil Moisture', name: 'S', func: this.equations['S']},
          {label: 'ET', name: 'ET', func: this.equations['ET']},
          {label: 'Runoff', name: 'Qrunoff', func: this.equations['Qrunoff']},
          {label: 'Recharge', name: 'Qrecharge', func: this.equations['Qrecharge']}
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
    }

  });

  return SoilTheoryChart;
});