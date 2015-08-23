(function() {
  var expect, url;

  expect = chai.expect;

  url = null;

  beforeEach(function() {
    var map;
    map = [
      {
        key: "one",
        value: false
      }, {
        key: "two",
        value: true
      }, {
        key: "four",
        value: true
      }, {
        key: "twenty",
        value: "twenty-one"
      }
    ];
    return url = new Url("http://domain.com/one/two/three/four/five?six=seven&eight=nine&ten=eleven,twelve#thirteen", map);
  });

  describe("Url", function() {
    return describe("print()", function() {
      return it("should return the full url", function() {
        return expect(url.print()).to.equal("http://domain.com/one/two/three/four/five?six=seven&eight=nine&ten=eleven,twelve#thirteen");
      });
    });
  });

  describe("Origin", function() {
    return describe("print()", function() {
      return it("should return the input value", function() {
        return expect(url.origin.print()).to.equal("http://domain.com");
      });
    });
  });

  describe("Path", function() {
    describe("get(key)", function() {
      it("should return the value of the key on the path", function() {
        return expect(url.path.get("two")).to.deep.equal({
          key: "two",
          value: "three"
        });
      });
      it("should return null as the value of the key on the path if single", function() {
        return expect(url.path.get("one")).to.deep.equal({
          key: "one",
          value: null
        });
      });
      it("should return the value of the key of an updated path", function() {
        url.path.update("twenty", "twenty-one");
        return expect(url.path.get("twenty")).to.deep.equal({
          key: "twenty",
          value: "twenty-one"
        });
      });
      return it("should return undefined if the key does not exist on the path", function() {
        return expect(url.path.get("twenty")).to.be.undefined;
      });
    });
    describe("add(key, value)", function() {
      it("should add a new key with a value to the path", function() {
        url.path.add("twenty", "twenty-one");
        return expect(url.path.print()).to.equal("/one/two/three/four/five/twenty/twenty-one");
      });
      it("should add a new value to a existing key on the path", function() {
        url.path.add("two", "twenty");
        return expect(url.path.print()).to.equal("/one/two/three,twenty/four/five");
      });
      it("should add a new key without a value to the path", function() {
        url.path.add("twenty");
        return expect(url.path.print()).to.equal("/one/two/three/four/five/twenty");
      });
      return it("should add the key and value on the params", function() {
        url.path.add("twenty", "twenty-one");
        return expect(url.path.params[3]).to.deep.equal({
          key: "twenty",
          value: "twenty-one"
        });
      });
    });
    describe("replace(key, value)", function() {
      it("should replace the value of a key on the path", function() {
        url.path.replace("two", "twenty");
        return expect(url.path.print()).to.equal("/one/two/twenty/four/five");
      });
      it("should replace the value of a key on the params", function() {
        url.path.replace("two", "twenty");
        return expect(url.path.params[1]).to.deep.equal({
          key: "two",
          value: "twenty"
        });
      });
      return it("should do nothing if the key does not exist", function() {
        url.path.replace("twenty", "twenty-one");
        return expect(url.path.print()).to.equal("/one/two/three/four/five");
      });
    });
    describe("remove(key, value)", function() {
      it("should remove a key from the path", function() {
        url.path.remove("two");
        return expect(url.path.print()).to.equal("/one/four/five");
      });
      it("should remove a key from the params", function() {
        url.path.remove("two");
        return expect(url.path.params[1]).to.not.deep.equal({
          key: "two",
          value: "three"
        });
      });
      it("should remove a value from a key that have multiple from the path", function() {
        url.path.add("two", "twenty");
        url.path.remove("two", "three");
        return expect(url.path.print()).to.equal("/one/two/twenty/four/five");
      });
      return it("should do nothing if the key does not exist", function() {
        url.path.remove("twenty");
        return expect(url.path.print()).to.equal("/one/two/three/four/five");
      });
    });
    describe("update(key, value, unique = false)", function() {
      it("should return the path with the updated data", function() {
        url.path.update("two", "twenty", true);
        return expect(url.path.print()).to.equal("/one/two/twenty/four/five");
      });
      it("should return the path with the passed key removed", function() {
        url.path.update("two", "three");
        return expect(url.path.print()).to.equal("/one/four/five");
      });
      it("should return the path with the passed value removed", function() {
        url.path.update("two", "twenty");
        url.path.update("two", "three");
        return expect(url.path.print()).to.equal("/one/two/twenty/four/five");
      });
      it("should return the path with the updated data when key is not in the url", function() {
        url.path.update("twenty", "twenty-one");
        return expect(url.path.print()).to.equal("/one/two/three/four/five/twenty/twenty-one");
      });
      return it("should do nothing if data is empty", function() {
        url.path.update();
        return expect(url.path.print()).to.equal("/one/two/three/four/five");
      });
    });
    describe("clear()", function() {
      return it("should remove all the params of the path", function() {
        url.path.clear();
        return expect(url.path.print()).to.be.empty;
      });
    });
    describe("any(but)", function() {
      it("should return true if there is any params in the path", function() {
        return expect(url.path.any()).to.be["true"];
      });
      it("should return false if there is not any params in the path", function() {
        url.path.clear();
        return expect(url.path.any()).to.be["false"];
      });
      it("should return true if there is any params in the path but the ones in the argument", function() {
        return expect(url.path.any("two")).to.be["true"];
      });
      return it("should return false if there is not any params in the path but the ones in the argument", function() {
        return expect(url.path.any(["one", "two", "four"])).to.be["false"];
      });
    });
    return describe("print()", function() {
      return it("should return the path", function() {
        return expect(url.path.print()).to.equal("/one/two/three/four/five");
      });
    });
  });

  describe("QueryString", function() {
    describe("get(key)", function() {
      it("should return the value of the key on the querystring", function() {
        return expect(url.queryString.get("six")).to.deep.equal({
          key: "six",
          value: "seven"
        });
      });
      it("should return the values of the key on the querystring if they are multiple", function() {
        return expect(url.queryString.get("ten")).to.deep.equal({
          key: "ten",
          value: ["eleven", "twelve"]
        });
      });
      return it("should return undefined if the key does not exist on the querystring", function() {
        return expect(url.queryString.get("twenty")).to.be.undefined;
      });
    });
    describe("add(key, value)", function() {
      it("should add a new key with a value to the querystring", function() {
        url.queryString.add("twenty", "twenty-one");
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve&twenty=twenty-one");
      });
      return it("should add a new key with a value to the querystring", function() {
        url.queryString.add("ten", "twenty");
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve,twenty");
      });
    });
    describe("replace(key, value)", function() {
      it("should replace the value of a key on the querystring", function() {
        url.queryString.replace("six", "twenty");
        return expect(url.queryString.print()).to.equal("?six=twenty&eight=nine&ten=eleven,twelve");
      });
      return it("should do nothing if the key does not exist", function() {
        url.queryString.replace("twenty", "twenty-one");
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve");
      });
    });
    describe("remove(key, value)", function() {
      it("should remove a key of the querystring", function() {
        url.queryString.remove("six");
        return expect(url.queryString.print()).to.equal("?eight=nine&ten=eleven,twelve");
      });
      it("should remove a value of a key on the querystring", function() {
        url.queryString.remove("ten", "eleven");
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=twelve");
      });
      return it("should do nothing if the key does not exist", function() {
        url.queryString.remove("twenty");
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve");
      });
    });
    describe("update(key, value, unique)", function() {
      it("should remove if the key and the value exists", function() {
        url.queryString.update("six", "seven");
        return expect(url.queryString.print()).to.equal("?eight=nine&ten=eleven,twelve");
      });
      it("should add if the key exists and the value is different", function() {
        url.queryString.update("six", "twenty");
        return expect(url.queryString.print()).to.equal("?six=seven,twenty&eight=nine&ten=eleven,twelve");
      });
      it("should replace if the key exists and the value is different and is unique", function() {
        url.queryString.update("six", "twenty", true);
        return expect(url.queryString.print()).to.equal("?six=twenty&eight=nine&ten=eleven,twelve");
      });
      return it("should add if the key does not exist", function() {
        url.queryString.update("twenty", "twenty-one");
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve&twenty=twenty-one");
      });
    });
    describe("clear()", function() {
      return it("should remove all the params of the queryString", function() {
        url.queryString.clear();
        return expect(url.queryString.print()).to.be.empty;
      });
    });
    describe("any()", function() {
      it("should return true if there is any params in the querystring", function() {
        return expect(url.queryString.any()).to.be["true"];
      });
      return it("should return false if there is not any params in the querystring", function() {
        url.queryString.clear();
        return expect(url.queryString.any()).to.be["false"];
      });
    });
    return describe("print()", function() {
      return it("should return the querystring", function() {
        return expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve");
      });
    });
  });

  describe("Hash", function() {
    describe("get()", function() {
      return it("should return the value of the hash", function() {
        return expect(url.hash.get()).to.equal("thirteen");
      });
    });
    describe("add(value)", function() {
      return it("should set the hash to the value", function() {
        url.hash.add("twenty");
        return expect(url.hash.print()).to.equal("#twenty");
      });
    });
    describe("replace(value)", function() {
      return it("should set the hash to the value", function() {
        url.hash.replace("twenty");
        return expect(url.hash.print()).to.equal("#twenty");
      });
    });
    describe("update(value)", function() {
      return it("should set the hash to the value", function() {
        url.hash.update("twenty");
        return expect(url.hash.print()).to.equal("#twenty");
      });
    });
    describe("remove(value)", function() {
      return it("should remove the hash", function() {
        url.hash.remove();
        return expect(url.hash.print()).to.be.empty;
      });
    });
    return describe("print()", function() {
      return it("should return the hash", function() {
        return expect(url.hash.print()).to.equal("#thirteen");
      });
    });
  });

}).call(this);
