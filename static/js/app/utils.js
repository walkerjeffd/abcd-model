define([
    'underscore'
], function (_) {
  
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

    var solarRadiation = function(latitude, Jday) {
      // section 4.4.2 of Handbook of Hydrology, Maidment
      // good for latitudes of -55 to +55
      var latitudeRadians = latitude/180*Math.PI,
          r = 1 + 0.033*Math.cos(2*Math.PI*Jday/365),
          delta = 0.4093*Math.sin((2*Math.PI*Jday/365) - 1.405),
          omega = Math.acos(-Math.tan(latitudeRadians)*Math.tan(delta)),
          daylight = 24*omega/Math.PI,
          S0_mm = 15.392*r*(Math.sin(latitudeRadians)*omega*Math.sin(delta) + Math.cos(latitudeRadians)*Math.cos(delta)*Math.sin(omega)),
          S0_in = S0_mm*0.03937;
      
      return S0_in;
    };

    var Hargreaves = function(Solar_in, Trng_degC, Tavg_degC) {
      return Trng_degC > 0 ? 0.0023*Solar_in*(Tavg_degC+17.8)*Math.sqrt(Trng_degC) : 0;
    };

    return {
        checkDates: checkDates,
        mean: mean,
        variance: variance,
        solarRadiation: solarRadiation,
        Hargreaves: Hargreaves
    };
});