class @Url

  print: () =>
    return @origin.print() + @path.print() + @queryString.print() + @hash.print()

  extract = (url) =>
    origin = url.match(/^((https?|ftp):\/\/|www?|\/\/).+?(?=\/|\?|\#|$)/)
    origin = if origin then origin[0] else null

    path = if origin then url.split(origin)[1] else url
    path = if path and path isnt "/" then path.split("?")[0].split("#")[0] else null

    queryString = url.split("?")[1]
    queryString = if queryString then queryString.split("#")[0] else null

    hash = url.split("#")[1]
    hash = if hash then hash else null

    return origin: origin, path: path, queryString: queryString, hash: hash

  constructor: (url, map) ->
    throw name: "UrlException", message: "Required parameter url is missing." if not url

    @input = url
    structure = extract(@input)

    @origin = new Origin(structure.origin)
    @path = new Path(structure.path, map)
    @queryString = new QueryString(structure.queryString)
    @hash = new Hash(structure.hash)

class Origin

  print: () =>
    return @input

  constructor: (origin) ->
    @input = origin

class Path

  get: (key) =>
    return param for param in @params when param.key is key

  add: (key, value) =>
    if not @get(key)
      @params.push(key: key, value: value or null)

  replace: (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = value

  remove: (key) =>
    if @get(key)
      for param, index in @params when param and param.key is key
        @params.splice(index, 1)

  update: (data = []) =>
    data = [data] if data.constructor isnt Array
    for tuple in data
      if param = @get(tuple.key)
        if param.value is tuple.value
          @remove(tuple.key, tuple.value)
        else
          @replace(tuple.key, tuple.value)
      else
        @add(tuple.key, tuple.value)

  any: () =>
    return @params.length > 0

  print: () =>
    path = []
    for param in @params
      if param.value
        path.push("/" + param.key + "/" + param.value)
      else
        path.push("/" + param.key)
    return if @any() then path.join("") else @input

  extract = (path, map) =>
    params = []
    for tuple in map
      splitParam = new RegExp("#{tuple.key}\/.+?(?=\/|$)")
      if match = path.match(splitParam)
        param =
          key: tuple.key
          value: if tuple.value then match[0].split("/")[1] else null
        params.push(param)
    return params

  constructor: (path, @map) ->
    @input = path
    @map = [@map] if @map and @map.constructor isnt Array
    @params = if @map then extract(path, @map) else []

class QueryString

  get: (key) =>
    return param for param in @params when param.key is key

  add: (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = [@params[index].value] if @params[index].value.constructor isnt Array
        @params[index].value.push(value)
    else
      @params.push(key: key, value: value)

  replace: (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = value

  remove: (key, value) =>
    if @get(key)
      for param, index in @params when param and param.key is key
        if value and param.value.constructor is Array
          values = @params[index].value
          @params[index].value.splice(values.indexOf(value), 1)
        else
          @params.splice(index, 1)

  update: (key, value, unique = false) =>
    if param = @get(key)
      if param.value is value
        @remove(key, value)
      else
        if unique then @replace(key, value) else @add(key, value)
    else
      @add(key, value)

  clear: () =>
    @params = []

  any: () =>
    return @params.length > 0

  print: () =>
    queryString = []
    queryString.push(param.key + "=" + param.value) for param in @params
    return if @any() then "?" + queryString.join("&") else ""

  extract = (queryString) =>
    params = queryString.split("&")
    for param in params
      param = param.split("=")
      value = param[1].split(",")
      param =
        key: param[0]
        value: if value.length > 1 then value else value[0]

  constructor: (queryString) ->
    @input = queryString
    @params = if @input then extract(@input) else []

class Hash

  get: () =>
    return @current

  add: (value) =>
    @current = value

  replace: @::add

  update: @::add

  remove: () =>
    @current = null

  print: () =>
    return if @current then "#" + @current else ""

  constructor: (hash) ->
    @input = @current = hash
