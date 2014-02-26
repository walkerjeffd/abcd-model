define([
  'backbone',
  'd3',
  'app/templates'
], function (Backbone, d3, Templates) {
  var Diagram = Backbone.View.extend({
    svg: ['<svg xmlns="http://www.w3.org/2000/svg" width="323px" height="307px" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">',
         '  <defs/>',
         '  <g transform="translate(0.5,0.5)scale(0.8,0.8)">',
         '    <g transform="translate(10,105)">',
         '        <rect x="0" y="0" width="120" height="60" fill="#ffffff" stroke="#000000" pointer-events="none" id="comp-S" class="component"/>',
         '        <text x="58" y="35" fill="white" text-anchor="middle" font-size="12px" font-family="Helvetica">Soil Moisture</text>',
         '    </g>',
         '    ',
         '    <g transform="translate(10,235)">',
         '        <rect x="0" y="0" width="120" height="60" fill="#ffffff" stroke="#000000" pointer-events="none" id="comp-G" class="component"/>    ',
         '        <text x="58" y="35" fill="white" text-anchor="middle" font-size="12px" font-family="Helvetica">Groundwater</text>',
         '    </g>',
         '    <path d="M 130 140 L 130 130 L 190 130 L 190 120 L 220 135 L 190 150 L 190 140 Z" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="none" id="comp-Qrunoff" class="component"/>',
         '    <path d="M 130 280 L 130 270 L 190 270 L 190 260 L 220 275 L 190 290 L 190 280 Z" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="none" id="comp-Qdischarge" class="component"/>',
         '    <path d="M 64 165 L 74 165 L 74 205 L 84 205 L 69 235 L 54 205 L 64 205 Z" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="none" id="comp-Qrecharge" class="component"/>',
         '    <path d="M 105 105 L 95 105 L 95 55 L 85 55 L 100 25 L 115 55 L 105 55 Z" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="none" id="comp-ET" class="component"/>',
         '    <path d="M 35 25 L 45 25 L 45 75 L 55 75 L 40 105 L 25 75 L 35 75 Z" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="none" id="comp-P" class="component"/>',
         '    <rect x="145" y="95" width="30" height="20" fill="none" stroke="none" pointer-events="none"/>',
         '    <g text-anchor="middle" font-size="12px">',
         '      <text x="160" y="108" fill="#000000" font-family="Helvetica">Runoff</text>',
         '    </g>',
         '    <rect x="90" y="185" width="30" height="20" fill="none" stroke="none" pointer-events="none"/>',
         '    <g font-size="12px">',
         '      <text x="92" y="198" fill="#000000" font-family="Helvetica">Recharge</text>',
         '    </g>',
         '    <rect x="150" y="235" width="30" height="20" fill="none" stroke="none" pointer-events="none"/>',
         '    <g text-anchor="middle" font-size="12px">',
         '      <text x="165" y="248" fill="#000000" font-family="Helvetica">Discharge</text>',
         '    </g>',
         '    <rect x="20" y="2" width="30" height="20" fill="none" stroke="none" pointer-events="none"/>',
         '    <g text-anchor="middle" font-size="12px">',
         '      <text x="35" y="15" fill="#000000" font-family="Helvetica">Precipitation</text>',
         '    </g>',
         '    <rect x="90" y="2" width="30" height="20" fill="none" stroke="none" pointer-events="none"/>',
         '    <g text-anchor="middle" font-size="12px">',
         '      <text x="105" y="15" fill="#000000" font-family="Helvetica">ET</text>',
         '    </g>',
         '    <path d="M 230 209 L 230 199 L 280 199 L 280 189 L 310 204 L 280 219 L 280 209 Z" fill="#ffffff" stroke="#000000" stroke-miterlimit="10" pointer-events="none" id="comp-Q" class="component" />',
         '    <rect x="220" y="134" width="10" height="141" fill="#ffffff" stroke="#000000" pointer-events="none"/>',
         '    <rect x="240" y="165" width="30" height="20" fill="none" stroke="none" pointer-events="none"/>',
         '    <g font-size="12px">',
         '      <text x="242" y="178" fill="#000000" font-family="Helvetica">Streamflow</text>',
         '    </g>',
         '  </g>',
         '</svg>'].join(''),

    initialize: function(options) {
      console.log('Initialize: Diagram');
      var colors = this.model.colors;
      this.$el.html(this.svg);

      var components = this.$('.component');
      components.each(function(d,i) {
        var key  = this.getAttribute('id');
        key = key.slice(5, key.length);
        this.setAttribute('fill', colors(key));
      });
    }
  });

  return Diagram;
});

      