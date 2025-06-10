// features/publicFeed/publicFeedApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const publicFeedApi = createApi({
  reducerPath: 'publicFeedApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
  }),
  tagTypes: ['PublicPost'],
  endpoints: (builder) => ({
    getPublicFeed: builder.query({
      query: ({ page = 1, limit = 10, cursor }) => {
        let url = `/posts/public-feed?page=${page}&limit=${limit}`;
        if (cursor) {
          url += `&cursor=${cursor}`;
        }
        return { url, method: 'GET' };
      },
      providesTags: (result, error, { page }) => [
        { type: 'PublicPost', id: 'FEED' },
        { type: 'PublicPost', id: `FEED-${page}` }
      ],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetPublicFeedQuery } = publicFeedApi;