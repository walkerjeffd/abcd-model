define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'app/charts',
  'app/templates'
], function ($, _, Backbone, d3, Charts, Templates) {
  var ChartView = Backbone.View.extend({
    template: Templates.chart,

    class: 'chart-wrapper',

    events: {
      'click .close': 'destroy',
    },

    initialize: function (options) {
      console.log('Init chart', options.variables);
      // this.dispatcher = options.dispatcher;
      this.variables = options.variables;
      this.dispatcher = options.dispatcher;
      var that = this;

      this.chart = new Charts.ZoomableTimeseriesLineChart()
        .id(this.cid)
        .x(function(d) { return d.Date; })
        .width(550)
        .height(200)
        .yVariables(this.variables)
        // .color(this.model.colors)
        .yLabel('')
        .onMousemove(function(x) { that.dispatcher.trigger('focus', x); })
        .onMouseout(function(x) { that.dispatcher.trigger('focus'); });
      this.render();
    },

    render: function () {
      this.$el.html(this.template());
      return this;
    },

    zoom: function(translate, scale) {
      this.chart.zoomX(translate, scale);        
    },

    update: function(data) {
      d3.select(this.$el.children('.chart')[0]).call(this.chart.data(data));
    },

    destroy: function() {
      this.remove();
    }

  });
  
  return ChartView;
});