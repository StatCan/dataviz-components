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
          sett.filterData.call(sett, sett.data) : sett.data,
        showLabel = sett.showLabels || data.length > 1,
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
        flatData = [].concat.apply([], data.map(function(d) {
          return sett.z.getDataPoints.call(sett, d);
        })),
        lines, labels;

      x.domain(d3.extent(flatData, sett.x.getValue.bind(sett)));
      y.domain([
        0,
        d3.max(flatData, sett.y.getValue.bind(sett))
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

      if(showLabel) {
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
      }

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
        columns = sett.z.getDataPoints.call(sett, data[keys[0]]),
        table, header, body, dataRows, dataRow, c;

      if (details.empty()) {
        details = parent
          .append("details")
            .attr("class", "chart-data-table");

        details.append("summary")
          .attr("id", "chrt-dt-tbl")
          .text(sett.datatable.title || "Data");

        table = details
          .append("table")
            .attr("class", "table");
        header = table.append("thead").append("tr");
        body = table.append("tbody");

        header.append("td");

        for(c = 0; c < columns.length; c++) {
          header.append("th")
            .datum(columns[c])
            .text((sett.x.getText || sett.x.getValue).bind(sett));
        }

        dataRows = body.selectAll("tr")
          .data(data);

        dataRow = dataRows
          .enter()
            .append("tr");

        dataRow
          .append("th")
            .text((sett.z.getText || sett.z.getValue).bind(sett));

        for(c = 0; c < columns.length; c++) {
          dataRow
            .append("td")
              .datum(function(d) {
                return sett.z.getDataPoints.call(sett, d)[c];
              })
              .text((sett.y.getText ? sett.y.getText : sett.y.getValue).bind(sett));
        }

        if ($) {
          $(".chart-data-table summary").trigger("wb-init.wb-details");
        }
      }
    },
    rtnObj, process;

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

  process = function() {
    draw.apply(rtnObj);
    if (mergedSettings.datatTable === false) return;
    drawTable.apply(rtnObj);
  };
  if (!mergedSettings.data) {
    d3.json(mergedSettings.url, function(error, data) {
      mergedSettings.data = data;
      process();
    });
  } else {
    process();
  }

  return rtnObj;
};

})(jQuery.extend);
