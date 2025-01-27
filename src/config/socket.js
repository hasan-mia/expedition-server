const http = require('http');
const socketIO = require('socket.io');

let io;

const userRooms = {};

const connectSocket = (app) => {
  const server = http.createServer(app);
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    // Join room
    socket.on("joinRoom", async (roomId) => {
      if (!roomId) {
        console.error(`Invalid room ID from ${socket.id}`);
        return;
      }

      const rooms = Array.from(socket.rooms);
      console.log(`Socket ${socket.id} is in rooms:`, rooms);

      socket.join(roomId.toString());

      userRooms[socket.id] = roomId.toString();

      const sockets = await io.in(roomId.toString()).allSockets();
      console.log(`Sockets in room ${roomId}:`, Array.from(sockets));

    });

    socket.on('disconnect', () => {
      const roomId = userRooms[socket.id];
      if (roomId) {
        socket.leave(roomId);
        delete userRooms[socket.id];
        console.log(`Client ${socket.id} left meeting room ${roomId}`);
      }
    });
  });

  return server;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { connectSocket, getIO };