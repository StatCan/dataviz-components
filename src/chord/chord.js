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

this.chordChart = function(svg, settings, data) {
  var mergedSettings = extend(true, {}, defaults, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    chartInner = svg.select("g.margin-offset"),
    dataLayer = chartInner.select(".data"),
    transition = d3.transition()
      .duration(1000),
    draw = function() {
      var sett = this.settings,
        filteredData = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData.call(sett, data) : data,
        outerDiameter = Math.min(innerHeight, innerWidth) / 2,
        innerDiameter = outerDiameter - sett.arcsWidth,
        getArcsAngles = function(d) {
          return [d.startAngle, d.endAngle];
        },
        getRibbonsAngles = function(d) {
          return [d.source.startAngle, d.source.endAngle, d.target.startAngle, d.target.endAngle];
        },
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
        arcTween = function(d) {
          var newD = getArcsAngles(d),
            oldD = this.parentNode._current,
            i = d3.interpolate(oldD, newD);
          this.parentNode._current = newD;
          return function(t) {
            var d = i(t);
            return arc({
              startAngle: d[0],
              endAngle: d[1]
            });
          };
        },
        arcsId = sett.arcs && sett.arcs.getId ? sett.arcs.getId.bind(sett) : null,
        arcsClass = sett.arcs && sett.arcs.getClass ? sett.arcs.getClass.bind(sett) : null,
        arcsText = sett.arcs && sett.arcs.getText ? sett.arcs.getText.bind(sett) : null,
        textFit = function(d) {
          var textObj = d3.select(this),
            text = textObj.text(),
            textPath, textLength, angle, circumference;

          if (text !== "") {
            textPath = textObj.select("textPath").remove();
            textObj.text(text);
            textLength = this.getSubStringLength(0, text.length);
            textObj
              .text(null)
              .insert(function() {
                return textPath.node();
              });
            angle = (d.endAngle - d.startAngle) / (2 * Math.PI);
            circumference = angle * 2 * Math.PI * innerDiameter / 2;

            return textLength < circumference;
          }

          return null;
        },
        hiddenText = function() {
          if (textFit.apply(this, arguments) === true) {
            return "1";

          }
          return "0";
        },
        ribbonTween = function(d) {
          var newD = getRibbonsAngles(d),
            oldD = this.parentNode._current,
            i = d3.interpolate(oldD, newD);
          this.parentNode._current = newD;
          return function(t) {
            var d = i(t);
            return ribbon({
              source: {
                startAngle: d[0],
                endAngle: d[1]
              },
              target: {
                startAngle: d[2],
                endAngle: d[3]
              }
            });
          };
        },
        ribbonsId = sett.ribbons && sett.ribbons.getId ? sett.ribbons.getId.bind(sett) : null,
        ribbonsClass = sett.ribbons ? sett.ribbons.getClass.bind(sett) : null,
        chord = d3.chord()
          .padAngle(sett.padding),
        arc = d3.arc()
          .innerRadius(innerDiameter)
          .outerRadius(outerDiameter),
        ribbon = d3.ribbon()
          .radius(innerDiameter),
        arcsGroup, ribbonsGroup, arcs, ribbons;

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
      dataLayer.datum(mapIndexes(sett.getMatrix.call(sett, filteredData)));

      arcsGroup = dataLayer.select(".arcs");
      if (arcsGroup.empty()) {
        arcsGroup = dataLayer.append("g")
          .attr("class", "arcs");
      }
      arcs = arcsGroup
        .selectAll("g")
        .data(function(chords) { return chords.groups; }, arcsId);

      ribbonsGroup = dataLayer.select(".ribbons");
      if (ribbonsGroup.empty()) {
        ribbonsGroup = dataLayer.append("g")
          .attr("class", "ribbons");
      }
      ribbons = ribbonsGroup
        .selectAll("g")
        .data(function(chords) { return chords; }, ribbonsId);

      arcs
        .enter()
        .append("g")
          .attr("class", arcsClass)
          .attr("id", arcsId)
          .each(function(d, index) {
            var parent = d3.select(this),
              arcId = function() {
                return svg.attr("id") + "arc" + index;
              },
              textObj;
            this._current = getArcsAngles(d);
            parent.append("path")
              .attr("d", arc)
              .attr("id", arcId);

            textObj = parent.append("text")
              .attr("dy", 15)
              .attr("dx", 5)
              .attr("aria-hidden", "true");

            textObj
              .append("textPath")
              .attr("xlink:href", function() {
                return "#" + arcId.apply(this, arguments);
              })
              .text(arcsText);

            textObj.style("opacity", hiddenText);
          });

      arcs
        .attr("class", arcsClass)
        .each(function() {
          var parent = d3.select(this);

          parent.select("text")
            .style("opacity", hiddenText);

          parent.select("path")
            .transition(transition)
            .attrTween("d", arcTween);
        });

      arcs
        .exit()
        .remove();

      ribbons
        .enter()
        .append("g")
          .attr("id", ribbonsId)
          .attr("class", ribbonsClass)
          .each(function(d) {
            this._current = getRibbonsAngles(d);
            d3.select(this).append("path")
              .attr("d", ribbon);
          });

      ribbons
        .attr("class", ribbonsClass)
        .each(function() {
          d3.select(this).select("path")
            .transition(transition)
            .attrTween("d", ribbonTween);
        });

      ribbons
        .exit()
        .remove();
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
