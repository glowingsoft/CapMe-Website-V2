import { getSocket } from './socket';

const emitWithLog = (eventName, payload) => {
  console.log(`[Socket] Emit ${eventName}`, payload);
  getSocket()?.emit(eventName, payload);
};

export const chatSocketService = {
  joinRoom: (roomId) => {
    emitWithLog('joinRoom', { roomId });
  },

  leaveRoom: (roomId) => {
    emitWithLog('leaveRoom', { roomId });
  },

  sendMessage: ({ roomId, content, attachments = [], meta = {} }) => {
    emitWithLog('chatMessage', { roomId, content, attachments, meta });
  },

  addComment: ({ messageId, content, attachments = [], meta = {} }) => {
    emitWithLog('addComment', { messageId, content, attachments, meta });
  },

  deleteMessage: ({ messageId, roomId }) => {
    emitWithLog('deleteMessage', { messageId, roomId });
  },

  clearChat: (roomId) => {
    emitWithLog('clearChat', { roomId });
  },

  deleteComment: ({ commentId }) => {
    emitWithLog('deleteComment', { commentId });
  },

  editMessage: ({ messageId, content, roomId, meta = {} }) => {
    emitWithLog('editMessage', { messageId, content, roomId, meta });
  },

  likeMessage: ({ messageId }) => {
    emitWithLog('likeMessage', { messageId });
  },

  pinMessage: ({ messageId, is_pin }) => {
    emitWithLog('pinMessage', { messageId, is_pin });
  },
};
