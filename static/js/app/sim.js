define([
  'underscore',
  'd3'
], function (_, d3) {
  var SimModel = function() {
    'use strict';

    var output = [];

    var computeSolar = function(latitude, Jday) {
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

    var computePET = function(Solar_in, Trng_degC, Tavg_degC) {
      // Hargreave's Equation
      return Trng_degC > 0 ? 0.0023*Solar_in*(Tavg_degC+17.8)*Math.sqrt(Trng_degC) : 0;
    };

    // public function
    var setInput = function(input, latitude) {
      console.log('SimModel: set input');
      output.length = 0;
      
      // copy input to output, compute derived, and add placeholders for others
      for (var i = 0, len = input.length; i < len; i++) {
        var d = {};

        // copy input values
        d.Date = input[i].Date;
        d.Tmin = input[i].Tmin_degC;
        d.Tmax = input[i].Tmax_degC;
        d.P = input[i].Precip_in;
        d.obsQ = input[i].Flow_in;

        // compute derived
        d.Jday = d3.time.dayOfYear(d.Date) + 1;
        d.Trng = d.Tmax - d.Tmin;
        d.Tavg = (d.Tmax + d.Tmin)/2;
        d.SR = computeSolar(latitude, d.Jday);
        d.PET = computePET(d.SR, d.Trng, d.Tavg);
        
        output.push(d);
      }

    };

    var run = function(params) {
      // console.log('SimModel: running');
      var W, Y, S, ET, GR, DR, G, GD, Q, WGW;

      var a = params.get('a'),
          b = params.get('b'),
          c = params.get('c'),
          d = params.get('d'),
          latitude = params.get('latitude');

      for (var i = 0, len = output.length; i < len; i++) {

        if (i === 0) { 
          // assign initial conditions
          S = params.get('S0');
          G = params.get('G0');
        } 

        W = S + output[i].P;
        Y = (W + b)/(2 * a) - Math.sqrt(Math.pow((W + b)/(2 * a),2) - (W * b / a));
        S = Y * Math.exp(-output[i].PET / b);
        ET = Y - S;
        GR = c * (W - Y);
        DR = (1 - c) * (W - Y);

        WGW = GR + G; // available groundwater
        G = WGW / (1 + d);
        GD = d * WGW / (1 + d);
        Q = Math.max(DR + GD, 0.001);

        output[i].W = W;
        output[i].Y = Y;
        output[i].S = S;
        output[i].ET = ET;
        output[i].GR = GR;
        output[i].DR = DR;
        output[i].WGW = WGW;
        output[i].G = G;
        output[i].GD = GD;
        output[i].Q = Q;
        output[i].resQ = output[i].obsQ - Q;
      }
    };
    
    return {
      run: run,
      output: output,
      setInput: setInput
    };
  };

  return SimModel;
});
