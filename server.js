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
// Track all bullets to update them on the server
var bullet_array = [];
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
  socket.on('shoot-bullet', function (data) {
    if (players[socket.id] == undefined) return;
    var new_bullet = data;
    // Attach id of the player to the bullet
    data.owner_id = socket.id;
    bullet_array.push(new_bullet);
  })
})

// Update the bullets 60 times per frame and send update
function ServerGameLoop() {
  for (var i = 0; i < bullet_array.length; i++) {
    var bullet = bullet_array[i];
    bullet.x += bullet.speed_x * 0.25;
    bullet.y += bullet.speed_y * 0.25;

    // Check if this bullet is close enough to hit a player
    for (var id in players) {
      if (bullet.owner_id != id) {
        // And your own bullet shouldn't kill you
        var dx = players[id].x - bullet.x;
        var dy = players[id].y - bullet.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70) {
          // Tell everyone this player got hit
          io.emit('player-hit', id);
        }
      }
    }

    // Remove bullet if it goes too far off screen
    if (bullet.x < -10 || bullet.x > 1000 || bullet.y < -10 || bullet.y > 1000) {
      bullet_array.splice(i, 1);
      i--;
    }
  }
  // Tell everyone where the bullets are by sending the whole array
  io.emit("bullets-update", bullet_array);
}
setInterval(ServerGameLoop, 16);
