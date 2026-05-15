import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

const getHistoryGroup = (dateValue) => {
  if (!dateValue) return 'older';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'older';

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'today';
  if (date >= startOfYesterday) return 'yesterday';
  if (date >= startOfWeek) return 'this_week';
  return 'older';
};

const getHistoryText = (item) => {
  const firstMessage = Array.isArray(item?.messages) ? item.messages[0] : null;
  return item?.title
    ?? item?.text
    ?? item?.prompt
    ?? item?.question
    ?? item?.query
    ?? item?.message
    ?? item?.content
    ?? firstMessage?.content
    ?? firstMessage?.text
    ?? '';
};

const HISTORY_BUCKETS = [
  ['today', 'today'],
  ['yesterday', 'yesterday'],
  ['last7days', 'this_week'],
  ['older', 'older'],
];

const normalizeHistoryItem = (item, group, fallbackId) => ({
  id: item?._id ?? item?.id ?? item?.chatId ?? item?.conversationId ?? fallbackId,
  text: getHistoryText(item) || 'Untitled chat',
  description: item?.description ?? '',
  group,
  createdAt: item?.createdAt ?? item?.updatedAt ?? item?.date ?? item?.timestamp ?? '',
  raw: item,
});

const getMessageText = (message, role) => {
  if (role === 'assistant') {
    return message?.response ?? message?.answer ?? message?.assistant ?? message?.content ?? message?.message ?? message?.text ?? '';
  }
  return message?.query ?? message?.prompt ?? message?.question ?? message?.content ?? message?.message ?? message?.text ?? '';
};

const normalizeChatMessage = (message, index) => {
  const rawRole = String(message?.role ?? message?.sender ?? message?.type ?? '').toLowerCase();
  const role = rawRole.includes('assistant') || rawRole.includes('ai') || message?.response ? 'assistant' : 'user';
  return {
    id: message?._id ?? message?.id ?? `${role}-${index}`,
    role,
    content: getMessageText(message, role),
    createdAt: message?.createdAt ?? message?.updatedAt ?? '',
    raw: message,
  };
};

const normalizeChatTurn = (message, index) => {
  const createdAt = message?.createdAt ?? message?.updatedAt ?? '';
  if (message?.query !== undefined || message?.response !== undefined) {
    return [
      message?.query ? {
        id: `${message?._id ?? message?.id ?? index}-query`,
        role: 'user',
        content: message.query,
        createdAt,
        raw: message,
      } : null,
      message?.response ? {
        id: `${message?._id ?? message?.id ?? index}-response`,
        role: 'assistant',
        content: message.response,
        createdAt,
        raw: message,
      } : null,
    ].filter(Boolean);
  }

  return [normalizeChatMessage(message, index)];
};

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['aiInterests', 'aiSummary', 'aiHistory', 'aiChat'],

  endpoints: (builder) => ({
    getAiInterests: builder.query({
      query: ({ refresh } = {}) => ({
        url: API_ROUTES.AI_INTERESTS,
        method: 'GET',
        ...(refresh ? { params: { refresh: true } } : {}),
      }),
      keepUnusedDataFor: 3600,
      providesTags: ['aiInterests'],
      transformResponse: (res) => {
        const raw = res?.body?.interests?.interests ?? res?.body?.interests ?? res?.interests ?? [];
        const list = Array.isArray(raw) ? raw : [];
        return list.map((it) => ({
          title: it.name ?? '',
          score: it.strength ?? it.modelScore ?? 0,
          confidence: Math.round((it.confidence ?? 0) * 100),
          description: it.reason ?? '',
          tags: it.keywords ?? [],
        }));
      },
    }),

    getAiSummary: builder.query({
      query: ({ refresh } = {}) => ({
        url: API_ROUTES.AI_SUMMARY,
        method: 'GET',
        ...(refresh ? { params: { refresh: true } } : {}),
      }),
      keepUnusedDataFor: 3600,
      providesTags: ['aiSummary'],
      transformResponse: (res) =>
        res?.body?.summary?.overview ?? res?.body?.overview ?? res?.body?.summary ?? res?.overview ?? res?.summary ?? '',
    }),

    getAiHistory: builder.query({
      query: ({ pageno = 1, search = '' } = {}) => ({
        url: API_ROUTES.AI_HISTORY,
        method: 'GET',
        params: { pageno, ...(search ? { search } : {}) },
      }),
      providesTags: ['aiHistory'],
      transformResponse: (res) => {
        const body = res?.body ?? res ?? {};
        const hasGroupedBody = HISTORY_BUCKETS.some(([key]) => body?.[key]?.data);

        if (hasGroupedBody) {
          let maxCurrentPage = 1;
          let maxTotalPages = 1;

          const items = HISTORY_BUCKETS.flatMap(([apiGroup, uiGroup]) => {
            const bucket = body?.[apiGroup] ?? {};
            const list = Array.isArray(bucket.data) ? bucket.data : [];
            const bucketPage = Number(bucket.page ?? 1);
            const bucketTotalPages = Number(bucket.totalPages ?? 1);
            maxCurrentPage = Math.max(maxCurrentPage, bucketPage);
            maxTotalPages = Math.max(maxTotalPages, bucketTotalPages);

            return list.map((item, index) => normalizeHistoryItem(item, uiGroup, `${uiGroup}-${bucketPage}-${index}`));
          });

          return {
            items,
            currentPage: maxCurrentPage,
            totalPages: maxTotalPages,
            hasMore: HISTORY_BUCKETS.some(([apiGroup]) => {
              const bucket = body?.[apiGroup] ?? {};
              return Number(bucket.page ?? 1) < Number(bucket.totalPages ?? 0);
            }),
          };
        }

        const prompts = Array.isArray(body?.prompts) ? body.prompts : [];
        const chats = Array.isArray(body?.chats) ? body.chats : [];
        if (prompts.length || chats.length) {
          const currentPage = Number(body?.currentPage ?? body?.pageno ?? body?.page ?? 1);
          const totalPages = Number(body?.totalPages ?? body?.pages ?? 1);
          const promptItems = prompts.map((item, index) => normalizeHistoryItem(item, 'prompts', `prompt-${currentPage}-${index}`));
          const chatItems = chats.map((item, index) => {
            const createdAt = item?.createdAt ?? item?.updatedAt ?? item?.date ?? item?.timestamp ?? '';
            return normalizeHistoryItem(item, item?.group ?? getHistoryGroup(createdAt), `chat-${currentPage}-${index}`);
          });

          return {
            items: [...promptItems, ...chatItems],
            currentPage,
            totalPages,
            hasMore: Boolean(body?.hasMore ?? (totalPages ? currentPage < totalPages : false)),
          };
        }

        const raw = body?.history
          ?? body?.histories
          ?? body?.chats
          ?? body?.conversations
          ?? body?.data
          ?? body?.results
          ?? [];
        const list = Array.isArray(raw) ? raw : [];
        const currentPage = Number(body?.currentPage ?? body?.pageno ?? body?.page ?? 1);
        const totalPages = Number(body?.totalPages ?? body?.pages ?? 1);

        return {
          items: list.map((item, index) => {
            const createdAt = item?.createdAt ?? item?.updatedAt ?? item?.date ?? item?.timestamp ?? '';
            return normalizeHistoryItem(item, item?.group ?? getHistoryGroup(createdAt), `${currentPage}-${index}`);
          }),
          currentPage,
          totalPages,
          hasMore: Boolean(body?.hasMore ?? (totalPages ? currentPage < totalPages : list.length > 0)),
        };
      },
    }),

    getAiChat: builder.query({
      query: ({ chatId, messageId, query }) => ({
        url: API_ROUTES.AI_CHAT,
        method: 'GET',
        params: {
          ...(chatId ? { chat_id: chatId } : {}),
          ...(messageId ? { message_id: messageId } : {}),
          query,
        },
      }),
      providesTags: ['aiChat'],
      transformResponse: (res) => {
        const body = res?.body ?? res ?? {};
        return {
          chatId: body?.chat_id ?? body?.chatId ?? '',
          response: body?.response ?? body?.message ?? body?.answer ?? '',
          raw: body,
        };
      },
    }),

    getAiChatDetail: builder.query({
      query: ({ chatId, pageno = 1 }) => ({
        url: API_ROUTES.AI_CHAT_DETAIL(chatId),
        method: 'GET',
        params: { pageno },
      }),
      providesTags: ['aiChat'],
      transformResponse: (res) => {
        const body = res?.body ?? res ?? {};
        const chat = body?.chat ?? body?.data ?? body;
        const rawMessages = chat?.messages ?? body?.messages ?? body?.chats ?? [];
        const list = Array.isArray(rawMessages) ? rawMessages : [];
        return {
          chatId: chat?._id ?? chat?.id ?? body?.chat_id ?? body?.chatId ?? '',
          title: chat?.title ?? body?.title ?? '',
          messages: [...list].reverse().flatMap(normalizeChatTurn).filter((message) => message.content),
          currentPage: Number(body?.currentPage ?? body?.pageno ?? body?.page ?? 1),
          totalPages: Number(body?.totalPages ?? body?.pages ?? 1),
        };
      },
    }),

    deleteAllAiChats: builder.mutation({
      query: () => ({
        url: API_ROUTES.AI_DELETE_ALL_CHATS,
        method: 'DELETE',
      }),
      invalidatesTags: ['aiHistory', 'aiChat'],
    }),
  }),
});

export const {
  useGetAiInterestsQuery,
  useLazyGetAiInterestsQuery,
  useGetAiSummaryQuery,
  useLazyGetAiSummaryQuery,
  useGetAiHistoryQuery,
  useLazyGetAiHistoryQuery,
  useGetAiChatQuery,
  useLazyGetAiChatQuery,
  useGetAiChatDetailQuery,
  useLazyGetAiChatDetailQuery,
  useDeleteAllAiChatsMutation,
} = aiApi;
