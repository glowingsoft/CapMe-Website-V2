import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function normalizeRoom(r) {
  return {
    _id: r._id ?? r.id ?? '',
    id: r._id ?? r.id ?? '',
    name: r.name ?? '',
    description: r.description ?? '',
    image: r.image ?? r.icon ?? r.photo ?? '',
    visibility: r.visibility ?? 'public',
    memberCount: r.memberCount ?? r.membersCount ?? 0,
    tags: Array.isArray(r.tags) ? r.tags : [],
    isFollowing: r.follow ?? r.isFollowing ?? r.is_following ?? false,
    isPending: r.isRequest ?? r.isPending ?? r.is_pending ?? false,
    permission: r.permission ?? 'view',
    createdAt: r.createdAt ?? '',
  };
}

export const exploreApi = createApi({
  reducerPath: 'exploreApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['exploreRooms'],

  endpoints: (builder) => ({
    // GET /room/exploreroom?type=all&page=1&limit=10
    getExploreRoomList: builder.query({
      query: ({ type = 'all', search = '', page = 1, limit = 10, dateCreated, memberCount, contentFocus } = {}) => ({
        url: `${API_ROUTES.ROOM_EXPLORE_LIST}${buildQueryString({
          type,
          ...(search ? { search } : {}),
          page,
          limit,
          ...(dateCreated ? { dateCreated } : {}),
          ...(memberCount ? { memberCount } : {}),
          ...(contentFocus ? { contentFocus } : {}),
        })}`,
        method: 'GET',
      }),
      transformResponse: (res) => ({
        rooms: (res?.body?.rooms ?? res?.body?.data ?? res?.rooms ?? res?.data ?? []).map(normalizeRoom),
        totalPages: res?.body?.totalPages ?? res?.totalPages ?? 1,
        total: res?.body?.total ?? res?.total ?? 0,
      }),
      providesTags: ['exploreRooms'],
    }),
  }),
});

export const { useLazyGetExploreRoomListQuery } = exploreApi;
