define([
    'backbone',
    'backbone.localStorage'
], function (Backbone) {
    'use strict';

    var AppModel = Backbone.Model.extend({
        defaults: {
            watershedName: ''            
        },

        localStorage: new Backbone.LocalStorage('AppSettings'),

        initialize: function () {
            console.log('AppModel initialized');;
        }
    });

    return AppModel;
});