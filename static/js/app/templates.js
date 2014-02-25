define([
    'underscore'
], function (_) {
    var Templates = {};

    Templates['app'] = [
        '<div class="navbar navbar-default">',
            '<div class="container">',
                '<a class="navbar-brand" href="#">ABCD Model</a>',
                '<ul class="nav navbar-nav">',
                    '<li id="nav-home"><a href="#">Home</a></li>',
                    '<li id="nav-theory"><a href="#theory">Theory</a></li>',
                    '<li id="nav-data"><a href="#data">Data</a></li>',
                    '<li id="nav-simulation"><a href="#simulation">Simulation</a></li>',
                    '<li id="nav-calibration"><a href="#calibration">Calibration</a></li>',
                    '<li id="nav-montecarlo"><a href="#montecarlo">Monte Carlo</a></li>',
                '</ul>',
                '<form class="navbar-form navbar-right">',
                    '<button type="button" id="btn-settings" class="btn btn-default">Settings</button>',
                '</form>',
            '</div>',
        '</div>',        
        '<div id="content" class="container"></div>'
    ].join('')

    Templates['modal'] = [
        '<div class="modal fade">',
            '<div class="modal-dialog">',
                '<div class="modal-content">',
                    '<div class="modal-header">',
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                        '<h4 class="modal-title"><%=title %></h4>',
                    '</div>',
                    '<div class="modal-body">content</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    Templates['settings'] = [
        '<form role="form">',
            '<div class="form-group">',
                '<label for="watershedName">Watershed Name</label>',
                '<input type="text" class="form-control" id="watershedNameInput" placeholder="Enter Watershed Name" value="<%= watershedName %>">',
            '</div>',
            '<div id="btn-save" class="btn btn-default">Save</div>',
        '</form>'
    ].join('');

    for (var tmpl in Templates) {
        if (Templates.hasOwnProperty(tmpl)) {
            Templates[tmpl] = _.template(Templates[tmpl]);
        }
    }

    return Templates;
});