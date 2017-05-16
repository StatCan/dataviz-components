/* globals lineChart */
var chart = d3.select(".line.data")
    .append("svg")
      .attr("id", "demo");

i18n.load(["i18n"], function() {
  var formatter = i18n.getNumberFormatter(),
    settings;

  settings = {
    alt: i18next.t("alt", {ns: "line"}),
    url: "data/un_worldpop.json",
    datatableTitle: i18next.t("datatableTitle", {ns: "line"}),
    filterData: function(data) {
      var sett = this,
        filteredData = data.un_worldpop,
        sets = sett.z.getKeys(filteredData).map(function(key){
          var set = {
            id: key,
          };
          set[sett.z.dataPointsProperty] = filteredData[key].map(function(value, index) {
            return {
              year: filteredData.keys.values[index],
              pop: value
            };
          });
          return set;
        });
      return sets;
    },
    x: {
      label: i18next.t("x_label", {ns: "line"}),
      getValue: function(d) {
        return new Date(d.year + "-01");
      },
      getText: function(d) {
        return d.year;
      }
    },

    y: {
      label: i18next.t("y_label", {ns: "line"}),
      getValue: function(d) {
        return d.pop * 1.0 / 1000000;
      },
      getText: function(d) {
        return formatter.format(Math.round(d.pop));
      }
    },

    z: {
      label: i18next.t("z_label", {ns: "line"}),
      getKeys: function(d) {
        var keys = Object.keys(d);
        keys.splice(keys.indexOf("keys"),1);
        return keys;
      },
      getClass: function(d) {
        return d.id;
      },
      getDataPoints: function(d) {
        var sett = this;
        return d[sett.z.dataPointsProperty];
      },
      getText: function(d) {
        return i18next.t(d.id, {ns: "line"});
      }
    },
    width: 900
  };

  lineChart(chart, settings);
});
