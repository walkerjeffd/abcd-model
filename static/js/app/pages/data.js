define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'app/charts',
  'app/utils'
], function ($, _, Backbone, d3, Charts, Utils) {
  var DataPage = Backbone.View.extend({
    charts: {},

    events: {
      'click #btn-save': 'saveApp',
      'keyup #input-name': 'updateName',
      'keyup #input-latitude': 'updateLatitude'
    },

    initialize: function(options) {
      console.log('Initialize: DataPage');

      this.dispatcher = options.dispatcher;
      
      this.$name = this.$('#input-name');
      this.$latitude = this.$('#input-latitude');

      this.initDragDrop(this.$('#holder'));

      this.initCharts();

      $('#btn-delete').on('click', this.deleteApp.bind(this));

      this.listenTo(this.model, 'change:input', this.render);
      this.listenTo(this.model, 'sync', this.updateModelInfo);

      this.listenTo(this.model, 'invalid', this.invalidAlert);

      this.render();
      this.dispatcher.trigger('status', 'Ready!');
    },

    updateModelInfo: function() {
      this.$name.val(this.model.get('watershedName'));
      this.$latitude.val(this.model.get('latitude'));
    },

    invalidAlert: function(model, error) {
      this.dispatcher.trigger('alert', error, 'danger');
    },

    updateName: function() {
      console.log(this.$('#input-name').val());
      this.model.set('watershedName', this.$('#input-name').val());
    },

    updateLatitude: function() {
      console.log(this.$('#input-latitude').val());
      this.model.set('latitude', +this.$('#input-latitude').val());
    },

    initDragDrop: function($drop) {
      var that = this;

      console.log('Initializing: drag and drop holder');
      if (typeof window.FileReader === 'undefined') {
        alert('FileReader not supported!');
      }
      
      var el = '#holder';

      $drop.on('dragover', function () { $(this).addClass('hover'); return false; });
      $drop.on('dragend', function () { $(this).removeClass('hover'); return false; });
      $drop.on('drop', function (e) {
        console.log('Event: file dropped on holder');
        that.dispatcher.trigger('status', 'Loading file...');
        $(this).removeClass('hover')
        e.preventDefault();

        var file = e.originalEvent.dataTransfer.files[0],
            reader = new FileReader();

        var fileName = file.name,
            fileNameParts = fileName.split('.'),
            fileExtension = fileNameParts[fileNameParts.length-1].toLowerCase();

        var parser;
        if (fileExtension == "json") {
          parser = JSON.parse;
        } else if (fileExtension == "csv") {
          parser = d3.csv.parse;
        } else {
          console.log("Error: Unable to infer format for filename " + fileName + " (must end in .csv or .json)");
          return false;
        }

        reader.onload = function (event) {
          var data = parser(event.target.result);
          that.loadData(data);
        };

        reader.readAsText(file);

        return false;
      });
    },

    showHelp: function() {
      this.$help.show();
    },

    saveApp: function() {
      console.log('Saving...');
      var that = this;
      this.model.save(
        {
          watershedName: this.$name.val(),
          latitude: +this.$latitude.val()
        }, 
        {
          success: function() {
            that.dispatcher.trigger('alert', 'Model saved', 'success');
            that.dispatcher.trigger('status', 'Ready!');
          },
          error: function(e) {
            that.dispatcher.trigger('alert', 'Model save failed!', 'error');
            that.dispatcher.trigger('status', 'Unsaved changes...');
          }
      });
    },

    deleteApp: function() {
      console.log('Deleting...');
      this.model.destroy({
        success: function(model, response, options) {
          // model.set(model.defaults);
          window.location.reload();
        },
        error: function(model, response, options) {
          console.log('error: ', response);
        }
      });
    },

    loadData: function(data) {
      var dateFormat = d3.time.format('%Y-%m-%d');
      
      var parsers = {
        'Date': function(v) { return dateFormat.parse(v); }, 
        'Precip_in': function(v) { return +v; }, 
        'Tmin_degC': function(v) { return +v; }, 
        'Tmax_degC': function(v) { return +v; },
        'Flow_in': function(v) { return +v; }
      };

      data.forEach(function(row) {
        d3.keys(parsers).forEach(function (key) {
          if (key in row) {
            row[key] = parsers[key](row[key]); 
          }
        });
      });

      // sort dates
      console.log('Sorting data by Date');
      data.sort(function (a, b) {
        if (a['Date'] < b['Date'])
          return -1;
        if (a['Date'] > b['Date'])
          return 1;
        return 0;
      });

      // check dates
      console.log('Checking dates');
      if (!Utils.checkDates(_.pluck(data, 'Date'))) {
        console.log('Error: Dates of input data are either incomplete or incorrect');
        return null;
      }

      // compute derived
      data.forEach(function(d) {
        d.Jday = d3.time.dayOfYear(d.Date) + 1;
        d.Trng_degC = d.Tmax_degC - d.Tmin_degC;
        d.Tavg_degC = (d.Tmax_degC + d.Tmin_degC)/2;
      });

      this.model.addInputData(data);
      this.dispatcher.trigger('status', 'Ready!');
      // this.loadData(this.defaultParams, data);
    },

    render: function() {
      console.log('Rendering...');
      this.dispatcher.trigger('status', 'Rendering...');

      if (this.model.get('input') && this.model.get('input').length) {
        console.log('Showing charts');
        d3.select('#chart-temp').call(this.charts['Temp'].data(this.model.get('input')));
        d3.select('#chart-precip').call(this.charts['Precip'].data(this.model.get('input')));
        d3.select('#chart-flow').call(this.charts['Flow'].data(this.model.get('input')));
        d3.select('#chart-pet').call(this.charts['PET'].data(this.model.get('input')));
      }

      if (!this.model.isNew() && this.model.hasChanged()) {
        this.dispatcher.trigger('status', 'Unsaved changes...')
      } else {
        this.dispatcher.trigger('status', 'Ready!')
      }
    },

    initCharts: function() {
      this.charts['Temp'] = Charts.TimeseriesLineChart()
          .x(function(d) { return d.Date; })
          .width(550)
          .height(150)
          .yVariables(['Tmin_degC', 'Tmax_degC'])
          .yLabel('Min/Max Air Temperature (deg C)')
          .yAxis(d3.svg.axis().ticks(5).orient("left"));

      this.charts['Precip'] = Charts.Timeseries()
          .xVariable('Date')
          .yVariable('Precip_in')
          .width(550)
          .height(150)
          .yLabel('Precipitation (in/d)')
          .yAxis(d3.svg.axis().ticks(5).orient("left"));

      this.charts['Flow'] = Charts.Timeseries()
          .xVariable('Date')
          .yVariable('Flow_in')
          .width(550)
          .height(150)
          .yLabel('Observed Flow (in/d)')
          .yAxis(d3.svg.axis().ticks(5).orient("left"));

      this.charts['PET'] = Charts.Timeseries()
          .xVariable('Date')
          .yVariable('PET_in')
          .width(550)
          .height(150)
          .yLabel('Potential Evapotranspiration (in/d)')
          .yAxis(d3.svg.axis().ticks(5).orient("left"));
    }

  });

  return DataPage;
});
