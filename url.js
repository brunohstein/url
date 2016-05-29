(function() {
  var Hash, Origin, Path, QueryString, paramsHandler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  paramsHandler = function() {
    this.get = (function(_this) {
      return function(key) {
        var param, _i, _len, _ref;
        _ref = _this.params;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          if (param.key === key) {
            return param;
          }
        }
      };
    })(this);
    this.contains = (function(_this) {
      return function(key, value) {
        var param;
        param = _this.get(key);
        if (!param) {
          return false;
        }
        if (param.value.constructor !== Array) {
          return param.value === value;
        } else {
          return param.value.indexOf(value) !== -1;
        }
      };
    })(this);
    this.add = (function(_this) {
      return function(key, value) {
        var index, param, _i, _len, _ref;
        if (_this.get(key) && value) {
          _ref = _this.params;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            param = _ref[index];
            if (!(param.key === key)) {
              continue;
            }
            if (_this.params[index].value.constructor !== Array) {
              _this.params[index].value = [_this.params[index].value];
            }
            _this.params[index].value.push(value);
          }
        } else {
          _this.params.push({
            key: key,
            value: value
          });
        }
        return _this;
      };
    })(this);
    this.replace = (function(_this) {
      return function(key, value) {
        var index, param, _i, _len, _ref;
        if (_this.get(key) && value) {
          _ref = _this.params;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            param = _ref[index];
            if (param.key === key) {
              _this.params[index].value = value;
            }
          }
        }
        return _this;
      };
    })(this);
    this.remove = (function(_this) {
      return function(key, value) {
        var index, param, remove, valueToRemoveIndex, _i, _len, _ref;
        if (_this.get(key)) {
          _ref = _this.params;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            param = _ref[_i];
            if (param.key === key) {
              remove = param;
              index = _this.params.indexOf(remove);
            }
          }
          if (value && remove.value.constructor === Array) {
            valueToRemoveIndex = remove.value.indexOf(value);
            if (valueToRemoveIndex !== -1) {
              _this.params[index].value.splice(valueToRemoveIndex, 1);
            }
          } else {
            _this.params.splice(index, 1);
          }
        }
        return _this;
      };
    })(this);
    this.update = (function(_this) {
      return function(key, value, unique) {
        var param;
        if (unique == null) {
          unique = false;
        }
        if (key && value) {
          if (param = _this.get(key)) {
            if (param.value && (param.value === value || (param.value.constructor === Array && param.value.indexOf(value) !== -1))) {
              _this.remove(key, value);
            } else {
              if (unique) {
                _this.replace(key, value);
              } else {
                _this.add(key, value);
              }
            }
          } else {
            _this.add(key, value);
          }
        }
        return _this;
      };
    })(this);
    this.clear = (function(_this) {
      return function() {
        _this.params = [];
        return _this;
      };
    })(this);
    return this.any = (function(_this) {
      return function(but) {
        var ignore, param, params, remove, _i, _j, _k, _len, _len1, _len2, _ref;
        if (but) {
          if (but.constructor !== Array) {
            but = [but];
          }
          params = _this.params.slice();
          remove = [];
          for (_i = 0, _len = but.length; _i < _len; _i++) {
            ignore = but[_i];
            _ref = _this.params;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              param = _ref[_j];
              if (param.key === ignore) {
                remove.push(param);
              }
            }
          }
          for (_k = 0, _len2 = remove.length; _k < _len2; _k++) {
            param = remove[_k];
            params.splice(params.indexOf(param), 1);
          }
          return params.length > 0;
        } else {
          return _this.params.length > 0;
        }
      };
    })(this);
  };

  this.Url = (function() {
    var extractHash, extractOrigin, extractPath, extractQueryString;

    function Url(url, pathMap) {
      this.print = __bind(this.print, this);
      this.setup = __bind(this.setup, this);
      this.setup(url, pathMap);
    }

    Url.prototype.setup = function(url, pathMap) {
      if (!url) {
        throw {
          name: "UrlException",
          message: "Required parameter url is missing."
        };
      }
      this.input = url;
      this.origin = new Origin(extractOrigin(url));
      this.path = new Path(extractPath(url, this.origin.input), pathMap);
      this.queryString = new QueryString(extractQueryString(url));
      this.hash = new Hash(extractHash(url));
      return this;
    };

    Url.prototype.print = function() {
      return this.origin.print() + this.path.print() + this.queryString.print() + this.hash.print();
    };

    extractOrigin = function(url) {
      var origin;
      origin = url.match(/^((https?|ftp):\/\/|www?|\/\/).+?(?=\/|\?|\#|$)/);
      if (origin) {
        return origin[0];
      } else {
        return null;
      }
    };

    extractPath = function(url, origin) {
      var path;
      path = origin ? url.split(origin)[1] : url;
      if (path && path !== "/") {
        return path.split("?")[0].split("#")[0];
      } else {
        return null;
      }
    };

    extractQueryString = function(url) {
      var queryString;
      queryString = url.split("?")[1];
      if (queryString) {
        return queryString.split("#")[0];
      } else {
        return null;
      }
    };

    extractHash = function(url) {
      var hash;
      hash = url.split("#")[1];
      if (hash) {
        return hash;
      } else {
        return null;
      }
    };

    return Url;

  })();

  Origin = (function() {
    function Origin(origin) {
      this.print = __bind(this.print, this);
      this.input = origin;
    }

    Origin.prototype.print = function() {
      if (this.input) {
        return this.input;
      } else {
        return "";
      }
    };

    return Origin;

  })();

  Path = (function() {
    var extractMap, extractParams;

    function Path(path, map) {
      this.print = __bind(this.print, this);
      paramsHandler.call(this);
      this.input = path;
      this.map = map ? map : extractMap(path);
      if (this.map.constructor !== Array) {
        this.map = [this.map];
      }
      this.params = this.map ? extractParams(path, this.map) : [];
    }

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

    extractMap = function(path) {
      var map, param, params, _i, _len;
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
      return map;
    };

    extractParams = function(path, map) {
      var match, param, params, splitParam, tuple, value, _i, _len;
      params = [];
      if (!path) {
        return params;
      }
      path = path;
      for (_i = 0, _len = map.length; _i < _len; _i++) {
        tuple = map[_i];
        splitParam = new RegExp("\/" + tuple.key + "((\/.+?(?=\/|$))|(?=\/|$))");
        if (match = path.match(splitParam)) {
          console.log(tuple.value);
          if (tuple.value) {
            path = path.replace(match[0], "");
            value = match[0].substring(1).split("/")[1];
          } else {
            value = null;
          }
          if (value) {
            value = value.split(",");
            value = value.length > 1 ? value : value[0];
          }
          param = {
            key: tuple.key,
            value: value
          };
          params.push(param);
        }
      }
      return params;
    };

    return Path;

  })();

  QueryString = (function() {
    var extractParams;

    function QueryString(queryString) {
      this.print = __bind(this.print, this);
      paramsHandler.call(this);
      this.input = queryString;
      this.params = this.input ? extractParams(this.input) : [];
    }

    QueryString.prototype.print = function() {
      var param, queryString, _i, _len, _ref;
      queryString = [];
      _ref = this.params;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        queryString.push("" + param.key + "=" + param.value);
      }
      if (this.any()) {
        return "?" + (queryString.join('&'));
      } else {
        return "";
      }
    };

    extractParams = function(queryString) {
      var param, params, value, _i, _len, _results;
      params = queryString.split("&");
      _results = [];
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        param = param.split("=");
        value = param[1];
        if (value) {
          value = value.split(",");
          value = value.length > 1 ? value : value[0];
        }
        _results.push(param = {
          key: param[0],
          value: value
        });
      }
      return _results;
    };

    return QueryString;

  })();

  Hash = (function() {
    function Hash(hash) {
      this.print = __bind(this.print, this);
      this.remove = __bind(this.remove, this);
      this.update = __bind(this.update, this);
      this.get = __bind(this.get, this);
      this.input = this.current = hash;
    }

    Hash.prototype.get = function() {
      return this.current;
    };

    Hash.prototype.update = function(value) {
      return this.current = value;
    };

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

    return Hash;

  })();

}).call(this);
