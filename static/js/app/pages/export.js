define([
  'jquery',
  'backbone'
], function ($, Backbone) {
  'use strict';

  var TheoryPage = Backbone.View.extend({
    events: {
      'click #btn-export': 'exportModel'
    },

    initialize: function(options) {
      console.log('Initialize: TheoryPage');

      this.dispatcher = options.dispatcher;
    },

    exportModel: function() {
      this.dispatcher.trigger('exportModel');
    }

  });

  return TheoryPage;
});