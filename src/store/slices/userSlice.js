import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null },

  reducers: {
    setUser: (state, action) => {
      const user = { ...action.payload };
      user.displayName = user?.basicInfo?.name ?? user?.name ?? user?.displayName ?? '';
      user.photoURL = user?.photoURL ?? user?.image ?? user?.basicInfo?.image ?? null;
      state.user = user;
    },

    setToken: (state, action) => {
      state.device_id = action.payload;
    },

    updateSubscriptionTokens: (state, action) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        subscription: {
          ...state.user.subscription,
          tokens: action.payload,
        },
      };
    },

    updateSubscription: (state, action) => {
      if (!state.user) return;
      state.user.is_active_subscription = action.payload.is_active_subscription ?? false;
      state.user.is_friendly_subscription = action.payload.is_friendly_subscription ?? false;
      if (action.payload.subscription) {
        state.user.subscription = { ...state.user.subscription, ...action.payload.subscription };
      }
      if (action.payload.tokens != null) {
        state.user.subscription = { ...state.user.subscription, tokens: action.payload.tokens };
      }
    },

    logout: (state) => {
      console.log('userSlice - Logging out');
      state.user = null;
    },
  },
});

// Exporting actions
export const { setUser, setToken, logout, updateSubscriptionTokens, updateSubscription } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.device_id;

// Exporting the reducer
export default userSlice.reducer;

// // redux/userSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const userSlice = createSlice({
//   name: 'user', // The name of the slice
//   initialState: { user: null }, // The initial state of the slice

//   reducers: {
//     setUser: (state, action) => {
//       const user = { ...action.payload };
//       console.log('userSlice', user);
//       user.displayName = `${user?.basicInfo?.name}`
//       state.user = user;
//     },

//     // Action to set the user in the state
//     logout: (state) => {
//       localStorage.clear();
//       state.user = null
//     },
//     // Action to clear the user from the state
//   },
// });

// // Exporting actions
// export const { setUser, logout } = userSlice.actions;
// export const selectUser = (state) => state.user.user;
// // Exporting the reducer
// export default userSlice.reducer;
