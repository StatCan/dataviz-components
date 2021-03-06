(function(extend) {
var defaults = {
  margin: {
    top: 15,
    right: 10,
    bottom: 30,
    left: 50
  },
  aspectRatio: 16 / 9,
  x: {
    ticks: 5
  },
  y: {
    ticks: 10,
    totalProperty: "total",
    getTotal: function(d, index, data) {
      var sett = this,
        total, keys;
      if (!d[sett.y.totalProperty]) {
        keys = sett.z.getKeys.call(sett, data);
        total = 0;
        for(var k = 0; k < keys.length; k++) {
          total += sett.y.getValue.call(sett, d, keys[k], data);
        }
        d[sett.y.totalProperty] = total;
      }

      return d[sett.y.totalProperty];
    }
  },
  width: 600
};

this.areaChart = function(svg, settings, data) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    chartInner = svg.select("g.margin-offset"),
    dataLayer = chartInner.select(".data"),
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
        filteredData = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, data) : data,
        keys = sett.z.getKeys.call(sett, filteredData),
        stackData = stack
          .keys(keys)
          .value(sett.y.getValue.bind(sett))(filteredData),
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        labelX = innerWidth - 6,
        getXScale = function() {
          return d3.scaleTime();
        },
        labelY = function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); },
        classFn = function(d,i){
          var cl = "area area" + (i + 1);

          if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass.call(sett, d);
          }

          return cl;
        },
        areas, labels;

      x = rtnObj.x = getXScale().range([0, innerWidth]);
      y = rtnObj.y = d3.scaleLinear().range([innerHeight, 0]);

      x.domain(d3.extent(filteredData, sett.x.getValue.bind(sett)));
      y.domain([
        0,
        d3.max(filteredData, sett.y.getTotal.bind(sett))
      ]);

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data");
      }

      areas = dataLayer.selectAll(".area")
        .data(stackData, sett.z.getId.bind(sett));

      areas
        .enter()
        .append("path")
          .attr("class", classFn)
          .attr("d", area);

      areas
        .transition(transition)
        .attr("d", area);

      areas
        .exit()
          .remove();

      labels = dataLayer.selectAll(".area-label")
        .data(stackData, sett.z.getId.bind(sett));
      labels
        .enter()
        .append("text")
          .text(sett.z.getText.bind(sett))
          .attr("aria-hidden", "true")
          .attr("class", "area-label")
          .attr("fill", "#000")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("dy", "1em")
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
      } else {
        xAxisObj.select("text").text(settings.x.label);
      }
      xAxisObj.call(
        d3.axisBottom(x)
          .ticks(mergedSettings.x.ticks)
          .tickSizeOuter(sett.x.tickSizeOuter ? sett.x.tickSizeOuter : null)
          .tickFormat(sett.x.getTickText ? sett.x.getTickText.bind(sett) : null)
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
            .attr("dy", "-0.5em")
            .attr("text-anchor", "start")
            .text(settings.y.label);
      } else {
        yAxisObj.select("text").text(settings.y.label);
      }
      yAxisObj.call(
        d3.axisLeft(y)
          .ticks(mergedSettings.y.ticks)
          .tickSizeOuter(sett.y.tickSizeOuter ? sett.y.tickSizeOuter : null)
          .tickFormat(sett.y.getTickText ? sett.y.getTickText.bind(sett) : null)
        );
    },
    drawTable = function() {
      var sett = this.settings,
        summaryId = "chrt-dt-tbl",
        filteredData = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(data, "table") : data,
        parent = svg.select(
          svg.classed("svg-shimmed") ? function(){return this.parentNode.parentNode;} : function(){return this.parentNode;}
        ),
        details = parent
          .select("details"),
        keys = sett.z.getKeys.call(sett, filteredData),
        table, header, body, dataRows, dataRow, k;

      if (details.empty()) {
        details = parent
          .append("details")
            .attr("class", "chart-data-table");

        details.append("summary")
          .attr("id", summaryId)
          .text(sett.datatable.title);

        table = details
          .append("table")
            .attr("class", "table")
            .attr("aria-labelledby", summaryId);
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
          .data(filteredData);

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

        if ($ || wb) {
          $(".chart-data-table summary").trigger("wb-init.wb-details");
        }
      }
    },
    clear = function() {
      dataLayer.remove();
    },
    x, y, rtnObj, process;

  rtnObj = {
    settings: mergedSettings,
    clear: clear,
    svg: svg
  };

  svg
    .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img")
    .attr("aria-label", mergedSettings.altText);

  if (chartInner.empty()) {
    chartInner = svg.append("g")
      .attr("class", "margin-offset")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
  }

  process = function() {
    draw.apply(rtnObj);
    d3.stcExt.addIEShim(svg, outerHeight, outerWidth);
    if (mergedSettings.datatable === false) return;
    drawTable.apply(rtnObj);
  };
  if (data === undefined) {
    d3.json(mergedSettings.url, function(error, xhr) {
      data = xhr;
      process();
    });
  } else {
    process();
  }

  return rtnObj;
};

})(jQuery.extend, jQuery);
