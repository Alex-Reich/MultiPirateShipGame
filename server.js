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
http.listen(app.get('port'), function () {
  console.log('listening on port', app.get('port'));
});

// create dict to keep all players as key/value pairs
var players = {};
// Tell Socket.io to start accepting connections
io.on('connection', function (socket) {
  console.log("New client has connected with id:", socket.id);
  // Listen for new-player event on this client 
  socket.on('new-player', function (state) {
    console.log("New player has state:", state);
    // add new player to dict
    players[socket.id] = state;
    // send an update event
    io.emit('update-players', players);
  })

  // Listen for a disconnect and update player table
  socket.on('disconnect', function (state) {
    // delete player from dict on disconnect
    delete players[socket.id];
    // send an update event
    io.emit('update-players', players);
  })

  // Listen for move events and tell all other clients that something has moved
  socket.on('move-player', function (position_data) {
    if (players[socket.id] == undefined) return;
    players[socket.id].x = position_data.x;
    players[socket.id].y = position_data.y;
    players[socket.id].angle = position_data.angle;
    io.emit('update-players', players)
  })

  // Listen for shoot-bullet events and add it to our bullet array


  // Update the bullets 60 times per frame and send update

})