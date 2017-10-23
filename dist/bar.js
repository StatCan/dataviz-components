(function(extend) {
var defaults = {
  margin: {
    top: 18,
    right: 10,
    bottom: 30,
    left: 50
  },
  x: {
    getDomain: function(data) {
      var sett = this,
        keys = [],
        i, d, x;

      for (i = 0; i < data.length; i++) {
        d = data[i];
        x = sett.x.getValue.call(sett, d);

        if (keys.indexOf(x) === -1) {
          keys.push(x);
        }
      }

      return keys;
    }
  },
  z: {
    getDomain: function(data) {
      var sett = this,
        keys = [],
        i, d, x;

      for (i = 0; i < data.length; i++) {
        d = data[i];
        x = sett.z.getId.call(sett, d);

        if (keys.indexOf(x) === -1) {
          keys.push(x);
        }
      }

      return keys;
    }
  },
  groupPadding: 0.2,
  barPadding: 0.1,
  aspectRatio: 16 / 9,
  width: 600
};

this.barChart = function(svg, settings) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    chartInner = svg.select("g"),
    dataLayer = chartInner.select(".data"),
    transition = d3.transition()
      .duration(1000),
    draw = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, sett.data) : sett.data,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        showValue = sett.showValues,
        flatData = [].concat.apply([], data.map(function(d) {
          return sett.z.getDataPoints.call(sett, d);
        })),
        grpClassFn = function(d,i){
          var cl = "bar-group bar-group" + (i + 1);

          if (sett.x && sett.x.getClass && typeof sett.x.getClass === "function") {
            cl += " " + sett.x.getClass.call(sett, d);
          }

          return cl;
        },
        grpTransform = function() {
          return "translate(" + x0(sett.x.getValue.apply(this,arguments)) + ",0)";
        },
        barClassFn = function(d,i){
          var cl = "bar bar" + (i + 1);

          if (sett.x && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass.call(sett, d);
          }

          return cl;
        },
        barsFn = function() {
          var group = d3.select(this),
            datum = sett.z.getDataPoints.call(sett, group.datum()),
            bars = group.selectAll(".bar")
              .data(datum, sett.z.getId.bind(sett)),
            values = group.selectAll(".value")
              .data(function() {
                if (typeof showValue === "function") {
                  return datum.filter(showValue.bind(sett));
                } else if (showValue !== true) {
                  return[];
                }
                return datum.filter(function(d) {
                  return sett.y.getValue.call(sett, d) > 0;
                });
              }, sett.z.getId.bind(sett));

          bars
            .enter()
            .append("rect")
              .attr("x", xFn)
              .attr("y", innerHeight)
              .transition(transition)
              .attr("y", yFn)
              .attr("width", x1.bandwidth())
              .attr("height", heightFn.bind(sett))
              .attr("class", barClassFn.bind(sett));

          bars
            .transition(transition)
            .attr("x", xFn)
            .attr("y", yFn)
            .attr("width", x1.bandwidth())
            .attr("height", heightFn.bind(sett))
            .attr("class", barClassFn.bind(sett));

          bars
            .exit()
              .remove();

          values
            .enter()
              .append("text")
                .attr("x", function() {
                  return xFn.apply(this, arguments) + x1.bandwidth() / 2;
                })
                .attr("aria-hidden", "true")
                .attr("y", yFn)
                .attr("dy", "-0.5em")
                .attr("text-anchor", "middle")
                .attr("class", "value")
                .text(sett.y.getText.bind(sett));

          values
            .transition(transition)
            .attr("x", xFn)
            .attr("y", yFn)
            .text(sett.y.getText.bind(sett));

          values
            .exit()
              .remove();
        },
        xFn = function() {
          return x1(sett.z.getId.apply(this, arguments));
        },
        yFn = function(d) {
          return y(sett.y.getValue.call(sett, d));
        },
        heightFn = function() {
          return innerHeight - yFn.apply(this, arguments);
        },
        barGroups;

      x0 = rtnObj.x0 = d3.scaleBand()
        .paddingInner(sett.groupPadding);

      x1 = rtnObj.x1 = d3.scaleBand()
        .padding(sett.barPadding);

      y = rtnObj.y = d3.scaleLinear()
        .rangeRound([innerHeight, 0]);

      x0.domain(sett.x.getDomain.call(sett, data)).rangeRound([0, innerWidth]);
      x1.domain(sett.z.getDomain.call(sett, flatData)).rangeRound([0, x0.bandwidth()]);
      y.domain([
        0,
        d3.max(flatData, sett.y.getValue.bind(sett)) * (showValue === false ? 1 : 1.05)
      ]);

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data");
      }

      barGroups = dataLayer.selectAll(".bar-group")
        .data(data);

      barGroups
        .enter()
        .append("g")
          .attr("class", grpClassFn)
          .attr("transform", grpTransform)
          .each(barsFn);

      barGroups
        .transition(transition)
        .attr("transform", grpTransform)
        .each(barsFn);

      barGroups
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
            .text(sett.x.label);
      }
      xAxisObj.call(
        d3.axisBottom(x0)
          .ticks(sett.x.ticks)
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
            .attr("dy", "-8")
            .attr("text-anchor", "middle")
            .text(sett.y.label);
      }
      yAxisObj.call(
        d3.axisLeft(y)
          .ticks(sett.y.ticks)
          .tickFormat(sett.y.getTickText ? sett.y.getTickText.bind(sett) : null)
      );
    },
    drawTable = function() {
      /*var sett = this.settings,
        summaryId = "chrt-dt-tbl",
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(sett.data, "table") : sett.data,
        parent = svg.select(
          svg.classed("svg-shimmed") ? function(){return this.parentNode.parentNode;} : function(){return this.parentNode;}
        ),
        details = parent.select("details");*/
    },
    clear = function() {
      dataLayer.remove();
    },
    x0, x1, y, rtnObj, process;

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

})(jQuery.extend, jQuery);
