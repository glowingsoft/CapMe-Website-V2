import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomFetchBaseQuery } from '../baseQuery';
import { API_ROUTES } from '../apiRoutes';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Payment'],

  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (paymentData) => ({
        url: API_ROUTES.CREATE_PAYMENT,
        method: 'POST',
        body: paymentData,
      }),
    }),

    validateSubscription: builder.query({
      query: () => API_ROUTES.SUBSCRIPTION_VALIDATE,
      transformResponse: (res) => res?.body ?? res,
    }),

    getSubscriptionPlans: builder.query({
      query: () => API_ROUTES.SUBSCRIPTION_PLANS,
      transformResponse: (res) => res?.body ?? res?.data ?? res,
    }),

    createSubscription: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.SUBSCRIPTION_CREATE,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useLazyValidateSubscriptionQuery,
  useLazyGetSubscriptionPlansQuery,
  useCreateSubscriptionMutation,
} = paymentApi;
