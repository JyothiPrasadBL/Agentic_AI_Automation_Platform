const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { clientUrl, jwtSecret } = require('./env');

let io;
function initializeSocket(server) {
  io = new Server(server, { cors: { origin: clientUrl, credentials: true } });
  io.use((socket, next) => { try { const token = socket.handshake.auth?.token; if (!token) return next(new Error('Authentication required.')); socket.user = jwt.verify(token, jwtSecret); return next(); } catch { return next(new Error('Invalid token.')); } });
  io.on('connection', (socket) => socket.join(`user:${socket.user.sub}`));
  return io;
}
function emitToUser(ownerId, event, payload) { if (io) io.to(`user:${ownerId}`).emit(event, payload); }
module.exports = { initializeSocket, emitToUser };
