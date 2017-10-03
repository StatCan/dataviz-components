(function(extend) {
var defaults = {
  margin: {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
  },
  arcsWidth: 20,
  padding: 0.03,
  aspectRatio: 16 / 9,
  width: 600
};

this.chordChart = function(svg, settings) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    chartInner = svg.select("g"),
    dataLayer = chartInner.select(".data"),
    draw = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, sett.data) : sett.data,
        outerRadius = Math.min(innerHeight, innerWidth) / 2,
        innerRadius = outerRadius - sett.arcsWidth,
        mapIndexes = function(d) {
          var newD = chord(d.matrix),
            g, group, c, ch;
          for (g = 0; g < newD.groups.length; g++) {
            group = newD.groups[g];
            group.index = d.indexes[group.index];
          }
          for (c = 0; c < newD.length; c++) {
            ch = newD[c];
            ch.source.index = d.indexes[ch.source.index];
            ch.source.subIndex = d.indexes[ch.source.subIndex];
            ch.target.index = d.indexes[ch.target.index];
            ch.target.subIndex = d.indexes[ch.target.subIndex];
          }
          return newD;
        },
        arcsClass = sett.arcs && sett.arcs.getClass ? sett.arcs.getClass.bind(sett) : null,
        arcsText = sett.arcs && sett.arcs.getText ? sett.arcs.getText.bind(sett) : null,
        ribbonsClass = sett.ribbons ? sett.ribbons.getClass.bind(sett) : null,
        chord = d3.chord()
          .padAngle(sett.padding),
        arc = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius),
        ribbon = d3.ribbon()
          .radius(innerRadius),
        arcs, ribbons;

      if (sett.startAngle) {
        arc.startAngle(sett.startAngle.bind(sett));
        ribbon.startAngle(sett.startAngle.bind(sett));
      }

      if (sett.endAngle) {
        arc.endAngle(sett.endAngle.bind(sett));
        ribbon.endAngle(sett.endAngle.bind(sett));
      }

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("class", "data")
          .attr("transform", "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")");
      }
      dataLayer.datum(mapIndexes(sett.getMatrix.call(sett, data)));

      arcs = dataLayer.append("g")
        .attr("class", "arcs")
        .selectAll("g")
        .data(function(chords) { return chords.groups; });

      arcs
        .enter()
        .append("g")
          .attr("class", arcsClass)
          .each(function(d, index) {
            var parent = d3.select(this),
              arcId = function() {
                return svg.attr("id") + "arc" + index;
              };

            parent.append("path")
              .attr("d", arc)
              .attr("id", arcId);

            parent.append("text")
              .attr("dy", 15)
              .attr("dx", 5)
                .append("textPath")
                .attr("href", function() {
                  return "#" + arcId.apply(this, arguments);
                })
                .text(arcsText);
          });

      ribbons = dataLayer.append("g")
        .attr("class", "ribbons")
        .selectAll("g")
        .data(function(chords) { return chords; });

      ribbons
        .enter()
        .append("g")
          .attr("class", ribbonsClass)
          .each(function() {
            d3.select(this).append("path")
              .attr("d", ribbon);
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
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
  }

  process = function() {
    draw.apply(rtnObj);
    if (mergedSettings.datatable === false) return;
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
