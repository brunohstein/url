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

    map = []
    if path
      params = path.replace(/^\//, "").split("/")
      map.push(key: param, value: false) for param in params

    return origin: origin, path: path, queryString: queryString, hash: hash, map: map

  constructor: (url, map) ->
    throw name: "UrlException", message: "Required parameter url is missing." if not url

    @input = url
    structure = extract(@input)

    @origin = new Origin(structure.origin)
    @path = new Path(structure.path, if map then map else structure.map)
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
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = [@params[index].value] if @params[index].value.constructor isnt Array
        @params[index].value.push(value)
    else
      @params.push(key: key, value: value)
    return @

  replace: (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = value
    return @

  remove: (key, value) =>
    if @get(key)
      for param in @params
        if param.key is key
          remove = param
          index = @params.indexOf(remove)
      if value and remove.value.constructor is Array
        @params[index].value.splice(remove.value.indexOf(value), 1)
      else
        @params.splice(index, 1)
    return @

  update: (key, value, unique = false) =>
    if key and value
      if param = @get(key)
        if param.value is value or (param.value.constructor is Array and param.value.indexOf(value) isnt -1)
          @remove(key, value)
        else
          if unique then @replace(key, value) else @add(key, value)
      else
        @add(key, value)
    return @

  clear: () =>
    @params = []
    return @

  any: (but) =>
    if but
      but = [but] if but.constructor isnt Array
      params = @params.slice()
      remove = []
      for ignore in but
        remove.push(param) for param in @params when param.key is ignore
      for param in remove
        params.splice(params.indexOf(param), 1)
      return params.length > 0
    else
      return @params.length > 0

  print: () =>
    path = []
    for tuple in @map
      for param in @params
        if tuple.key is param.key
          if param.value
            path.push("/" + param.key + "/" + param.value)
          else
            path.push("/" + param.key)
    return if @any() then path.join("") else ""

  extract = (path, map) =>
    params = []
    return params unless path
    for tuple in map
      checkParam = new RegExp("#{tuple.key}(?=\/|$)")
      splitParam = new RegExp("#{tuple.key}\/.+?(?=\/|$)")
      if match = path.match(splitParam) or path.match(checkParam)
        value = if tuple.value then match[0].split("/")[1] else null
        if value
          value = value.split(",")
          value = if value.length > 1 then value else value[0]
        param =
          key: tuple.key
          value: value
        params.push(param)
    return params

  constructor: (path, @map) ->
    @input = path
    @map = [@map] if @map.constructor isnt Array
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
    return @

  replace: (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = value
    return @

  remove: (key, value) =>
    if @get(key)
      for param in @params
        if param.key is key
          remove = param
          index = @params.indexOf(remove)
      if value and remove.value.constructor is Array
        @params[index].value.splice(remove.value.indexOf(value), 1)
      else
        @params.splice(index, 1)
    return @

  update: (key, value, unique = false) =>
    if param = @get(key)
      if param.value is value or (param.value.constructor is Array and param.value.indexOf(value))
        @remove(key, value)
      else
        if unique then @replace(key, value) else @add(key, value)
    else
      @add(key, value)
    return @

  clear: () =>
    @params = []
    return @

  any: (but) =>
    if but
      but = [but] if but.constructor isnt Array
      params = @params.slice()
      remove = []
      for ignore in but
        remove.push(param) for param in @params when param.key is ignore
      for param in remove
        params.splice(params.indexOf(param), 1)
      return params.length > 0
    else
      return @params.length > 0

  print: () =>
    queryString = []
    queryString.push(param.key + "=" + param.value) for param in @params
    return if @any() then "?" + queryString.join("&") else ""

  extract = (queryString) =>
    params = queryString.split("&")
    for param in params
      param = param.split("=")
      value = param[1]
      if value
        value = value.split(",")
        value = if value.length > 1 then value else value[0]
      else
        value = null
      param =
        key: param[0]
        value: value

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
