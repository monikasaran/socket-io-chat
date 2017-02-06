var express = require('express');
var http = require('http');
var socketIO = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);

app.use(express.static(__dirname + '/public'));

var users = [];

io.sockets.on('connection', function(socket){
  console.log("A New Connection has been Established");
  socket.on('new user', function(data, callback){
    if(data in users){
      console.log("Username already exists");
      callback(false);
    }else{
      console.log("Username available");
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      io.sockets.emit('usernames', Object.keys(users));
    }
  });//io.sockets.on('connection'

  socket.on('ClientMessage', function(data, callback){
    var msg = data.trim();

    if(msg.substr(0,1) === '@'){
      msg = msg.substr(1);
      var ind = msg.indexOf(' ');
      if(ind !== -1){
        var name = msg.substring(0, ind);
        var msg = msg.substring(ind+1);
         if(name in users){
            users[name].emit('whisper', {msg:msg,nick:socket.nickname});
            socket.emit('private', {msg:msg,nick:name});
          console.log("Whispering !");
        }else{
          callback("Sorry, " + name + " is not online");
        }
      }else{
        callback("Looks like you forgot to write the message");
      }
    }//if(msg.substr(0,1) === '@')
    else{
     console.log("Got Message :" + data);
     io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
    }
  });//socket.on('ClientMessage)

  socket.on('disconnect', function(data){
        if(!socket.nickname) return;
        delete users[socket.nickname];
        io.sockets.emit('usernames', Object.keys(users));
  });//on('disconnect'
  
});//io.sockets.on()

var port = process.env.PORT || 8080;
server.listen(port, function(){
  console.log("HTTP server is up & Running on port " + port);
});
