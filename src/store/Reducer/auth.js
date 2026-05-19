import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

const ADMIN_ACCESS_TOKEN = import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

// Maps any MIME type to a fileType value the backend accepts.
// Known MIME types are sent as-is; everything else falls back to a category string.
const KNOWN_FILE_TYPES = new Set(['image/png', 'image/jpg', 'image/jpeg', 'video/mp4', 'video/quicktime', 'audio/mp4']);

export function normalizeFileType(mimeType = '') {
  if (KNOWN_FILE_TYPES.has(mimeType)) return mimeType;
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}

export const authApi = createApi({
  reducerPath: 'auth',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['profile', 'legal'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (login) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body: login,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: API_ROUTES.AUTH.LOGOUT,
        method: 'POST',
      }),
    }),

    socialLogin: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.SOCIAL_LOGIN,
        method: 'POST',
        body,
      }),
    }),

    register: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.REGISTER,
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation({
      query: ({ email, pin }) => ({
        url: API_ROUTES.AUTH.VERIFY_OTP,
        method: 'PUT',
        body: { email, pin },
      }),
    }),

    resendOtp: builder.mutation({
      query: ({ email }) => ({
        url: API_ROUTES.AUTH.RESEND_OTP,
        method: 'POST',
        body: { email },
      }),
    }),

    verifyPasswordOtp: builder.mutation({
      query: ({ email, pin }) => ({
        url: API_ROUTES.AUTH.VERIFY_PASSWORD_OTP,
        method: 'PUT',
        body: { email, pin },
      }),
    }),

    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: API_ROUTES.AUTH.FORGOT_PASSWORD,
        method: 'PUT',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, newpassword, retypenewpassword }) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD,
        method: 'PUT',
        body: { email, user_type: '2', newpassword, retypenewpassword },
      }),
    }),

    adminLogin: builder.mutation({
      query: (login) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
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

    changePassword: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.CHANGE_PASSWORD,
        method: 'PUT',
        body,
      }),
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

    // Upload one or more chat attachment files.
    // Transforms the response into the attachment shape the socket backend expects:
    // { fileName, fileType, originalFileName }
    uploadChatFiles: builder.mutation({
      query: (files) => {
        const formData = new FormData();
        const fileArray = Array.isArray(files) ? files : [files];
        fileArray.forEach((f) => formData.append('file', f));
        return {
          url: API_ROUTES.FILE_UPLOAD,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (res, _meta, files) => {
        const fileArray = Array.isArray(files) ? files : [files];
        const body = res?.body ?? res;

        // Primary shape from /file/upload: { fileUrl, fileName, originalName }
        if (body?.fileName) {
          return [
            {
              fileUrl: body.fileUrl ?? '',
              fileName: body.fileName,
              fileType: normalizeFileType(fileArray[0]?.type ?? ''),
              originalFileName: body.originalName ?? body.originalFileName ?? body.fileName,
            },
          ];
        }

        // Array response: [{ key/fileName, mimetype/fileType, originalname/originalFileName, fileUrl? }]
        if (Array.isArray(body)) {
          return body.map((item, i) => ({
            fileUrl: item.fileUrl ?? item.url ?? '',
            fileName: item.fileName ?? item.key ?? item.name ?? '',
            fileType: normalizeFileType(item.fileType ?? item.mimetype ?? fileArray[i]?.type ?? ''),
            originalFileName: item.originalFileName ?? item.originalName ?? item.originalname ?? fileArray[i]?.name ?? '',
          }));
        }

        // String or other URL-only response
        const rawUrl = typeof body === 'string' ? body : body?.url ?? body?.fileUrl ?? '';
        const fileName = rawUrl.includes('/') ? rawUrl.split('/').pop().split('?')[0] : rawUrl;
        return [
          {
            fileUrl: rawUrl,
            fileName,
            fileType: normalizeFileType(fileArray[0]?.type ?? ''),
            originalFileName: fileArray[0]?.name ?? fileName,
          },
        ];
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
      query: ({ userId, type = 'created', pageno = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (pageno) params.append('pageno', pageno);
        if (search) params.append('search', search);

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

    termsAndConditions: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.TERMS_AND_CONDITIONS,
        method: 'GET',
      }),
      providesTags: ['legal'],
      transformResponse: (res) => {
        const body = res?.body ?? res ?? {};
        const known = body?.terms ?? body?.termsAndCondition ?? body?.termsAndConditions ?? body?.content ?? body?.description ?? body?.data ?? body?.html ?? body?.text ?? '';
        if (known) return known;
        return Object.values(body).find((v) => typeof v === 'string' && v.length > 0) ?? '';
      },
    }),

    privacyPolicy: builder.query({
      query: () => ({
        url: API_ROUTES.AUTH.PRIVACY_POLICY,
        method: 'GET',
      }),
      providesTags: ['legal'],
      transformResponse: (res) => {
        const body = res?.body ?? res ?? {};
        const known = body?.privacy ?? body?.privacyPolicy ?? body?.content ?? body?.description ?? body?.policy ?? body?.data ?? body?.html ?? body?.text ?? '';
        if (known) return known;
        return Object.values(body).find((v) => typeof v === 'string' && v.length > 0) ?? '';
      },
    }),

    getAnnouncement: builder.query({
      query: () => ({
        url: `${API_ROUTES.AUTH.ANNOUNCEMENT}?type=annoucement`,
        method: 'GET',
      }),
      providesTags: ['legal'],
      transformResponse: (res) => {
        const body = res?.body ?? res ?? {};
        return {
          title: body?.title ?? body?.name ?? '',
          content: body?.annoucement ?? body?.announcement ?? body?.content ?? body?.description ?? body?.text ?? body?.html ?? body?.data ?? '',
        };
      },
    }),

    contactSupport: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.CONTACT_SUPPORT,
        method: 'POST',
        body,
      }),
    }),

    searchUsers: builder.query({
      query: (search = '') => ({
        url: `${API_ROUTES.ROOM_SEARCH_USER}?search=${encodeURIComponent(search)}`,
        method: 'GET',
      }),
      transformResponse: (res) => {
        const list = Array.isArray(res?.body) ? res.body : [];
        return list.map((u) => ({
          id: u._id ?? u.id,
          name: u.name ?? u.username ?? u.email ?? '',
          email: u.email ?? '',
          avatar: u.image ?? u.avatar ?? '',
        }));
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useSocialLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useVerifyPasswordOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAdminLoginMutation,
  useUserProfileQuery,
  useUpdateProfileMutation,
  useUploadFileMutation,
  useUploadChatFilesMutation,
  useOtherUserProfileQuery,
  useLazyOtherUserProfileQuery,
  useOtherUserRoomsQuery,
  useFollowUnfollowUserMutation,
  useConnectionsQuery,
  useTermsAndConditionsQuery,
  usePrivacyPolicyQuery,
  useGetAnnouncementQuery,
  useContactSupportMutation,
  useLazySearchUsersQuery,
} = authApi;
