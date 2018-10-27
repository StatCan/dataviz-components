(function(extend) {
var defaults = {
  margin: {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
  },
  sort: function(a, b) {
    return this.getId(a).localeCompare(this.getId(b));
  },
  innerRadius: 0,
  padding: 0.0008,
  aspectRatio: 16 / 9,
  width: 600
};

this.pieChart = function(svg, settings, data) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    chartInner = svg.select("g.margin-offset"),
    dataLayer = chartInner.select(".data"),
    elipsis = "...",
    arcTextPadding = 5,
    getTransition = function(transition) {
      var t = transition || d3.transition();
      return t.duration(1000);
    },
    draw = function() {
      var sett = this.settings,
        filteredData = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, data) : data,
        outerRadius = Math.min(innerHeight, innerWidth) / 2,
        innerRadius = sett.innerRadius / 2,
        getStartAngle = function(d) {
          return d.startAngle;
        },
        getEndAngle = function(d) {
          return d.endAngle;
        },
        getPadAngle = function(d) {
          return d.padAngle;
        },
        arc = d3.arc()
          .startAngle(getStartAngle)
          .endAngle(getEndAngle)
          .padAngle(getPadAngle)
          .innerRadius(innerRadius)
          .outerRadius(outerRadius),
        padAngle = typeof sett.padding === "function" ? sett.padding.bind(sett) : sett.padding || 0,
        valueFn = sett.getValue ? sett.getValue.bind(sett) : null,
        idFn = sett.getId ? function(d, i, sel) {
          return sett.getId.call(sett, d.data, i, sel);
        } : null,
        textFn = sett.getText ? sett.getText.bind(sett) : null,
        textRedrawFn = function() {
          d3.select(this).select("textPath").text(truncateText);
        },
        classFn = function(d,i){
          var cl = "arc arc" + (i + 1);

          if (sett.getClass && typeof sett.getClass === "function") {
            cl += " " + sett.getClass.call(sett, d);
          }

          return cl;
        },
        arcTween = function(d) {
          var oldD = this.parentNode._current,
            newD = d,
            i;

          i = d3.interpolate(oldD, newD);

          this.parentNode._current = newD;

          return function(t) {
            var td = i(t);
            td.parent = d.parent;
            return arc(td);
          };

        },

        truncateText = function(d, i, selection) {
          var obj = selection[0],
            textObj = d3.select(obj.parentNode).append("tspan"),
            text = textFn.call(this, d.data, i, selection),
            getText = function() {
              var angle, arcLength, elipsisLength, textLength, pos, ratio;

              angle = (getEndAngle(d) - getStartAngle(d)) / (2 * Math.PI);
              arcLength = (angle * 2 * Math.PI * outerRadius) - (arcTextPadding * 2);

              if (!text || text.length < 1 || arcLength <= 0)
                return null;


              textObj.text(elipsis);
              elipsisLength = textObj.node().getComputedTextLength();
              textObj.text(text);
              textLength = textObj.node().getComputedTextLength();

              if (textLength < arcLength)
                return text;

              if (elipsisLength * 3 > arcLength)
                return null;

              ratio = textLength / arcLength;
              pos = Math.ceil(text.length * 1 / ratio);
              while (textObj.node().getSubStringLength(0, pos) + elipsisLength > arcLength){
                pos--;
              }
              return text.substr(0, pos) + elipsis;
            },
            rtn = getText();

          textObj.remove();

          return rtn;
        },
        pie = d3.pie()
          .value(valueFn)
          .sort(sett.sort.bind(sett))
          .padAngle(padAngle),
        arcs;

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data")
          .attr("transform", "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")");
      }

      arcs = dataLayer
        .selectAll(".arc")
        .data(pie(filteredData), idFn);

      arcs
        .enter()
        .append("g")
        .attr("id", idFn)
        .attr("class", classFn)
        .each(function(d) {
          var parent = d3.select(this),
            arcId = function() {
              return parent.attr("id") + "_arc";
            };

          this._current = d;

          parent.append("path")
            .attr("id", arcId)
            .attr("d", arc);

          parent.append("text")
            .attr("dy", 15)
            .attr("dx", arcTextPadding)
            .attr("aria-hidden", "true")
            .append("textPath")
              .attr("xlink:href", function() {
                return "#" + arcId.apply(this, arguments);
              })
              .text(truncateText);
        });

      arcs
        .attr("class", classFn)
        .transition()
        .each(function() {
          var parent = getTransition(d3.select(this).transition());

          parent.select("text textPath")
            .text(null);

          parent
            .select("path")
            .attrTween("d", arcTween);

          parent.on("end", textRedrawFn);
        });

      arcs
        .exit()
        .transition()
        .each(function() {
          var parent = getTransition(d3.select(this).transition());

          parent.select("text textPath")
            .text(null);

          parent
            .select("path")
            .attrTween("d", arcTween);

          parent.on("end", function() {
            d3.select(this).remove();
          });
        });
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
      .attr("class", "margin-offset")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
  }

  process = function() {
    draw.apply(rtnObj);
    d3.stcExt.addIEShim(svg, outerHeight, outerWidth);
    if (mergedSettings.datatable === false) return;
  };
  if (data === undefined) {
    d3.json(mergedSettings.url, function(error, json) {
      data = json;
      process();
    });
  } else {
    process();
  }

  return rtnObj;
};

})(jQuery.extend, jQuery);
