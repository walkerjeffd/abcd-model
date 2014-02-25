define([
    'app/models/app',
    'app/views/app',
    'app/routers/router'
], function (AppModel, AppView, Router) {
    'use strict';

    var initialize = function() {
        console.log('App initialized');
        var appModel = new AppModel({id: 1});
        
        var appView = new AppView({model: appModel});
        $('body').append(appView.render().el);

        var router = new Router(appView);
        Backbone.history.start();

        appModel.fetch();

        window.debug = {
            settings: appModel
        }
    };

    return {
        initialize: initialize,
    }
});