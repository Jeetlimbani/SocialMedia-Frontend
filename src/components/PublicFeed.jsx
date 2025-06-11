import React, { useState, useCallback } from 'react';
import { Container, Box, Typography, Alert, useTheme, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

// Import from the consolidated API slice
import { useGetPublicFeedQuery } from '../features/profile/publicFeedApi';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
} from '../features/profile/profileApi';
import { togglePostLike, togglePostSave } from '../features/profile/profileSlice';

// Import newly separated components
import PostSkeleton from './PostSkeleton';
import PublicFeedPostCardWrapper from './PublicFeedPostCardWrapper';
import PostList from './PostList'; // This will replace direct mapping of allPosts
import CommentsDialog from './CommentsDialog'; // This will encapsulate Comments component

const PublicFeed = ({ onLoginPrompt }) => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [actionLoading, setActionLoading] = useState({}); // For optimistic updates
  const [commentsDialog, setCommentsDialog] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  const {
    data: feedData,
    isLoading,
    error,
    isFetching,
  } = useGetPublicFeedQuery({ page, limit: 10 });

  // Append new posts when page changes
  React.useEffect(() => {
    if (feedData?.posts) {
      if (page === 1) {
        setAllPosts(feedData.posts);
      } else {
        setAllPosts((prev) => {
          // Filter out duplicates if present (e.g., from refetching page 1 after load more)
          const newPosts = feedData.posts.filter(
            (newPost) => !prev.some((existingPost) => existingPost.id === newPost.id)
          );
          return [...prev, ...newPosts];
        });
      }
    }
  }, [feedData, page]);

  const handleCommentCountChange = useCallback((postId, action) => {
    setAllPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const currentCount = post.commentsCount || post._count?.comments || 0;
          const newCount =
            action === 'increment' ? currentCount + 1 : Math.max(currentCount - 1, 0);

          return {
            ...post,
            commentsCount: newCount,
            _count: post._count ? { ...post._count, comments: newCount } : undefined,
          };
        }
        return post;
      })
    );
  }, []);

  const handleLike = useCallback(
    async (post) => {
      if (!post?.id || !currentUser) return;
      if (actionLoading[post.id]) return;

      setActionLoading((prev) => ({ ...prev, [post.id]: true }));
      const wasLiked = post.isLiked;
      const currentLikesCount = post.likesCount || 0;

      // Optimistic update
      setAllPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLiked: !wasLiked,
                likesCount: wasLiked ? Math.max(currentLikesCount - 1, 0) : currentLikesCount + 1,
              }
            : p
        )
      );
      dispatch(
        togglePostLike({
          postId: post.id,
          isLiked: !wasLiked,
          likesCount: wasLiked ? Math.max(currentLikesCount - 1, 0) : currentLikesCount + 1,
        })
      );

      try {
        const result = await (wasLiked ? unlikePost(post.id) : likePost(post.id)).unwrap();
        const newLikesCount = result.likesCount !== undefined ? result.likesCount : null;
        const newIsLiked = result.isLiked !== undefined ? result.isLiked : !wasLiked;

        setAllPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  isLiked: newIsLiked,
                  ...(newLikesCount !== null && { likesCount: newLikesCount }),
                }
              : p
          )
        );
        dispatch(
          togglePostLike({ postId: post.id, isLiked: newIsLiked, likesCount: newLikesCount })
        );
      } catch (error) {
        console.error('Error toggling like:', error);
        setAllPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id ? { ...p, isLiked: wasLiked, likesCount: currentLikesCount } : p
          )
        );
        dispatch(
          togglePostLike({ postId: post.id, isLiked: wasLiked, likesCount: currentLikesCount })
        );
        alert(
          `Failed to update like status: ${error.data?.error || error.message || 'Unknown error'}`
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [post.id]: false }));
      }
    },
    [likePost, unlikePost, actionLoading, currentUser, dispatch]
  );

  const handleSave = useCallback(
    async (post) => {
      if (!post?.id || !currentUser) return;
      if (actionLoading[post.id]) return;

      setActionLoading((prev) => ({ ...prev, [post.id]: true }));
      const wasSaved = post.isSaved;

      // Optimistic update
      setAllPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === post.id ? { ...p, isSaved: !wasSaved } : p))
      );
      dispatch(togglePostSave({ postId: post.id, isSaved: !wasSaved }));

      try {
        const result = await (wasSaved ? unsavePost(post.id) : savePost(post.id)).unwrap();
        if (result && typeof result.isSaved !== 'undefined') {
          setAllPosts((prevPosts) =>
            prevPosts.map((p) => (p.id === post.id ? { ...p, isSaved: result.isSaved } : p))
          );
          dispatch(togglePostSave({ postId: post.id, isSaved: result.isSaved }));
        }
      } catch (error) {
        console.error('Error toggling save:', error);
        setAllPosts((prevPosts) =>
          prevPosts.map((p) => (p.id === post.id ? { ...p, isSaved: wasSaved } : p))
        );
        dispatch(togglePostSave({ postId: post.id, isSaved: wasSaved }));
        alert(
          `Failed to update save status: ${error.data?.error || error.message || 'Unknown error'}`
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [post.id]: false }));
      }
    },
    [savePost, unsavePost, actionLoading, currentUser, dispatch]
  );

  const handleComment = useCallback((post) => {
    setSelectedPostForComments(post);
    setCommentsDialog(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentsDialog(false);
    setSelectedPostForComments(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (feedData?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [feedData, isFetching]);

  if (isLoading && page === 1) {
    return (
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant={isSmallScreen ? 'h6' : 'h5'}
            gutterBottom
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
          >
            Discover Posts
          </Typography>
        </Box>
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Alert
          severity="error"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '& .MuiAlert-message': {
              padding: { xs: '4px 0', sm: '8px 0' },
            },
          }}
        >
          Failed to load posts: {error?.data?.error || error?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            mb: { xs: 2, sm: 3 },
            textAlign: { xs: 'left', sm: 'left' },
          }}
        >
          <Typography
            variant={isSmallScreen ? 'h6' : 'h5'}
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              fontWeight: { xs: 600, sm: 700 },
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            Discover Posts
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              display: { xs: 'block', sm: 'block' },
            }}
          >
            See what's happening around the world
          </Typography>
        </Box>

        {/* Posts Content */}
        <PostList
          posts={allPosts}
          hasMore={feedData?.hasMore}
          isFetching={isFetching}
          onLoadMore={handleLoadMore}
          onLoginPrompt={onLoginPrompt}
          onLike={handleLike}
          onComment={handleComment}
          onSave={handleSave}
          actionLoading={actionLoading}
        />
      </Container>

      {/* Comments Dialog */}
      <CommentsDialog
        open={commentsDialog}
        onClose={handleCloseComments}
        postId={selectedPostForComments?.id}
        postTitle={selectedPostForComments?.content?.substring(0, 50) + '...' || 'Post'}
        onCommentCountChange={handleCommentCountChange}
      />
    </>
  );
};

export default PublicFeed;
