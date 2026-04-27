import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { handleApiError } from './handleApiError';
import { logout } from './slices/userSlice';

export const createCustomFetchBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state?.user?.user?.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  return async (arg, api, extraOptions) => {
    const result = await baseQuery(arg, api, extraOptions);

    if (result.error) {
      const message = handleApiError(result.error);
      console.error('API Error:', message);

      const { status } = result.error;

      // Handle unauthorized access (token expired / invalid)
      if (status === 401) {
        const isBrowser = typeof window !== 'undefined';
        const isOnLoginPage =
          isBrowser &&
          (window.location.pathname === '/' ||
            window.location.pathname === '/auth/jwt/sign-in');

        if (!isOnLoginPage) {
          api.dispatch(logout());

          if (isBrowser) {
            window.location.replace('/');
          }
        }
      }
    }

    return result;
  };
};

// // import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // export const createCustomFetchBaseQuery = () => fetchBaseQuery({
// //   baseUrl: import.meta.env.VITE_BASE_URL,
// //   prepareHeaders: (headers, { getState }) => {
// //     const user = getState()?.user?.user;
// //     const token = user ? user.accesstoken : '';

// //     if (token) {
// //       headers.set('authorization', `Bearer ${token}`);
// //     }

// //     return headers;
// //   },
// // });

// import { fetchBaseQuery } from '@reduxjs/toolkit/query';
// import { handleApiError } from './handleApiError';
// // import { resetStore } from './store';
// import { logout } from './slices/userSlice';

// export const createCustomFetchBaseQuery = () => {
//   const baseQuery = fetchBaseQuery({
//     baseUrl: import.meta.env.VITE_BASE_URL,
//     prepareHeaders: (headers, { getState }) => {
//       const state = getState();
//       const token = state?.user?.user?.token;

//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   });

//   return async (arg, api, extraOptions) => {
//     const result = await baseQuery(arg, api, extraOptions);

//     if (result.error) {
//       const message = handleApiError(result.error);
//       console.log(message);

//       const { status } = result.error;

//       // Handle unauthorized access (token expired / invalid)
//       if (status === 401) {
//         const isBrowser = typeof window !== 'undefined';
//         const isOnLoginPage = isBrowser && (window.location.pathname === '/' || window.location.pathname === '/auth/jwt/sign-in');

//         if (!isOnLoginPage) {
//           api.dispatch(logout());
//           // api.dispatch(resetStore());

//           if (isBrowser) {
//             window.location.replace('/');
//           }
//         }
//       }
//     }

//     return result;
//   };
// };
