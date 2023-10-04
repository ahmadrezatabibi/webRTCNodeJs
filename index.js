const express = require("express");
const socket = require("socket.io");
const app = express();

//Starts the server

let server = app.listen(4000, function () {
  console.log("Server is running");
});

app.use(express.static("public"));

//Upgrades the server to accept websockets.

let io = socket(server);

//Triggered when a client is connected.

io.on("connection", function (socket) {
  console.log("User Connected :" + socket.id);

  //Triggered when a peer hits the join room button.

  socket.on("join", function (data) {
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(data.roomName);
    let user = rooms.get(data.userName);

    //room == undefined when no such room exists.
    if (room == undefined) {
      socket.join(data.roomName);
      socket.emit("created");
    } else if (room.size > 0) {
      //room.size == 1 when one person is inside the room.
      // socket.join(data.roomName);
      socket.emit("permission", data);
    } 
    console.log(rooms);
  });

  socket.on("start", function (data) {
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(data.roomName);
    let user = rooms.get(data.userName);
    //room.size == 1 when one person is inside the room.
    socket.join(data.roomName);
    socket.emit("joined");
    console.log(rooms);
  });

  //Triggered when the person who joined the room is ready to communicate.
  socket.on("ready", function (roomName) {
    socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
  });

  //Triggered when server gets an icecandidate from a peer in the room.

  socket.on("candidate", function (candidate, roomName) {
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
  });

  //Triggered when server gets an offer from a peer in the room.

  socket.on("offer", function (offer, roomName) {
    socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
  });

  //Triggered when server gets an answer from a peer in the room.

  socket.on("answer", function (answer, roomName) {
    socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
  });
});
