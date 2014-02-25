define([
    'backbone',
    'app/templates',
    'app/views/settings'
], function (Backbone, Templates, SettingsView) {
    'use strict';

    var AppView = Backbone.View.extend({
        id: 'app-view',

        template: Templates['app'],

        events: {
            'click #btn-settings': 'showSettings'
        },

        initialize: function () {
            console.log('AppView: initialize');
            this.listenTo(this.model, 'change', this.render);

            this.$el.html(this.template());
            this.$content = this.$('#content');

            this.settingsModal = new SettingsView({
                title: 'Application Settings',
                id: 'modal-settings',
                model: this.model
            });
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