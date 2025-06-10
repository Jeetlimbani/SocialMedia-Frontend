import { apiSlice } from '../api/apiSlice';
import {
  setViewedProfile,
  clearViewedProfile,
  setCurrentUserProfile,
  clearCurrentUserProfile,
  setPosts,
  appendPosts,
  addPost,
  updatePostInState,
  removePost,
  togglePostLike,
  togglePostSave,
  setFeedLoading,
  setHasMore,
  resetFeed,
}  from '../profile/profileSlice';

// --- RTK Query Endpoints for Profile ---
export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Profile endpoints
    getUserProfile: builder.query({
      query: (identifier) => ({
        url: `/profile/${identifier}`,  
        method: 'GET',
      }),
      providesTags: (result, error, identifier) => [
        { type: 'Profile', id: identifier },
        { type: 'Profile', id: 'LIST' }
      ],
      async onQueryStarted(identifier, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setViewedProfile(data));
        } catch (error) {
          console.error("Failed to fetch profile (onQueryStarted):", error);
        }
      },
    }),

    getCurrentUserProfile: builder.query({
      query: () => ({
        url: '/profile/me/profile',
        method: 'GET',
      }),
      providesTags: [{ type: 'Profile', id: 'CURRENT' }],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUserProfile(data));
        } catch (error) {
          console.error("Failed to fetch current profile (onQueryStarted):", error);
        }
      },
    }),

    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile/update',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: [
        { type: 'Profile', id: 'CURRENT' },
        { type: 'Profile', id: 'LIST' }
      ],
      async onQueryStarted(profileData, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUserProfile(data));
          dispatch(setViewedProfile(data));
        } catch (error) {
          console.error("Failed to update profile (onQueryStarted):", error);
        }
      },
    }),

    uploadAvatar: builder.mutation({
      query: (formData) => ({
        url: '/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'Profile', id: 'CURRENT' },
        { type: 'Profile', id: 'LIST' }
      ],
      async onQueryStarted(formData, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUserProfile(data.user));
          dispatch(setViewedProfile(data.user));
        } catch (error) {
          console.error("Failed to upload avatar (onQueryStarted):", error);
        }
      },
    }),

    // Follow/Unfollow endpoints
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/profile/follow/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Profile', id: userId },
        { type: 'Profile', id: 'LIST' },
        { type: 'Follow', id: 'FOLLOWERS' },
        { type: 'Follow', id: 'FOLLOWING' },
        { type: 'Follow', id: 'LIST' }
      ],
    }),

    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/profile/follow/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Profile', id: userId },
        { type: 'Profile', id: 'LIST' },
        { type: 'Follow', id: 'FOLLOWERS' },
        { type: 'Follow', id: 'FOLLOWING' },
        { type: 'Follow', id: 'LIST' }
      ],
    }),

    getFollowers: builder.query({
      query: ({ userId, page = 1, limit = 20, search = '' }) => {
        let url = `/profile/${userId}/followers?page=${page}&limit=${limit}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        return { url, method: 'GET' };
      },
      providesTags: (result, error, { userId, page, search }) => [
        { type: 'Follow', id: 'FOLLOWERS' },
        { type: 'Follow', id: `FOLLOWERS-${userId}-${page}-${search}` }
      ],
      keepUnusedDataFor: 60,
    }),

    getFollowing: builder.query({
      query: ({ userId, page = 1, limit = 20, search = '' }) => {
        let url = `/profile/${userId}/following?page=${page}&limit=${limit}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        return { url, method: 'GET' };
      },
      providesTags: (result, error, { userId, page, search }) => [
        { type: 'Follow', id: 'FOLLOWING' },
        { type: 'Follow', id: `FOLLOWING-${userId}-${page}-${search}` }
      ],
      keepUnusedDataFor: 60,
    }),

    searchUsers: builder.query({
      query: ({ query, page = 1, limit = 20 }) => ({
        url: `/profile/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result) => {
        if (result?.users) {
          return [
            ...result.users.map(user => ({ type: 'User', id: user.id })),
            { type: 'Profile', id: 'SEARCH' },
          ];
        }
        return [{ type: 'Profile', id: 'SEARCH' }];
      },
    }),

    // Post management endpoints
    createPost: builder.mutation({
      query: (formData) => ({
        url: '/posts/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'Post', id: 'LIST' },
        { type: 'Post', id: 'FEED' },
        { type: 'Profile', id: 'CURRENT' }
      ],
      async onQueryStarted(formData, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addPost(data.post));
        } catch (error) {
          console.error("Failed to create post:", error);
        }
      },
    }),

    updatePost: builder.mutation({
      query: ({ postId, content }) => ({
        url: `/posts/update/${postId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: ['Post'],
    }),

    deletePost: builder.mutation({
      query: (postId) => {
        console.log('Deleting post with ID:', postId);
        return {
          url: `/posts/delete/${postId}`,
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: (result, error, postId) => [
        'Post', 
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' }
      ],
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        console.log('Starting delete for post:', postId);
        try {
          await queryFulfilled;
          console.log('Delete successful for post:', postId);
        } catch (error) {
          console.error('Delete failed for post:', postId, error);
        }
      },
    }),

    // Feed endpoint
    getFeed: builder.query({
      query: ({ page = 1, limit = 10, cursor }) => {
        let url = `/posts/feed?page=${page}&limit=${limit}`;
        if (cursor) {
          url += `&cursor=${cursor}`;
        }
        return { url, method: 'GET' };
      },
      providesTags: (result, error, { page }) => [
        { type: 'Post', id: 'FEED' },
        { type: 'Post', id: `FEED-${page}` }
      ],
      keepUnusedDataFor: 60,
      async onQueryStarted({ page }, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (page === 1) {
            dispatch(setPosts(data.posts));
          } else {
            dispatch(appendPosts(data.posts));
          }
        } catch (error) {
          console.error("Failed to fetch feed:", error);
        }
      },
    }),

    // Like/Unlike endpoints
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      transformResponse: (response) => {
        console.log('Like API response:', response);
        return {
          success: true,
          message: response.message || 'Post liked successfully',
          isLiked: true,
          likesCount: response.likesCount || response.post?.likesCount,
          post: response.post,
          ...response
        };
      },
      transformErrorResponse: (error) => {
        console.error('Like API error:', error);
        return {
          status: error.status,
          data: error.data,
          error: error.data?.error || error.data?.message || 'Failed to like post'
        };
      },
      invalidatesTags: [],
    }),
    
    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'DELETE',
      }),
      transformResponse: (response) => {
        console.log('Unlike API response:', response);
        return {
          success: true,
          message: response.message || 'Post unliked successfully',
          isLiked: false,
          likesCount: response.likesCount || response.post?.likesCount,
          post: response.post,
          ...response
        };
      },
      transformErrorResponse: (error) => {
        console.error('Unlike API error:', error);
        return {
          status: error.status,
          data: error.data,
          error: error.data?.error || error.data?.message || 'Failed to unlike post'
        };
      },
      invalidatesTags: [],
    }),
    
    // Save/Unsave endpoints - MISSING savePost ENDPOINT ADDED HERE
    savePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/save`,
        method: 'POST',
      }),
      transformResponse: (response) => {
        console.log('Save API response:', response);
        return {
          success: true,
          message: response.message || 'Post saved successfully',
          isSaved: true,
          ...response
        };
      },
      transformErrorResponse: (error) => {
        console.error('Save API error:', error);
        return {
          status: error.status,
          data: error.data,
          error: error.data?.error || error.data?.message || 'Failed to save post'
        };
      },
      invalidatesTags: [
        { type: 'SavedPost', id: 'LIST' },
      ],
    }),

    getSavedPosts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/posts/saved',
        method: 'GET',
        params: { page, limit },
      }),
      transformResponse: (response) => {
        console.log('Get saved posts API response:', response);
        return {
          savedPosts: response.savedPosts || [],
          pagination: response.pagination || {},
          ...response
        };
      },
      transformErrorResponse: (error) => {
        console.error('Get saved posts API error:', error);
        return {
          status: error.status,
          data: error.data,
          error: error.data?.error || error.data?.message || 'Failed to load saved posts'
        };
      },
      providesTags: [
        { type: 'SavedPost', id: 'LIST' },
      ],
    }),

    unsavePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/unsave`,
        method: 'DELETE',
      }),
      transformResponse: (response) => {
        console.log('Unsave API response:', response);
        return {
          success: true,
          message: response.message || 'Post removed from saved successfully',
          isSaved: false,
          ...response
        };
      },
      transformErrorResponse: (error) => {
        console.error('Unsave API error:', error);
        return {
          status: error.status,
          data: error.data,
          error: error.data?.error || error.data?.message || 'Failed to remove post from saved'
        };
      },
      invalidatesTags: [
        { type: 'SavedPost', id: 'LIST' },
      ],
    }),
    
    // Alternative approach: Add a refetch posts query for when you need fresh data
    refetchPosts: builder.query({
      query: ({ userId, page = 1, limit = 10 }) => ({
        url: `/profile/${userId}/posts?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result, error, { userId, page }) => [
        { type: 'Post', id: `USER-${userId}-${page}` }
      ],
    }),
    
    // Get single post (useful for refreshing individual post data)
    getPost: builder.query({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => [
        { type: 'Post', id: postId }
      ],
    }),
    getComments: builder.query({
      query: ({ postId, page = 1, limit = 20, sort = 'newest' }) => 
        `posts/${postId}/comments?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Comment', id: 'LIST' },
      ],
    }),
    addComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Comment', id: 'LIST' },
        { type: 'Post', id: postId }, // Invalidate the specific post
        { type: 'Post', id: 'LIST' }, // Invalidate posts list
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ postId, content }, { dispatch, queryFulfilled, getState }) {
        const currentUser = getState().auth.user;
        
        // Optimistic update for comments
        const patchResult = dispatch(
          commentsApi.util.updateQueryData('getComments', { postId }, (draft) => {
            const newComment = {
              id: `temp_${Date.now()}`,
              content,
              user: currentUser,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.comments.unshift(newComment);
            draft.total += 1;
          })
        );

        // Update post comment count in Redux state
        dispatch(incrementCommentCount(postId));

        try {
          const { data: newComment } = await queryFulfilled;
          
          // Replace the temporary comment with the real one
          dispatch(
            commentsApi.util.updateQueryData('getComments', { postId }, (draft) => {
              const tempIndex = draft.comments.findIndex(comment => 
                comment.id.toString().startsWith('temp_')
              );
              if (tempIndex !== -1) {
                draft.comments[tempIndex] = newComment;
              }
            })
          );
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
          dispatch(decrementCommentCount(postId)); // You'll need to add this action
        }
      },
    }),
    updateComment: builder.mutation({
      query: ({ postId, commentId, content }) => ({
        url: `posts/${postId}/comments/${commentId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
      ],
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
      // Optimistic update for delete
      async onQueryStarted({ postId, commentId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commentsApi.util.updateQueryData('getComments', { postId }, (draft) => {
            const index = draft.comments.findIndex(comment => 
              comment.id === commentId || comment._id === commentId
            );
            if (index !== -1) {
              draft.comments.splice(index, 1);
              draft.total -= 1;
            }
          })
        );

        dispatch(decrementCommentCount(postId));

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          dispatch(incrementCommentCount(postId));
        }
      },
    }),
  }),
});


// Export hooks - ADDED MISSING useSavePostMutation
export const {
  // Profile hooks
  useGetUserProfileQuery,
  useGetCurrentUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadAvatarMutation,
  
  // Follow hooks
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
  
  // Post hooks
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetFeedQuery,
  
  // Like hooks
  useLikePostMutation,
  useUnlikePostMutation,
  
  // Save hooks - FIXED: Added useSavePostMutation
  useSavePostMutation,
  useUnsavePostMutation,
  useGetSavedPostsQuery,
  
  // Additional hooks
  useRefetchPostsQuery,
  useGetPostQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = profileApi;