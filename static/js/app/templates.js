define([
    'underscore'
], function (_) {
	'use strict';

  var Templates = {};

  Templates.controls = _.template([
    '<div class="btn-toolbar">',
      '<button class="btn btn-primary" id="btn-save"><span class="glyphicon glyphicon-floppy-disk"></span> Save</button>',
      '<button class="btn btn-danger" data-target="#modal-delete" data-toggle="modal" id="btn-delete-model"><span class="glyphicon glyphicon-trash"></span> Delete</button>',
      '<button class="btn btn-success" data-target="#modal-help" data-toggle="modal"><span class="glyphicon glyphicon-question-sign"></span> Help</button>',
    '</div>',
    '<hr>',
    '<div class="btn-toolbar">',
      '<button class="btn btn-default" id="btn-export"><span class="glyphicon glyphicon-save"></span> Download Output</button>',
    '</div>'].join(''));

  Templates.chart = _.template([
    '<button type="button" class="close">&times;</button>',
    '<div class="chart">',
    '</div>'].join(''));

  return Templates;
});