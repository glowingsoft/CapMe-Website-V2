import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from "../baseQuery";

const ADMIN_ACCESS_TOKEN = import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['profile'],
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (login) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: "POST",
        body: login,
      }),
    }),

    adminLogin: builder.mutation({
      query: (login) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: "POST",
        body: login,
        headers: {
          'x-admin-access-token': ADMIN_ACCESS_TOKEN,
        },
      }),
    }),

    userProfile: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.USER_PROFILE,
        method: 'GET',
      }),
      providesTags: ['profile'],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.UPDATE_PROFILE,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['profile'],
    }),

    uploadFile: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: API_ROUTES.FILE_UPLOAD,
          method: 'POST',
          body: formData,
        };
      },
    }),

    otherUserProfile: builder.query({
      query: ({ userId } = {}) => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);

        return {
          url: `${API_ROUTES.AUTH.OTHER_USER_PROFILE}?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

    otherUserRooms: builder.query({
      query: ({ userId, type = 'created', pageno = 1 } = {}) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (pageno) params.append('pageno', pageno);

        return {
          url: `${API_ROUTES.AUTH.OTHER_USER_ROOMS}/${userId}?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

    followUnfollowUser: builder.mutation({
      query: ({ userId }) => ({
        url: API_ROUTES.AUTH.FOLLOW_UNFOLLOW,
        method: 'POST',
        body: { userId },
      }),
    }),

    connections: builder.query({
      query: ({ type = 'followings', page = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (page) params.append('page', page);
        if (search) params.append('search', search);
        
        return {
          url: `${API_ROUTES.AUTH.CONNECTIONS}?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
  })
});

export const {
  useLoginMutation,
  useAdminLoginMutation,
  useUserProfileQuery,
  useUpdateProfileMutation,
  useUploadFileMutation,
  useOtherUserProfileQuery,
  useOtherUserRoomsQuery,
  useFollowUnfollowUserMutation,
  useConnectionsQuery,
} = authApi;
