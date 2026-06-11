import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket = null;
let socketUserId = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (socket?.connected && socketUserId === userId) return socket;

  // Different user or stale socket — always disconnect and reconnect
  if (socket) {
    socket.disconnect();
    socket = null;
    socketUserId = null;
  }

  socketUserId = userId;
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    query: { user_id: userId },
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected — id:', socket.id, '| user_id:', userId);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected — reason:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket] Disconnecting...');
    socket.disconnect();
    socket = null;
    socketUserId = null;
  }
};
