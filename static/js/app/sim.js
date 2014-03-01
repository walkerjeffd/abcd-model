define([
], function () {
  var SimModel = function() {
    'use strict';

    var output,
        input;

    var setInput = function(x) {
      // console.log('setting input', x);
      input = x;
      output = [];
      for (var i = 0, len = input.length; i < len; i++) {
        output.push({
          Date: input[i].Date,
          Precip_in: input[i].Precip_in,
          Flow_in: input[i].Flow_in,
          W: 0.0,
          S: 0.0,
          G: 0.0,
          Y: 0.0,
          GR: 0.0,
          DR: 0.0,
          dG: 0.0,
          ET: 0.0,
          At: 0.0,
          mt: 0.0,
          Pe: 0.0,
          Q: 0.0
        });           
      }  
    };

    var run = function(params) {
      var At, mt, Pe, W, Y, S, GR, DR, G, dG, ET, Q;

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
