define([
], function () {
  'use strict';

  var Equations = function(params) {
    var Y = function(W) {
      return (W+params.get('b'))/(2*params.get('a')) - Math.sqrt(Math.pow((W+params.get('b'))/(2*params.get('a')),2) - (W*params.get('b')/params.get('a')));  
    };

    var S = function(W) {
      return Y(W)*Math.exp(-params.get('PET')/params.get('b'));
    };

    var ET = function(W) {
      return Y(W) - S(W);
    };

    var GR = function(W) {
      return params.get('c')*(W - Y(W));
    };

    var DR = function(W) {
      return (1-params.get('c'))*(W - Y(W));
    };

    var GD = function(WGW) {
      return params.get('d')*G(WGW);
    };

    var G = function(WGW) {
      return WGW/(1 + params.get('d'));
    };

    return {
      Y: Y,
      S: S,
      ET: ET,
      GR: GR,
      DR: DR,
      GD: GD,
      G: G
    };
  };
  
  return Equations;
});