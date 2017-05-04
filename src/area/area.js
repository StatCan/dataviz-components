(function() {
var areaDefault = {
    margin: {
      top: 0,
      right: 0,
      bottom: 30,
      left: 50
    },
    aspectRatio: 16 / 9,
    x: {
      ticks: 5
    },
    y: {
      ticks: 10
    }
  },
  outerWidth = 600;

this.getAreaChart = function(svg, settings) {
  var mergedSettings = $.extend({}, areaDefault, settings),
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    x = d3.scaleTime().range([0, innerWidth]),
    y = d3.scaleLinear().range([innerHeight, 0]),
    xAxis = d3.axisBottom(x).ticks(mergedSettings.x.ticks),
    yAxis = d3.axisLeft(y).ticks(mergedSettings.y.ticks),
    chartInner = svg.select("g"),
    area = d3.area()
      .x(function(d) {
        return x(mergedSettings.x.getValue(d.data));
      })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); }),
    stack = d3.stack(),
    transition = d3.transition()
      .duration(1000),
    draw = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(sett.data) : sett.data,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        dataLayer = chartInner.select(".data"),
        labelX = innerWidth - 6,
        labelY = function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); },
        keys = sett.z.getKeys(data), stackData, areas, labels;


      x.domain(d3.extent(data, sett.x.getValue));
      y.domain([
        0,
        d3.max(data, function(d) {
          var total = 0;
          for(var k = 0; k < keys.length; k++) {
            total += parseInt(sett.y.getValue(d, keys[k], data),10);
          }
          return total;
        })
      ]);
      stackData = stack
        .keys(keys)
        .value(sett.y.getValue)(data);

      chartInner
        .attr("transform", "translate(" + sett.margin.left + "," + sett.margin.top + ")");

      if (dataLayer.empty()) {
        dataLayer = chartInner
          .append("g")
            .attr("class", "data");
      }

      areas = dataLayer.selectAll(".area")
        .data(stackData);

      areas
        .enter()
        .append("path")
          .attr("class", function(d,i){return "area area" + (i + 1);})
          .attr("d", area);

      areas
        .transition(transition)
        .attr("d", area);

      labels = dataLayer.selectAll(".label")
        .data(stackData);

      labels
        .enter()
        .append("text")
          .attr("class", "label")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("dy", ".45em")
          .text(function(d) { return d.key; });

      labels
        .transition(transition)
        .attr("y", labelY);

      if (xAxisObj.empty()) {
        xAxisObj = chartInner.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + innerHeight + ")");
      }
      xAxisObj.call(xAxis);

      if (yAxisObj.empty()) {
        yAxisObj = chartInner.append("g")
          .attr("class", "y axis");
      }
      yAxisObj.call(yAxis);
    },
    rtnObj;

  rtnObj = {
    settings: mergedSettings,
    svg: svg
  };

  svg
    .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
    .attr("preserveAspectRatio", "xMidYMid meet");

  if (chartInner.empty()) {
    chartInner = svg.append("g");
  }

  if (!mergedSettings.data) {
    d3.json(mergedSettings.url, function(error, data) {
      mergedSettings.data = data;
      draw.apply(rtnObj);
    });
  } else {
    draw.apply(rtnObj);
  }

  return rtnObj;
};

})();
