var express = require("express")
var app = express()
var server = require("http").Server(app)
var io = require("socket.io")(server)
nicknames=[];

app.use("/static", express.static(__dirname + '/static'))
app.use("/node_modules", express.static(__dirname + '/node_modules'))

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/splashpage.html")
})

app.get("/game", function(req, res) {
  res.sendFile(__dirname + "/views/game.html")
})

var playerCount = 0
var id = 0

io.on("connection", function(socket) {
  playerCount++
  id++

  setTimeout(function() {
    socket.emit("connected_game", {
      playerId: id
    })
    io.emit("count", {
      playerCount: playerCount
    })
  }, 1500)

  socket.on("disconnect", function() {
    playerCount--
    io.emit("count", {
      playerCount: playerCount
    })
  })

  socket.on("updatePlayer", function(data) {
    socket.broadcast.emit("updatedActor", data)
  })

  socket.on("updateScore", function(data) {
    socket.broadcast.emit("updatedScore", data)
  })

    socket.on("update", function (data) 
  {
    socket.broadcast.emit("updated", data);
  });

})

io.sockets.on('connection', function(socket)
{
  socket.on('new user', function(data, callback)
  {
    if (nicknames.indexOf(data) != -1)
    {
      callback(false);
    }
     else{
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      updateNicknames();
    }
  });
});

function updateNicknames()
{
    io.sockets.emit('usernames', nicknames);
}

io.sockets.on('connection', function(socket)
{
  socket.on('send message', function(data)
  {
    io.sockets.emit('new message', {msg: data, nick: socket.nickname});
  });
});

server.listen(8080)
console.log("Listening on http://localhost:8080/")
