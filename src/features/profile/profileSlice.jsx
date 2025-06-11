import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  viewedProfile: null,
  currentUserProfile: null,
  posts: [], // General posts array (e.g., for profile feed)
  feedPosts: [], // Posts for the main feed
  userPosts: [], // Posts by the current user
  savedPosts: [], // Saved posts (objects with { id, post, savedAt, ... })
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
      const newPost = action.payload;
      // Add to general posts array
      state.posts.unshift(newPost);

      // Add to feedPosts if applicable
      if (state.feedPosts) {
        state.feedPosts.unshift(newPost);
      }

      // Add to userPosts if the post belongs to the current user
      if (
        state.currentUserProfile &&
        (newPost.authorId === state.currentUserProfile.id ||
          newPost.userId === state.currentUserProfile.id ||
          newPost.author?.id === state.currentUserProfile.id)
      ) {
        state.userPosts = state.userPosts || [];
        state.userPosts.unshift(newPost);
      }

      // Add to currentUserProfile.posts if applicable
      if (
        state.currentUserProfile &&
        state.currentUserProfile.posts &&
        (newPost.authorId === state.currentUserProfile.id ||
          newPost.userId === state.currentUserProfile.id ||
          newPost.author?.id === state.currentUserProfile.id)
      ) {
        state.currentUserProfile.posts.unshift(newPost);
      }

      // Add to viewedProfile.posts if the viewed profile is the post author
      if (
        state.viewedProfile &&
        state.viewedProfile.posts &&
        (newPost.authorId === state.viewedProfile.id ||
          newPost.userId === state.viewedProfile.id ||
          newPost.author?.id === state.viewedProfile.id)
      ) {
        state.viewedProfile.posts.unshift(newPost);
      }
    },
    togglePostLike: (state, action) => {
      const { postId, isLiked, likesCount } = action.payload;

      // Helper to update a direct post
      const updateDirectPost = (post) =>
        post && (post.id === postId || post._id === postId)
          ? {
              ...post,
              isLiked,
              likesCount:
                likesCount !== null && likesCount !== undefined ? likesCount : post.likesCount,
            }
          : post;

      // Helper to update a saved post
      const updateSavedPost = (savedPost) =>
        savedPost.post && (savedPost.post.id === postId || savedPost.post._id === postId)
          ? {
              ...savedPost,
              post: {
                ...savedPost.post,
                isLiked,
                likesCount:
                  likesCount !== null && likesCount !== undefined
                    ? likesCount
                    : savedPost.post.likesCount,
              },
            }
          : savedPost;

      // Update all relevant arrays
      state.posts = state.posts?.map(updateDirectPost) || [];
      state.feedPosts = state.feedPosts?.map(updateDirectPost) || [];
      state.userPosts = state.userPosts?.map(updateDirectPost) || [];
      state.savedPosts = state.savedPosts?.map(updateSavedPost) || [];
      if (state.viewedProfile?.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.map(updateDirectPost);
      }
      if (state.currentUserProfile?.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.map(updateDirectPost);
      }
    },
    togglePostSave: (state, action) => {
      const { postId, isSaved } = action.payload;

      // Helper to update a post's isSaved status
      const updatePost = (post) =>
        post && (post.id === postId || post._id === postId) ? { ...post, isSaved } : post;

      // Helper to update a saved post
      const updateSavedPost = (savedPost) =>
        savedPost.post && (savedPost.post.id === postId || savedPost.post._id === postId)
          ? { ...savedPost, post: { ...savedPost.post, isSaved } }
          : savedPost;

      // Update all relevant arrays
      state.posts = state.posts?.map(updatePost) || [];
      state.feedPosts = state.feedPosts?.map(updatePost) || [];
      state.userPosts = state.userPosts?.map(updatePost) || [];
      state.savedPosts = state.savedPosts?.map(updateSavedPost) || [];
      if (state.viewedProfile?.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.map(updatePost);
      }
      if (state.currentUserProfile?.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.map(updatePost);
      }

      // If saving, add to savedPosts if not already present
      if (isSaved) {
        const postToSave = [
          ...state.posts,
          ...state.feedPosts,
          ...state.userPosts,
          ...(state.viewedProfile?.posts || []),
          ...(state.currentUserProfile?.posts || []),
        ].find((post) => post && (post.id === postId || post._id === postId));
        if (postToSave && !state.savedPosts.some((sp) => sp.post.id === postId)) {
          state.savedPosts.push({
            id: `saved-${postId}`,
            post: { ...postToSave, isSaved: true },
            savedAt: new Date().toISOString(),
          });
        }
      } else {
        // If un-saving, remove from savedPosts
        state.savedPosts = state.savedPosts.filter(
          (sp) => !(sp.post.id === postId || sp.post._id === postId)
        );
      }
    },
    updatePostInState: (state, action) => {
      const updatedPost = action.payload;

      // Helper to update a post
      const updatePost = (post) =>
        post && (post.id === updatedPost.id || post._id === updatedPost.id)
          ? { ...post, ...updatedPost }
          : post;

      // Helper to update a saved post
      const updateSavedPost = (savedPost) =>
        savedPost.post &&
        (savedPost.post.id === updatedPost.id || savedPost.post._id === updatedPost.id)
          ? { ...savedPost, post: { ...savedPost.post, ...updatedPost } }
          : savedPost;

      // Update all relevant arrays
      state.posts = state.posts?.map(updatePost) || [];
      state.feedPosts = state.feedPosts?.map(updatePost) || [];
      state.userPosts = state.userPosts?.map(updatePost) || [];
      state.savedPosts = state.savedPosts?.map(updateSavedPost) || [];
      if (state.viewedProfile?.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.map(updatePost);
      }
      if (state.currentUserProfile?.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.map(updatePost);
      }
    },
    incrementCommentCount: (state, action) => {
      const postId = action.payload;

      // Helper to update comment count
      const updatePost = (post) => {
        if (post && (post.id === postId || post._id === postId)) {
          const currentCount =
            post.commentsCount !== undefined ? post.commentsCount : post._count?.comments || 0;
          return {
            ...post,
            commentsCount: currentCount + 1,
            _count: post._count ? { ...post._count, comments: currentCount + 1 } : post._count,
          };
        }
        return post;
      };

      // Helper to update saved post
      const updateSavedPost = (savedPost) => {
        if (savedPost.post && (savedPost.post.id === postId || savedPost.post._id === postId)) {
          const currentCount =
            savedPost.post.commentsCount !== undefined
              ? savedPost.post.commentsCount
              : savedPost.post._count?.comments || 0;
          return {
            ...savedPost,
            post: {
              ...savedPost.post,
              commentsCount: currentCount + 1,
              _count: savedPost.post._count
                ? { ...savedPost.post._count, comments: currentCount + 1 }
                : savedPost.post._count,
            },
          };
        }
        return savedPost;
      };

      // Update all relevant arrays
      state.posts = state.posts?.map(updatePost) || [];
      state.feedPosts = state.feedPosts?.map(updatePost) || [];
      state.userPosts = state.userPosts?.map(updatePost) || [];
      state.savedPosts = state.savedPosts?.map(updateSavedPost) || [];
      if (state.viewedProfile?.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.map(updatePost);
      }
      if (state.currentUserProfile?.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.map(updatePost);
      }
    },
    decrementCommentCount: (state, action) => {
      const postId = action.payload;

      // Helper to update comment count
      const updatePost = (post) => {
        if (post && (post.id === postId || post._id === postId)) {
          const currentCount =
            post.commentsCount !== undefined ? post.commentsCount : post._count?.comments || 0;
          const newCount = Math.max(currentCount - 1, 0);
          return {
            ...post,
            commentsCount: newCount,
            _count: post._count ? { ...post._count, comments: newCount } : post._count,
          };
        }
        return post;
      };

      // Helper to update saved post
      const updateSavedPost = (savedPost) => {
        if (savedPost.post && (savedPost.post.id === postId || savedPost.post._id === postId)) {
          const currentCount =
            savedPost.post.commentsCount !== undefined
              ? savedPost.post.commentsCount
              : savedPost.post._count?.comments || 0;
          const newCount = Math.max(currentCount - 1, 0);
          return {
            ...savedPost,
            post: {
              ...savedPost.post,
              commentsCount: newCount,
              _count: savedPost.post._count
                ? { ...savedPost.post._count, comments: newCount }
                : savedPost.post._count,
            },
          };
        }
        return savedPost;
      };

      // Update all relevant arrays
      state.posts = state.posts?.map(updatePost) || [];
      state.feedPosts = state.feedPosts?.map(updatePost) || [];
      state.userPosts = state.userPosts?.map(updatePost) || [];
      state.savedPosts = state.savedPosts?.map(updateSavedPost) || [];
      if (state.viewedProfile?.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.map(updatePost);
      }
      if (state.currentUserProfile?.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.map(updatePost);
      }
    },
    removePost: (state, action) => {
      const postId = action.payload;

      // Filter out the post from all relevant arrays
      state.posts = state.posts?.filter((post) => post.id !== postId && post._id !== postId) || [];
      state.feedPosts =
        state.feedPosts?.filter((post) => post.id !== postId && post._id !== postId) || [];
      state.userPosts =
        state.userPosts?.filter((post) => post.id !== postId && post._id !== postId) || [];
      state.savedPosts =
        state.savedPosts?.filter((sp) => !(sp.post.id === postId || sp.post._id === postId)) || [];
      if (state.viewedProfile?.posts) {
        state.viewedProfile.posts = state.viewedProfile.posts.filter(
          (post) => post.id !== postId && post._id !== postId
        );
      }
      if (state.currentUserProfile?.posts) {
        state.currentUserProfile.posts = state.currentUserProfile.posts.filter(
          (post) => post.id !== postId && post._id !== postId
        );
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
      state.feedPosts = [];
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
