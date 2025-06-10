import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
  Chip,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetSavedPostsQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useUnsavePostMutation
} from '../../features/profile/profileApi';
import { togglePostLike, togglePostSave } from '../../features/profile/profileSlice';
import PostCard from './PostCard';
import Comments from './Comment';

const SavedPosts = () => {
  const currentUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSavedPost, setSelectedSavedPost] = useState(null);
  const [unsaveDialog, setUnsaveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [commentsDialog, setCommentsDialog] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const {
    data: savedPostsData,
    isLoading,
    error,
    refetch
  } = useGetSavedPostsQuery({
    page: currentPage,
    limit: postsPerPage
  });

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation();

  const handleLike = useCallback(async (post) => {
    if (!post?.id || !currentUser) return;
    if (actionLoading[post.id]) return;

    setActionLoading(prev => ({ ...prev, [post.id]: true }));
    const wasLiked = post.isLiked;
    const currentLikesCount = post.likesCount || 0;

    dispatch(togglePostLike({
      postId: post.id,
      isLiked: !wasLiked,
      likesCount: wasLiked ? Math.max(currentLikesCount - 1, 0) : currentLikesCount + 1
    }));

    try {
      const result = wasLiked ? await unlikePost(post.id).unwrap() : await likePost(post.id).unwrap();
      if (result) {
        dispatch(togglePostLike({
          postId: post.id,
          isLiked: result.isLiked ?? !wasLiked,
          likesCount: result.likesCount ?? null
        }));
      }
    } catch (error) {
      dispatch(togglePostLike({
        postId: post.id,
        isLiked: wasLiked,
        likesCount: currentLikesCount
      }));
      alert('Failed to update like status.');
    } finally {
      setActionLoading(prev => ({ ...prev, [post.id]: false }));
    }
  }, [likePost, unlikePost, actionLoading, currentUser, dispatch]);

  // Handle opening comments dialog
  const handleComment = useCallback((postId) => {
    const savedPost = savedPostsData?.savedPosts?.find(sp => sp.post.id === postId);
    if (savedPost) {
      setSelectedPostForComments(savedPost.post);
      setCommentsDialog(true);
    }
  }, [savedPostsData?.savedPosts]);

  // Handle closing comments dialog
  const handleCloseComments = useCallback(() => {
    setCommentsDialog(false);
    setSelectedPostForComments(null);
  }, []);

  // Handle comment count changes from the Comments component
  const handleCommentCountChange = useCallback((postId, action) => {
    // This function can be used to update local state if needed
    // For now, we'll rely on the Redux store updates from the Comments component
    console.log(`Comment count ${action} for post ${postId}`);
  }, []);

  const handlePostMenuOpen = useCallback((event, savedPost) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedSavedPost(savedPost);
  }, []);

  const handlePostMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleUnsaveFromMenu = useCallback(() => {
    if (selectedSavedPost?.post?.id) {
      setUnsaveDialog(true);
    }
    handlePostMenuClose();
  }, [selectedSavedPost, handlePostMenuClose]);

  const handleUnsaveConfirm = useCallback(async () => {
    const postId = selectedSavedPost?.post?.id;
    if (!postId) {
      setUnsaveDialog(false);
      return;
    }

    try {
      await unsavePost(postId).unwrap();
      dispatch(togglePostSave({ postId, isSaved: false }));
      await refetch();
    } catch (error) {
      if (error.status === 400 && error.data?.error === 'Post not saved') {
        dispatch(togglePostSave({ postId, isSaved: false }));
        await refetch();
      } else {
        alert('Failed to remove post from saved.');
      }
    } finally {
      setUnsaveDialog(false);
      setSelectedSavedPost(null);
    }
  }, [selectedSavedPost, unsavePost, refetch, dispatch]);

  const handleUnsaveCancel = useCallback(() => {
    setUnsaveDialog(false);
    setSelectedSavedPost(null);
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
  }, []);

  const formatSavedDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? 'Saved today' :
           diffDays <= 7 ? `Saved ${diffDays} days ago` :
           `Saved on ${date.toLocaleDateString()}`;
  }, []);

  useEffect(() => {
    if (savedPostsData?.pagination && currentPage > savedPostsData.pagination.totalPages) {
      setCurrentPage(1);
    }
  }, [savedPostsData?.pagination, currentPage]);

  if (!currentUser) {
    return (
      <Paper sx={{ borderRadius: 3, p: 3 }}>
        <Alert severity="warning">Please log in to view your saved posts.</Alert>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ borderRadius: 3, p: 3 }}>
        <Alert 
          severity="error" 
          action={<Button color="inherit" size="small" onClick={refetch}>Retry</Button>}
        >
          {error.data?.error || error.error || 'Failed to load saved posts'}
        </Alert>
      </Paper>
    );
  }

  const savedPosts = savedPostsData?.savedPosts || [];
  const pagination = savedPostsData?.pagination || {};

  return (
    <>
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookmarkIcon color="primary" />
              <Typography variant="h6" fontWeight="medium">Saved Posts</Typography>
              {pagination.total > 0 && (
                <Chip label={`${pagination.total} saved`} size="small" variant="outlined" />
              )}
            </Box>
            {savedPosts.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={refetch}
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
              >
                Refresh
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : savedPosts.length > 0 ? (
            <>
              {savedPosts.map((savedPost) => (
                <Box key={savedPost.id} sx={{ mb: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BookmarkBorderIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatSavedDate(savedPost.savedAt)}
                    </Typography>
                  </Box>

                  <PostCard
                    post={savedPost.post}
                    onLike={() => handleLike(savedPost.post)}
                    onComment={() => handleComment(savedPost.post.id)}
                    showActions={true}
                    isActionLoading={actionLoading[savedPost.post.id]}
                  />

                  <IconButton
                    onClick={(e) => handlePostMenuOpen(e, savedPost)}
                    sx={{
                      position: 'absolute',
                      top: 32,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                    }}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              ))}

              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No saved posts yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posts you save will appear here for easy access later.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Menu for post actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handlePostMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleUnsaveFromMenu} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Remove from Saved
        </MenuItem>
      </Menu>

      {/* Unsave confirmation dialog */}
      <Dialog open={unsaveDialog} onClose={handleUnsaveCancel} maxWidth="sm">
        <DialogTitle>Remove from Saved</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this post from your saved collection?
          </Typography>
          {selectedSavedPost?.post && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Post: "{selectedSavedPost.post.content?.substring(0, 100)}..."
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                By {selectedSavedPost.post.author?.firstName} {selectedSavedPost.post.author?.lastName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUnsaveCancel} disabled={isUnsaving}>Cancel</Button>
          <Button
            onClick={handleUnsaveConfirm}
            color="error"
            variant="contained"
            disabled={isUnsaving}
          >
            {isUnsaving ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Removing...
              </>
            ) : (
              'Remove'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Comments
        open={commentsDialog}
        onClose={handleCloseComments}
        postId={selectedPostForComments?.id}
        postTitle={selectedPostForComments?.content?.substring(0, 50) + '...' || 'Post'}
        onCommentCountChange={handleCommentCountChange}
      />
    </>
  );
};

export default SavedPosts;