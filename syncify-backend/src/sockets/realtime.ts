import { Server } from 'socket.io';

export function registerRealtimeHandlers(io: Server) {
  io.on('connection', (socket) => {
    socket.on('ping', () => socket.emit('pong'));
  });
}


