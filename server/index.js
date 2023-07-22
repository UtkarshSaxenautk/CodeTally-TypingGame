// server.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// Store connected clients and their selected difficulty levels
const rooms = new Map();

const ROOM_LIMIT_PER_DIFFICULTY = 1000;

function generateUniqueRoomId() {
  let roomId;
  do {
    roomId = Math.random().toString(36).substr(2, 5);
  } while (rooms.has(roomId));

  return roomId;
}

io.on('connection', (socket) => {
  console.log('New client connected: ', socket.id);

  socket.on('get-rooms', ({ difficulty }) => {
    // Send the list of rooms for the selected difficulty to the client
    const roomList = Array.from(rooms.values()).filter((room) => room.difficulty === difficulty);
    socket.emit('room-list', { rooms: roomList });
  });

  socket.on('create-room', ({ difficulty, username }) => {
    // Check if the username already exists in the same room
    const currentRoom = [...rooms.values()].find(
      (room) => room.players.some((player) => player.username === username)
    );

    if (currentRoom) {
      // Notify the client that the username already exists in the room
      socket.emit('room-joined', { roomId: currentRoom.roomId, usernameExists: true });
    } else {
      // Create a new room with the selected difficulty and the username
      if (rooms.size > ROOM_LIMIT_PER_DIFFICULTY) {
        const roomId = "no";
         socket.emit('room-created', {roomId});
      }
      const roomId = generateUniqueRoomId();
      const newRoom = {
        roomId,
        difficulty,
        players: [{ clientId: socket.id, username }],
        gameStarted: false,
        votes: [],
        startTime: null,
        scoreboard: [],
        index: getRandomNumber(),
      };
      rooms.set(roomId, newRoom);

      // Notify the client about the created room and its ID
      socket.emit('room-created', { roomId });
      // Emit the updated room data to the client who just joined the room
      socket.emit('room-data', currentRoom); // Add this line to emit room data

      // Broadcast the updated room list to all clients
      const roomList = Array.from(rooms.values()).filter((room) => room.difficulty === difficulty);
      console.log(roomList);
      io.emit('room-list', { rooms: roomList });
    }
  });

  socket.on('get-room-data', ({ roomId }) => {
    const currentRoom = rooms.get(roomId);
    socket.emit('room-data', currentRoom);
  });

  socket.on('join-room', ({ roomId, username }) => {
    // Check if the room exists
    const currentRoom = rooms.get(roomId);

    if (!currentRoom) {
      // If the room does not exist, notify the client that the room is invalid
      socket.emit('room-joined', { roomId, usernameExists: false, invalidRoom: true });
    } else if (currentRoom.players.some((player) => player.username === username)) {
      // If the username already exists in the room, notify the client
      socket.emit('room-joined', { roomId, usernameExists: true, invalidRoom: false });
    } else if (currentRoom.players.length < 4) {
      // If the room exists and the username is not taken, join the room
      currentRoom.players.push({ clientId: socket.id, username });

      // Notify the client that they have successfully joined the room
      socket.emit('room-joined', { roomId, usernameExists: false, invalidRoom: false });

      // Broadcast the updated room list to all clients
      const roomList = Array.from(rooms.values()).filter((room) => room.difficulty === currentRoom.difficulty);
      io.emit('room-list', { rooms: roomList });

      // Emit the updated room data to the client who just joined the room
      socket.emit('room-data', currentRoom); // Add this line to emit room data
      //io.sockets.in('user1@example.com').emit('new_msg', {msg: 'hello'});
    }
  });

  socket.on('vote-start-game', ({ roomId, username }) => {
    const currentRoom = rooms.get(roomId);
    if (currentRoom) {
      // Check if the player already voted
      if (!currentRoom.votes.includes(username)) {
        currentRoom.votes.push(username);
        io.to(roomId).emit('update-votes', { votes: currentRoom.votes });
      }
    }
  });

  // Handle user score updates
  socket.on('update-score', ({ roomId,
          username,
          clientId,
          wpm,
          accuracy,
          percentageCompleted, }) => {
    const currentRoom = rooms.get(roomId);
const score = wpm;

if (currentRoom) {
  // Check if the user's entry exists in the scoreboard
  const userEntryIndex = currentRoom.scoreboard.findIndex((entry) => entry.username === username && entry.roomId === roomId);

  if (userEntryIndex === -1) {
    // If the user's entry doesn't exist, push a new entry to the scoreboard
    currentRoom.scoreboard.push({
      username: username,
      score: score,
      roomId: roomId,
    });
  } else {
    // If the user's entry exists, update the score
    currentRoom.scoreboard[userEntryIndex].score = score;
  }

  // Sort the scoreboard based on score in descending order
  currentRoom.scoreboard.sort((a, b) => b.score - a.score);
  console.log(currentRoom.scoreboard);

  // Emit the updated scoreboard to all clients in the room
  socket.emit('scoreboard-update', { scoreboard: currentRoom.scoreboard });
     console.log("send score")
    }
  });

  // Handle user progress updates
  socket.on('user-progress', ({ roomId, clientId, userInput }) => {
    const currentRoom = rooms.get(roomId);
    if (currentRoom && currentRoom.gameStarted) {
      // Update user's input progress in the room
      const updatedPlayers = currentRoom.players.map((player) =>
        player.clientId === clientId ? { ...player, userInput } : player
      );
      currentRoom.players = updatedPlayers;

      // Emit the updated player list to all clients in the room
      io.to(roomId).emit('players-update', { players: currentRoom.players });
    }
  });

  // Handle game start
  socket.on('start-game', ({ roomId }) => {
    const currentRoom = rooms.get(roomId);
    if (currentRoom) {
      currentRoom.gameStarted = true;
      currentRoom.startTime = Date.now();

      // Emit game start event to all clients in the room
      io.to(roomId).emit('game-start', { startTime: currentRoom.startTime });
    }
  });

  socket.on('disconnect', () => {
    // Check if the disconnected client is in any room
    rooms.forEach((room, roomId) => {
      const { players } = room;
      const index = players.findIndex((player) => player.clientId === socket.id);
      if (index !== -1) {
        players.splice(index, 1);

        // Broadcast the updated room list to all clients
        const roomList = Array.from(rooms.values()).filter((room) => room.difficulty === room.difficulty);
        io.emit('room-list', { rooms: roomList });
      }
    });
  });
});

function getRandomNumber() {
  // Generate a random decimal number between 0 (inclusive) and 1 (exclusive)
  const randomDecimal = Math.random();

  // Multiply the random decimal number by 5 to get a number between 0 (inclusive) and 5 (exclusive)
  const randomBetween0And5 = randomDecimal * 5;

  // Take the floor of the result to get an integer between 0 and 4 (both inclusive)
  const randomNumber = Math.floor(randomBetween0And5);

  return randomNumber;
}

function generateUniqueRoomId() {
  // Generate a random string of characters
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const roomIdLength = 5;
  let roomId = '';

  for (let i = 0; i < roomIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomId += characters.charAt(randomIndex);
  }

  return roomId;
}


const port = 5000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
