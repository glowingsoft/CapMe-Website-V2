export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        ADMIN_LOGIN: 'admin/login',
        USER_PROFILE: '/auth/userprofile',
        UPDATE_PROFILE: '/auth/updateprofile',
        OTHER_USER_PROFILE: '/auth/otheruserprofile',
        OTHER_USER_ROOMS: '/auth/otheruserrooms',
        FOLLOW_UNFOLLOW: '/auth/followunfollow',
        CONNECTIONS: '/auth/connections',
    },

    WALLETS: '/wallets',
    WALLETS_BY_ID: (id) => `/wallets/${id}`,

    TRANSACTIONS: '/transactions',
    TRANSACTIONS_BY_ID: (id) => `/transactions/${id}`,

    USERS: '/users',
    USERS_BY_ID: (id) => `/users/${id}`,

    CATEGORIES: '/categories',
    CATEGORIES_BY_ID: (id) => `/categories/${id}`,

    ROOMS: '/rooms',
    ROOM_HOME_API: '/room/homeapi',
    ROOMS_BY_ID: (id) => `/rooms/${id}`,
    ROOMS_FOLLOW: (id) => `/rooms/${id}/follow`,
    ROOMS_UNFOLLOW: (id) => `/rooms/${id}/follow`,

    ROOM_MESSAGES: (roomId) => `/message/rooms/${roomId}/messages`,
    ROOM_TAGS: (roomId) => `/message/tags/${roomId}`,
    MESSAGE_TAGS: '/message/tags',

    MESSAGE_LIKE: (id) => `/message/${id}/like`,
    MESSAGE_SHARE: (id) => `/message/${id}/share`,
    MESSAGE_PIN: (id) => `/message/${id}/pin`,
    MESSAGE_EDIT: (id) => `/message/${id}/edit`,
    MESSAGE_COMMENTS: '/message/getcomments',

    FILE_UPLOAD: '/file/upload',
};