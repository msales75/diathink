(function ($) {
  // parseUri 1.2.2
  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License
  $.bad_browser = function () {
    if (navigator.appVersion.indexOf("MSIE") != -1) {
      version = parseFloat(navigator.appVersion.split("MSIE")[1]);
      if (version < 7) {
        return true;
      }
    }
  };


  $.wait_until = function (test, f, freq) {
    if (!freq) {
      freq = 500;
    } // default every half-second
    // unique identifier incremented
    var waiting_interval = window.setInterval(function () {
      if (test()) {
        // we are done, we can finally call the function f and stop waiting
        window.clearInterval(waiting_interval); // stop waiting
        f();
      }
    }, freq); // check back every half-second.
  };

  $.parseUri = function (str) {
    var o = $.parseUri.options,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
  };

  $.parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };


  // insert or replace the object-map of key/value 'pairs' into the given url.
  //  overwrites any duplicate keys in the url, but preserves any other key/values in the url.
  $.buildUrl = function (url, pairs) {
    var parsed = $.parseUri(url);
    var base_url = parsed.protocol + '://' + parsed.authority + parsed.path;
    var pairs2 = {};
    if (parsed.queryKey) {
      for (k in parsed.queryKey) {
        pairs2[k] = parsed.queryKey[k];
      }
    }
    // Override query-keys with specified hashes
    if (pairs) {
      for (h in pairs) {
        pairs2[h] = pairs[h];
      }
    }
      var first=1;
      var query='';
      for (p in pairs2) {
        if (!first) {query += '&';}
        query += p+'='+pairs2[p];
	first=0;
      }
      if (!first) {
        base_url += '?'+query;
      }
    return base_url;
  };

  // remove program-specific keys from a url to extract original page.
  $.trimUrl = function (url, config) {
    var parts = $.parseUri(url);
    var prefix = parts.protocol + '://' + parts.authority + parts.path;
    var urlvars = parts.queryKey;
    delete urlvars[config.conversation_code_key];
    delete urlvars[config.conversation_referer_key];
    delete urlvars['scroll']; // should eliminate this later
    delete urlvars['account']; // should eliminate this later
    return $.buildUrl(prefix, urlvars);
  }


  $.randomString = function () {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  };


})(jQuery);
