define([
	'jquery',
	'underscore',
	'backbone',
  'app/templates'
], function ($, _, Backbone, Templates) {
	var ControlView = Backbone.View.extend({
		template: Templates.controls,

    events: {
      'click #btn-save': 'saveApp',
      
    },

    initialize: function (options) {
      this.dispatcher = options.dispatcher;
      $('#btn-delete').on('click', this.deleteApp.bind(this));
      this.listenTo(this.model, 'invalid', this.invalidAlert);
      
      this.render();
    },

    render: function () {
      this.$el.html(this.template());
    },

    invalidAlert: function(model, error) {
      this.dispatcher.trigger('alert', error, 'danger');
    },

    saveApp: function() {
      console.log('Saving...');
      var that = this;
      this.model.save({},
        {
          success: function() {
            that.dispatcher.trigger('alert', 'Model saved', 'success');
            that.dispatcher.trigger('status', 'Ready!');
          },
          error: function(e) {
            that.dispatcher.trigger('alert', 'Model save failed!', 'error');
            that.dispatcher.trigger('status', 'Unsaved changes...');
          }
        }
      );
    },

    deleteApp: function() {
      console.log('Deleting...');
      this.model.destroy({
        success: function(model, response, options) {
          window.location.reload();
        },
        error: function(model, response, options) {
          console.log('error: ', response);
        }
      });
    }

	});
	
	return ControlView;
});