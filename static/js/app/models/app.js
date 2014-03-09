define([
    'underscore',
    'backbone',
    'd3',
    'app/utils',
    'backbone.localStorage'
], function (_, Backbone, d3, Utils) {
    'use strict';

    var AppModel = Backbone.Model.extend({
        defaults: {
            watershedName: '',
            input: [],
            latitude: null,
            Tb: -0.07124,
            A0: 0,
            S0: 2.0,
            G0: 2.0,
            a: 1,
            b: 5,
            c: 0.5,
            d: 0.1,
            e: 0.08,
            PET: 1
        },

        validate: function(attrs, options) {
            if (this.isNew()) {
                return;
            }
            if (attrs.watershedName === '') {
                return 'Watershed name cannot be blank';
            }
            if ((attrs.latitude < 20) || (attrs.latitude > 50)) {
                return 'Latitude must be between 20 and 50 degrees North';
            }
            if (attrs.latitude === null || !isFinite(attrs.latitude)) {
                return 'Latitude must be between 20 and 50 degrees North';
            }
           
            if (attrs.input.length === 0) {
                return 'Input data is missing';
            }
        },

        localStorage: new Backbone.LocalStorage('AppSettings'),

        initialize: function (options) {
            console.log('AppModel: initialize');
            this.isNewModel = true;
            this.colors = d3.scale.ordinal()
                .range(["#444444", "#1f77b4", "#aec7e8", "#ffbb78", "#ff7f0e", "#98df8a","#2ca02c",  "#d62728", "black", "green", "blue"])
                .domain(['P', 'S', 'ET', 'Qrecharge', 'Qrunoff', 'G', 'Qdischarge', 'Q', 'Flow_in', 'Rainfall_in', 'Snowmelt_in']);
        },

        isNew: function () {
            return this.isNewModel;
        },

        parse: function(response, options) {
            // Parse data from localStorage

            // convert d.Date from string to Date object
            if (response.input) {
                _.each(response.input, function(d) {
                    d.Date = new Date(d.Date);
                });
            }
            return response;
        },


        addInputData: function(data) {
            // console.log('AppModel: Adding input data', data[0]);
            
            this.set('input', data);
        }
    });

    return AppModel;
});
