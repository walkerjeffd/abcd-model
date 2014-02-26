define([
    'jquery',
    'underscore',
    'backbone',
    'app/pages/theory',
    'app/pages/data',
    'app/pages/simulation',
    'app/pages/calibration',
    'app/pages/montecarlo'
], function ($, _, Backbone, TheoryPage, DataPage, SimulationPage, CalibrationPage, MonteCarloPage) {
    'use strict';

    var AppView = Backbone.View.extend({
        events: {
        },

        views: {
            'theory': TheoryPage,
            'data': DataPage,
            'simulation': SimulationPage,
            'calibration': CalibrationPage,
            'montecarlo': MonteCarloPage
        },

        initialize: function (options) {
            console.log('AppView: initialize');
            var page = options.page;
            
            this.dispatcher = _.extend({}, Backbone.Events);
            this.$alert = this.$('#alert');
            this.$status = this.$('#status');
            this.dispatcher.on('alert', this.showAlert, this);
            this.dispatcher.on('status', this.showStatus, this);

            if (this.views[page]) {
                var pageView = new this.views[page]({
                    model: this.model, 
                    el: this.$('#page-view'), 
                    dispatcher: this.dispatcher
                });

                this.listenTo(this.model, 'all', function(event, model, response, options) {
                  console.log('AppModel Event:', event, '|', response);
                })
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

        render: function () {
            console.log('AppView: render');
            return this;
        },

        setPage: function(page) {
            this.$('.nav li').removeClass('active');
            this.$('#nav-'+page).addClass('active');
            this.$content.html('<p>This is page ' + page + '</p>');
        },

        showSettings: function() {
            this.settingsModal.show();
        }
    });

    return AppView;
});