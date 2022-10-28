import express from 'express';
import { Server } from 'socket.io';

const port = process.env.PORT || 5000;
/* Express app */
const app = express();

const server = app.listen(port, () => console.log(`Server running on port ${port}`));
/* Socket.io server */
const io = new Server(server, { cors: '*' });

io.on('connection', socket => {
  // Join user to game room on connection
  const gameRoom = io.sockets.adapter.rooms.get(socket.request._query.roomId);
  if (!gameRoom) {
    socket.join(socket.request._query.roomId);
    socket.emit('waiting-opponent', true);
  } else if (gameRoom.size === 1) {
    socket.join(socket.request._query.roomId);
    const playerWithTurn = [...gameRoom][Math.floor(Math.random() * gameRoom.size)];
    io.to(socket.request._query.roomId).emit('set-turn', playerWithTurn);
  } else {
    socket.emit('error', 'Cannot join. 2 users playing in the room');
  }

  // Listen to user moves
  socket.on('move', arg => {
    io.to(socket.request._query.roomId).emit('notify-move', socket.id);
  });
});
