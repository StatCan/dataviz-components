(function() {
window.i18n = (function() {
  var lang = document.documentElement.lang,
    blankFormatter = {
      format: function(d){return d;}
    };

  return {
    lang: lang,
    load: function(url_roots, callback) {
      i18next.init({
        lng: lang
      }).on("initialized", function() {
        var q = d3.queue(),
          i;

        for(i = 0; i < url_roots.length; i++) {
          q = q.defer(d3.json, url_roots[i] + "/" + lang + ".json");
        }

        q.await(function() {
          var j, data, namespaces, n, ns;
          for (j = 1; j < arguments.length; j++) {
            data = arguments[j];
            namespaces = Object.keys(data[lang]);
            for (n = 0; n < namespaces.length; n++) {
              ns = namespaces[n];
              i18next.addResourceBundle(lang, ns, data[lang][ns]);
            }
          }

          if (callback) {
            callback();
          }
        });
      });
    },
    getNumberFormatter: function(max_precision, min_precision) {
      var max = max_precision || 0,
        min = min_precision || max;

      var options = {
        minimumFractionDigits: min,
        maximumFractionDigits: max
      };

      try {
        return new Intl.NumberFormat(lang, options);
      } catch (e) {
        return blankFormatter;
      }
    },
    getDateFormatter: function(options) {
      try {
        return new Intl.DateTimeFormat(lang, options);
      } catch (e) {
        return blankFormatter;
      }
    }
  };
})();

d3 = d3 || {};

d3.stcExt = {
  get5PointsInterpolation: function(negativeStartColor, negativeEndColor, neutralColor, positiveStartColor, positiveEndColor) {
    var rgbNegStart = d3.rgb(negativeStartColor),
      rgbNegEnd = d3.rgb(negativeEndColor),
      rgbPosStart = d3.rgb(positiveStartColor),
      rgbPosEnd = d3.rgb(positiveEndColor),
      startColor, endColor;

    return function(t) {
      if (t === 0) {
        return neutralColor;
      } else if (t > 0) {
        startColor = rgbPosStart;
        endColor = rgbPosEnd;
      } else {
        startColor = rgbNegStart;
        endColor = rgbNegEnd;
      }

      return d3.rgb.apply(null, ["r", "g", "b"].map(function(channel) {
        var diff = endColor[channel] - startColor[channel];
        return startColor[channel] + diff * Math.abs(t);
      }));
    };
  },
  get3PointsInterpolation: function(negativeColor, neutralColor, positiveColor, deadzone) {
    deadzone = deadzone || 0;
    return function(t) {
      var color;

      if (t === 0) {
        return neutralColor;
      } else {
        color = t > 0 ? positiveColor : negativeColor;
      }

      //TODO: Add support for other color methods
      return d3.rgb.apply(null, ["r", "g", "b"].map(function(channel) {
        var diff = color[channel] - neutralColor[channel],
          newDeadzone = diff > 0 ? deadzone : -deadzone;
        diff -= newDeadzone;
        return neutralColor[channel] + diff * Math.abs(t) + newDeadzone;
      }));
    };
  }
};
})();
