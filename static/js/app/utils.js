define([
    'underscore',
    'd3'
], function (_, d3) {
    'use strict';
    
    var checkDates = function(dates) {
      // check array of Date objects to ensure sorted, continuous, daily frequency
      var startDate = dates[0],
          endDate = dates[dates.length-1],
          expectedDates = d3.time.days(startDate, d3.time.day.offset(endDate, 1));

      // Check matching lengths
      if (expectedDates.length !== dates.length) {
        console.log('Error: Length of input dates does not match length of expected dates (' + dates.length + ', ' + expectedDates.length + ')');
        return false;
      }

      for (var i=0, n=dates.length; i<n; i++) {
        // Check for null date
        if (dates[i] === null) {
          console.log('Error: date at row ' + i + ' could not be parsed, format must be YYYY-mm-dd (e.g. 2000-05-15)');
          return false;
        }

        // Check date matches expected date
        if ((dates[i] - expectedDates[i]) !== 0) {
          console.log('Error: unexpected date ' + dateFormat(dates[i]) + ' at row ' + i + ', expected ' + dateFormat(expectedDates[i]));
          return false;
        }
      }
      return true;
    };

    var sum = function(x) {
      var n = x.length;
      if (n === 0) return NaN;
      var m = 0,
          i = -1;
      while (++i < n) m += x[i];
      return m;
    };

    var mean = function(x) {
      // science.js
      var n = x.length;
      if (n === 0) return NaN;
      var m = 0,
          i = -1;
      while (++i < n) m += (x[i] - m) / (i + 1);
      return m;
    };

    var variance = function(x) {
      // science.js
      var n = x.length;
      if (n < 1) return NaN;
      if (n === 1) return 0;
      var m = mean(x),
          i = -1,
          s = 0;
      while (++i < n) {
        var v = x[i] - m;
        s += v * v;
      }
      return s / (n - 1);
    };


    return {
        checkDates: checkDates,
        sum: sum,
        mean: mean,
        variance: variance
    };
});