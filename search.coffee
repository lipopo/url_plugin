class Search
  constructor: (search_str) ->
    @search_list = []
    if search_str.length > 1
      @search_list = search_str.slice(1).split("&").map (item) ->
        item.split("=")
    @get_search_list = @get_search_list.bind(this)

  get_search_list: ->
    @search_list

  get_field_count: ->
    @search_list.length

  get_search: ->
    search_value = @search_list.map(
      (search_item) => search_item.map((value) ->
        encodeURI(value)
      ).join("=")
    ).join("&")
    return "?#{search_value}"


export default Search
