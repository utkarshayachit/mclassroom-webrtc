var Classroom = (function($, window) {
  if (!$) { throw "jQuery required."; }
  // Instance stores the reference to the Singleton.
  var instance;
  var self = this;

  var AudioContext = window.AudioContext ||
                     window.webkitAudioContext;

  //---------------------------------------------------------------------------
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

  //---------------------------------------------------------------------------
  // initialize WebAudio.
  function initializeWebAudio() {
    if (!AudioContext) {
      console.log("Browser does not support WebAudio.");
      return false;
    }
    return true;
  }

  //---------------------------------------------------------------------------
  // setup WebAudio.
  function setupWebAudio() {
    self.webAudio = {};
    self.webAudio.context = new AudioContext();
    self.webAudio.inputs = [];
    self.webAudio.compressor =
      self.webAudio.context.createDynamicsCompressor();
    //self.webAudio.compressor.connect(self.webAudio.context.destination);
  }

  //---------------------------------------------------------------------------
  // returns a map of audio sources key == source-id, value == label/name
  function _getAudioSources(callback) {
    MediaStreamTrack.getSources(function(sourceInfos) {
      var result = {}
      $.each(sourceInfos, function(index, sourceInfo) {
        if (sourceInfo.kind === "audio") {
          var text = sourceInfo.label || 'Audio Input ' + index;
          result[sourceInfo.id] = text;
        }
        console.log("Source " + index + " " + JSON.stringify(sourceInfo, null, " "));
      });
      callback(result);
    });
  }

  //---------------------------------------------------------------------------
  // add an input source.
  function _addAudioInput(sourceId, successcallback, errorcallback) {
    var constraints = {
      audio: { optional: [ {sourceId: sourceId} ] }
    };
    getUserMedia(constraints, function(stream) {
      //var inputStream = self.webAudio.context.createMediaStreamSource(stream);
      //var gainNode = self.webAudio.context.createGain();
      //gainNode.gain.value = 0.1;

      //inputStream.connect(gainNode);
      //gainNode.connect(self.webAudio.context.destination);

      self.webAudio.inputs.push({
        sourceId : sourceId,
        webRTCStream : stream,
        //mediaStream : inputStream,
        //gainNode: gainNode
      });
      if (successcallback) {
        successcallback(self.webAudio.inputs[self.webAudio.inputs.length-1]);
      }
    }, function(error) {
      if (errorcallback) { errorcallback(error); }
      else { console.log("Classroom Error: " + error); }
    });
  }

  //---------------------------------------------------------------------------
  function constructor() {
    if (!initializeWebRTC() || !initializeWebAudio()) { return null; }

    return {
      getAudioSources : _getAudioSources,
      addAudioInput : _addAudioInput
    };
  }

  //---------------------------------------------------------------------------
  return {
    // Get access to the singleton instance.
    getInstance: function() {
      if (!instance) {
        instance = constructor();
        setupWebAudio();
      }
      return instance;
    }
  };

})($, window);
