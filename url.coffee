paramsHandler = () ->
  @get = (key) =>
    return param for param in @params when param.key is key

  @contains = (key, value) =>
     param = @get(key)
     return false unless param

     if param.value.constructor isnt Array
       return param.value is value
     else
       return param.value.indexOf(value) isnt -1

  @add = (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = [@params[index].value] if @params[index].value.constructor isnt Array
        @params[index].value.push(value)
    else
      @params.push(key: key, value: value)
    return @

  @replace = (key, value) =>
    if @get(key) and value
      for param, index in @params when param.key is key
        @params[index].value = value
    return @

  @remove = (key, value) =>
    if @get(key)
      for param in @params
        if param.key is key
          remove = param
          index = @params.indexOf(remove)
      if value and remove.value.constructor is Array
        valueToRemoveIndex = remove.value.indexOf(value)
        @params[index].value.splice(valueToRemoveIndex, 1) if valueToRemoveIndex isnt -1
      else
        @params.splice(index, 1)
    return @

  @update = (key, value, unique = false) =>
    if key and value
      if param = @get(key)
        if param.value and (param.value is value or (param.value.constructor is Array and param.value.indexOf(value) isnt -1))
          @remove(key, value)
        else
          if unique then @replace(key, value) else @add(key, value)
      else
        @add(key, value)
    return @

  @clear = () =>
    @params = []
    return @

  @any = (but) =>
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

class @Url

  constructor: (url, pathMap) ->
    @setup(url, pathMap)

  setup: (url, pathMap) =>
    if not url
      throw name: "UrlException", message: "Required parameter url is missing."

    @input = url
    @origin = new Origin extractOrigin(url)
    @path = new Path extractPath(url, @origin.input), pathMap
    @queryString = new QueryString extractQueryString(url)
    @hash = new Hash extractHash(url)

    return @

  print: () =>
    return @origin.print() + @path.print() + @queryString.print() + @hash.print()

  extractOrigin = (url) =>
    origin = url.match(/^((https?|ftp):\/\/|www?|\/\/).+?(?=\/|\?|\#|$)/)
    return if origin then origin[0] else null

  extractPath = (url, origin) =>
    path = if origin then url.split(origin)[1] else url
    return if path and path isnt "/" then path.split("?")[0].split("#")[0] else null

  extractQueryString = (url) =>
    queryString = url.split("?")[1]
    return if queryString then queryString.split("#")[0] else null

  extractHash = (url) =>
    hash = url.split("#")[1]
    return if hash then hash else null

class Origin

  constructor: (origin) ->
    @input = origin

  print: () =>
    return if @input then @input else ""

class Path

  constructor: (path, map) ->
    paramsHandler.call(@)
    @input = path
    @map = if map then map else extractMap(path)
    @map = [@map] if @map.constructor isnt Array
    @params = if @map then extractParams(path, @map) else []

  print: () =>
    path = []
    for tuple in @map
      for param in @params
        if tuple.key is param.key
          if param.value
            path.push("/#{param.key}/#{param.value}")
          else
            path.push("/#{param.key}")
    return if @any() then path.join("") else ""

  extractMap = (path) =>
    map = []

    if path
      params = path.replace(/^\//, "").split("/")
      map.push(key: param, value: false) for param in params

    return map

  extractParams = (path, map) =>
    params = []
    return params unless path
    path = path
    for tuple in map
      splitParam = new RegExp("\/#{tuple.key}((\/.+?(?=\/|$))|(?=\/|$))")
      if match = path.match(splitParam)
        console.log tuple.value
        if tuple.value
          path = path.replace(match[0], "")
          value = match[0].substring(1).split("/")[1]
        else
          value = null
        if value
          value = value.split(",")
          value = if value.length > 1 then value else value[0]
        param =
          key: tuple.key
          value: value
        params.push(param)
    return params

class QueryString

  constructor: (queryString) ->
    paramsHandler.call(@)
    @input = queryString
    @params = if @input then extractParams(@input) else []

  print: () =>
    queryString = []
    queryString.push("#{param.key}=#{param.value}") for param in @params
    return if @any() then "?#{queryString.join('&')}" else ""

  extractParams = (queryString) =>
    params = queryString.split("&")
    for param in params
      param = param.split("=")
      value = param[1]
      if value
        value = value.split(",")
        value = if value.length > 1 then value else value[0]
      param =
        key: param[0]
        value: value

class Hash

  constructor: (hash) ->
    @input = @current = hash

  get: () =>
    return @current

  update: (value) =>
    @current = value

  remove: () =>
    @current = null

  print: () =>
    return if @current then "##{@current}" else ""
