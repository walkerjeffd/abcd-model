define([
    'jquery',
    'underscore',
    'backbone',
    'app/utils',
    'app/pages/theory',
    'app/pages/data',
    'app/pages/simulation',
    'app/pages/calibration',
    'app/pages/optimization'
], function ($, _, Backbone, Utils, TheoryPage, DataPage, SimulationPage, CalibrationPage, OptimizationPage) {
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
            this.dispatcher.on('export-output', this.exportOutput, this);

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

        exportOutput: function(data) {
            Utils.saveToCSVFile(data, 'output.csv');
        }
    });

    return AppView;
});