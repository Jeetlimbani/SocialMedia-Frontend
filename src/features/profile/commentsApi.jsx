// features/comments/commentsApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../api/apiSlice';

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Comments'],
  endpoints: (builder) => ({
    getComments: builder.query({
      query: ({ postId, page = 1, limit = 20, sort = 'newest' }) =>
        `posts/${postId}/comments?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result, error, { postId }) => [
        { type: 'Comments', id: postId },
      ],
    }),
    addComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comments', id: postId },
      ],
    }),
    updateComment: builder.mutation({
      query: ({ postId, commentId, content }) => ({
        url: `posts/${postId}/comments/${commentId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comments', id: postId },
      ],
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comments', id: postId },
      ],
    }),
  }),
});


export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
