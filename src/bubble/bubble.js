(function(extend) {
var defaults = {
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  aspectRatio: 16 / 9,
  padding: 1.5,
  width: 600
};

this.bubbleChart = function(svg, settings, data) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    pack = d3.pack()
      .size([innerWidth, innerHeight]),
    chartInner = svg.select("g.margin-offset"),
    dataLayer = chartInner.select(".data"),
    transition = d3.transition()
      .duration(1000),
    getSelection = function() {
      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data")
          .attr("aria-hidden", "true");
      }
      return dataLayer.selectAll(".bubble").order();
    },
    draw = function() {
      var sett = this.settings,
        filteredData = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, data) : data,
        hierarchy = d3.hierarchy({children: filteredData})
          .sum(sett.y.getValue.bind(sett))
          .sort(function(a, b) {
            return sett.y.getValue.call(sett, b) - sett.y.getValue.call(sett, a);
          }),
        zFn = function(fn) {
          if (sett.z && sett.z[fn] && typeof sett.z[fn] === "function") {
            return sett.z[fn].bind(sett);
          }
        },
        classFn = function(d,i){
          var cl = "bubble bubble" + (i + 1);

          if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass.call(sett, d);
          }

          return cl;
        },
        stylesFn = function() {
          var fn = zFn("getBubbleStyle"),
            styles, keys, k, key;

          if (fn) {
            styles = fn.apply(null, arguments);
            if (styles && typeof styles === "object") {
              keys = Object.keys(styles);

              for (k = 0; k < keys.length; k++) {
                key = keys[k];
                d3.select(this).style(key, styles[key]);
              }
            }
          }
        },
        bubbleTransform = function(d, index, selection) {
          if (!isNaN(d.x) && !isNaN(d.y)) {
            return "translate(" + d.x + "," + d.y + ")";
          }
          return d3.select(selection[index]).attr("transform");
        },
        bubbleRadius = function(d) {
          return d.r || 0;
        },
        bubbles, bubble;

      pack.padding(mergedSettings.padding);

      pack(hierarchy);
      bubbles = getSelection()
        .data(hierarchy.children, sett.z.getId);

      bubble = bubbles
        .enter()
        .append("g")
          .attr("id", zFn("getId"))
          .attr("class", classFn)
          .attr("transform", bubbleTransform);

      bubble.append("circle")
        .attr("r", bubbleRadius)
        .each(stylesFn);

      bubble.append("text")
        .text(sett.x.getText.bind(sett));

      bubble = bubbles
        .transition(transition)
        .attr("class", classFn)
        .attr("transform", bubbleTransform);

      bubble.select("circle")
        .attr("r", bubbleRadius)
        .each(stylesFn);

      bubble.select("text")
        .text(sett.x.getText.bind(sett));

      bubble = bubbles
        .exit()
          .transition(transition);

      bubble.select("circle")
        .attr("r", 0);

      bubble.select("text")
        .text("");
    },
    drawTable = function() {

    },
    clear = function() {
      dataLayer.remove();
    },
    rtnObj, process;

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

})(jQuery.extend);
