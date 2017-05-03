(function() {
window.i18n = (function() {
  var lang = document.documentElement.lang;

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
    }
  };
})();
})();
