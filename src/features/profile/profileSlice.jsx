// // features/api/profileSlice.js
// import { createSlice } from '@reduxjs/toolkit';
// import { apiSlice } from '../api/apiSlice';

// // --- RTK Query Endpoints for Profile ---
// export const profileApi = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     getUserProfile: builder.query({
//       query: (identifier) => (
//         {
//         url: `/profile/${identifier}`,  
//         method: 'GET',
//       }),
//       providesTags: (result, error, identifier) => [
//         { type: 'Profile', id: identifier },
//         { type: 'Profile', id: 'LIST' }
//       ],
//       // Use onQueryStarted to dispatch the fetched data to the regular Redux slice
//       async onQueryStarted(identifier, { queryFulfilled, dispatch }) {
//         try {
//           const { data } = await queryFulfilled;
//           // Dispatch action to the new profileSlice to store the viewed profile
//           dispatch(setViewedProfile(data));
//         } catch (error) {
//           console.error("Failed to fetch profile (onQueryStarted):", error);
//         }
//       },
//     }),

//     getCurrentUserProfile: builder.query({
//       query: () => ({
//         url: '/profile/me/profile',
//         method: 'GET',
//       }),
//       providesTags: [{ type: 'Profile', id: 'CURRENT' }],
//       // Use onQueryStarted to dispatch the fetched data to the regular Redux slice
//       async onQueryStarted(arg, { queryFulfilled, dispatch }) {
//         try {
//           const { data } = await queryFulfilled;
//           // Dispatch action to store the current user's profile globally
//           dispatch(setCurrentUserProfile(data));
//         } catch (error) {
//           console.error("Failed to fetch current profile (onQueryStarted):", error);
//         }
//       },
//     }),

//     updateUserProfile: builder.mutation({
//       query: (profileData) => ({
//         url: '/profile/update',
//         method: 'PUT',
//         body: profileData,
//       }),
//       invalidatesTags: [
//         { type: 'Profile', id: 'CURRENT' },
//         { type: 'Profile', id: 'LIST' }
//       ],
//       // After successful update, refetch the current user's profile to update the slice state
//       async onQueryStarted(profileData, { queryFulfilled, dispatch }) {
//         try {
//           const { data } = await queryFulfilled;
//           dispatch(setCurrentUserProfile(data)); // Update current user profile in slice
//           dispatch(setViewedProfile(data)); // Also update viewed profile if it's the current user
//         } catch (error) {
//           console.error("Failed to update profile (onQueryStarted):", error);
//         }
//       },
//     }),

//     uploadAvatar: builder.mutation({
//       query: (formData) => ({
//         url: '/profile/avatar',
//         method: 'POST',
//         body: formData,
//       }),
//       invalidatesTags: [
//         { type: 'Profile', id: 'CURRENT' },
//         { type: 'Profile', id: 'LIST' }
//       ],
//       // After successful avatar upload, update the Redux state with the correct data
//       async onQueryStarted(formData, { queryFulfilled, dispatch }) {
//         try {
//           const { data } = await queryFulfilled;
//           // The backend returns { message, user }, so we need data.user
//           dispatch(setCurrentUserProfile(data.user)); // Use data.user instead of data
//           dispatch(setViewedProfile(data.user)); // Use data.user instead of data
//         } catch (error) {
//           console.error("Failed to upload avatar (onQueryStarted):", error);
//         }
//       },
//     }),

//     followUser: builder.mutation({
//       query: (userId) => ({
//         url: `/profile/follow/${userId}`,
//         method: 'POST',
//       }),
//       invalidatesTags: (result, error, userId) => [
//         { type: 'Profile', id: userId },
//         { type: 'Profile', id: 'LIST' },
//         { type: 'Follow', id: 'FOLLOWERS' },
//         { type: 'Follow', id: 'FOLLOWING' },
//         { type: 'Follow', id: 'LIST' }
//       ],
//       // Optimistic update for better UX
//       async onQueryStarted(userId, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled;
//           // The invalidation will handle refetching
//         } catch (error) {
//           console.error("Follow user error:", error);
//         }
//       },
//     }),

//     unfollowUser: builder.mutation({
//       query: (userId) => ({
//         url: `/profile/follow/${userId}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: (result, error, userId) => [
//         { type: 'Profile', id: userId },
//         { type: 'Profile', id: 'LIST' },
//         { type: 'Follow', id: 'FOLLOWERS' },
//         { type: 'Follow', id: 'FOLLOWING' },
//         { type: 'Follow', id: 'LIST' }
//       ],
//       // Optimistic update for better UX
//       async onQueryStarted(userId, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled;
//           // The invalidation will handle refetching
//         } catch (error) {
//           console.error("Unfollow user error:", error);
//         }
//       },
//     }),

//     getFollowers: builder.query({
//       query: ({ userId, page = 1, limit = 20, search = '' }) => {
//         let url = `/profile/${userId}/followers?page=${page}&limit=${limit}`;
//         if (search) {
//           url += `&search=${encodeURIComponent(search)}`;
//         }
//         return {
//           url,
//           method: 'GET',
//         };
//       },
//       providesTags: (result, error, { userId, page, search }) => [
//         { type: 'Follow', id: 'FOLLOWERS' },
//         { type: 'Follow', id: `FOLLOWERS-${userId}-${page}-${search}` }
//       ],
//       // Keep previous data while fetching new data for better UX
//       keepUnusedDataFor: 60, // 60 seconds
//     }),

//     getFollowing: builder.query({
//       query: ({ userId, page = 1, limit = 20, search = '' }) => {
//         let url = `/profile/${userId}/following?page=${page}&limit=${limit}`;
//         if (search) {
//           url += `&search=${encodeURIComponent(search)}`;
//         }
//         return {
//           url,
//           method: 'GET',
//         };
//       },
//       providesTags: (result, error, { userId, page, search }) => [
//         { type: 'Follow', id: 'FOLLOWING' },
//         { type: 'Follow', id: `FOLLOWING-${userId}-${page}-${search}` }
//       ],
//       // Keep previous data while fetching new data for better UX
//       keepUnusedDataFor: 60, // 60 seconds
//     }),

//     searchUsers: builder.query({
//       query: ({ query, page = 1, limit = 20 }) => ({
//         url: `/profile/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
//         method: 'GET',  
//       }),
//       providesTags: [{ type: 'Profile', id: 'SEARCH' }],
//     }),
//   }),
// });

// export const {
//   useGetUserProfileQuery,
//   useGetCurrentUserProfileQuery,
//   useUpdateUserProfileMutation,
//   useUploadAvatarMutation,
//   useFollowUserMutation,
//   useUnfollowUserMutation,
//   useGetFollowersQuery,
//   useGetFollowingQuery,
//   useSearchUsersQuery,
// } = profileApi;

// // --- Redux Toolkit Slice for Profile-Related State ---
// const initialState = {
//   viewedProfile: null, // Stores the profile data of the user currently being viewed
//   currentUserProfile: null, // Stores the profile data of the authenticated user
// };

// const profileSlice = createSlice({
//   name: 'profile',
//   initialState,
//   reducers: {
//     setViewedProfile: (state, action) => {
//       state.viewedProfile = action.payload;
//     },
//     clearViewedProfile: (state) => {
//       state.viewedProfile = null;
//     },
//     setCurrentUserProfile: (state, action) => {
//       state.currentUserProfile = action.payload;
//     },
//     clearCurrentUserProfile: (state) => {
//       state.currentUserProfile = null;
//     },
//   },
// });

// export const { setViewedProfile, clearViewedProfile, setCurrentUserProfile, clearCurrentUserProfile } = profileSlice.actions;

// export default profileSlice.reducer;
// features/api/profileSlice.js


// src/features/profile/profileSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  viewedProfile: null,
  currentUserProfile: null,
  posts: [],
  feedPagination: {
    page: 1,
    hasMore: true,
    loading: false,
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setViewedProfile: (state, action) => {
      state.viewedProfile = action.payload;
    },
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
    },
    setCurrentUserProfile: (state, action) => {
      state.currentUserProfile = action.payload;
    },
    clearCurrentUserProfile: (state) => {
      state.currentUserProfile = null;
    },
    setPosts: (state, action) => {
      state.posts = action.payload;
      state.feedPagination.page = 1;
    },
    appendPosts: (state, action) => {
      state.posts = [...state.posts, ...action.payload];
      state.feedPagination.page += 1;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },

    togglePostLike: (state, action) => {
      const { postId, isLiked, likesCount } = action.payload;
      
      // Find post in all possible locations
      const updatePost = (post) => {
        if (post && post.id === postId) {
          post.isLiked = isLiked;
          
          // Only update likesCount if it's explicitly provided and not null
          if (likesCount !== null && likesCount !== undefined) {
            post.likesCount = likesCount;
          }
          return true;
        }
        return false;
      };
    
      // Update in posts array
      if (state.posts) {
        state.posts.forEach(updatePost);
      }
      
      // Update in feed posts if they exist
      if (state.feedPosts) {
        state.feedPosts.forEach(updatePost);
      }
      
      // Update in user posts if they exist
      if (state.userPosts) {
        state.userPosts.forEach(updatePost);
      }
      
      // Update in viewed profile posts if they exist
      if (state.viewedProfile && state.viewedProfile.posts) {
        state.viewedProfile.posts.forEach(updatePost);
      }
      
      // Update in current user profile posts if they exist
      if (state.currentUserProfile && state.currentUserProfile.posts) {
        state.currentUserProfile.posts.forEach(updatePost);
      }
    },
    
    // Fixed togglePostSave reducer
    togglePostSave: (state, action) => {
      const { postId, isSaved } = action.payload;
      
      // Find post in all possible locations
      const updatePost = (post) => {
        if (post && post.id === postId) {
          post.isSaved = isSaved;
          return true;
        }
        return false;
      };
    
      // Update in posts array
      if (state.posts) {
        state.posts.forEach(updatePost);
      }
      
      // Update in feed posts if they exist
      if (state.feedPosts) {
        state.feedPosts.forEach(updatePost);
      }
      
      // Update in user posts if they exist
      if (state.userPosts) {
        state.userPosts.forEach(updatePost);
      }
      
      // Update in viewed profile posts if they exist
      if (state.viewedProfile && state.viewedProfile.posts) {
        state.viewedProfile.posts.forEach(updatePost);
      }
      
      // Update in current user profile posts if they exist
      if (state.currentUserProfile && state.currentUserProfile.posts) {
        state.currentUserProfile.posts.forEach(updatePost);
      }
    },
    
    // Additional helper reducer to update post content
    updatePostInState: (state, action) => {
      const updatedPost = action.payload;
      
      const updatePost = (post) => {
        if (post && post.id === updatedPost.id) {
          Object.assign(post, updatedPost);
          return true;
        }
        return false;
      };
    
      // Update in all possible locations
      if (state.posts) {
        state.posts.forEach(updatePost);
      }
      
      if (state.feedPosts) {
        state.feedPosts.forEach(updatePost);
      }
      
      if (state.userPosts) {
        state.userPosts.forEach(updatePost);
      }
      
      if (state.viewedProfile && state.viewedProfile.posts) {
        state.viewedProfile.posts.forEach(updatePost);
      }
      
      if (state.currentUserProfile && state.currentUserProfile.posts) {
        state.currentUserProfile.posts.forEach(updatePost);
      }
    },
  
    // Updated increment/decrement comment count actions
    incrementCommentCount: (state, action) => {
      const postId = action.payload;
      
      const updatePost = (post) => {
        if (post && (post.id === postId || post._id === postId)) {
          const currentCount = post.commentsCount !== undefined 
            ? post.commentsCount 
            : post._count?.comments || 0;
          
          post.commentsCount = currentCount + 1;
          
          // Also update _count if it exists
          if (post._count) {
            post._count.comments = post.commentsCount;
          }
        }
      };
    
      // Update all sources
      [state.posts, state.feedPosts, state.userPosts].forEach(arr => {
        if (arr) arr.forEach(updatePost);
      });
    
      if (state.viewedProfile?.posts) state.viewedProfile.posts.forEach(updatePost);
      if (state.currentUserProfile?.posts) state.currentUserProfile.posts.forEach(updatePost);
    },
    
    decrementCommentCount: (state, action) => {
      const postId = action.payload;
    
      const updatePost = (post) => {
        if (post && (post.id === postId || post._id === postId)) {
          const currentCount = post.commentsCount !== undefined 
            ? post.commentsCount 
            : post._count?.comments || 0;
          
          post.commentsCount = Math.max(currentCount - 1, 0);
          
          // Also update _count if it exists
          if (post._count) {
            post._count.comments = post.commentsCount;
          }
        }
      };
    
      // Update all sources
      [state.posts, state.feedPosts, state.userPosts].forEach(arr => {
        if (arr) arr.forEach(updatePost);
      });
    
      if (state.viewedProfile?.posts) state.viewedProfile.posts.forEach(updatePost);
      if (state.currentUserProfile?.posts) state.currentUserProfile.posts.forEach(updatePost);
    },
    
    // Fixed removePost reducer
    removePost: (state, action) => {
      const postId = action.payload;
      
      // Remove from all possible locations
      if (state.posts) {
        state.posts = state.posts.filter(post => post.id !== postId);
      }
      
      if (state.feedPosts) {
        state.feedPosts = state.feedPosts.filter(post => post.id !== postId);
      }
      
      if (state.userPosts) {
        state.userPosts = state.userPosts.filter(post => post.id !== postId);
      }
      
      if (state.viewedProfile && state.viewedProfile.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.filter(post => post.id !== postId);
      }
      
      if (state.currentUserProfile && state.currentUserProfile.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.filter(post => post.id !== postId);
      }
    },
    setFeedLoading: (state, action) => {
      state.feedPagination.loading = action.payload;
    },
    setHasMore: (state, action) => {
      state.feedPagination.hasMore = action.payload;
    },
    resetFeed: (state) => {
      state.posts = [];
      state.feedPagination = { page: 1, hasMore: true, loading: false };
    },
  },
});

export const {
  setViewedProfile,
  clearViewedProfile,
  setCurrentUserProfile,
  clearCurrentUserProfile,
  setPosts,
  appendPosts,
  addPost,
  updatePostInState,
  removePost,
 
  incrementCommentCount,
  decrementCommentCount,
  togglePostLike,
  togglePostSave,
  setFeedLoading,
  setHasMore,
  resetFeed,
} = profileSlice.actions;

export default profileSlice.reducer;