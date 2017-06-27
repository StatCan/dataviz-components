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
    getNumberFormatter: function() {
      var min = arguments[0] || 0,
        max = arguments.length > 1 ? arguments[1] : min;

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
    var rgbNeutral = d3.rgb(neutralColor),
      rgbNegEnd = d3.rgb(negativeColor),
      rgbPosEnd = d3.rgb(positiveColor),
      addDeadzone = function(color) {
        return d3.rgb.apply(null, ["r", "g", "b"].map(function(channel) {
          var currentChannel = neutralColor[channel],
            diff = color[channel] - currentChannel,
            newDeadzone;

          if ((diff < 0  && diff > -deadzone) || diff > 0 && diff < deadzone) {
            newDeadzone = 0;
          } else {
            newDeadzone =  diff < 0 ? deadzone : -deadzone;
          }

          return rgbNeutral[channel] - newDeadzone;
        }));
      },
      rgbNegStart, rgbPosStart;

    deadzone = deadzone || 0;

    rgbNegStart =  addDeadzone(rgbNegEnd);
    rgbPosStart =  addDeadzone(rgbPosEnd);
    return d3.stcExt.get5PointsInterpolation(rgbNegStart, rgbNegEnd, neutralColor, rgbPosStart, rgbPosEnd);
  },
  // Source: https://stackoverflow.com/questions/6338217/get-a-css-value-with-javascript
  getStyleRuleValue: function (style, selector) {
    var value = null,
      i, j, mysheet, myrules;
    for ( i = 0; i < document.styleSheets.length; i++) {
      mysheet = document.styleSheets[i];
      try {
        myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
        for (j = 0; j < myrules.length; j++) {
          if (myrules[j].selectorText &&
              myrules[j].selectorText.toLowerCase() === selector) {
            value =  myrules[j].style[style];
          }
        }
      } catch(e) {
        continue;
      }
    }
    return value;
  }
};
})();
