export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        ADMIN_LOGIN: 'admin/login',
    },

    WALLETS: '/wallets',
    WALLETS_BY_ID: (id) => `/wallets/${id}`,

    TRANSACTIONS: '/transactions',
    TRANSACTIONS_BY_ID: (id) => `/transactions/${id}`,

    USERS: '/users',
    USERS_BY_ID: (id) => `/users/${id}`,

    CATEGORIES: '/categories',
    CATEGORIES_BY_ID: (id) => `/categories/${id}`,
};