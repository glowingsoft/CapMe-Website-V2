import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['room', 'pinnedMessages', 'comments'],

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

    getHomeRooms: builder.query({
      query: ({ page = 1, limit = 10, type = 'all', group } = {}) => ({
        url: `${API_ROUTES.ROOM_HOME_API}${buildQueryString({ page, limit, type, ...(group ? { group } : {}) })}`,
        method: 'GET',
      }),
      providesTags: ['room'],
    }),

    getRoomMessages: builder.query({
      query: ({ roomId, page = 1, limit = 20 } = {}) => ({
        url: `${API_ROUTES.ROOM_MESSAGES(roomId)}${buildQueryString({ page, limit })}`,
        method: 'GET',
      }),
    }),

    getRoomPinnedMessages: builder.query({
      query: ({ roomId } = {}) => ({
        url: `${API_ROUTES.ROOM_MESSAGES(roomId)}${buildQueryString({ is_pin: true, limit: 50 })}`,
        method: 'GET',
      }),
      providesTags: ['pinnedMessages'],
      transformResponse: (res) =>
        (res?.body?.messages ?? [])
          .filter((msg) => msg.is_pin)
          .map((msg) => ({
            id: msg._id,
            user: {
              name: msg.sendername ?? msg.sender?.name ?? 'Unknown',
              avatar: msg.senderImage ?? msg.sender?.image ?? '',
            },
            content: msg.content ?? '',
            isPinned: true,
            createdAt: msg.createdAt ?? null,
            time: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            stats: {
              likes: msg.likeCount ?? 0,
              comments: msg.commentCount ?? 0,
              shares: msg.shareCount ?? 0,
            },
          })),
    }),

    getRoomTags: builder.query({
      query: ({ roomId, page = 1, limit = 10 } = {}) => ({
        url: `${API_ROUTES.ROOM_TAGS(roomId)}${buildQueryString({ page, limit })}`,
        method: 'GET',
      }),
      transformResponse: (res) => (res?.body?.data ?? []).map((item) => item.tag),
    }),

    getMessagesByTag: builder.query({
      query: ({ tag, roomId, pageno = 1, limit = 10 } = {}) => ({
        url: `${API_ROUTES.MESSAGE_TAGS}${buildQueryString({ tag, ...(roomId ? { roomId } : {}), pageno, limit })}`,
        method: 'GET',
      }),
      transformResponse: (res) => ({
        messages: (res?.body?.messages ?? []).map((msg) => ({
          ...msg,
          id: msg._id,
          user: {
            name: msg.sendername,
            avatar: msg.senderImage,
            id: msg.senderId,
          },
          time: msg.createdAt
            ? new Date(msg.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          stats: {
            likes: msg.likeCount ?? 0,
            comments: msg.commentCount ?? 0,
            shares: msg.shareCount ?? 0,
          },
        })),
        tag: res?.body?.tag ?? '',
        totalMessages: res?.body?.totalMessages ?? 0,
        totalPages: res?.body?.totalPages ?? 1,
        currentPage: res?.body?.currentPage ?? 1,
      }),
    }),

    // GET /message/getcomments?messageId=:id&page=1&limit=10
    getComments: builder.query({
      query: ({ messageId, page = 1, limit = 10 } = {}) => ({
        url: `${API_ROUTES.MESSAGE_COMMENTS}${buildQueryString({ messageId, page, limit })}`,
        method: 'GET',
      }),
      providesTags: (result, error, { messageId }) => [{ type: 'comments', id: messageId }],
      transformResponse: (res) => ({
        comments: (res?.body?.comments ?? []).map((c) => ({
          id: c._id,
          user: c.sender?.name ?? c.sendername ?? 'Unknown',
          avatar: c.sender?.image ?? c.senderImage ?? '',
          text: c.content ?? '',
          likes: c.likesCount ?? c.likeCount ?? 0,
          isLiked: false,
          replies: c.replyCount ?? 0,
          attachments: c.attachments ?? [],
          time: c.createdAt
            ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        })),
        totalComments: res?.body?.totalComments ?? res?.body?.total ?? 0,
        totalPages: res?.body?.totalPages ?? 1,
        currentPage: res?.body?.currentPage ?? 1,
      }),
    }),

    // POST /message/:messageId/like
    likeMessage: builder.mutation({
      query: (messageId) => ({
        url: API_ROUTES.MESSAGE_LIKE(messageId),
        method: 'POST',
      }),
    }),

    // PUT /message/:messageId/share
    shareMessage: builder.mutation({
      query: (messageId) => ({
        url: API_ROUTES.MESSAGE_SHARE(messageId),
        method: 'PUT',
      }),
    }),

    // PUT /message/:messageId/pin
    pinMessage: builder.mutation({
      query: ({ messageId, is_pin }) => ({
        url: API_ROUTES.MESSAGE_PIN(messageId),
        method: 'PUT',
        body: { is_pin },
      }),
      invalidatesTags: ['pinnedMessages'],
    }),

    // PUT /message/:messageId/edit
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: API_ROUTES.MESSAGE_EDIT(messageId),
        method: 'PUT',
        body: { content },
      }),
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
  useGetHomeRoomsQuery,
  useGetRoomMessagesQuery,
  useGetRoomPinnedMessagesQuery,
  useGetRoomTagsQuery,
  useGetMessagesByTagQuery,
  useGetCommentsQuery,
  useLikeMessageMutation,
  useShareMessageMutation,
  usePinMessageMutation,
  useEditMessageMutation,
  useFollowRoomMutation,
  useUnfollowRoomMutation,
} = roomsApi;
