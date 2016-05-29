expect = chai.expect
url = null

beforeEach ->
  map = [{ key: "one", value: false }, { key: "two", value: true }, { key: "four", value: true }, { key: "twenty", value: "twenty-one" }]
  url = new Url("http://domain.com/one/two/three/four/five?six=seven&eight=nine&ten=eleven,twelve#thirteen", map)

describe "Url", ->
  describe "print()", ->
    it "should return the full url", ->
      expect(url.print()).to.equal("http://domain.com/one/two/three/four/five?six=seven&eight=nine&ten=eleven,twelve#thirteen")

describe "Origin", ->
  describe "print()", ->
    it "should return the input value", ->
      expect(url.origin.print()).to.equal("http://domain.com")

describe "Path", ->
  describe "get(key)", ->
    it "should return the value of the key on the path", ->
      expect(url.path.get("two")).to.deep.equal({ key: "two", value: "three" })

    it "should return null as the value of the key on the path if single", ->
      expect(url.path.get("one")).to.deep.equal({ key: "one", value: null })

    it "should return the value of the key of an updated path", ->
      url.path.update("twenty", "twenty-one")
      expect(url.path.get("twenty")).to.deep.equal({ key: "twenty", value: "twenty-one" })

    it "should return undefined if the key does not exist on the path", ->
      expect(url.path.get("twenty")).to.be.undefined

  describe "add(key, value)", ->
    it "should add a new key with a value to the path", ->
      url.path.add("twenty", "twenty-one")
      expect(url.path.print()).to.equal("/one/two/three/four/five/twenty/twenty-one")

    it "should add a new value to a existing key on the path", ->
      url.path.add("two", "twenty")
      expect(url.path.print()).to.equal("/one/two/three,twenty/four/five")

    it "should add a new key without a value to the path", ->
      url.path.add("twenty")
      expect(url.path.print()).to.equal("/one/two/three/four/five/twenty")

    it "should add the key and value on the params", ->
      url.path.add("twenty", "twenty-one")
      expect(url.path.params[3]).to.deep.equal({ key: "twenty", value: "twenty-one" })

  describe "replace(key, value)", ->
    it "should replace the value of a key on the path", ->
      url.path.replace("two", "twenty")
      expect(url.path.print()).to.equal("/one/two/twenty/four/five")

    it "should replace the value of a key on the params", ->
      url.path.replace("two", "twenty")
      expect(url.path.params[1]).to.deep.equal({ key: "two", value: "twenty" })

    it "should do nothing if the key does not exist", ->
      url.path.replace("twenty", "twenty-one")
      expect(url.path.print()).to.equal("/one/two/three/four/five")

  describe "remove(key, value)", ->
    it "should remove a key from the path", ->
      url.path.remove("two")
      expect(url.path.print()).to.equal("/one/four/five")

    it "should remove a key from the params", ->
      url.path.remove("two")
      expect(url.path.params[1]).to.not.deep.equal({ key: "two", value: "three" })

    it "should remove a value from a key that have multiple from the path", ->
      url.path.add("two", "twenty").remove("two", "three")
      expect(url.path.print()).to.equal("/one/two/twenty/four/five")

    it "should do nothing if the key does not exist", ->
      url.path.remove("twenty")
      expect(url.path.print()).to.equal("/one/two/three/four/five")

  describe "update(key, value, unique = false)", ->
    it "should return the path with the updated data", ->
      url.path.update("two", "twenty", true)
      expect(url.path.print()).to.equal("/one/two/twenty/four/five")

    it "should return the path with the passed key removed", ->
      url.path.update("two", "three")
      expect(url.path.print()).to.equal("/one/four/five")

    it "should return the path with the passed value removed", ->
      url.path.update("two", "twenty").update("two", "three")
      expect(url.path.print()).to.equal("/one/two/twenty/four/five")

    it "should return the path with the updated data when key is not in the url", ->
      url.path.update("twenty", "twenty-one")
      expect(url.path.print()).to.equal("/one/two/three/four/five/twenty/twenty-one")

    it "should do nothing if data is empty", ->
      url.path.update()
      expect(url.path.print()).to.equal("/one/two/three/four/five")

  describe "clear()", ->
    it "should remove all the params of the path", ->
      url.path.clear()
      expect(url.path.print()).to.be.empty

  describe "any(but)", ->
    it "should return true if there is any params in the path", ->
      expect(url.path.any()).to.be.true

    it "should return false if there is not any params in the path", ->
      url.path.clear()
      expect(url.path.any()).to.be.false

    it "should return true if there is any params in the path but the ones in the argument", ->
      expect(url.path.any("two")).to.be.true

    it "should return false if there is not any params in the path but the ones in the argument", ->
      expect(url.path.any(["one", "two", "four"])).to.be.false

  describe "print()", ->
    it "should return the path", ->
      expect(url.path.print()).to.equal("/one/two/three/four/five")

describe "QueryString", ->
  describe "get(key)", ->
    it "should return the value of the key on the querystring", ->
      expect(url.queryString.get("six")).to.deep.equal({ key: "six", value: "seven" })

    it "should return the values of the key on the querystring if they are multiple", ->
      expect(url.queryString.get("ten")).to.deep.equal({ key: "ten", value: ["eleven", "twelve"] })

    it "should return undefined if the key does not exist on the querystring", ->
      expect(url.queryString.get("twenty")).to.be.undefined

  describe "add(key, value)", ->
    it "should add a new key with a value to the querystring", ->
      url.queryString.add("twenty", "twenty-one")
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve&twenty=twenty-one")

    it "should add a new key with a value to the querystring", ->
      url.queryString.add("ten", "twenty")
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve,twenty")

  describe "replace(key, value)", ->
    it "should replace the value of a key on the querystring", ->
      url.queryString.replace("six", "twenty")
      expect(url.queryString.print()).to.equal("?six=twenty&eight=nine&ten=eleven,twelve")

    it "should do nothing if the key does not exist", ->
      url.queryString.replace("twenty", "twenty-one")
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve")

  describe "remove(key, value)", ->
    it "should remove a key of the querystring", ->
      url.queryString.remove("six")
      expect(url.queryString.print()).to.equal("?eight=nine&ten=eleven,twelve")

    it "should remove a value of a key on the querystring", ->
      url.queryString.remove("ten", "eleven")
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=twelve")

    it "should do nothing if the key does not exist", ->
      url.queryString.remove("twenty")
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve")

  describe "update(key, value, unique)", ->
    it "should remove if the key and the value exists", ->
      url.queryString.update("six", "seven")
      expect(url.queryString.print()).to.equal("?eight=nine&ten=eleven,twelve")

    it "should add if the key exists and the value is different", ->
      url.queryString.update("six", "twenty")
      expect(url.queryString.print()).to.equal("?six=seven,twenty&eight=nine&ten=eleven,twelve")

    it "should replace if the key exists and the value is different and is unique", ->
      url.queryString.update("six", "twenty", true)
      expect(url.queryString.print()).to.equal("?six=twenty&eight=nine&ten=eleven,twelve")

    it "should add if the key does not exist", ->
      url.queryString.update("twenty", "twenty-one")
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve&twenty=twenty-one")

  describe "clear()", ->
    it "should remove all the params of the queryString", ->
      url.queryString.clear()
      expect(url.queryString.print()).to.be.empty

  describe "any(but)", ->
    it "should return true if there is any params in the querystring", ->
      expect(url.queryString.any()).to.be.true

    it "should return false if there is not any params in the querystring", ->
      url.queryString.clear()
      expect(url.queryString.any()).to.be.false

    it "should return true if there is any params in the querystring but the ones in the argument", ->
      expect(url.queryString.any("eight")).to.be.true

    it "should return false if there is not any params in the querystring but the ones in the argument", ->
      expect(url.queryString.any(["six", "eight", "ten"])).to.be.false

  describe "print()", ->
    it "should return the querystring", ->
      expect(url.queryString.print()).to.equal("?six=seven&eight=nine&ten=eleven,twelve")

describe "Hash", ->
  describe "get()", ->
    it "should return the value of the hash", ->
      expect(url.hash.get()).to.equal("thirteen")

  describe "update(value)", ->
    it "should set the hash to the value", ->
      url.hash.update("twenty")
      expect(url.hash.print()).to.equal("#twenty")

  describe "remove(value)", ->
    it "should remove the hash", ->
      url.hash.remove()
      expect(url.hash.print()).to.be.empty

  describe "print()", ->
    it "should return the hash", ->
      expect(url.hash.print()).to.equal("#thirteen")
