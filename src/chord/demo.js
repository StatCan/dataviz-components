/* globals chordChart */
var chart = d3.select(".chord.data")
    .append("svg")
      .attr("id", "demo");

i18n.load(["i18n"], function() {
  var rootI18nNs = "chord",
    settings;

  settings = {
    alt: i18next.t("alt", {ns: rootI18nNs}),
    data: {},
    getMatrix: function() {
      var indexes = [
          "t1",
          "t2",
          "t3",
          "t4"
        ],
        matrix = Array(indexes.length),
        getValue = function() {
          return Math.floor(Math.random() * 50);
        },
        i, j;

      for (i = 0; i < indexes.length; i++) {
        matrix[i] = Array(indexes.length);
        for (j = 0; j < indexes.length; j++) {
          if (i === j) {
            matrix[i][j] = null;
            continue;
          }

          matrix[i][j] = getValue();
        }
      }
      return {
        indexes: indexes,
        matrix: matrix
      };
    },
    arcs: {
      getId: function(d) {
        return d.index;
      },
      getClass: function(d) {
        return d.index;
      },
      getText: function(d) {
        return i18next.t(d.index, {ns: rootI18nNs});
      }
    },
    ribbons: {
      getId: function(d) {
        return d.source.index + "_" + d.target.index;
      },
      getClass: function(d) {
        return d.source.index;
      }
    },
    width: 900
  };

  chordChart(chart, settings);
});
