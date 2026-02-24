import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      transports: ['polling'],
      withCredentials: true
    });
  }
  return socket;
}
