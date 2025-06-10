// src/services/chatApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/chat', // Your backend chat API base URL
    prepareHeaders: (headers, { getState }) => {
      // Assuming you store your JWT token in localStorage or Redux state
      const token = localStorage.getItem('token'); // Or getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Conversation', 'Messages'], // Define tag types for invalidation
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: () => '/conversations',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Conversation', id })),
              { type: 'Conversation', id: 'LIST' },
            ]
          : [{ type: 'Conversation', id: 'LIST' }],
    }),
    getConversationById: builder.query({
      query: (conversationId) => `/conversations/${conversationId}`,
      providesTags: (result, error, id) => [{ type: 'Conversation', id }],
    }),
    createConversation: builder.mutation({
      query: (participantId) => ({
        url: '/conversations',
        method: 'POST',
        body: { participantId },
      }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }) =>
        `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      providesTags: (result, error, { conversationId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Messages', id })),
              { type: 'Messages', id: conversationId },
            ]
          : [{ type: 'Messages', id: conversationId }],
    }),
    sendMessage: builder.mutation({
      query: ({ conversationId, content, type = 'TEXT' }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { content, type },
      }),
      // Invalidate messages for the specific conversation after sending
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        { type: 'Conversation', id: 'LIST' } // To update lastMessageAt
      ],
    }),
    markMessagesAsRead: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/messages/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Conversation', id: 'LIST' }, // To update unread count
        { type: 'Messages', id: conversationId } // If you want message list to reflect read status
      ],
    }),
    searchUsers: builder.query({
      query: (searchTerm) => `/users/search?q=${searchTerm}`,
      providesTags: ['UserSearch'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useSearchUsersQuery,
} = chatApi;