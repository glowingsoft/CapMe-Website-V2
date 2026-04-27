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
  })
});

export const {
  useLoginMutation, useAdminLoginMutation
} = authApi;
