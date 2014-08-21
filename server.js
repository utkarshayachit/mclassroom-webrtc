var static = require('node-static');

/* setup static page server */
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;

var fileServer = new static.Server("./public");
var http = require('http');
http.createServer(function (request, response) {
  request.addListener('end', function () {
    fileServer.serve(request, response);
  }).resume();
}).listen(port, host, function() {
  console.log("Static page server started on " + port);
});


/* setup PeerJS server */
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port:9000, path: '/mclassroom'});
