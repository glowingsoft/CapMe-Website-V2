import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['room'],

  endpoints: (builder) => ({
    // GET /rooms  — explore list with filters
    getExploreRooms: builder.query({
      query: ({ search, tab, date, memberCount, contentType, page = 1, limit = 20 } = {}) => {
        const params = { page, limit };
        if (search)      params.search      = search;
        if (tab && tab !== 'all') params.tab = tab;
        if (date)        params.date        = date;
        if (memberCount) params.memberCount = memberCount;
        if (contentType) params.contentType = contentType;
        return { url: API_ROUTES.ROOMS, method: 'GET', params };
      },
      transformResponse: (res) => ({
        data: res.data ?? [],
        meta: res.meta ?? {},
      }),
      providesTags: ['room'],
    }),

    // POST /rooms/:id/follow
    followRoom: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.ROOMS_FOLLOW(id),
        method: 'POST',
      }),
      invalidatesTags: ['room'],
    }),

    // DELETE /rooms/:id/follow
    unfollowRoom: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.ROOMS_UNFOLLOW(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['room'],
    }),
  }),
});

export const {
  useGetExploreRoomsQuery,
  useFollowRoomMutation,
  useUnfollowRoomMutation,
} = roomsApi;
