import { io } from 'socket.io-client';

let socket;
export function getSocket(token) {
  if (!socket && token) socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', { auth: { token } });
  return socket;
}
export function disconnectSocket() { socket?.disconnect(); socket = null; }
