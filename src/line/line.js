(function(extend) {
var defaults = {
  margin: {
    top: 10,
    right: 10,
    bottom: 30,
    left: 50
  },
  aspectRatio: 16 / 9,
  x: {
    ticks: 5,
    getDomain: function(flatData) {
      return d3.extent(flatData, this.x.getValue.bind(this));
    },
    getRange: function() {
      return [0, this.innerWidth];
    }
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
        showLabel = sett.showLabels !== undefined ? sett.showLabels : data.length > 1,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        dataLayer = chartInner.select(".data"),
        getXScale = function() {
          switch(sett.x.type) {
          case "linear":
            return d3.scaleLinear();
          case "ordinal":
            return d3.scaleOrdinal();
          default:
            return d3.scaleTime();
          }

        },
        labelX = innerWidth,
        labelY = function(d) {
          var points = mergedSettings.z.getDataPoints(d);
          return y(mergedSettings.y.getValue.call(sett, points[points.length - 1]));
        },
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

      x = rtnObj.x = getXScale().range(sett.x.getRange.call(sett, flatData));
      y = rtnObj.y = d3.scaleLinear().range([innerHeight, 0]);

      x.domain(sett.x.getDomain.call(sett, flatData));
      y.domain([
        0,
        d3.max(flatData, sett.y.getValue.bind(sett))
      ]);
      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data");
      }

      lines = dataLayer.selectAll(".dline")
        .data(data, sett.z.getId.bind(sett));

      lines
        .enter()
        .append("path")
          .attr("class", classFn)
          .attr("fill", "none")
          .attr("d", lineFn);

      lines
        .transition(transition)
        .attr("d", lineFn);

      lines
        .exit()
          .remove();
      labels = dataLayer.selectAll(".label")
        .data(
          function() {
            if (typeof showLabel === "function") {
              return data.filter(showLabel.bind(sett));
            } else if (showLabel === false) {
              return [];
            }
            return data;
          }()
          , sett.z.getId.bind(sett)
        );

      labels
        .enter()
          .append("text")
            .text(sett.z.getText.bind(sett))
            .attr("aria-hidden", "true")
            .attr("class", "label")
            .attr("fill", "#000")
            .attr("x", labelX)
            .attr("y", labelY)

            .attr("text-anchor", "end");

      labels
        .transition(transition)
        .attr("y", labelY);

      labels
        .exit()
          .remove();

      if (xAxisObj.empty()) {
        xAxisObj = chartInner.append("g")
        .attr("class", "x axis")
        .attr("aria-hidden", "true")
        .attr("transform", "translate(0," + innerHeight + ")");

        xAxisObj
          .append("text")
            .attr("class", "chart-label")
            .attr("fill", "#000")
            .attr("x", innerWidth)
            .attr("dy", "-0.5em")
            .attr("text-anchor", "end")
            .text(settings.x.label);
      }
      xAxisObj.call(
        d3.axisBottom(x)
          .ticks(mergedSettings.x.ticks)
      );

      if (yAxisObj.empty()) {
        yAxisObj = chartInner.append("g")
          .attr("class", "y axis")
          .attr("aria-hidden", "true");

        yAxisObj
          .append("text")
            .attr("class", "chart-label")
            .attr("fill", "#000")
            .attr("y", "0")
            .attr("transform", "rotate(-90)")
            .attr("dy", "1.5em")
            .attr("text-anchor", "end")
            .text(settings.y.label);
      }
      yAxisObj.call(
        d3.axisLeft(y)
          .ticks(mergedSettings.y.ticks)
      );
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
    x, y, rtnObj, process;

  rtnObj = {
    settings: mergedSettings,
    x: x,
    y: y,
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
    if (mergedSettings.datatable === false) return;
    drawTable.apply(rtnObj);
    d3.stcExt.addIEShim(svg, outerHeight, outerWidth);
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
