var Alert = (function($, window) {
  if (!$) { throw "jQuery required.";}


  var self = {};
  var self$ = $(self);

  function _initialize(warning, error) {
    self.Warning = warning;
    self.Error = error;
    self.WarningText = self.Warning.find("strong");
    self.WarningClose = self.Warning.find("span");
    self.ErrorText = self.Error.find("strong");

    self.WarningClose.on("click", function() {
      self.Warning.addClass("hidden");
    });
  }

  function _warn(msg) {
    self.WarningText.text("Warning! " + msg);
    self.Warning.removeClass("hidden");
  }

  function _error(msg) {
    self.ErrorText = "ERROR! " + msg;
    self.Error.removeClass("hidden");
  }

  return {
    initialize : _initialize,
    warn : _warn,
    error : _error
  };
})($, window);
