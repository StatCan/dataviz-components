/* globals areaChart */
var chart = d3.select(".area.data")
    .append("svg")
      .attr("id", "demo");

i18n.load(["i18n"], function() {
  var settings,
  id = "year";

  settings = {
    alt: i18next.t("alt", {ns: "area"}),
    url: "data/worldpop.json",
    datatableTitle: i18next.t("datatableTitle", {ns: "area"}),
    filterData: function(data) {
      return data.worldpop;
    },
    x: {

      getValue: function(d) {
        return new Date(d[id] + "-01");
      },
      getText: function(d) {
        return d[id];
      },
      ticks: 7
    },

    y: {
      label: i18next.t("y_label", {ns: "area"}),
      getValue: function(d, key) {
        return d[key] * 1.0 / 1000;
      }
    },

    z: {
      label: i18next.t("z_label", {ns: "area"}),
      getKeys: function(object) {
        var sett = this,
          keys = Object.keys(object[0]);
        keys.splice(keys.indexOf(id),1);
        keys.splice(keys.indexOf(sett.y.totalProperty),1);
        return keys;
      },
      getClass: function(d) {
        return d.key;
      },
      getText: function(d) {
        return i18next.t(d.key, {ns: "area"});
      }
    },
    width: 900
  };

  areaChart(chart, settings);
});
