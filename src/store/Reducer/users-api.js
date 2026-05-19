import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const usersApi = createApi({
  reducerPath: 'users',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['users', 'Users'],
  endpoints: (builder) => ({
    getAllUsersList: builder.query({
      query: ({ page, keyword, status, date }) => {
        let url = `admin/users?pageno=${page}`;
        if (keyword) url += `&search=${keyword}`;
        if (status) url += `&status=${status}`;
        if (date) url += `&date=${date}`;
        return { url, method: 'GET' };
      },
      transformResponse: (res) => res,
      providesTags: ['users'],
    }),

    updateUserStatus: builder.mutation({
      query: (_id) => ({ url: `/admin/user/status/${_id}`, method: 'PUT' }),
      invalidatesTags: ['users'],
    }),

    updateChatbotStatus: builder.mutation({
      query: (_id) => ({ url: `/admin/user/chatbot-status/${_id}`, method: 'PUT' }),
      invalidatesTags: ['users'],
    }),

    updateFriendlySubscription: builder.mutation({
      query: (_id) => ({ url: `/admin/user/friendly-subscription/${_id}`, method: 'PUT' }),
      invalidatesTags: ['users'],
    }),

    getUserById: builder.query({
      query: (id) => `admin/user/${id}`,
      transformResponse: (res) => res.body,
      providesTags: ['Users'],
    }),

    getUserRooms: builder.query({
      query: ({ id, page, limit }) => `admin/user/room/${id}?pageno=${page}&limit=${limit}`,
      transformResponse: (res) => res,
      providesTags: ['Users'],
    }),

    getUserMedia: builder.query({
      query: ({ id, pageno, limit, type }) =>
        `admin/user/media/${id}?pageno=${pageno}&limit=${limit}&type=${type}`,
      transformResponse: (res) => res,
      providesTags: ['Users'],
    }),

    getGptProfileSummary: builder.query({
      query: ({ id }) => `admin/user/gpt-profile-summary/${id}`,
      transformResponse: (res) => res.body,
      providesTags: ['Users'],
    }),

    getUserAIRequests: builder.query({
      query: ({ id, period, start_date, end_date }) =>
        `admin/user/ai-usage/${id}?period=${period || ''}&start_date=${start_date || ''}&end_date=${end_date || ''}`,
      transformResponse: (res) => res.body,
      providesTags: ['Users'],
    }),

    getKnowledgeGraphData: builder.query({
      query: ({ userId }) => `auth/user/knowledge-graph?userId=${userId}`,
      transformResponse: (res) => res?.body,
      providesTags: ['Users'],
    }),

    getknowledgeGraphVisuals: builder.query({
      query: ({ userId }) => `knowledge-graph/graph-visuals?userId=${userId}`,
      transformResponse: (res) => res,
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useGetAllUsersListQuery,
  useUpdateUserStatusMutation,
  useGetUserByIdQuery,
  useLazyGetUserRoomsQuery,
  useGetUserMediaQuery,
  useGetUserRoomsQuery,
  useUpdateChatbotStatusMutation,
  useLazyGetGptProfileSummaryQuery,
  useLazyGetUserByIdQuery,
  useUpdateFriendlySubscriptionMutation,
  useGetUserAIRequestsQuery,
  useGetKnowledgeGraphDataQuery,
  useGetknowledgeGraphVisualsQuery,
} = usersApi;
