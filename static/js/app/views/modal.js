define([
    'jquery',
    'underscore',
    'backbone',
    'app/templates',
    'bootstrap'
], function ($, _, Backbone, Templates, Bootstrap) {
    'use strict';

    var ModalView = Backbone.View.extend({
        template: Templates['modal'],

        id: 'modal-view',

        initialize: function(options) {
            var title = options.title || '';
            var appendTo = options.appendTo || 'body';

            var html = Templates['modal']({title: title});
            this.$el.html(html);
            this.$modalEl = this.$('.modal');

            this.$bodyEl = this.$('.modal-body');
            this.$titleEl = this.$('.modal-title');
            $(appendTo).append(this.el);
        },

        render: function() {
            this.$modalEl.modal({
                show: false
            });
            return this;
        },

        show: function() {
            console.log('Model: show');
            var that = this;
            this.$modalEl.modal('show');
            this.$modalEl.on('hidden.bs.modal', function () {
                that.teardown();
            });
        },

        teardown: function(e) {
            console.log('Model: hide');
            this.$modalEl.hide();
            this.$modalEl.off('hidden.bs.modal');
            // console.log(this.$modalEl.data('bs.modal', null));
            // this.remove();
        }
    });

    return ModalView;
});