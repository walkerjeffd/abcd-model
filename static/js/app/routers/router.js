define([
    'backbone'
], function (Backbone) {
    'use strict';

    var Router = Backbone.Router.extend({
        routes: {
            '': 'goToHome',
            'theory': 'goToTheory',
            'data': 'goToData',
            'simulation': 'goToSimulation',
            'calibration': 'goToCalibration',
            'montecarlo': 'goToMonteCarlo'
        },

        initialize: function (view) {
            this.appView = view;
        },

        goToHome: function () {
            this.appView.setPage('home');
        },

        goToTheory: function () {
            this.appView.setPage('theory');
        },

        goToData: function () {
            this.appView.setPage('data');
        },

        goToSimulation: function () {
            this.appView.setPage('simulation');
        },

        goToCalibration: function () {
            this.appView.setPage('calibration');
        },

        goToMonteCarlo: function () {
            this.appView.setPage('montecarlo');
        }
    })

    return Router;
});