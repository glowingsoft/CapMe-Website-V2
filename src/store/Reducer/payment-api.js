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
  }),
});

export const { useCreatePaymentMutation } = paymentApi;
