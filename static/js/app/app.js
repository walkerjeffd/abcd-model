define([
    'bootstrap',
    'app/models/app',
    'app/views/app'
], function (Bootstrap, AppModel, AppView) {
    'use strict';

    var initialize = function(page) {
        console.log('App initialized');

        var appModel = new AppModel({id: 1});
        var appView;

        if (page != "index") {
            appView = new AppView({model: appModel, el: $('body'), page: page});

            appModel.fetch({
                error: function(model, response, options) {
                    model.save();
                }
            });
        }
        
        window.debug = {
            app: appModel,
            view: appView
        };
    };

    return {
        initialize: initialize
    };
});