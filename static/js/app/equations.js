define([

], function () {
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

    var Qrecharge = function(W) {
      return params.get('c')*(W - Y(W));
    };

    var Qrunoff = function(W) {
      return (1-params.get('c'))*(W - Y(W));
    };

    var Qdischarge = function(GR) {
      return params.get('d')*G(GR);
    };

    var G = function(GR) {
      return GR/(1 + params.get('d'));
    };

    return {
      Y: Y,
      S: S,
      ET: ET,
      Qrecharge: Qrecharge,
      Qrunoff: Qrunoff,
      Qdischarge: Qdischarge,
      G: G
    };
  }
  return Equations;
});