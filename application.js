var Classroom = (function($) {

  // Instance stores the reference to the Singleton.
  var instance;

  // validate WebRTC support.
  function initializeWebRTC() {
    if (!webrtcDetectedBrowser) {
      console.log("Does not support WebRTC.");
      return false;
    }
    if (webrtcDetectedBrowser === "chrome" && webrtcDetectedVersion < 30) {
      console.log("Browser not supported. Please upgrade to latest Chrome.");
      return false;
    }
    return true;
  }


  // returns a map of audio sources key == source-id, value == label/name
  function _getAudioSources(callback) {
    MediaStreamTrack.getSources(function(sourceInfos) {
      var counter = 1;
      var result = {}
      $.each(sourceInfos, function(index, sourceInfo) {
        if (sourceInfo.kind === "audio") {
          var text = sourceInfo.label || 'Audio Input ' + counter++;
          result[sourceInfo.id] = text;
        }
      });
      callback(result);
    });
  }

  function constructor() {
    if (!initializeWebRTC()) { return null; }

    return {
      getAudioSources : _getAudioSources
    };
  }


  return {
    // Get access to the singleton instance.
    getInstance: function() {
      if (!instance) {
        instance = constructor();
      }
      return instance;
    }
  };

})($);
