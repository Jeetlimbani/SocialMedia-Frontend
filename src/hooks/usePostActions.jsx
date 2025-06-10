// src/hooks/usePostActions.js or src/features/profile/hooks/usePostActions.js
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
} from '../features/profile/profileApi'; // Adjust path if needed
import { togglePostLike, togglePostSave } from '../features/profile/profileSlice'; // Adjust path if needed

const usePostActions = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const [actionLoading, setActionLoading] = useState({});

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  // Handle like/unlike with optimistic updates and proper error handling
  const handleLike = useCallback(async (post) => {
    if (!post?.id || !currentUser) return;

    if (actionLoading[post.id]) return;

    setActionLoading(prev => ({ ...prev, [post.id]: true }));

    const wasLiked = post.isLiked;
    const currentLikesCount = post.likesCount || 0;

    // Optimistic update
    dispatch(togglePostLike({
      postId: post.id,
      isLiked: !wasLiked,
      likesCount: wasLiked ? Math.max(currentLikesCount - 1, 0) : currentLikesCount + 1
    }));

    try {
      let result;
      if (wasLiked) {
        result = await unlikePost(post.id).unwrap();
      } else {
        result = await likePost(post.id).unwrap();
      }

      if (result) {
        dispatch(togglePostLike({
          postId: post.id,
          isLiked: result.isLiked !== undefined ? result.isLiked : !wasLiked,
          likesCount: result.likesCount !== undefined ? result.likesCount : null
        }));
      }

    } catch (error) {
      console.error('Error toggling like:', error);

      // Revert optimistic update on error
      dispatch(togglePostLike({
        postId: post.id,
        isLiked: wasLiked,
        likesCount: currentLikesCount
      }));

      // Handle different error types
      if (error.status === 404) {
        alert('Post not found. Please refresh the page and try again.');
      } else if (error.status === 401) {
        alert('Please log in to like posts.');
      } else if (error.status === 400) {
        if (error.data?.error === 'Post already liked') {
          dispatch(togglePostLike({
            postId: post.id,
            isLiked: true,
            likesCount: currentLikesCount
          }));
        } else if (error.data?.error === 'Post not liked') {
          dispatch(togglePostLike({
            postId: post.id,
            isLiked: false,
            likesCount: currentLikesCount
          }));
        }
      } else if (error.status === 500) {
        alert('Server error occurred. Please try again later.');
      } else {
        alert('Failed to update like status. Please check your connection and try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [post.id]: false }));
    }
  }, [likePost, unlikePost, actionLoading, currentUser, dispatch]);

  // Handle save/unsave with optimistic updates
  const handleSave = useCallback(async (post) => {
    if (!post?.id || !currentUser) return;

    if (actionLoading[post.id]) return;

    setActionLoading(prev => ({ ...prev, [post.id]: true }));

    const wasSaved = post.isSaved;

    // Optimistic update
    dispatch(togglePostSave({
      postId: post.id,
      isSaved: !wasSaved
    }));

    try {
      let result;
      if (wasSaved) {
        result = await unsavePost(post.id).unwrap();
      } else {
        result = await savePost(post.id).unwrap();
      }

      if (result && typeof result.isSaved !== 'undefined') {
        dispatch(togglePostSave({
          postId: post.id,
          isSaved: result.isSaved
        }));
      }

    } catch (error) {
      console.error('Error toggling save:', error);

      // Revert optimistic update on error
      dispatch(togglePostSave({
        postId: post.id,
        isSaved: wasSaved
      }));

      if (error.status === 400) {
        if (error.data?.error === 'Post already saved') {
          dispatch(togglePostSave({
            postId: post.id,
            isSaved: true
          }));
        } else if (error.data?.error === 'Post not saved') {
          dispatch(togglePostSave({
            postId: post.id,
            isSaved: false
          }));
        }
      } else {
        alert('Failed to update save status. Please try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [post.id]: false }));
    }
  }, [savePost, unsavePost, actionLoading, currentUser, dispatch]);

  return {
    handleLike,
    handleSave,
    actionLoading,
  };
};

export default usePostActions;