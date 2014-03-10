define([
  'd3',
], function (d3) {
  'use strict';
  
  var TimeseriesAreaChart = function() {
    var svg,
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960,
        height = 500,
        xScale = d3.time.scale(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis(),
        xValue = function(d) { return d.x; },
        yValue = function(d) { return d.y; },
        color,
        stack = d3.layout.stack().values(function(d) { return d.values; }).x(xValue).y(yValue),
        area = d3.svg.area(),
        chartData = [],
        yVariables = [],
        yLabel = "",
        yDomain,
        mouseover;

    function chart(selection) {
      selection.each(function() {
        yAxis.scale(yScale).ticks(5, "g").orient("left");

        if (typeof yVariables === 'string') {
          yVariables = [yVariables];
        }

        if (!color) {
          color = d3.scale.category10().domain(yVariables);      
        }

        xScale
          .range([0, width - margin.left - margin.right])
          .domain(d3.extent(chartData, xValue));
        yScale
          .range([height - margin.top - margin.bottom, 0])
          .domain(yDomain || [0, d3.max(chartData, function(d, i) {
            return d3.sum(yVariables.map(function(v) {
              return d[v];
            }));
          })]); // TODO

        if (!svg) {
          svg = d3.select(this).append('svg');

          var gEnter = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
          gEnter.append('g').attr('class', 'x axis')
            .attr("transform", "translate(0," + yScale.range()[0] + ")");

          gEnter.append('g').attr('class', 'y axis')
            .append("text")
              .attr("y", 0)
              .attr("x", 5)
              .attr("dy", -5)
              .style("text-anchor", "start")
              .text(yLabel);

          gEnter.append('g').attr('class', 'areas')
            .attr("clip-path", "url(#clip)");

          var clip = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);
        }

        svg.attr("width", width)
           .attr("height", height);

        var g = svg.select('g');

        g.select('.x.axis')
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        var minY = yScale.domain()[0];

        area
          .x(function(d) { return xScale(d.x); })
          .y0(function(d) { return yScale(d.y0); })
          .y1(function(d) { return yScale(d.y0 + d.y); });

        var yStack = stack(yVariables.map(function(v) {
          return { name: v, values: chartData.map(function(d) {
            return {x: d.Date, y: d[v]};
          })};
        }));

        var areas = g.select('g.areas').selectAll('.area')
          .data(yStack, function(d) { return d.name; });
        
        areas.enter().append('path').attr('class', 'area')
          .on('mouseover', mouseover || function() {});
        
        areas
          .attr("d", function(d) { return area(d.values); })
          .attr("fill", function(d) { return color(d.name); });


        areas.exit().remove();
      });
    }

    function X(d) {
      return xScale(d[0]);
    }

    function Y(d) {
      return yScale(d[1]);
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      return chart;
    };

    chart.yVariables = function(_) {
      if (!arguments.length) return yVariables;
      yVariables = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.yAxis = function(_) {
      if (!arguments.length) return yAxis;
      yAxis = _;
      return chart;
    };

    chart.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };

    chart.mouseover = function(_) {
      if (!arguments.length) return mouseover;
      mouseover = _;
      return chart;
    };

    return chart;
  };

  var Timeseries = function() {
    var svg,
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960,
        height = 500,
        xScale = d3.time.scale(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().ticks(5, "g").orient("left"),
        xValue = function(d) { return d[xVariable]; },
        yValue = function(d) { return d[yVariable]; },
        color = d3.scale.category10(),
        yLabel = "",
        line = d3.svg.line().x(X).y(Y),
        chartData = [],
        xVariable = 0,
        yVariable = 1,
        yDomain,
        lines;

    function chart(selection) {
      xScale
        .range([0, width - margin.left - margin.right])
        .domain(d3.extent(chartData, xValue));
      yScale
        .range([height - margin.top - margin.bottom, 0]);

      yAxis.scale(yScale);
      xAxis.scale(xScale);

      if (!svg) {
        svg = selection.append('svg')
          .attr("width", width)
          .attr("height", height);

        var gEnter = svg.append('g')
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
        gEnter.append('g').attr('class', 'x axis')
          .attr("transform", "translate(0," + yScale.range()[0] + ")");

        gEnter.append('g').attr('class', 'y axis')
          .append("text")
            .attr("y", 0)
            .attr("x", 5)
            .attr("dy", -5)
            .style("text-anchor", "start")
            .text(yLabel);

        gEnter.append('g').attr('class', 'lines')
          .attr("clip-path", "url(#clip)");

        var clip = svg.append("defs").append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("id", "clip-rect")
          .attr("x", "0")
          .attr("y", "0")
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom);
      }

      var g = svg.select('g');

      g.select('.x.axis')
          .call(xAxis);

      updateYaxis();

      lines = g.select('g.lines').selectAll('.line')
          .data([chartData]);
      
      lines.enter().append('path').attr('class', 'line').style("stroke", function(d) { return color(yVariable); });
      
      lines.attr("d", line);

      lines.exit().remove();
    }

    function X(d) {
      return xScale(xValue(d));
    }

    function Y(d) {
      return yScale(yValue(d));
    }

    function updateLine() {
      lines.attr("d", line);
    }

    function updateYaxis() {
      yScale
        .domain(yDomain || [d3.min([0, d3.min(chartData, yValue)]), d3.max(chartData, yValue)*1.1]);

      svg.select('.y.axis')
          .call(yAxis);
    }

    chart.update = function() {
      updateYaxis();
      updateLine();
    };

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      return chart;
    };

    chart.xVariable = function(_) {
      if (!arguments.length) return xVariable;
      xVariable = _;
      return chart;
    };

    chart.yVariable = function(_) {
      if (!arguments.length) return yVariable;
      yVariable = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.yAxis = function(_) {
      if (!arguments.length) return yAxis;
      yAxis = _;
      return chart;
    };

    chart.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };

    return chart;
  };

  var TimeseriesLineChart = function() {
    var svg,
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960,
        height = 500,
        xScale = d3.time.scale(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().ticks(5, "g").orient("left"),
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; },
        color,
        yLabel = "",
        line = d3.svg.line().x(X).y(Y),
        chartData = [],
        yVariables = [],
        yDomain;

    function chart(selection) {
      selection.each(function() {
        yAxis.scale(yScale);

        if (typeof yVariables === 'string') {
          yVariables = [yVariables];
        }

        var nestData = yVariables.map(function(name) {
          return {
            name: name,
            values: d3.zip(chartData.map(xValue),chartData.map(function(d) { return d[name]; }))
          };
        });

        if (!color) {
          color = d3.scale.category10().domain(yVariables);
        }

        xScale
          .range([0, width - margin.left - margin.right])
          .domain(d3.extent(chartData, xValue));
        yScale
          .range([height - margin.top - margin.bottom, 0])
          .domain(yDomain || [
            d3.min([0, d3.min(nestData, function(d) { return d3.min(d.values, function(d) { return d[1]; }); })]),
            d3.max(nestData, function(d) { return d3.max(d.values, function(d) { return d[1]; }); })]);

        if (!svg) {
          svg = d3.select(this).selectAll('svg').data([nestData]);

          var gEnter = svg.enter().append('svg').append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
          gEnter.append('g').attr('class', 'x axis')
            .attr("transform", "translate(0," + yScale.range()[0] + ")");

          gEnter.append('g').attr('class', 'y axis')
            .append("text")
              .attr("y", 0)
              .attr("x", 5)
              .attr("dy", -5)
              .style("text-anchor", "start")
              .text(yLabel);

          gEnter.append('g').attr('class', 'lines')
            .attr("clip-path", "url(#clip)");

          var clip = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);
        }

        svg.attr("width", width)
           .attr("height", height);

        var g = svg.select('g');

        g.select('.x.axis')
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        var lines = g.select('g.lines').selectAll('.line')
            .data(nestData);
        
        lines.enter().append('path').attr('class', 'line');
        
        lines.attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

        lines.exit().remove();
      });
    }

    function X(d) {
      return xScale(d[0]);
    }

    function Y(d) {
      return yScale(d[1]);
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      return chart;
    };

    chart.yVariables = function(_) {
      if (!arguments.length) return yVariables;
      yVariables = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.yAxis = function(_) {
      if (!arguments.length) return yAxis;
      yAxis = _;
      return chart;
    };

    chart.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };

    return chart;
  };

  var ZoomableTimeseriesLineChart = function() {
    var svg,
        id = 0,
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960,
        height = 500,
        xScale = d3.time.scale(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().ticks(5, "g").orient("left"),
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; },
        color,
        yLabel = "",
        line = d3.svg.line().x(X).y(Y),
        chartData = [],
        nestData,
        lines,
        xExtent,
        yVariables = [],
        yVariableLabels = {},
        legend = true,
        yDomain,
        zoomable = true,
        zoom,
        onZoom,
        onMousemove,
        onMouseout;

    var customTimeFormat = d3.time.format.multi([
      [".%L", function(d) { return d.getMilliseconds(); }],
      [":%S", function(d) { return d.getSeconds(); }],
      ["%I:%M", function(d) { return d.getMinutes(); }],
      ["%I %p", function(d) { return d.getHours(); }],
      ["%b %d", function(d) { return d.getDay() && d.getDate() != 1; }],
      ["%b %d", function(d) { return d.getDate() != 1; }],
      ["%b", function(d) { return d.getMonth(); }],
      ["%Y", function() { return true; }]
    ]);
    xAxis.tickFormat(customTimeFormat).ticks(5);

    function chart(selection) {
      selection.each(function() {

        yAxis.scale(yScale);

        if (typeof yVariables === 'string') {
          yVariables = [yVariables];
        }

        nestData = yVariables.map(function(name) {
          return {
            name: name,
            values: d3.zip(chartData.map(xValue),chartData.map(function(d) { return d[name]; }))
          };
        });

        if (!color) {
          color = d3.scale.category10().domain(yVariables);
        }
        
        if (!zoom) {
          xScale
            .range([0, width - margin.left - margin.right])
            .domain(xExtent);

          yScale
            .range([height - margin.top - margin.bottom, 0])
            .domain(yDomain || [
              d3.min([0, d3.min(nestData, function(d) { return d3.min(d.values, function(d) { return d[1]; }); })]),
              d3.max(nestData, function(d) { return d3.max(d.values, function(d) { return d[1]; }); })]);

          zoom = d3.behavior.zoom().x(xScale).scaleExtent([1, 100]).on("zoom", draw);
        }        

        var currentYMax = yScale.domain()[1];
        var dataYMax = d3.max(nestData, function(d) { return d3.max(d.values, function(d) { return d[1]; }); });

        if (dataYMax > currentYMax) {
          yScale.domain([yScale.domain()[0], dataYMax]);
        }

        if (!svg) {
          svg = d3.select(this).append('svg');
          
          if (legend) {
            var gLegend = svg.append('g').attr('class', 'legend')
              .attr("transform", "translate(" + margin.left + ",0)");

            // add all legend items
            var gLegendItems = gLegend.selectAll('.legend-item').data(yVariables);

            gLegendItems.enter()
              .append('g')
              .attr('class', 'legend-item');

            gLegendItems.append('circle')
              .attr('r', 4)
              .attr('cx', 4)
              .attr('cy', 8)
              .attr('fill', function(d) { return color(d); });

            gLegendItems.append('text')
              .attr("y", "1em")
              .attr("x", 0)
              .attr("dy", 0)
              .attr("dx", 12)
              .style("text-anchor", "start")
              .text(function(d) { return yVariableLabels[d]; });

            // shift legend items by the width of their div
            var labelWidths = [];
            gLegendItems.each(function(d, i) { 
              labelWidths.push(d3.select(this)[0][0].getBBox().width);}
            );

            var labelOffsets = [0];
            for (var i = 1; i < (labelWidths.length); i++) {
              labelOffsets.push(labelOffsets[i-1] + labelWidths[i-1]);
            }

            gLegendItems.attr('transform', function(d, i) {
              if (i === 0) {
                return null;
              } else {
                return 'translate(' + (labelOffsets[i]+5*i) + ',0)';
              }
            });

          }

          var gEnter = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
          gEnter.append('g').attr('class', 'x axis')
            .attr("transform", "translate(0," + yScale.range()[0] + ")");

          gEnter.append('g').attr('class', 'y axis')
            .append("text")
              .attr("y", 0)
              .attr("x", 5)
              .attr("dy", -5)
              .style("text-anchor", "start")
              .text(yLabel);

          gEnter.append('g').attr('class', 'lines')
            .attr("clip-path", "url(#clip-"+id+")");

          var clip = svg.append("defs").append("clipPath")
            .attr("id", "clip-"+id)
            .append("rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);

          svg.append("rect")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")            
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("class", "overlay")
            .on("mousemove", function() {
              if (onMousemove) {
                onMousemove(xScale.invert(d3.mouse(this)[0]));
              }
            })
            .on("mouseout", function() {
              if (onMouseout) {
                onMouseout();
              }
            });

          if (zoomable) {
            svg.selectAll("rect.overlay").call(zoom);
          }

        }

        svg.attr("width", width)
           .attr("height", height);

        draw();
      });
    }

    function draw() {
      // update zoom, clamp to ends of timeseries
      var distanceToEnd = xScale.range()[1] - xScale(xExtent[1]);
      zoom.translate([d3.min([d3.max([zoom.translate()[0], distanceToEnd+zoom.translate()[0]]), 0]), 0]);
      
      if (onZoom) {
        // trigger zoom callback
        onZoom(zoom.translate(), zoom.scale());
      }

      svg.select('.x.axis')
          .call(xAxis);

      svg.select('.y.axis')
          .call(yAxis);

      lines = svg.select('g.lines').selectAll('.line')
            .data(nestData);
        
      lines.enter().append('path').attr('class', 'line');
      
      lines.attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });

      lines.exit().remove();
    }

    function X(d) {
      return xScale(d[0]);
    }

    function Y(d) {
      return yScale(d[1]);
    }

    chart.zoomX = function(translate, scale) {
      if (zoom) {
        zoom.translate(translate);
        zoom.scale(scale);
        draw();
      }
    };

    chart.id = function(_) {
      if (!arguments.length) return id;
      id = _;
      return chart;
    };

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      xExtent = d3.extent(chartData, xValue);
      return chart;
    };

    chart.onZoom = function(_) {
      if (!arguments.length) return onZoom;
      onZoom = _;
      return chart;
    };

    chart.zoomable = function(_) {
      if (!arguments.length) return zoomable;
      zoomable = _;
      return chart;
    };

    chart.onMouseout = function(_) {
      if (!arguments.length) return onMouseout;
      onMouseout = _;
      return chart;
    };

    chart.onMousemove = function(_) {
      if (!arguments.length) return onMousemove;
      onMousemove = _;
      return chart;
    };

    chart.legend = function(_) {
      if (!arguments.length) return legend;
      legend = _;
      return chart;
    };

    chart.yVariableLabels = function(_) {
      if (!arguments.length) return yVariableLabels;
      yVariableLabels = _;
      return chart;
    };

    chart.yVariables = function(_) {
      if (!arguments.length) return yVariables;
      yVariables = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.yAxis = function(_) {
      if (!arguments.length) return yAxis;
      yAxis = _;
      return chart;
    };

    chart.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };

    return chart;
  };

  var ComponentChart = function() {
    var margin = {top: 25, bottom: 45, left: 30, right: 80},
        width = 300,
        height = 200,
        xScale = d3.scale.linear(),
        yScale = d3.scale.linear(),
        xDomain,
        yDomain,
        xAxis = d3.svg.axis().orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).orient("left"),
        xValues,
        yValues,
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; },
        xLabel = "",
        yLabel = "",
        line = d3.svg.line().x(X).y(Y),
        chartData = [],
        funcs = [],
        svg,
        colors,
        stack = d3.layout.stack().values(function(d) { return d.values; }).x(xValue).y(yValue),
        area = d3.svg.area()
          .x(function(d) { return xScale(d[0]); })
          .y0(function(d) { return yScale(d.y0); })
          .y1(function(d) { return yScale(d.y0 + d.y); });

    function chart(selection) {
      selection.each(function() {
        funcs.forEach(function(f) {
          f.values = xValues.map(f.func);
        });

        var yStack = stack(funcs.map(function(f) {
          return { name: f.name, label: f.label, values: d3.zip(xValues, f.values)};
        }));

        if (!colors) {
          colors = d3.scale.category20().domain(funcs.map(function(f) { return f.name; }));
        }

        xScale
          .range([0, width - margin.left - margin.right])
          .domain(xDomain || d3.extent(xValues));

        yScale
          .range([height - margin.top - margin.bottom, 0])
          .domain(yDomain || d3.extent(yValues));

        xAxis.scale(xScale);
        yAxis.scale(yScale);

        if (!svg) {
          svg = d3.select(this).append('svg');

          var gEnter = svg.append('g');

          gEnter.append('g').attr('class', 'lines');

          gEnter.append('g').attr('class', 'areas');

          gEnter.append('g').attr('class', 'focus');

          gEnter.append('g').attr('class', 'x axis')
            .append("text")
              .attr("y", yScale.range()[1])
              .attr("x", xScale.range()[1])
              .attr("dy", "3em")
              .style("text-anchor", "end")
              .text(xLabel);

          gEnter.append('g').attr('class', 'y axis')
            .append("text")
              .attr("y", 0)
              .attr("x", 5)
              .attr("dy", -5)
              .style("text-anchor", "start")
              .text(yLabel);

          svg.attr("width", width)
             .attr("height", height);

          gEnter.append("rect")
            .attr("class", "overlay")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .on("mousemove", function() { chart.focus(xScale.invert(d3.mouse(this)[0])); })
            .on("mouseout", function() { chart.focus(); });
        }
        

        var g = svg.select('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.select('.x.axis').attr("transform", "translate(0," + yScale.range()[0] + ")")
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        var areas = g.select('.areas').selectAll('.area')
          .data(yStack, function(d) { return d.name; });
        
        areas.enter()
          .append('path')
          .attr('class', 'area');

        areas
          .attr("d", function(d) { return area(d.values); })
          .attr("fill", function(d) { return colors(d.name); });

        areas.exit().remove();


        var labels = g.select('.areas').selectAll('.lbl')
          .data(yStack, function(d) { return d.name; });

        labels.enter()
          .append('text')
          .attr("x", 2)
          .attr("dy", "0.35em")
          .attr("class", "lbl")
          .text(function(d) { return d.label; });

        labels
          .attr("transform", function(d) { return "translate(" + xScale(d.values[d.values.length-1][0]) + "," + yScale(d.values[d.values.length-1].y0 + d.values[d.values.length-1].y / 2) + ")"; });
      });
    }

    chart.focus = function(x) {
      // console.log('ComponentChart: focus', x);
      if (!x) {
        // clear focus
        svg.select('g.focus').selectAll('circle').remove();
        svg.select('g.focus').selectAll('line').remove();
      } else {
        // set focus
        // x = focal point
        var yStack = stack(funcs.map(function(f) {
          return { name: f.name, values: [[x, f.func(x)]]};
        })).reverse();

        var x0 = 0,
            x1 = x,
            y0 = 0,
            y1 = d3.sum(funcs.map(function(f) {
              return f.func(x);
            }));

        var hline = svg.select('g.focus').selectAll('.hline')
          .data([x]);

        hline.enter()
          .append('line')
          .attr('class', 'hline')
          .style('stroke', 'black')
          .style('stroke-width', '2px')
          .style('fill', 'none')
          .style('opacity', 0.5);

        hline
          .attr('x1', xScale(x0))
          .attr('x2', xScale(x1))
          .attr('y1', yScale(y1))
          .attr('y2', yScale(y1));

        hline.exit().remove();

        var vline = svg.select('g.focus').selectAll('.vline')
          .data([x]);

        vline.enter()
          .append('line')
          .attr('class', 'vline')
          .style('stroke', 'black')
          .style('stroke-width', '2px')
          .style('fill', 'none')
          .style('opacity', 0.5);

        vline
          .attr('x1', xScale(x1))
          .attr('x2', xScale(x1))
          .attr('y1', yScale(y0))
          .attr('y2', yScale(y1));

        vline.exit().remove();

        var circles = svg.select('g.focus').selectAll('circle')
          .data(yStack, function(d) { return d.name; });

        circles.enter()
          .append('circle')
          .attr('r', 5)
          .style('fill', function(d) { return colors(d.name); })
          .style('stroke', 'black')
          .style('stroke-width', '2px');

        circles.attr('cx', xScale(x))
          .attr('cy', function(d) { return yScale(d.values[0].y+d.values[0].y0); });

        circles.exit().remove();
      }
    };

    function X(d) {
      return xScale(xValue(d));
    }

    function Y(d) {
      return yScale(yValue(d));
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.xDomain = function(_) {
      if (!arguments.length) return xDomain;
      xDomain = _;
      xValues = d3.range(xDomain[0], xDomain[1]+0.1, 0.1);
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.xLabel = function(_) {
      if (!arguments.length) return xLabel;
      xLabel = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.colors = function(_) {
      if (!arguments.length) return colors;
      colors = _;
      return chart;
    };

    chart.funcs = function(_) {
      if (!arguments.length) return funcs;
      funcs = _;
      return chart;
    };

    return chart;
  };

  var ScatterChart = function() {
    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 960,
        height = 500,
        xScale = d3.scale.linear(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis(),
        yAxis = d3.svg.axis(),
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; },
        xLabel = "",
        yLabel = "",
        xDomain,
        yDomain,
        chartData = [],
        rSize,
        opacity = 1,
        one2one = false,
        line = d3.svg.line(),
        abline;

    function chart(selection) {
      selection.each(function() {
        xScale
          .range([0, width - margin.left - margin.right])
          .domain(xDomain || d3.extent(chartData, function(d) { return xValue(d); }));

        yScale
          .range([height - margin.top - margin.bottom, 0])
          .domain(yDomain || d3.extent(chartData, function(d) { return yValue(d); }));

        line
          .x(function(d) { return xScale(d[0]); })
          .y(function(d) { return yScale(d[1]); });

        xAxis.scale(xScale).ticks(5, "g").orient("bottom");
        yAxis.scale(yScale).ticks(5, "g").orient("left");

        var svg = d3.select(this).selectAll('svg').data([chartData]);

        var gEnter = svg.enter().append('svg').append('g');

        gEnter.append('path').attr('class', 'line one2one')
          .style('stroke', 'black')
          .style('stroke-dasharray', '5,5');
        gEnter.append('path').attr('class', 'line abline')
          .style('stroke', 'blue');
        gEnter.append('g').attr('class', 'x axis')
          .append("text")
            .attr("y", 0)
            .attr("x", width - margin.left - margin.right)
            .attr("dy", "2.9em")
            .style("text-anchor", "end")
            .text(xLabel);
        gEnter.append('g').attr('class', 'y axis')
          .append("text")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dy", 15)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "end")
            .text(yLabel); 
        gEnter.append('g').attr('class', 'circles');

        svg.attr("width", width)
           .attr("height", height);

        var g = svg.select('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.select('.x.axis').attr("transform", "translate(0," + yScale.range()[0] + ")")
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        var circles = g.select('.circles').selectAll('.circle')
          .data(chartData, function(d) { return d.Date; });
        
        circles.enter()
          .append('circle')
          .attr('class', 'circle')
          .attr("r", rSize)
          .on('click', function(d) { selectedDate=d.Date; });

        circles
          .attr("cx", X)
          .attr("cy", Y)
          .attr("opacity", opacity);

        circles.exit().remove();

        if (one2one) {
          g.select('.line.one2one')
              .attr("d", line([[xScale.domain()[0], yScale.domain()[0]], 
                               [xScale.domain()[1], yScale.domain()[1]]]));
        } else {
          g.select('.line.one2one').remove();
        }
        if (abline) {
          g.select('.line.abline')
              .attr("d", line([[xScale.domain()[0], Math.exp(abline[0])*Math.pow(xScale.domain()[0], abline[1])],
                               [xScale.domain()[1], Math.exp(abline[0])*Math.pow(xScale.domain()[1], abline[1])]]));
        } else {
          g.select('.line.abline').attr("d", line([[xScale.domain()[0], xScale.domain()[0]],[xScale.domain()[0], xScale.domain()[0]]]));
        }
      });
    }

    function X(d) {
      return xScale(xValue(d));
    }

    function Y(d) {
      return yScale(yValue(d));
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.xScale = function(_) {
      if (!arguments.length) return xScale;
      xScale = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.xLabel = function(_) {
      if (!arguments.length) return xLabel;
      xLabel = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.xDomain = function(_) {
      if (!arguments.length) return xDomain;
      xDomain = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      return chart;
    };

    chart.r = function(_) {
      if (!arguments.length) return rSize;
      rSize = _;
      return chart;
    };

    chart.opacity = function(_) {
      if (!arguments.length) return opacity;
      opacity = _;
      return chart;
    };

    chart.one2one = function(_) {
      if (!arguments.length) return one2one;
      one2one = _;
      return chart;
    };

    chart.abline = function(_) {
      if (!arguments.length) return abline;
      abline = _;
      return chart;
    };

    return chart;
  };

  var CDFChart = function() {
    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 960,
        height = 500,
        xScale = d3.scale.linear(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis = d3.svg.axis().scale(yScale).ticks(5, 'g').orient("left"),
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; },
        color,
        xLabel = '',
        yLabel = '',
        line = d3.svg.line().x(X).y(Y),
        chartData = [],
        yVariables = [],
        yDomain,
        nestData;

    function chart(selection) {
      selection.each(function() {
        yAxis.scale(yScale).orient("left");

        if (typeof yVariables === 'string') {
          yVariables = [yVariables];
        }

        nestData = yVariables.map(function(name) {
          var x = _.pluck(chartData, name),
                  xSort = x.sort(function (a, b) { return a - b; }),
                  n = x.length;

          var freq = xSort.map(function(d, i) {
            return ((i+1)-0.5)/n;
          });

          return {
            name: name,
            values: d3.zip(freq, xSort)
          };
        });

        if (!color) {
          color = d3.scale.category10().domain(nestData, function(d) { return d.name; });
        }

        xScale
          .range([0, width - margin.left - margin.right])
          .domain([0, 1]);
        yScale
          .range([height - margin.top - margin.bottom, 0])
          .domain(yDomain || [
            d3.min([0, d3.min(nestData, function(d) { return d3.min(d.values, function(d) { return d[1]; }); })]),
            d3.max(nestData, function(d) { return d3.max(d.values, function(d) { return d[1]; }); })]);

        var svg = d3.select(this).selectAll('svg').data([nestData]);

        var gEnter = svg.enter().append('svg').append('g');

        gEnter.append('g').attr('class', 'x axis')
          .append("text")
            .attr("y", 0)
            .attr("x", width - margin.left - margin.right)
            .attr("dy", "2.9em")
            .style("text-anchor", "end")
            .text(xLabel);

        gEnter.append('g').attr('class', 'y axis')
          .append("text")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dy", 15)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "end")
            .text(yLabel); 

        svg.attr("width", width)
           .attr("height", height);

        var g = svg.select('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.select('.x.axis').attr("transform", "translate(0," + yScale.range()[0] + ")")
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        var lines = g.selectAll('.line')
            .data(nestData);
        
        lines.enter().append('path').attr('class', 'line');
        
        lines.attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

        lines.exit().remove();
      });
    }

    function X(d) {
      return xScale(d[0]);
    }

    function Y(d) {
      return yScale(d[1]);
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.xLabel = function(_) {
      if (!arguments.length) return xLabel;
      xLabel = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      return chart;
    };

    chart.yVariables = function(_) {
      if (!arguments.length) return yVariables;
      yVariables = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.yAxis = function(_) {
      if (!arguments.length) return yAxis;
      yAxis = _;
      return chart;
    };

    chart.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };
    return chart;
  };

  var DottyChart = function() {
    var margin = {top: 20, right: 23, bottom: 56, left: 53},
      width = 960,
      height = 500,
      xScale = d3.scale.linear().nice(),
      yScale = d3.scale.linear().nice(),
      xAxis = d3.svg.axis(),
      yAxis = d3.svg.axis(),
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xLabel = "",
      yLabel = "",
      xDomain,
      yDomain,
      chartData = [],
      highlight = [], // optimal value
      optimal = [],  // current value
      r = 1,
      opacity = 1,
      fill = 'black',
      click;

    function chart(selection) {
      selection.each(function() {
        xScale
          .range([0, width - margin.left - margin.right])
          .domain(xDomain || d3.extent(d3.merge([chartData, highlight, optimal]), function(d) { return xValue(d); }))
          .nice();

        var mergeData = d3.merge([chartData, highlight, optimal]);

        var yExtent;
        if (mergeData.length == 1) {
          yExtent = [d3.round(yValue(mergeData[0]), 1)-0.1, d3.round(yValue(mergeData[0]), 1)+0.1];
        } else {
          yExtent = d3.extent(mergeData, function(d) { return yValue(d); });  
        }
        
        yScale
          .range([height - margin.top - margin.bottom, 0])
          .domain(yDomain || yExtent)
          .nice();

        xAxis.scale(xScale).ticks(5).orient("bottom");
        yAxis.scale(yScale).ticks(5).orient("left");

        var svg = d3.select(this).selectAll('svg').data([chartData]);

        var gEnter = svg.enter().append('svg').append('g');

        gEnter.append('g').attr('class', 'circles');
        gEnter.append('g').attr('class', 'x axis');
        gEnter.append('g').attr('class', 'y axis'); 
        gEnter.append('g').attr('class', 'optimal');
        gEnter.append('g').attr('class', 'highlight');
        
        gEnter.select('.x.axis')        
          .append("text")
            .attr("y", 0)
            .attr("x", (width - margin.left - margin.right)/2)
            .attr("dy", 55)
            .style("text-anchor", "middle")
            .text(xLabel);

        gEnter.select('.y.axis')
          .append("text")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dx", -2)
            .attr("dy", -10)
            .style("text-anchor", "end")
            .text(yLabel);

        svg.attr("width", width)
           .attr("height", height);

        var g = svg.select('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.select('.x.axis').attr("transform", "translate(0," + yScale.range()[0] + ")")
            .call(xAxis)
            .selectAll(".tick text")  
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", "-.5em")
              .attr("transform", function(d) {
                  return "rotate(-90)";
                  });

        g.select('.y.axis')
            .call(yAxis);

        var circles = g.select('.circles').selectAll('.circle')
          .data(chartData);
        
        circles.enter()
          .append('circle')
          .attr('class', 'circle');

        circles
          .attr("cx", X)
          .attr("cy", Y)
          .attr("r", r)
          .attr("opacity", opacity)
          .attr("fill", fill)
          .on('click', click);

        circles.exit().remove();

        var highlightCircle = g.select('.highlight').selectAll('.circle')
          .data(highlight);
        
        highlightCircle.enter()
          .append('circle')
          .attr('class', 'circle');

        highlightCircle
          .attr("cx", X)
          .attr("cy", Y)
          .attr("r", 3)
          .attr("opacity", 1)
          .attr("fill", "#d62728");
          // .on('click', click);

        highlightCircle.exit().remove();

        var optimalCircle = g.select('.optimal').selectAll('.circle')
          .data(optimal);

        optimalCircle.enter()
          .append('circle')
          .attr('class', 'circle');

        optimalCircle
          .attr("cx", X)
          .attr("cy", Y)
          .attr("r", 4)
          .attr("opacity", 1)
          .attr("fill", "steelblue")
          .on('click', click);

        optimalCircle.exit().remove();
      });
    }

    function X(d) {
      return xScale(xValue(d));
    }

    function Y(d) {
      return yScale(yValue(d));
    }

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.xScale = function(_) {
      if (!arguments.length) return xScale;
      xScale = _;
      return chart;
    };

    chart.yScale = function(_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return chart;
    };

    chart.xLabel = function(_) {
      if (!arguments.length) return xLabel;
      xLabel = _;
      return chart;
    };

    chart.yLabel = function(_) {
      if (!arguments.length) return yLabel;
      yLabel = _;
      return chart;
    };

    chart.xDomain = function(_) {
      if (!arguments.length) return xDomain;
      xDomain = _;
      return chart;
    };

    chart.yDomain = function(_) {
      if (!arguments.length) return yDomain;
      yDomain = _;
      return chart;
    };

    chart.data = function(_) {
      if (!arguments.length) return chartData;
      chartData = _;
      return chart;
    };

    chart.r = function(_) {
      if (!arguments.length) return r;
      r = _;
      return chart;
    };

    chart.opacity = function(_) {
      if (!arguments.length) return opacity;
      opacity = _;
      return chart;
    };

    chart.fill = function(_) {
      if (!arguments.length) return fill;
      fill = _;
      return chart;
    };

    chart.click = function(_) {
      if (!arguments.length) return click;
      click = _;
      return chart;
    };

    chart.highlight = function(_) {
      if (!arguments.length) return highlight;
      highlight = _;
      return chart;
    };

    chart.optimal = function(_) {
      if (!arguments.length) return optimal;
      optimal = _;
      return chart;
    };

    return chart;
  };

  return {
    TimeseriesAreaChart: TimeseriesAreaChart,
    TimeseriesLineChart: TimeseriesLineChart,
    ZoomableTimeseriesLineChart: ZoomableTimeseriesLineChart,
    Timeseries: Timeseries,
    ComponentChart: ComponentChart,
    ScatterChart: ScatterChart,
    CDFChart: CDFChart,
    DottyChart: DottyChart
  };
});

