(function(extend) {
var defaults = {
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
  },
  width: 600
};

this.areaChart = function(svg, settings) {
  var mergedSettings = extend({}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
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
        keys = sett.z.getKeys(data),
        classFn = function(d,i){
          var cl = "area area" + (i + 1);

          if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass(d);
          }

          return cl;
        },
        getTotal = function(d) {
          var total = 0;
          for(var k = 0; k < keys.length; k++) {
            total += parseInt(sett.y.getValue(d, keys[k], data),10);
          }
          return total;
        },
        stackData, areas, labels;

      x.domain(d3.extent(data, sett.x.getValue));
      y.domain([
        0,
        d3.max(data, sett.y.getTotal ? sett.y.getTotal : getTotal)
      ]);
      stackData = stack
        .keys(keys)
        .value(sett.y.getValue)(data);

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data");
      }

      areas = dataLayer.selectAll(".area")
        .data(stackData);

      areas
        .enter()
        .append("path")
          .attr("class", classFn)
          .attr("d", area);

      areas
        .transition(transition)
        .attr("d", area);

      labels = dataLayer.selectAll(".label");
      labels
        .data(stackData)
        .enter()
        .append("text")
          .text(sett.z.getText)
          .attr("aria-hidden", "true")
          .attr("class", "label")
          .attr("fill", "#000")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("dy", ".45em")
          .attr("text-anchor", "end");

      labels
        .transition(transition)
        .attr("y", labelY);

      if (xAxisObj.empty()) {
        xAxisObj = chartInner.append("g")
        .attr("class", "x axis")
        .attr("aria-hidden", "true")
        .attr("transform", "translate(0," + innerHeight + ")");
      }
      xAxisObj.call(xAxis)
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("x", innerWidth)
          .attr("dy", "-0.5em")
          .attr("text-anchor", "end")
          .text(settings.x.label);

      if (yAxisObj.empty()) {
        yAxisObj = chartInner.append("g")
          .attr("class", "y axis")
          .attr("aria-hidden", "true");
      }
      yAxisObj.call(yAxis)
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("y", "0")
          .attr("transform", "rotate(-90)")
          .attr("dy", "1.5em")
          .attr("text-anchor", "end")
          .text(settings.y.label);
    },
    rtnObj;

  rtnObj = {
    settings: mergedSettings,
    svg: svg
  };

  svg
    .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img")
    .attr("aria-label", mergedSettings.altText);

  if (chartInner.empty()) {
    chartInner = svg.append("g")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
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

})(jQuery.extend);
