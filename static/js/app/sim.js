define([
  'underscore'
], function (_) {
  var SimModel = function() {
    'use strict';

    var output,
        input;

    var setInput = function(x) {
      // console.log('setting input', x);

      input = x;
      output = [];
      for (var i = 0, len = input.length; i < len; i++) {
        var timestep = _.clone(input[i]);
        timestep.W = 0.0;
        timestep.S = 0.0;
        timestep.G = 0.0;
        timestep.Y = 0.0;
        timestep.GR = 0.0;
        timestep.DR = 0.0;
        timestep.dG = 0.0;
        timestep.ET = 0.0;
        timestep.At = 0.0;
        timestep.mt = 0.0;
        timestep.Pe = 0.0;
        timestep.Q = 0.0;
        output.push(timestep);           
      }
    };

    var run = function(params) {
      var At, mt, Pe, W, Y, S, GR, DR, G, dG, ET, Q;
      var Snowfall_in, Rainfall_in;

      var a = params.get('a');
      var b = params.get('b');
      var c = params.get('c');
      var d = params.get('d');
      var e = params.get('e');
      var Tb = params.get('Tb');

      for (var i = 0, len = input.length; i < len; i++) {
        if (i === 0) { // assign initial conditions
          At = params.get('A0');
          S = params.get('S0');
          G = params.get('G0');
        } else {

          At = Math.max((input[i].Tavg_degC > Tb ? At - mt : At - mt + input[i].Precip_in), 0);
        }

        Snowfall_in = input[i].Tavg_degC > Tb ? 0 : input[i].Precip_in;
        Rainfall_in = input[i].Precip_in - Snowfall_in;

        mt = input[i].Tavg_degC > Tb ? Math.min(At, e*(input[i].Tavg_degC - Tb)) : 0;
        Pe = input[i].Tavg_degC < Tb ? 0 : input[i].Precip_in + mt;

        W = S + Pe;
        Y = (W + b)/(2 * a) - Math.sqrt(Math.pow((W + b)/(2 * a),2) - (W * b / a));
        S = Y * Math.exp(-input[i].PET_in / b);
        GR = c * (W - Y);
        DR = Math.max((1 - c) * (W - Y), 0.001);

        G = (GR + G)/(1 + d);
        dG = d * G;
        ET = Y - S;
        Q = Math.max(DR + dG, 0.001);

        output[i].W = W;
        output[i].S = S;
        output[i].G = G;
        output[i].Y = Y;
        output[i].GR = GR;
        output[i].DR = DR;
        output[i].dG = dG;
        output[i].ET = ET;
        output[i].At = At;
        output[i].mt = mt;
        output[i].Pe = Pe;
        output[i].Q = Q;
        output[i].Snowfall_in = Snowfall_in;
        output[i].Rainfall_in = Rainfall_in;
      }

      return output;
    };
    
    return {
      run: run,
      input: input,
      output: output,
      setInput: setInput
    };
  };

  return SimModel;
});
