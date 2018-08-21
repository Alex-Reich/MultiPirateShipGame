var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // Make sure to put this after http has been defined

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

// Tell Socket.io to start accepting connections
io.on('connection', function(socket){
  console.log("New client has connected with id:",socket.id);
})