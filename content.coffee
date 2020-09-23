
class ContentScript
  set_location: (location) ->
    location_str = document.location.toString()
    Object.keys(location).forEach (k) ->
      location_str = location_str.replace(document.location[k], location[k])
    document.location = location_str
    return true

  get_location: ->
    window.location

  run: ->
    self = @
    chrome.runtime.onMessage.addListener (message, error, callback) ->
      if message.to == "get_location"
        _loc = self.get_location()
        callback(_loc)
      else if message.to == "set_location"
        _loc = message.location
        self.set_location(_loc)
      else if message.to == "console"
        console.log message.message


content_script = new ContentScript()
content_script.run()
