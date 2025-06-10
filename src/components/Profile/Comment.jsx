import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../../features/profile/commentsApi';
import { incrementCommentCount, decrementCommentCount } from '../../features/profile/profileSlice';

const Comments = ({ 
  open, 
  onClose, 
  postId, 
  postTitle = "Post" ,
  onCommentCountChange 
}) => {
  const currentUser = useSelector(state => state.auth.user);

  const dispatch = useDispatch();
  
  // Local state
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [apiError, setApiError] = useState(null);

  // RTK Query hooks with enhanced error handling
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments,
    isError: hasCommentsError,
  } = useGetCommentsQuery(
    { postId, page, limit: 20, sort: sortBy },
    { 
      skip: !open || !postId,
      retry: (failureCount, error) => {
        // Don't retry on 404 or client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      }
    }
  );

  const [addComment, { isLoading: isAddingComment, error: addCommentError }] = useAddCommentMutation();
  const [updateComment, { isLoading: isUpdatingComment, error: updateCommentError }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment, error: deleteCommentError }] = useDeleteCommentMutation();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPage(1);
      setNewComment('');
      setEditingCommentId(null);
      setEditContent('');
      setApiError(null);
      handleMenuClose();
    }
  }, [open, postId]);

  // Handle adding new comment
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !currentUser || isAddingComment || !postId) return;

    try {
      setApiError(null);
      const result = await addComment({
        postId,
        content: newComment.trim(),
      }).unwrap();
      
      console.log('Comment added successfully:', result);
      setNewComment('');
      
      // Update Redux store
      dispatch(incrementCommentCount(postId));
      
      // Update parent component's local state immediately
      if (onCommentCountChange) {
        onCommentCountChange(postId, 'increment');
      }

      await refetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      // Error is handled by useEffect above
    }
  }, [newComment, postId, currentUser, isAddingComment, addComment, refetchComments, dispatch, onCommentCountChange]);

  // Handle delete comment - FIXED VERSION
  const handleConfirmDelete = useCallback(async () => {
    if (!commentToDelete || isDeletingComment || !postId) return;

    try {
      setApiError(null);
      const result = await deleteComment({
        postId,
        commentId: commentToDelete.id,
      }).unwrap();
      
      console.log('Comment deleted successfully:', result);
      
      // Update Redux store
      dispatch(decrementCommentCount(postId));
      
      // Update parent component's local state immediately
      if (onCommentCountChange) {
        onCommentCountChange(postId, 'decrement');
      }
      
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
      await refetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Error is handled by useEffect above
    }
  }, [commentToDelete, postId, isDeletingComment, deleteComment, refetchComments, dispatch, onCommentCountChange]);

  // Handle comment menu
  const handleMenuOpen = useCallback((event, comment) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  }, []);

  // Handle edit comment
  const handleEditComment = useCallback(() => {
    if (selectedComment) {
      setEditingCommentId(selectedComment.id);
      setEditContent(selectedComment.content);
      setApiError(null);
    }
    handleMenuClose();
  }, [selectedComment, handleMenuClose]);

  const handleUpdateComment = useCallback(async () => {
    if (!editContent.trim() || !editingCommentId || isUpdatingComment || !postId) return;

    try {
      setApiError(null);
      const result = await updateComment({
        postId,
        commentId: editingCommentId,
        content: editContent.trim(),
      }).unwrap();
      
      console.log('Comment updated successfully:', result);
      setEditingCommentId(null);
      setEditContent('');
      await refetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      // Error is handled by useEffect above
    }
  }, [editContent, editingCommentId, postId, isUpdatingComment, updateComment, refetchComments]);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditContent('');
    setApiError(null);
  }, []);

  // Handle delete comment
  const handleDeleteComment = useCallback(() => {
    if (selectedComment) {
      setCommentToDelete(selectedComment);
      setDeleteConfirmOpen(true);
      setApiError(null);
    }
    handleMenuClose();
  }, [selectedComment, handleMenuClose]);



  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setCommentToDelete(null);
    setApiError(null);
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setApiError(null);
    try {
      await refetchComments();
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  }, [refetchComments]);

  // Check if user can edit/delete comment
  const canModifyComment = useCallback((comment) => {
    if (!currentUser || !comment) return false;
    
    const currentUserId = String(currentUser.id || currentUser._id);
    const commentUserId = String(
      comment.userId || 
      comment.authorId || 
      comment.user?.id || 
      comment.user?._id ||
      comment.createdBy || 
      ''
    );
    
    return currentUserId === commentUserId;
  }, [currentUser]);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (isNaN(diffMs)) return 'Invalid date';
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);


  // Handle key press for adding comment
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleAddComment();
    }
  }, [handleAddComment]);

  // Handle key press for editing comment
  const handleEditKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleUpdateComment();
    }
    if (event.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleUpdateComment, handleCancelEdit]);

  // Safe data extraction with fallbacks
  const comments = Array.isArray(commentsData?.comments) ? commentsData.comments : [];
  const totalComments = commentsData?.total || 0;
  const hasMore = commentsData?.hasMore || false;
  console.log(comments);
  // Check if we should show the login prompt
  const showLoginPrompt = !currentUser && open;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box>
            <Typography variant="h6" component="div">
              Comments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'} on {postTitle}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={handleRefresh} 
              size="small" 
              disabled={isLoadingComments}
              title="Refresh comments"
            >
              <RefreshIcon />
            </IconButton>
            <Chip
              label={sortBy === 'newest' ? 'Newest' : 'Oldest'}
              variant="outlined"
              size="small"
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              sx={{ cursor: 'pointer' }}
              disabled={isLoadingComments}
            />
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ flex: 1, overflow: 'auto', py: 2 }}>
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleRefresh}
                  disabled={isLoadingComments}
                >
                  Retry
                </Button>
              }
            >
              {apiError}
            </Alert>
          )}

          {showLoginPrompt && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please log in to view and post comments.
            </Alert>
          )}

          {isLoadingComments ? (
            <Box sx={{ space: 2 }}>
              {[...Array(3)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="100%" height={16} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : comments.length === 0 && !hasCommentsError ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No comments yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to share your thoughts!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ space: 2 }}>
              {comments.map((comment) => (
                <Paper key={comment.id || comment._id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      src={comment.user?.avatar || comment.user?.profilePicture}
                      alt={comment.user?.name || comment.user?.username}
                      sx={{ width: 40, height: 40 }}
                    >
                      {(comment.user?.name || comment.user?.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                          {comment.user?.username || comment.user?.name || comment.author?.username || comment.author?.name || 'Anonymous'}


                          </Typography>
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                            {formatDate(comment.createdAt)}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                              <span> (edited)</span>
                            )}
                          </Typography>
                        </Box>
                        
                        {canModifyComment(comment) && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, comment)}
                            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      
                      {editingCommentId === (comment.id || comment._id) ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edit your comment..."
                            variant="outlined"
                            size="small"
                            onKeyDown={handleEditKeyPress}
                            inputProps={{ maxLength: 1000 }}
                            helperText={`${editContent.length}/1000 characters`}
                            autoFocus
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              onClick={handleUpdateComment}
                              disabled={!editContent.trim() || isUpdatingComment}
                              variant="contained"
                            >
                              {isUpdatingComment ? 'Updating...' : 'Update'}
                            </Button>
                            <Button
                              size="small"
                              onClick={handleCancelEdit}
                              disabled={isUpdatingComment}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                          {comment.content || 'No content'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
              
              {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={isLoadingComments}
                  >
                    {isLoadingComments ? 'Loading...' : 'Load More Comments'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <Divider />

        {currentUser && (
          <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar
                src={currentUser?.avatar || currentUser?.profilePicture}
                alt={currentUser?.name || currentUser?.username}
                sx={{ width: 40, height: 40, mt: 1 }}
              >
                {(currentUser?.name || currentUser?.username || 'U').charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  variant="outlined"
                  size="small"
                  onKeyDown={handleKeyPress}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${newComment.length}/1000 characters • Press Ctrl+Enter to post`}
                  disabled={!postId}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser?.name || currentUser?.username || 'Anonymous'}
                  </Typography>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment || !postId}
                    variant="contained"
                    startIcon={isAddingComment ? <CircularProgress size={16} /> : <SendIcon />}
                    size="small"
                  >
                    {isAddingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </DialogActions>
        )}
      </Dialog>

      {/* Comment Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEditComment}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Comment
        </MenuItem>
        <MenuItem onClick={handleDeleteComment} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Comment
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
          {commentToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                "{(commentToDelete.content || '').substring(0, 100)}..."
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={isDeletingComment}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeletingComment}
          >
            {isDeletingComment ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Comments;  