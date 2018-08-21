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
// create dict to keep all players as key/value pairs
var players = {};
io.on('connection', function(socket){
  console.log("New client has connected with id:",socket.id);
  socket.on('new-player',function(state_data){ // Listen for new-player event on this client 
    console.log("New player has state:",state_data);
    // add new player to dict
    players[socket.id] = state_data;
    // send an update event
    io.emit('update-players',players);
  })
  socket.on('disconnect', function(){
    // delete player from dict on disconnect
    delete players[socket.id];
    // send an update event
  })
})