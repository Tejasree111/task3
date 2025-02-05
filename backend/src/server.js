/*const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./v1/routes'); // Import routes from v1
const fileUpload = require('express-fileupload'); 
const { decryptMiddleware, encryptMiddleware } = require('./../src/middleware/cryptoMiddleware');
const { limit } = require('./mysql/connection');
require('./v1/tasks/backgroundTasks');

const server = express();


server.use(cors());
server.use(bodyParser.json());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150, // Limit each IP to 150 requests per `windowMs`
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});

server.use('/api/v1',limiter);


server.use(decryptMiddleware);
// Mount routes under '/api/v1'
server.use('/api/v1', routes);
// Encrypt all outgoing responses
server.use(encryptMiddleware);

// Global Error Handler
server.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./v1/routes');
const setupSwagger = require("./swagger");


const { decryptMiddleware, encryptMiddleware } = require('./../src/middleware/cryptoMiddleware');

const http = require('http');
const socketIo = require('socket.io');  // Import Socket.IO
// Store user socket connections
let userSockets = {};
const roomUsers = {}; // Store room users

const app = express();
setupSwagger(app);
const server = http.createServer(app);
// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all origins
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ["websocket"],  // Force WebSocket only (disable polling)
  allowEIO3: true
});
const corsOptions = {
  origin: 'http://localhost:4200',  // Update this with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow cookies/authorization headers
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
require('./v1/tasks/backgroundTasks')(io,userSockets);
// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 150,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/v1', limiter);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
    console.log("UserSockets: ", userSockets);
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  // Handle private messages
  /*
  socket.on('privateMessage', ({ senderId, receiverId, message }) => {
    const receiverSocketId = userSockets[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('privateMessage', { senderId, message });
    }
  });*/

  // Handle group messages
  /*
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on('groupMessage', ({ room, senderId, message }) => {
    socket.broadcast.to(room).emit('groupMessage', { senderId, message });
  });*/

// Join room
socket.on("joinRoom", ({ userId, room }) => {
  socket.join(room);
  if (!roomUsers[room]) roomUsers[room] = [];
  if (!roomUsers[room].includes(userId)) roomUsers[room].push(userId);
  
  console.log(`User ${userId} joined room: ${room}`);
  io.to(room).emit("roomUpdate", roomUsers[room]); // Notify all users in room
});

// Leave room
socket.on("leaveRoom", ({ userId, room }) => {
  socket.leave(room);
  if (roomUsers[room]) {
    roomUsers[room] = roomUsers[room].filter((id) => id !== userId);
    if (roomUsers[room].length === 0) delete roomUsers[room]; // Remove empty rooms
  }

  console.log(`User ${userId} left room: ${room}`);
  io.to(room).emit("roomUpdate", roomUsers[room]); // Notify all users in room
});

// Send group message
socket.on("groupMessage", ({ room, senderId, message }) => {
  if (!roomUsers[room] || !roomUsers[room].includes(senderId)) {
    socket.emit("error", "You must join the room before sending messages.");
    return;
  }
  socket.broadcast.to(room).emit("groupMessage", { senderId, message });
});

// Handle disconnect
socket.on("disconnect", () => {
  for (const room in roomUsers) {
    roomUsers[room] = roomUsers[room].filter((id) => userSockets[id] !== socket.id);
    if (roomUsers[room].length === 0) delete roomUsers[room];
  }
  console.log(`User disconnected: ${socket.id}`);
});
});




  // Acknowledge message delivery not necessaryyyyyy
  /*
  socket.on('messageDelivered', ({ messageId, receiverId }) => {
    const receiverSocketId = userSockets[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messageDelivered', { messageId });
    }
  });*/
/*
  socket.on('disconnect', () => {
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} disconnected`);
      }
    }
  });
});*/

app.use(decryptMiddleware);
app.use('/api/v1', routes);
app.use(encryptMiddleware);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});


