import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

const cleanAvatar = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('noImg')) return '';
  return url;
};

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

function normalizeTagList(res) {
  const raw = res?.body?.data ?? res?.body?.tags ?? res?.body ?? res?.data ?? res?.tags ?? res ?? [];
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item) => item?.tag ?? item?.name ?? item?.title ?? item?.value ?? item?._id ?? item)
    .filter(Boolean)
    .map((tag) => String(tag).replace(/^#+/, ''));
}

export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['room', 'pinnedMessages', 'comments', 'roomRequests'],

  endpoints: (builder) => ({
    // GET /rooms  — explore list with filters
    getExploreRooms: builder.query({
      query: ({ search, tab, date, memberCount, contentType, page = 1, limit = 20 } = {}) => {
        const params = { page, limit };
        if (search) params.search = search;
        if (tab && tab !== 'all') params.tab = tab;
        if (date) params.date = date;
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

    getRoomById: builder.query({
      query: (roomId) => ({
        url: API_ROUTES.ROOM_GET(roomId),
        method: 'GET',
      }),
      providesTags: (_result, _error, roomId) => [{ type: 'room', id: roomId }],
      transformResponse: (res) => res?.body ?? res,
    }),

    getHomeRooms: builder.query({
      query: ({ page = 1, limit = 10, type = 'all', group } = {}) => ({
        url: `${API_ROUTES.ROOM_HOME_API}${buildQueryString({ page, limit, type, ...(group ? { group } : {}) })}`,
        method: 'GET',
      }),
      providesTags: ['room'],
    }),

    getRoomMessages: builder.query({
      query: ({ roomId, page = 1, limit = 20, search = '' } = {}) => ({
        url: `${API_ROUTES.ROOM_MESSAGES(roomId)}${buildQueryString({ page, limit, ...(search ? { search } : {}) })}`,
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
            senderImage: msg.senderImage ?? msg.sender?.image ?? '',
            content: msg.content ?? '',
            attachments: (msg.attachments ?? []).map((a) => ({
              url: a.fileUrl ?? a.url ?? '',
              type: a.fileType ?? a.type ?? '',
              name: a.originalFileName ?? a.fileName ?? a.name ?? '',
              size: a.size ?? 0,
            })),
            isPinned: true,
            createdAt: msg.createdAt ?? null,
            time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
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
      transformResponse: normalizeTagList,
    }),

    getPopularTags: builder.query({
      query: ({ search = '' } = {}) => ({
        url: `${API_ROUTES.MESSAGE_POPULAR_TAGS}${buildQueryString({ search })}`,
        method: 'GET',
      }),
      transformResponse: normalizeTagList,
    }),

    getMessagesByTag: builder.query({
      query: ({ tag, roomId, pageno = 1, limit = 10 } = {}) => ({
        url: `${API_ROUTES.MESSAGE_TAGS}${buildQueryString({ tag, ...(roomId ? { roomId } : {}), pageno, limit })}`,
        method: 'GET',
      }),
      transformResponse: (res) => {
        const S3_BASE = 'https://capmes3.s3.us-east-1.amazonaws.com/';
        const cleanUrl = (url) => {
          if (!url) return undefined;
          if (url.toLowerCase().includes('noimg')) return undefined;
          if (url.startsWith(S3_BASE) && url.slice(S3_BASE.length).startsWith('http')) return cleanUrl(url.slice(S3_BASE.length));
          return url;
        };
        const EXT_MIME = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          svg: 'image/svg+xml',
          bmp: 'image/bmp',
          mp4: 'video/mp4',
          webm: 'video/webm',
          mov: 'video/quicktime',
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          ogg: 'audio/ogg',
          m4a: 'audio/mp4',
          pdf: 'application/pdf',
        };
        const resolveType = (rawType, fileName) => {
          if (rawType && rawType.includes('/')) return rawType;
          const t = rawType?.toLowerCase() ?? '';
          const ext = (fileName ?? '').split('.').pop()?.toLowerCase();
          if (ext && EXT_MIME[ext]) return EXT_MIME[ext];
          if (t === 'image') return 'image/jpeg';
          if (t === 'video') return 'video/mp4';
          if (t === 'audio' || t === 'voice') return 'audio/mpeg';
          return rawType ?? '';
        };
        return {
          messages: (res?.body?.messages ?? []).map((msg) => ({
            ...msg,
            id: msg._id,
            user: {
              name: msg.sendername,
              avatar: cleanUrl(msg.senderImage),
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
            attachments: (msg.attachments ?? []).map((a) => ({
              ...a,
              type: resolveType(a.fileType, a.fileName),
              url: a.fileUrl ?? '',
              name: a.originalFileName ?? a.fileName ?? '',
            })),
          })),
          tag: res?.body?.tag ?? '',
          totalMessages: res?.body?.totalMessages ?? 0,
          totalPages: res?.body?.totalPages ?? 1,
          currentPage: res?.body?.currentPage ?? 1,
        };
      },
    }),

    // GET /message/getcomments?messageId=:id&page=1&limit=10
    getComments: builder.query({
      query: ({ messageId, page = 1, limit = 10 } = {}) => ({
        url: `${API_ROUTES.MESSAGE_COMMENTS}${buildQueryString({ messageId, page, limit })}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { messageId }) => [{ type: 'comments', id: messageId }],
      transformResponse: (res) => ({
        comments: (res?.body?.comments ?? []).map((c) => ({
          id: c._id,
          userId: c.sender?._id ?? c.sender?.id ?? c.senderId ?? c.userId ?? '',
          user: c.sender?.name ?? c.sendername ?? 'Unknown',
          avatar: c.sender?.image ?? c.senderImage ?? '',
          text: c.content ?? '',
          likes: c.likesCount ?? c.likeCount ?? 0,
          likedBy: Array.isArray(c.likes) ? c.likes : [],
          isLiked: false,
          replies: c.replyCount ?? 0,
          attachments: c.attachments ?? [],
          meta: c.meta ?? {},
          time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        })),
        totalComments: res?.body?.totalComments ?? res?.body?.total ?? 0,
        totalPages: res?.body?.totalPages ?? 1,
        currentPage: res?.body?.currentPage ?? 1,
      }),
    }),

    // POST /message/:commentId/comment — like/unlike a comment
    likeComment: builder.mutation({
      query: (commentId) => ({
        url: API_ROUTES.COMMENT_LIKE(commentId),
        method: 'POST',
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
    getShareRoomList: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: `${API_ROUTES.ROOM_SHARE_LIST}${buildQueryString({ page, limit, ...(search ? { search } : {}) })}`,
        method: 'GET',
      }),
    }),

    shareMessage: builder.mutation({
      query: ({ messageId, roomId }) => ({
        url: API_ROUTES.MESSAGE_SHARE(messageId),
        method: 'PUT',
        body: { roomId },
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

    // POST /message/meta — fetch URL og/meta preview
    getUrlMeta: builder.mutation({
      query: (url) => ({
        url: API_ROUTES.MESSAGE_META,
        method: 'POST',
        body: { url },
      }),
      transformResponse: (res) => res?.body ?? null,
    }),

    // POST /room/addRoom
    createRoom: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.ROOM_CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['room'],
    }),

    // POST /room/favoriterooms/:id — toggles favourite
    toggleFavouriteRoom: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.ROOM_FAVOURITE(id),
        method: 'POST',
      }),
      invalidatesTags: ['room'],
    }),

    // PUT /room/:id
    updateRoom: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.ROOM_UPDATE(id),
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['room'],
    }),

    // PUT /room/request/update
    updateRoomRequestPermission: builder.mutation({
      query: ({ roomId, userId, permission }) => ({
        url: API_ROUTES.ROOM_REQUEST_UPDATE,
        method: 'PUT',
        body: { roomId, userId, permission },
      }),
      invalidatesTags: (_result, _error, { roomId }) => ['room', { type: 'room', id: roomId }, 'roomRequests'],
    }),

    // DELETE /room/delete
    deleteRoom: builder.mutation({
      query: (roomId) => ({
        url: API_ROUTES.ROOM_DELETE,
        method: 'DELETE',
        body: { roomId },
      }),
      invalidatesTags: ['room'],
    }),

    // DELETE /room/removemember
    removeRoomMember: builder.mutation({
      query: ({ roomId, memberId }) => ({
        url: API_ROUTES.ROOM_REMOVE_MEMBER,
        method: 'DELETE',
        body: { roomId, memberId },
      }),
      invalidatesTags: ['room'],
    }),

    // GET /room/retrivedownloadedfiles?roomId=:id
    getRoomDownloadedFiles: builder.query({
      query: (roomId) => ({
        url: API_ROUTES.ROOM_DOWNLOADED_FILES,
        method: 'GET',
        params: { roomId },
      }),
      transformResponse: (res) => {
        const raw = res?.body?.files ?? res?.body ?? res?.files ?? res ?? [];
        const files = Array.isArray(raw) ? raw : [];
        return files.map((f) => ({
          id: f._id ?? f.id,
          url: f.fileUrl ?? f.url ?? '',
          name: f.fileName ?? f.name ?? '',
          type: f.fileType ?? f.type ?? '',
          size: f.fileSize ?? f.size ?? 0,
          downloadedAt: f.createdAt ?? f.downloadedAt ?? '',
        }));
      },
    }),

    // GET /room/activityfeeds — activity feed (type: all|myrooms|following|me)
    getActivityFeeds: builder.query({
      query: ({ search = '', type = 'all', page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.ROOM_ACTIVITY_FEEDS,
        method: 'GET',
        params: { search, type, page, limit },
      }),
      transformResponse: (res) => {
        const body = res?.body ?? res;
        const raw = Array.isArray(body?.activityFeeds) ? body.activityFeeds : Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];

        const S3_BASE = 'https://capmes3.s3.us-east-1.amazonaws.com/';
        const cleanUrl = (url) => {
          if (!url) return undefined;
          if (url.toLowerCase().includes('noimg')) return undefined;
          // Strip double S3 prefix
          if (url.startsWith(S3_BASE) && url.slice(S3_BASE.length).startsWith('http')) {
            return cleanUrl(url.slice(S3_BASE.length));
          }
          return url;
        };

        const EXT_MIME = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          svg: 'image/svg+xml',
          bmp: 'image/bmp',
          mp4: 'video/mp4',
          webm: 'video/webm',
          mov: 'video/quicktime',
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          ogg: 'audio/ogg',
          m4a: 'audio/mp4',
          pdf: 'application/pdf',
        };
        const resolveType = (rawType, fileName) => {
          if (rawType && rawType.includes('/')) return rawType;
          const t = rawType?.toLowerCase() ?? '';
          const ext = (fileName ?? '').split('.').pop()?.toLowerCase();
          if (ext && EXT_MIME[ext]) return EXT_MIME[ext];
          if (t === 'image') return 'image/jpeg';
          if (t === 'video') return 'video/mp4';
          if (t === 'audio' || t === 'voice') return 'audio/mpeg';
          return rawType ?? '';
        };

        const items = raw.map((item) => ({
          ...item,
          id: item._id,
          user: {
            _id: item.senderId,
            id: item.senderId,
            name: item.sendername ?? '',
            avatar: cleanUrl(item.senderImage),
          },
          time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          attachments: (item.attachments ?? []).map((a) => ({
            ...a,
            type: resolveType(a.fileType, a.fileName),
            url: a.fileUrl ?? '',
            name: a.originalFileName ?? a.fileName ?? '',
          })),
          stats: {
            likes: item.likeCount ?? 0,
            comments: item.commentCount ?? 0,
            shares: item.shareCount ?? 0,
            capme: item.capmeCount ?? 0,
          },
        }));

        const pagination = body?.pagination ?? {};
        return {
          data: items,
          totalPages: pagination.totalPages ?? body?.totalPages ?? 1,
          currentPage: pagination.currentPage ?? body?.currentPage ?? body?.page ?? 1,
          totalCount: pagination.totalItems ?? body?.totalCount ?? body?.total ?? items.length,
        };
      },
    }),

    // GET /room/explore — unified search (type: all|rooms|users|attachment, scope: home|explore)
    searchOverlay: builder.query({
      query: ({ search = '', type = 'all', scope = 'home', page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.ROOM_EXPLORE,
        method: 'GET',
        params: { search, type, scope, page, limit },
      }),
      transformResponse: (res) => {
        const body = res?.body ?? res;
        if (body?.results !== undefined) {
          return {
            results: Array.isArray(body.results) ? body.results : [],
            totalPages: body.totalPages ?? 1,
            currentPage: body.currentPage ?? 1,
            totalCount: body.totalCount ?? 0,
          };
        }
        const items = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
        return { results: items, totalPages: 1, currentPage: 1, totalCount: items.length };
      },
    }),

    // POST /rooms/:id/follow
    followRoom: builder.mutation({
      query: (id) => ({
        url: API_ROUTES.ROOMS_FOLLOW(id),
        method: 'POST',
      }),
      invalidatesTags: ['room'],
    }),

    // POST /room/followAndunfollow  { roomId }
    toggleRoomFollow: builder.mutation({
      query: (roomId) => ({
        url: API_ROUTES.ROOM_FOLLOW_TOGGLE,
        method: 'POST',
        body: { roomId },
      }),
      invalidatesTags: ['room'],
    }),

    // GET /room/requests/:roomId?type=requests|members
    getRoomRequests: builder.query({
      query: ({ roomId, type }) => ({ url: `${API_ROUTES.ROOM_REQUESTS(roomId)}?type=${type}`, method: 'GET' }),
      transformResponse: (res, _meta, { type }) => {
        const raw = res?.body?.requests ?? res?.body?.members ?? res?.body?.data ?? res?.requests ?? res?.members ?? res?.data ?? [];
        return raw.map((r) => {
          const user = typeof r.user === 'object' && r.user !== null ? r.user : null;
          const userIdValue = typeof r.userId === 'object' && r.userId !== null ? r.userId : null;
          const userId =
            user?._id ?? user?.id ?? userIdValue?._id ?? userIdValue?.id ?? (typeof r.user === 'string' ? r.user : null) ?? (typeof r.userId === 'string' ? r.userId : null) ?? '';
          const dateField = r.addedDate ?? r.createdAt ?? r.requestedAt ?? '';
          let timeAgo = '';
          if (dateField) {
            const diff = Math.floor((Date.now() - new Date(dateField)) / 1000);
            if (diff < 60) timeAgo = 'Just now';
            else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)}m ago`;
            else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)}h ago`;
            else timeAgo = `${Math.floor(diff / 86400)}d ago`;
          }
          return {
            id: r._id ?? r.id ?? userId,
            userId,
            name: user?.name ?? userIdValue?.name ?? r.name ?? 'Unknown',
            email: user?.email ?? userIdValue?.email ?? r.email ?? '',
            avatar: cleanAvatar(user?.image ?? user?.avatar ?? userIdValue?.image ?? userIdValue?.avatar ?? r.avatar ?? r.image ?? ''),
            ...(type === 'requests' ? { requestedAt: timeAgo } : {}),
            ...(type === 'members' ? { role: r.permission ?? r.role ?? 'view', joinedAt: timeAgo } : {}),
          };
        });
      },
      providesTags: ['roomRequests'],
    }),

    // GET /room/getmember/:roomId?page=1&limit=10
    getRoomMembers: builder.query({
      query: ({ roomId, page = 1, limit = 10 }) => ({
        url: `${API_ROUTES.ROOM_GET_MEMBERS(roomId)}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      transformResponse: (res) => {
        const raw = res?.body?.members ?? res?.body?.data ?? res?.members ?? res?.data ?? [];
        const total = res?.body?.totalCount ?? res?.body?.total ?? res?.total ?? raw.length;
        const members = raw.map((r) => {
          const user = typeof r.user === 'object' && r.user !== null ? r.user : null;
          const userIdValue = typeof r.userId === 'object' && r.userId !== null ? r.userId : null;
          const userId =
            user?._id ??
            user?.id ??
            userIdValue?._id ??
            userIdValue?.id ??
            (typeof r.user === 'string' ? r.user : null) ??
            (typeof r.userId === 'string' ? r.userId : null) ??
            r.memberId ??
            '';
          const dateField = r.addedDate ?? r.createdAt ?? r.joinedAt ?? '';
          let timeAgo = '';
          if (dateField) {
            const diff = Math.floor((Date.now() - new Date(dateField)) / 1000);
            if (diff < 60) timeAgo = 'Just now';
            else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)}m ago`;
            else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)}h ago`;
            else timeAgo = `${Math.floor(diff / 86400)}d ago`;
          }
          return {
            id: r._id ?? r.id ?? r.memberId ?? userId,
            userId,
            name: user?.name ?? userIdValue?.name ?? r.name ?? 'Unknown',
            email: user?.email ?? userIdValue?.email ?? r.email ?? '',
            avatar: cleanAvatar(user?.image ?? user?.avatar ?? userIdValue?.image ?? userIdValue?.avatar ?? r.avatar ?? r.image ?? ''),
            role: r.permission ?? r.role ?? 'view',
            joinedAt: timeAgo,
          };
        });
        return { members, total };
      },
      providesTags: ['roomMembers'],
    }),

    // POST /room/submitreport
    submitRoomReport: builder.mutation({
      query: ({ roomId, message }) => ({
        url: API_ROUTES.ROOM_SUBMIT_REPORT,
        method: 'POST',
        body: { roomId, message },
      }),
    }),

    // PUT /room/request/cancel/:roomId
    cancelRoomRequest: builder.mutation({
      query: (roomId) => ({
        url: API_ROUTES.ROOM_REQUEST_CANCEL(roomId),
        method: 'PUT',
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

    // GET /room/notifications?page=&limit=
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `${API_ROUTES.ROOM_NOTIFICATIONS}${buildQueryString({ page, limit })}`,
        method: 'GET',
      }),
      transformResponse: (res) => {
        const detectType = (msg = '') => {
          const m = msg.toLowerCase();
          if (m.includes('comment')) return 'comment';
          if (m.includes('liked') || m.includes('like')) return 'like';
          if (m.includes('mention')) return 'mention';
          if (m.includes('following') || m.includes('followed')) return 'follow';
          if (m.includes('added you') || m.includes('invited') || m.includes('joined') || m.includes('room')) return 'room';
          if (m.includes('invite')) return 'invite';
          return 'message';
        };

        const formatTimeAgo = (dateStr) => {
          if (!dateStr) return '';
          const diff = Date.now() - new Date(dateStr).getTime();
          const mins = Math.floor(diff / 60000);
          if (mins < 1) return 'just now';
          if (mins < 60) return `${mins}m ago`;
          const hours = Math.floor(mins / 60);
          if (hours < 24) return `${hours}h ago`;
          const days = Math.floor(hours / 24);
          if (days < 7) return `${days}d ago`;
          return `${Math.floor(days / 7)}w ago`;
        };

        return {
          notifications: (res?.notifications ?? []).map((n) => ({
            id: n._id ?? n.id,
            title: n.message ?? '',
            message: '',
            timeAgo: formatTimeAgo(n.createdAt),
            type: n.type ?? detectType(n.message),
            read: n.isRead ?? n.read ?? false,
            objectId: n.objectId ?? '',
            user: n.sender
              ? {
                  name: n.sender.name ?? '',
                  username: n.sender.username ? `@${n.sender.username}` : '',
                  avatar: n.sender.image ?? n.sender.avatar ?? '',
                }
              : null,
          })),
          totalPages: res?.total_pages ?? 1,
          total: res?.total_count ?? 0,
        };
      },
    }),
  }),
});

export const {
  useGetActivityFeedsQuery,
  useLazyGetActivityFeedsQuery,
  useGetExploreRoomsQuery,
  useGetHomeRoomsQuery,
  useGetRoomByIdQuery,
  useLazyGetRoomByIdQuery,
  useToggleFavouriteRoomMutation,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useUpdateRoomRequestPermissionMutation,
  useDeleteRoomMutation,
  useRemoveRoomMemberMutation,
  useGetRoomDownloadedFilesQuery,
  useGetRoomMessagesQuery,
  useGetRoomPinnedMessagesQuery,
  useGetRoomTagsQuery,
  useGetPopularTagsQuery,
  useGetMessagesByTagQuery,
  useGetCommentsQuery,
  useLikeCommentMutation,
  useLikeMessageMutation,
  useShareMessageMutation,
  usePinMessageMutation,
  useEditMessageMutation,
  useFollowRoomMutation,
  useUnfollowRoomMutation,
  useToggleRoomFollowMutation,
  useCancelRoomRequestMutation,
  useSubmitRoomReportMutation,
  useLazyGetRoomRequestsQuery,
  useGetRoomMembersQuery,
  useLazyGetRoomMembersQuery,
  useGetUrlMetaMutation,
  useLazySearchOverlayQuery,
  useLazyGetNotificationsQuery,
  useLazyGetShareRoomListQuery,
} = roomsApi;
