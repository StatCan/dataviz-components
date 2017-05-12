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
    ticks: 10,
  },
  z: {
    dataPointsProperty: "values"
  },
  width: 600
};

this.lineChart = function(svg, settings) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    x = d3.scaleTime().range([0, innerWidth]),
    y = d3.scaleLinear().range([innerHeight, 0]),
    xAxis = d3.axisBottom(x).ticks(mergedSettings.x.ticks),
    yAxis = d3.axisLeft(y).ticks(mergedSettings.y.ticks),
    chartInner = svg.select("g"),
    line = d3.line()
      .x(function(d) {
        return x(mergedSettings.x.getValue.call(mergedSettings, d));
      })
      .y(function(d) {
        return y(mergedSettings.y.getValue.call(mergedSettings, d));
      }),
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
        labelY = function(d) { return y(mergedSettings.y.getValue.call(sett, d)); },
        classFn = function(d,i){
          var cl = "dline dline" + (i + 1);

          if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass.call(sett, d);
          }

          return cl;
        },
        lineFn = function(d) {
          return line(sett.z.getDataPoints.call(sett, d));
        },
        lines, labels;

      x.domain(d3.extent(
        [].concat.apply([], data.map(sett.z.getDataPoints.bind(sett))),
        sett.x.getValue.bind(sett)
      ));
      y.domain([
        0,
        d3.max(data, function(d){
          return d3.max(sett.z.getDataPoints.call(sett, d), sett.y.getValue.bind(sett));
        })
      ]);
      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data");
      }

      lines = dataLayer.selectAll(".line")
        .data(data);

      lines
        .enter()
        .append("path")
          .attr("class", classFn)
          .attr("fill", "none")
          .attr("d", lineFn);

      lines
        .transition(transition)
        .attr("d", lineFn);

      labels = dataLayer.selectAll(".label");
      labels
        .data(data)
        .enter()
        .append("text")
          .text(sett.z.getText.bind(sett))
          .datum(function(d){
            var points = sett.z.getDataPoints.call(sett, d);
            return points[points.length - 1];

          })
          .attr("aria-hidden", "true")
          .attr("class", "label")
          .attr("fill", "#000")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("dy", "1em")
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
    drawTable = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(sett.data, "table") : sett.data,
        parent = svg.select(function(){return this.parentNode;}),
        details = parent
          .select("details"),
        keys = sett.z.getKeys.call(sett, data),
        table, header, body, dataRows, dataRow, k;

      if (details.empty()) {
        details = parent
          .append("details")
            .attr("class", "chart-data-table");

        details.append("summary")
          .attr("id", "chrt-dt-tbl")
          .text(sett.datatableTitle);

        table = details
          .append("table")
            .attr("class", "table");
        header = table.append("thead").append("tr");
        body = table.append("tbody");

        header.append("th")
          .text(sett.x.label);

        for(k = 0; k < keys.length; k++) {
          header.append("th")
            .text(sett.z.getText.bind(sett)({
              key: keys[k]
            }));
        }

        dataRows = body.selectAll("tr")
          .data(data);

        dataRow = dataRows
          .enter()
            .append("tr");

        dataRow
          .append("th")
            .text((sett.x.getText || sett.x.getValue).bind(sett));

        for(k = 0; k < keys.length; k++) {
          dataRow
            .append("td")
              .text(function(d) {
                if (sett.y.getText) {
                  return sett.y.getText.call(sett, d, keys[k]);
                }
                return sett.y.getValue.call(sett, d, keys[k]);
              });
        }

        if ($) {
          $(".chart-data-table summary").trigger("wb-init.wb-details");
        }
      }
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
      drawTable.apply(rtnObj);
    });
  } else {
    draw.apply(rtnObj);
    drawTable.apply(rtnObj);
  }

  return rtnObj;
};

})(jQuery.extend);
