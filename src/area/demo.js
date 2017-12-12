/* globals areaChart */
var chart = d3.select(".area.data")
    .append("svg")
      .attr("id", "demo"),
    percentChart = d3.select(".area.datapercent")
        .append("svg")
          .attr("id", "demopercent");

i18n.load(["i18n"], function() {
  var settings,
  id = "year";

  settings = {
    alt: i18next.t("alt", {ns: "area"}),
    url: "data/worldpop.json",
    datatable: {
      title: i18next.t("datatableTitle", {ns: "area"})
    },
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
      getId: function(d) {
        return d.key;
      },
      getKeys: function(object) {
        var sett = this,
          keys = Object.keys(object[0]);
        keys.splice(keys.indexOf(id),1);
        keys.splice(keys.indexOf(sett.y.totalProperty),1);
        return keys;
      },
      getClass: function() {
        return this.z.getId.apply(this, arguments);
      },
      getText: function(d) {
        return i18next.t(d.key, {ns: "area"});
      }
    },
    width: 900
  };

  areaChart(chart, settings);

  percentSettings = $.extend(true, {}, settings, {
    datatableTitle: i18next.t("datatableTitlePercent", {ns: "area"}),
    y: {
      label: i18next.t("y_label_percent", {ns: "area"}),
      getAbsoluteTotal: function(d, index, data) {
        var sett = this,
          keys, total;
        if (!d[sett.y.totalProperty]) {
          keys = sett.z.getKeys.bind(sett)(data);
          total = 0;
          for(var k = 0; k < keys.length; k++) {
            total += sett.y.getAbsoluteValue.bind(sett)(d, keys[k], data);
          }
          d[sett.y.totalProperty] = total;
        }

        return d[sett.y.totalProperty];
      },
      getAbsoluteValue: function(d, key) {
        return d[key];
      },
      getTotal: function() {
        return 100;
      },
      getValue: function(d, key, index, data) {
        var sett = this;
        return sett.y.getAbsoluteValue(d, key) * 1.0 / sett.y.getAbsoluteTotal.call(sett, d, key, data) * 100;
      },
      getText: function() {
        var sett = this;
        return Math.round(sett.y.getValue.apply(this, arguments) * 10) / 10 + "%";
      }
    }
  });

  areaChart(percentChart, percentSettings);
});
