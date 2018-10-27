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
    ticks: 10
  },
  showLabels: false,
  pointRadius: 5,
  width: 600
};

this.scatterChart = function(svg, settings, data) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    chartInner = svg.select("g.margin-offset"),
    dataLayer = chartInner.select(".data"),
    transition = d3.transition()
      .duration(1000)
      .ease(d3.easeLinear),
    getOutliarBounds = function(data) {
      var numericalSort = function (a, b) {
          return a - b;
        },
        xArray, yArray, p5;

      xArray = data.map(function(d) {
        return mergedSettings.x.getValue(d);
      }).sort(numericalSort);

      yArray = data.map(function(d) {
        return mergedSettings.y.getValue(d);
      }).sort(numericalSort);

      p5 = Math.floor(data.length * .05);

      return {
        x: {
          min: xArray[p5],
          max: xArray[xArray.length - p5]
        },
        y: {
          min: yArray[p5],
          max: yArray[yArray.length - p5]
        }
      };
    },
    draw = function() {
      var sett = this.settings,
        filteredData = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, data) : data,
        displayOnly = sett.displayOnly && typeof sett.displayOnly === "function" ?
          sett.displayOnly.call(sett, filteredData) : null,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        classFn = function(d,i){
          var cl = "point point" + (i + 1);

          if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass.call(sett, d);
          }

          if (!displayOnly || displayOnly.indexOf(d) !== -1) {
            cl += " visible";
          }

          return cl;
        },
        labelClassFn = function(d, i) {
          var cl = "label label" + (i + 1);

          if (!displayOnly || displayOnly.indexOf(d) !== -1) {
            cl += " visible";
          }

          return cl;
        },
        idFn = function() {
          if (sett.z && sett.z.getId && typeof sett.z.getId === "function") {
            return sett.z.getId.apply(sett, arguments);
          }
        },
        xFn = function() {return x(sett.x.getValue.apply(this, arguments));},
        yFn = function() {return y(sett.y.getValue.apply(this, arguments));},
        xLabelFn = function(d, i, selection) {
          var bbox = selection[i].getBBox(),
            lblX = xFn.apply(sett, arguments) + sett.pointRadius;

          if (lblX + bbox.width > innerWidth) {
            lblX -= bbox.width + sett.pointRadius * 2;
          }

          return lblX;
        },
        yLabelFn = function(d) {
          var lblY = yFn(d) - sett.pointRadius;

          if (lblY < 0) {
            lblY =+ sett.pointRadius * 2;
          }

          return lblY;
        },
        padding, xDomain, yDomain, pDomain, pRange, pRadius, bounds, scatter, labels;

      if (typeof sett.pointRadius === "object") {
        pDomain = typeof sett.pointRadius.getDomain === "function" ? sett.pointRadius.getDomain.call(sett, filteredData) : [0, 1];
        pRange = sett.pointRadius.getRange.call(sett, filteredData) || [1, 1];
        p = rtnObj.p = d3.scaleLinear().range(pRange).domain(pDomain);
        pRadius = function() {
          return p(sett.pointRadius.getValue.apply(this, arguments));
        };
        padding = pRange[1];
      } else {
        pRadius = sett.pointRadius || 1;
        padding = pRadius;
      }

      if (sett.filterOutliars) {
        bounds = getOutliarBounds(filteredData);

        xDomain = [bounds.x.min, bounds.x.max];
        yDomain = [bounds.y.min, bounds.y.max];
      } else {
        xDomain = d3.extent(displayOnly ? displayOnly : filteredData, sett.x.getValue.bind(sett));
        yDomain = d3.extent(displayOnly ? displayOnly : filteredData, sett.y.getValue.bind(sett));
      }

      x = rtnObj.x = d3.scaleLinear().range([padding, innerWidth - (padding * 2)]);
      y = rtnObj.y = d3.scaleLinear().range([innerHeight - (padding * 2), padding]);

      x.domain(xDomain);
      y.domain(yDomain);

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data");
      }

      scatter = dataLayer.selectAll(".point")
        .data(filteredData, sett.z.getId.bind(sett));

      scatter
        .enter()
        .append("circle")
          .attr("r", pRadius)
          .attr("id", idFn)
          .attr("class", classFn)
          .attr("cx", xFn)
          .attr("cy", yFn);

      scatter
        .transition(transition)
        .attr("class", classFn)
        .attr("cx", xFn)
        .attr("cy", yFn);

      scatter
        .exit()
          .remove();

      labels = dataLayer.selectAll(".label");
      if (sett.showLabels) {
        labels
          .data(filteredData)
          .enter()
          .append("text")
            .text(sett.z.getText.bind(sett))
            .attr("aria-hidden", "true")
            .attr("class", labelClassFn)
            .attr("fill", "#000")
            .attr("x", xLabelFn)
            .attr("y", yLabelFn);

        labels
          .transition(transition)
          .text(sett.z.getText.bind(sett))
          .attr("class", labelClassFn)
          .attr("x", xLabelFn)
          .attr("y", yLabelFn);

        labels
          .exit()
            .remove();
      } else {
        labels
          .remove();
      }

      if (xAxisObj.empty()) {
        xAxisObj = chartInner.append("g")
        .attr("class", "x axis")
        .attr("aria-hidden", "true")
        .attr("transform", "translate(0," + (innerHeight - (padding * 2)) + ")");

        xAxisObj
          .append("text")
            .attr("class", "chart-label")
            .attr("fill", "#000")
            .attr("x", innerWidth - (padding * 2))
            .attr("dy", "-0.5em")
            .attr("text-anchor", "end")
            .text(settings.x.label);
      } else {
        xAxisObj.select("text").text(settings.x.label);
      }
      xAxisObj.call(
        d3.axisBottom(x)
          .ticks(mergedSettings.x.ticks)
          .tickFormat(sett.x.getTickText ? sett.x.getTickText.bind(sett) : null)
      );

      if (yAxisObj.empty()) {
        yAxisObj = chartInner.append("g")
          .attr("class", "y axis")
          .attr("aria-hidden", "true")
          .attr("transform", "translate(" + padding + ",0)");

        yAxisObj
          .append("text")
            .attr("class", "chart-label")
            .attr("fill", "#000")
            .attr("y", padding)
            .attr("dy", "-0.5em")
            .attr("text-anchor", "start")
            .text(settings.y.label);
      } else {
        yAxisObj.select("text").text(settings.y.label);
      }
      yAxisObj.call(
        d3.axisLeft(y)
          .ticks(mergedSettings.y.ticks)
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
        table, header, body, dataRows, dataRow;

      if (details.empty()) {
        details = parent
          .append("details")
            .attr("class", "chart-data-table");

        details.append("summary")
          .attr("id", summaryId)
          .text(settings.datatable.title || "Data");

        table = details
          .append("table")
            .attr("class", "table")
            .attr("aria-labelledby", summaryId);
        header = table.append("thead").append("tr");
        body = table.append("tbody");

        header.append("th")
          .text(settings.z.label);
        header.append("th")
          .text(settings.x.label);
        header.append("th")
          .text(settings.y.label);

        dataRows = body.selectAll("tr")
          .data(filteredData);

        dataRow = dataRows
          .enter()
            .append("tr");

        dataRow
          .append("th")
            .text(settings.z.getText.bind(sett));

        dataRow
          .append("td")
            .text((settings.x.getText || settings.x.getValue).bind(sett));

        dataRow
          .append("td")
            .text((settings.y.getText || settings.y.getValue).bind(sett) );

        if ($ || wb) {
          $(".chart-data-table summary").trigger("wb-init.wb-details");
        }
      }
    },
    clear = function() {
      dataLayer.remove();
    },
    x, y, p, rtnObj, process;

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

  if (svg.node().msContentZoomFactor) {
    svg.attr("height", outerHeight);
  }

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

})(jQuery.extend);
