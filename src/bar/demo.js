/* globals barChart */
var chart = d3.select(".bar.data")
    .append("svg")
      .attr("id", "demo");

i18n.load(["i18n"], function() {
  var formatter = i18n.getNumberFormatter(),
    rootI18nNs = "bar",
    settings;

  settings = {
    aspectRatio: 16 / 13,
    margin: {
      bottom: 150
    },
    alt: i18next.t("alt", {ns: rootI18nNs}),
    url: "data/data.json",
    datatable: {
      title: i18next.t("datatableTitle", {ns: rootI18nNs})
    },
    filterData: function(d) {
      var root = d.data,
        keys = Object.keys(root);
      keys.splice(keys.indexOf("keys"),1);

      return keys.map(function(category) {
        return {
          category: category,
          values: root.keys.values.map(function(region, index) {
            return {
              region: region,
              imm: root[category][index]
            };
          })
        };
      });
    },
    x: {
      label: i18next.t("x_label", {ns: rootI18nNs}),
      getValue: function(d) {
        return d.region;
      },
      getClass: function() {
        return this.x.getValue.apply(this, arguments);
      },
      getTickText: function(val) {
        return i18next.t(val, {ns: rootI18nNs});
      }
    },

    y: {
      label: i18next.t("y_label", {ns: rootI18nNs}),
      getValue: function(d) {
        return d.imm;
      },
      getText: function(d) {
        return formatter.format(Math.round(d.imm));
      }
    },

    z: {
      label: i18next.t("z_label", {ns: rootI18nNs}),
      getId: function(d) {
        return d.category;
      },
      getClass: function() {
        return this.z.getId.apply(this, arguments);
      },
      getDataPoints: function(d) {
        return d.values;
      },
      getText: function(d) {
        return i18next.t(d.id, {ns: rootI18nNs});
      }
    },
    width: 900
  };

  barChart(chart, settings);
});
