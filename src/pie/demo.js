/* globals pieChart */
var chart = d3.select(".pie.data")
    .append("svg")
      .attr("id", "demo");

var settings = {
    url: "data/browsershare.json",
    filterData: function(data) {
      return data.shares;
    },
    getId: function(d) {
      return d.data.browser;
    },
    getClass: function(d) {
      return d.data.browser;
    },
    getValue: function(d) {
      return d.share;
    },
    getText: function() {
      return formatter.format(this.getValue.apply(this, arguments)) + "%";
    },
    innerRadius: 200,
    padding: 0.01
  },
  formatter;

i18n.load(["i18n"], function() {
  formatter = i18n.getNumberFormatter(2);

  pieChart(chart, settings);
});
