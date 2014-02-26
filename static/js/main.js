require.config({
  paths: {
    'jquery': 'libs/jquery.min',
    'underscore': 'libs/underscore',
    'backbone': 'libs/backbone',
    'bootstrap': 'libs/bootstrap',
    'backbone.localStorage': 'libs/backbone.localStorage',
    'd3': 'libs/d3.v3'
  },

  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: [
      'underscore',
      'jquery'
      ],
      exports: 'Backbone'
    },
    'bootstrap': {
      deps: [
      'jquery'
      ]
    },
    'd3': {
      exports: 'd3'
    }
  }
});

require([
  'app/app',
  'bootstrap',
  'd3'
], function (App, Bootstrap, d3) {
  'use strict';
  
  var page = window.currentPage || "index";

  App.initialize(page);
});
