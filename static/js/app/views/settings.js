define([
    'jquery',
    'underscore',
    'backbone',
    'app/views/modal',
    'app/templates'
], function ($, _, Backbone, ModalView, Templates) {
    'use strict';

    var SettingsView = ModalView.extend({
        template: Templates['settings'],

        events: {
            'click #btn-save': 'saveSettings'
        },

        initialize: function() {
            ModalView.prototype.initialize.apply(this, arguments);
            // console.log(this.model.toJSON());
            this.$bodyEl.html(this.template(this.model.toJSON()));
        },

        saveSettings: function (e) {
            var data = {
                watershedName: this.$('#watershedNameInput').val()
            };
            this.model.save(data);
            this.teardown();
        }
    });

    return SettingsView;
});