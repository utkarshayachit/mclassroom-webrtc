var Classroom = (function($, window) {
  if (!$) { throw "jQuery required."; }
  // Instance stores the reference to the Singleton.
  var instance;
  var self = {};
  var self$ = $(self);

  var AudioContext = window.AudioContext ||
                     window.webkitAudioContext;


  function getUrlParameter(key) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == key) {
        return sParameterName[1];
      }
    }
  }

  //---------------------------------------------------------------------------
  // Error codes
  var ErrorCodes = {
      /* Connection is being attempted without a valid peer id. */
      COMMUNICATION_INVALID_PEERID : 10001,
      /* No audio streams are available to start a call.*/
      COMMUNICATION_NO_INPUT_AUDIO_STREAMS : 10002,
      /* Error message from PeerJS */
      PEERJS_ERROR : 10003
  };

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
      audio: { mandatory: {sourceId: sourceId, echoCancellation: false} }
    };
    getUserMedia(constraints, function(stream) {
        /* save sourceid as data on the stream */
        if (successcallback) {
            successcallback(stream);
            self.ActiveAudioStreams.push(stream);
        }
    }, function(error) {
        if (errorcallback) { errorcallback(error); }
        else { console.log("Classroom Error: " + error); }
    });
  }

  //---------------------------------------------------------------------------
  function _removeAudioInput(stream) {
    var index = self.ActiveAudioStreams.indexOf(stream);
    if (index >= 0) {
        stream.stop();
        self.ActiveAudioStreams.splice(index);
     } else {
         throw "Unexpected argument" + stream;
     }
  }

  //---------------------------------------------------------------------------
  function _connectToServer(pseudonym, successcallback) {
      if (self.Peer) {
        throw "Already connected to Server. Cannot connect again!";
      }
      console.log("Connect to PeerJS server");
      self.Peer = new Peer(pseudonym, {key: 'rg2evj4ryejw0zfr',
          // Set highest debug level (log everything!).
          debug : 3,
          config : { 'iceServers': [
                  /*{url : "107.23.150.92:3478" },*/
                  {url : "stun:stun.l.google.com:19302"},
                  {url : "stun:stun.stunprotocol.org:3478"}
          ]}
      });
      self.Peer.on('open', function(id) {
          console.log("My peer ID is: " + id);
          self.PeerID = id;
          if (successcallback) { successcallback(id); }
      });
      self.Peer.on('error', function(err) {
          console.log("Peer Error " + err);
      });
      self.Peer.on("call", function(call) {
          console.log("Received call from peer:" + call);
          call.answer(); /* we don't reply with our stream since there's no 1-1 mapping */
          call.on('stream', function (remotestream) {
              self$.trigger("stream", remotestream);
          });
      });
      return true;
  }

  //---------------------------------------------------------------------------
  function _connectToPeer(peerid) {
      if (peerid === undefined || peerid === "") {
          self$.trigger("error", ErrorCodes.COMMUNICATION_INVALID_PEERID);
      } else if (self.ActiveAudioStreams.length == 0) {
          self$.trigger("error", ErrorCodes.COMMUNICATION_NO_INPUT_AUDIO_STREAMS);
      } else {
          $.each(self.ActiveAudioStreams, function (idx, stream) {
              var mediaConnection = self.Peer.call(peerid, stream);

              /* handle remote adding a reply stream */
              mediaConnection.on('stream', function (remotestream) {
                  console.log("mediaConnection.on==>stream");
              });
              /* handle error */
              mediaConnection.on('error', function(err) {
                  console.log("MediaConnection Error: " + err);
                  self$.trigger("error", [ErrorCodes.PEERJS_ERROR, err]);
              });
              /* handle close */
              mediaConnection.on('close', function(){
                  console.log("mediaConnection.on==>close");
              });
          });
      }
  }

  //---------------------------------------------------------------------------
  function constructor() {
    if (!initializeWebRTC()) { return null; }

    self.ActiveAudioStreams = [];

    return {
      getAudioSources : _getAudioSources,
      addAudioInput : _addAudioInput,
      removeAudioInput : _removeAudioInput,
      connectToServer : _connectToServer,
      connectToPeer : _connectToPeer,
      error_codes   : ErrorCodes,
      on : function (events, selector, data, handler) {
          self$.on(events, selector, data, handler);
      }
    };
  }

  //---------------------------------------------------------------------------
  return {
    // Get access to the singleton instance.
    getInstance: function() {
      if (!instance) {
        instance = constructor();
        // setupWebAudio();
      }
      return instance;
    }
  };

})($, window);
