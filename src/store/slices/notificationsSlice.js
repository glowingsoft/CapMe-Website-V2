import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },

  reducers: {
    addNotification: (state, action) => {
      state.items.unshift({ ...action.payload, id: Date.now(), read: false });
      state.unreadCount += 1;
    },

    markAllAsRead: (state) => {
      state.items.forEach((n) => { n.read = true; });
      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead, clearNotifications } = notificationsSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationsSlice.reducer;
