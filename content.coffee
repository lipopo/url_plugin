
class ContentScript
  set_location: (location) ->
    window.location.search = location.search

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