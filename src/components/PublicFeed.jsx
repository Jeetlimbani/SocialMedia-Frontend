// components/PublicFeed.jsx - Refactored to use PostCard component
import React, { useState, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Skeleton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
// Import from the consolidated API slice instead
import { useGetPublicFeedQuery } from '../features/profile/publicFeedApi';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation
} from '../features/profile/profileApi';
import { togglePostLike, togglePostSave } from '../features/profile/profileSlice';
import Comments from './Profile/Comment'; // Import Comments component
import PostCard from './Profile/PostCard'; // Import the existing PostCard component

const PostSkeleton = () => (
  <Card sx={{ mb: 2, borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ ml: 2, flexGrow: 1 }}>
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
      </Box>
      <Skeleton variant="text" width="100%" height={20} />
      <Skeleton variant="text" width="80%" height={20} />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Skeleton variant="text" width={60} height={24} />
        <Skeleton variant="text" width={60} height={24} />
      </Box>
    </CardContent>
  </Card>
);

// Enhanced PostCard wrapper for PublicFeed specific features
const PublicFeedPostCard = ({ post, onLoginPrompt, onLike, onComment, onSave, isActionLoading }) => {
  const currentUser = useSelector(state => state.auth.user);
  const isLoggedIn = !!currentUser;

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:4000';
    return `${baseUrl}${avatarPath}`;
  };

  const handleAction = (actionCallback) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    actionCallback();
  };

  // Enhance the post object with additional UI properties
  const enhancedPost = {
    ...post,
    // Add time ago formatting if needed
    timeAgo: post.timeAgo || new Date(post.createdAt).toLocaleDateString(),
    // Ensure proper structure for PostCard
    author: {
      ...post.author,
      name: `${post.author.firstName} ${post.author.lastName}`,
      username: post.author.username
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        {/* Post Header with Author info and Follow button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={getAvatarUrl(post.author.avatar)}
            sx={{ width: 40, height: 40 }}
          >
            {post.author.firstName?.[0]}{post.author.lastName?.[0]}
          </Avatar>
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {post.author.firstName} {post.author.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{post.author.username} • {enhancedPost.timeAgo}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            color="primary"
            onClick={onLoginPrompt}
            title={isLoggedIn ? "Follow" : "Login to follow"}
          >
            <PersonAddIcon />
          </IconButton>
        </Box>

        {/* Use the existing PostCard component for the main content */}
        <PostCard
          post={enhancedPost}
          onLike={() => handleAction(onLike)}
          onComment={() => handleAction(onComment)}
          onSave={isLoggedIn ? () => handleAction(onSave) : null}
          showActions={true}
        />
      </CardContent>
    </Card>
  );
};

const PublicFeed = ({ onLoginPrompt }) => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [commentsDialog, setCommentsDialog] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  // Get current user from Redux store
  const currentUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  // API mutations
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  const {
    data: feedData,
    isLoading,
    error,
    isFetching
  } = useGetPublicFeedQuery({ page, limit: 10 });

  // Append new posts when page changes
  React.useEffect(() => {
    if (feedData?.posts) {
      if (page === 1) {
        setAllPosts(feedData.posts);
      } else {
        setAllPosts(prev => [...prev, ...feedData.posts]);
      }
    }
  }, [feedData, page]);

  const handleCommentCountChange = useCallback((postId, action) => {
    setAllPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentCount = post.commentsCount || post._count?.comments || 0;
          const newCount = action === 'increment' 
            ? currentCount + 1 
            : Math.max(currentCount - 1, 0);
          
          return {
            ...post,
            commentsCount: newCount,
            _count: post._count ? { ...post._count, comments: newCount } : undefined
          };
        }
        return post;
      })
    );
  }, []);
  // Handle like/unlike with optimistic updates
  const handleLike = useCallback(async (post) => {
    if (!post?.id || !currentUser) return;

    // Prevent double-clicking
    if (actionLoading[post.id]) return;

    setActionLoading(prev => ({ ...prev, [post.id]: true }));

    const wasLiked = post.isLiked;
    const currentLikesCount = post.likesCount || 0;

    // Optimistic update - update local state
    setAllPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === post.id 
          ? {
              ...p,
              isLiked: !wasLiked,
              likesCount: wasLiked ? Math.max(currentLikesCount - 1, 0) : currentLikesCount + 1
            }
          : p
      )
    );

    // Update Redux state for consistency across components
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

      // Update with server response if available
      if (result) {
        const newLikesCount = result.likesCount !== undefined ? result.likesCount : null;
        const newIsLiked = result.isLiked !== undefined ? result.isLiked : !wasLiked;
        
        // Update local state
        setAllPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === post.id 
              ? {
                  ...p,
                  isLiked: newIsLiked,
                  ...(newLikesCount !== null && { likesCount: newLikesCount })
                }
              : p
          )
        );

        // Update Redux state
        dispatch(togglePostLike({
          postId: post.id,
          isLiked: newIsLiked,
          likesCount: newLikesCount
        }));
      }

    } catch (error) {
      console.error('Error toggling like:', error);

      // Revert optimistic update on error in both local and Redux state
      setAllPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? {
                ...p,
                isLiked: wasLiked,
                likesCount: currentLikesCount
              }
            : p
        )
      );

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
          const correctedState = { isLiked: true, likesCount: currentLikesCount };
          setAllPosts(prevPosts => 
            prevPosts.map(p => 
              p.id === post.id ? { ...p, ...correctedState } : p
            )
          );
          dispatch(togglePostLike({ postId: post.id, ...correctedState }));
        } else if (error.data?.error === 'Post not liked') {
          const correctedState = { isLiked: false, likesCount: currentLikesCount };
          setAllPosts(prevPosts => 
            prevPosts.map(p => 
              p.id === post.id ? { ...p, ...correctedState } : p
            )
          );
          dispatch(togglePostLike({ postId: post.id, ...correctedState }));
        }
      } else {
        alert('Failed to update like status. Please check your connection and try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [post.id]: false }));
    }
  }, [likePost, unlikePost, actionLoading, currentUser, dispatch]);

  // Handle save/unsave with proper Redux state synchronization
  const handleSave = useCallback(async (post) => {
    if (!post?.id || !currentUser) return;

    // Prevent double-clicking
    if (actionLoading[post.id]) return;

    setActionLoading(prev => ({ ...prev, [post.id]: true }));

    const wasSaved = post.isSaved;

    // Optimistic update - update local state
    setAllPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === post.id 
          ? { ...p, isSaved: !wasSaved }
          : p
      )
    );

    // Update Redux state immediately for consistency
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

      // Update with server response if available
      if (result && typeof result.isSaved !== 'undefined') {
        // Update local state
        setAllPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === post.id 
              ? { ...p, isSaved: result.isSaved }
              : p
          )
        );

        // Update Redux state
        dispatch(togglePostSave({
          postId: post.id,
          isSaved: result.isSaved
        }));
      }

    } catch (error) {
      console.error('Error toggling save:', error);

      // Revert optimistic update on error in both local and Redux state
      setAllPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { ...p, isSaved: wasSaved }
            : p
        )
      );

      dispatch(togglePostSave({
        postId: post.id,
        isSaved: wasSaved
      }));

      if (error.status === 400) {
        if (error.data?.error === 'Post already saved') {
          const correctedState = { isSaved: true };
          setAllPosts(prevPosts => 
            prevPosts.map(p => 
              p.id === post.id ? { ...p, ...correctedState } : p
            )
          );
          dispatch(togglePostSave({ postId: post.id, ...correctedState }));
        } else if (error.data?.error === 'Post not saved') {
          const correctedState = { isSaved: false };
          setAllPosts(prevPosts => 
            prevPosts.map(p => 
              p.id === post.id ? { ...p, ...correctedState } : p
            )
          );
          dispatch(togglePostSave({ postId: post.id, ...correctedState }));
        }
      } else {
        alert('Failed to update save status. Please try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [post.id]: false }));
    }
  }, [savePost, unsavePost, actionLoading, currentUser, dispatch]);

  // Handle comment action
  const handleComment = useCallback((post) => {
    console.log('Opening comments for post:', post.id);
    setSelectedPostForComments(post);
    setCommentsDialog(true);
  }, []);

  // Handle closing comments dialog
  const handleCloseComments = useCallback(() => {
    setCommentsDialog(false);
    setSelectedPostForComments(null);
  }, []);

  const handleLoadMore = () => {
    if (feedData?.hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Discover Posts
        </Typography>
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Alert severity="error">
          Failed to load posts: {error?.data?.error || error?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Discover Posts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            See what's happening around the world
          </Typography>
        </Box>

        {allPosts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No posts available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share something!
            </Typography>
          </Box>
        ) : (
          <>
            {allPosts.map((post) => (
              <PublicFeedPostCard
                key={post.id}
                post={post}
                onLoginPrompt={onLoginPrompt}
                onLike={() => handleLike(post)}
                onComment={() => handleComment(post)}
                onSave={() => handleSave(post)}
                isActionLoading={actionLoading[post.id]}
              />
            ))}

            {/* Load More Button */}
            {feedData?.hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  startIcon={isFetching ? <CircularProgress size={16} /> : null}
                >
                  {isFetching ? 'Loading...' : 'Load More Posts'}
                </Button>
              </Box>
            )}

            {!feedData?.hasMore && allPosts.length > 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  You've reached the end of the feed
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Comments Dialog */}
      <Comments
        open={commentsDialog}
        onClose={handleCloseComments}
        postId={selectedPostForComments?.id}
        postTitle={selectedPostForComments?.content?.substring(0, 50) + '...' || 'Post'}
        onCommentCountChange={handleCommentCountChange} // Add this line
      />
    </>
  );
};

export default PublicFeed;