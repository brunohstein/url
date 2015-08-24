## API

```javascript
var url = new Url("http://domain.com/one/two/three?four=five&six=seven,eight#nine", [
  { key: "one", value: false },
  { key: "two", value: true }
])
```

`url.print()`

#### Origin

`url.origin.print()`

#### Path

`url.path.get(key)`

`url.path.add(key, value)`

`url.path.replace(key, value)`

`url.path.remove(key, value)`

`url.path.update(key, value, unique)`

`url.path.any(but)`

`url.path.print()`

#### QueryString

`url.queryString.get(key)`

`url.queryString.add(key, value)`

`url.queryString.replace(key, value)`

`url.queryString.remove(key, value)`

`url.queryString.update(key, value, unique)`

`url.queryString.clear()`

`url.queryString.any(but)`

`url.queryString.print()`

#### Hash

`url.hash.get()`

`url.hash.add(value)`

`url.hash.remove()`

`url.hash.print()`
