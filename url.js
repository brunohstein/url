(function() {
  var Hash, Origin, Path, QueryString,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Url = (function() {
    var extract;

    Url.prototype.print = function() {
      return this.origin.print() + this.path.print() + this.queryString.print() + this.hash.print();
    };

    extract = function(url) {
      var hash, map, origin, param, params, path, queryString, _i, _len;
      origin = url.match(/^((https?|ftp):\/\/|www?|\/\/).+?(?=\/|\?|\#|$)/);
      origin = origin ? origin[0] : null;
      path = origin ? url.split(origin)[1] : url;
      path = path && path !== "/" ? path.split("?")[0].split("#")[0] : null;
      queryString = url.split("?")[1];
      queryString = queryString ? queryString.split("#")[0] : null;
      hash = url.split("#")[1];
      hash = hash ? hash : null;
      map = [];
      if (path) {
        params = path.replace(/^\//, "").split("/");
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          param = params[_i];
          map.push({
            key: param,
            value: false
          });
        }
      }
      return {
        origin: origin,
        path: path,
        queryString: queryString,
        hash: hash,
        map: map
      };
    };

    function Url(url, map) {
      this.print = __bind(this.print, this);
      var structure;
      if (!url) {
        throw {
          name: "UrlException",
          message: "Required parameter url is missing."
        };
      }
      this.input = url;
      structure = extract(this.input);
      this.origin = new Origin(structure.origin);
      this.path = new Path(structure.path, map ? map : structure.map);
      this.queryString = new QueryString(structure.queryString);
      this.hash = new Hash(structure.hash);
    }

    return Url;

  })();

  Origin = (function() {
    Origin.prototype.print = function() {
      return this.input;
    };

    function Origin(origin) {
      this.print = __bind(this.print, this);
      this.input = origin;
    }

    return Origin;

  })();

  Path = (function() {
    var extract;

    Path.prototype.get = function(key) {
      var param, _i, _len, _ref;
      _ref = this.params;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        if (param.key === key) {
          return param;
        }
      }
    };

    Path.prototype.add = function(key, value) {
      var index, param, _i, _len, _ref, _results;
      if (this.get(key) && value) {
        _ref = this.params;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          param = _ref[index];
          if (!(param.key === key)) {
            continue;
          }
          if (this.params[index].value.constructor !== Array) {
            this.params[index].value = [this.params[index].value];
          }
          _results.push(this.params[index].value.push(value));
        }
        return _results;
      } else {
        return this.params.push({
          key: key,
          value: value
        });
      }
    };

    Path.prototype.replace = function(key, value) {
      var index, param, _i, _len, _ref, _results;
      if (this.get(key) && value) {
        _ref = this.params;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          param = _ref[index];
          if (param.key === key) {
            _results.push(this.params[index].value = value);
          }
        }
        return _results;
      }
    };

    Path.prototype.remove = function(key, value) {
      var index, param, remove, _i, _len, _ref;
      if (this.get(key)) {
        _ref = this.params;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          if (param.key === key) {
            remove = param;
            index = this.params.indexOf(remove);
          }
        }
        if (value && remove.value.constructor === Array) {
          return this.params[index].value.splice(remove.value.indexOf(value), 1);
        } else {
          return this.params.splice(index, 1);
        }
      }
    };

    Path.prototype.update = function(key, value, unique) {
      var param;
      if (unique == null) {
        unique = false;
      }
      if (key && value) {
        if (param = this.get(key)) {
          if (param.value === value || (param.value.constructor === Array && param.value.indexOf(value) !== -1)) {
            return this.remove(key, value);
          } else {
            if (unique) {
              return this.replace(key, value);
            } else {
              return this.add(key, value);
            }
          }
        } else {
          return this.add(key, value);
        }
      }
    };

    Path.prototype.clear = function() {
      return this.params = [];
    };

    Path.prototype.any = function(but) {
      var ignore, param, params, _i, _j, _len, _len1, _ref;
      if (but) {
        if (but.constructor !== Array) {
          but = [but];
        }
        params = this.params.slice();
        for (_i = 0, _len = but.length; _i < _len; _i++) {
          ignore = but[_i];
          _ref = this.params;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            param = _ref[_j];
            if (param.key === ignore) {
              param = param;
            }
          }
          params.splice(params.indexOf(param), 1);
        }
        return params.length > 0;
      } else {
        return this.params.length > 0;
      }
    };

    Path.prototype.print = function() {
      var param, path, tuple, _i, _j, _len, _len1, _ref, _ref1;
      path = [];
      _ref = this.map;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tuple = _ref[_i];
        _ref1 = this.params;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          param = _ref1[_j];
          if (tuple.key === param.key) {
            if (param.value) {
              path.push("/" + param.key + "/" + param.value);
            } else {
              path.push("/" + param.key);
            }
          }
        }
      }
      if (this.any()) {
        return path.join("");
      } else {
        return "";
      }
    };

    extract = function(path, map) {
      var checkParam, match, param, params, splitParam, tuple, _i, _len;
      params = [];
      for (_i = 0, _len = map.length; _i < _len; _i++) {
        tuple = map[_i];
        checkParam = new RegExp("" + tuple.key + "(?=\/|$)");
        splitParam = new RegExp("" + tuple.key + "\/.+?(?=\/|$)");
        if (match = path.match(splitParam) || path.match(checkParam)) {
          param = {
            key: tuple.key,
            value: tuple.value ? match[0].split("/")[1] : null
          };
          params.push(param);
        }
      }
      return params;
    };

    function Path(path, map) {
      this.map = map;
      this.print = __bind(this.print, this);
      this.any = __bind(this.any, this);
      this.clear = __bind(this.clear, this);
      this.update = __bind(this.update, this);
      this.remove = __bind(this.remove, this);
      this.replace = __bind(this.replace, this);
      this.add = __bind(this.add, this);
      this.get = __bind(this.get, this);
      this.input = path;
      if (this.map.constructor !== Array) {
        this.map = [this.map];
      }
      this.params = this.map ? extract(path, this.map) : [];
    }

    return Path;

  })();

  QueryString = (function() {
    var extract;

    QueryString.prototype.get = function(key) {
      var param, _i, _len, _ref;
      _ref = this.params;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        if (param.key === key) {
          return param;
        }
      }
    };

    QueryString.prototype.add = function(key, value) {
      var index, param, _i, _len, _ref, _results;
      if (this.get(key) && value) {
        _ref = this.params;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          param = _ref[index];
          if (!(param.key === key)) {
            continue;
          }
          if (this.params[index].value.constructor !== Array) {
            this.params[index].value = [this.params[index].value];
          }
          _results.push(this.params[index].value.push(value));
        }
        return _results;
      } else {
        return this.params.push({
          key: key,
          value: value
        });
      }
    };

    QueryString.prototype.replace = function(key, value) {
      var index, param, _i, _len, _ref, _results;
      if (this.get(key) && value) {
        _ref = this.params;
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          param = _ref[index];
          if (param.key === key) {
            _results.push(this.params[index].value = value);
          }
        }
        return _results;
      }
    };

    QueryString.prototype.remove = function(key, value) {
      var index, param, remove, _i, _len, _ref;
      if (this.get(key)) {
        _ref = this.params;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          if (param.key === key) {
            remove = param;
            index = this.params.indexOf(remove);
          }
        }
        if (value && remove.value.constructor === Array) {
          return this.params[index].value.splice(remove.value.indexOf(value), 1);
        } else {
          return this.params.splice(index, 1);
        }
      }
    };

    QueryString.prototype.update = function(key, value, unique) {
      var param;
      if (unique == null) {
        unique = false;
      }
      if (param = this.get(key)) {
        if (param.value === value || (param.value.constructor === Array && param.value.indexOf(value))) {
          return this.remove(key, value);
        } else {
          if (unique) {
            return this.replace(key, value);
          } else {
            return this.add(key, value);
          }
        }
      } else {
        return this.add(key, value);
      }
    };

    QueryString.prototype.clear = function() {
      return this.params = [];
    };

    QueryString.prototype.any = function() {
      return this.params.length > 0;
    };

    QueryString.prototype.print = function() {
      var param, queryString, _i, _len, _ref;
      queryString = [];
      _ref = this.params;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        queryString.push(param.key + "=" + param.value);
      }
      if (this.any()) {
        return "?" + queryString.join("&");
      } else {
        return "";
      }
    };

    extract = function(queryString) {
      var param, params, value, _i, _len, _results;
      params = queryString.split("&");
      _results = [];
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        param = param.split("=");
        value = param[1].split(",");
        _results.push(param = {
          key: param[0],
          value: value.length > 1 ? value : value[0]
        });
      }
      return _results;
    };

    function QueryString(queryString) {
      this.print = __bind(this.print, this);
      this.any = __bind(this.any, this);
      this.clear = __bind(this.clear, this);
      this.update = __bind(this.update, this);
      this.remove = __bind(this.remove, this);
      this.replace = __bind(this.replace, this);
      this.add = __bind(this.add, this);
      this.get = __bind(this.get, this);
      this.input = queryString;
      this.params = this.input ? extract(this.input) : [];
    }

    return QueryString;

  })();

  Hash = (function() {
    Hash.prototype.get = function() {
      return this.current;
    };

    Hash.prototype.add = function(value) {
      return this.current = value;
    };

    Hash.prototype.replace = Hash.prototype.add;

    Hash.prototype.update = Hash.prototype.add;

    Hash.prototype.remove = function() {
      return this.current = null;
    };

    Hash.prototype.print = function() {
      if (this.current) {
        return "#" + this.current;
      } else {
        return "";
      }
    };

    function Hash(hash) {
      this.print = __bind(this.print, this);
      this.remove = __bind(this.remove, this);
      this.add = __bind(this.add, this);
      this.get = __bind(this.get, this);
      this.input = this.current = hash;
    }

    return Hash;

  })();

}).call(this);
