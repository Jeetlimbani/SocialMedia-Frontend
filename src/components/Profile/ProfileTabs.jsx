import React, { useState, useCallback, useEffect } from 'react';
import { Box, Paper, Tab, Tabs, Typography, CircularProgress, Alert, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  useDeletePostMutation,
  useUpdatePostMutation,
  useGetSavedPostsQuery 
} from '../../features/profile/profileApi';
import { updatePostInState, removePost } from '../../features/profile/profileSlice';
import PostCard from './PostCard';
import CreatePostTab from './CreatePostTab';
import SavedPosts from './SavedPosts';
import Comments from './Comment';
import ChatInterface from './ChatInterface'; // New chat component
import usePostActions from '../../hooks/usePostActions';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ProfileTabs = ({
  tabValue,
  onTabChange,
  posts,
  isOwnProfile = false,
  isLoading = false,
  error = null,
}) => {
  const currentUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const { handleLike, handleSave, actionLoading } = usePostActions();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [commentsDialog, setCommentsDialog] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const handleComment = useCallback((post) => {
    console.log('Opening comments for post:', post.id);
    setSelectedPostForComments(post);
    setCommentsDialog(true);
  }, []);
  
  const handleCloseComments = useCallback(() => {
    setCommentsDialog(false);
    setSelectedPostForComments(null);
  }, []);

  const handlePostMenuOpen = useCallback((event, post) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedPost(post);
    setConfirmDeletePostId(post.id);
  }, []);

  const handlePostMenuClose = useCallback(() => {
    setMenuAnchor(null);
    if (!editDialog) {
      setSelectedPost(null);
    }
  }, [editDialog]);

  const handleEditPost = useCallback(() => {
    console.log('Edit post clicked, selectedPost:', selectedPost);
    if (selectedPost) {
      setEditContent(selectedPost.content || '');
      setEditDialog(true);
      setMenuAnchor(null);
    } else {
      console.error('No post selected for editing');
      alert('No post selected for editing');
    }
  }, [selectedPost]);

  const handleEditSubmit = useCallback(async () => {
    console.log('=== EDIT SUBMIT STARTED ===');
    console.log('selectedPost:', selectedPost);
    console.log('editContent:', editContent);
    console.log('editContent.trim():', editContent.trim());
    
    if (!selectedPost) {
      console.log('BLOCKED - No selected post');
      alert('No post selected for editing');
      return;
    }
    
    if (!editContent.trim()) {
      console.log('BLOCKED - Empty content');
      alert('Content cannot be empty');
      return;
    }
    
    if (editContent.length > 2000) {
      console.log('BLOCKED - Content too long');
      alert('Content exceeds 2000 characters');
      return;
    }
   
    console.log('Starting edit submit for post:', selectedPost.id);
    console.log('Edit content:', editContent.trim());
     
    try {
      const result = await updatePost({
        postId: selectedPost.id,
        content: editContent.trim()
      }).unwrap();
     
      console.log('API Response result:', result);
      console.log('Type of result:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));
     
      const updatedPost = {
        ...selectedPost,
        content: editContent.trim(),
        updatedAt: new Date().toISOString(),
        ...(result?.post || result || {})
      };
      
      console.log('Dispatching updated post:', updatedPost);
      dispatch(updatePostInState(updatedPost));
     
      console.log('Redux dispatch completed');
     
      setEditDialog(false);
      setEditContent('');
      setSelectedPost(null);
      
      console.log('Edit submit completed successfully');
      alert('Post updated successfully!');
      
    } catch (error) {
      console.error('Error updating post:', error);
      console.log('Full error object:', error);
      
      let errorMessage = 'Failed to update post. Please try again.';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  }, [selectedPost, editContent, updatePost, dispatch]);

  const handleEditCancel = useCallback(() => {
    console.log('Edit cancelled');
    setEditDialog(false);
    setEditContent('');
    setSelectedPost(null);
  }, []);

  const handleDeletePost = useCallback(() => {
    if (selectedPost) {
      setDeleteDialog(true);
      setMenuAnchor(null);
    } else {
      console.error('No post selected for deletion when attempting to open dialog.');
      alert('Could not prepare post for deletion. Please try again.');
      setMenuAnchor(null);
    }
  }, [selectedPost]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDeletePostId) {
      console.error('No post ID to delete. confirmDeletePostId is null.');
      setDeleteDialog(false);
      return;
    }

    console.log('Attempting to delete post with ID:', confirmDeletePostId);

    try {
      const result = await deletePost(confirmDeletePostId).unwrap();
      console.log('Delete API response:', result);

      dispatch(removePost(confirmDeletePostId));
      console.log('Post removed from Redux state');

      setDeleteDialog(false);
      setConfirmDeletePostId(null);
      setSelectedPost(null);
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);

      if (error.status === 404) {
        alert('Post not found. It may have already been deleted.');
        dispatch(removePost(confirmDeletePostId));
        setDeleteDialog(false);
        setConfirmDeletePostId(null);
        setSelectedPost(null);
      } else if (error.status === 403) {
        alert('You do not have permission to delete this post.');
      } else if (error.status === 401) {
        alert('Please log in to delete posts.');
      } else if (error.originalStatus === 'PARSING_ERROR' || error.status === 204) {
        console.log('Parsing error/No Content - might be successful delete with empty response');
        dispatch(removePost(confirmDeletePostId));
        setDeleteDialog(false);
        setConfirmDeletePostId(null);
        setSelectedPost(null);
        alert('Post deleted successfully!');
      } else {
        alert(`Failed to delete post: ${error.data?.message || error.message || 'Unknown error'}`);
      }
    } finally {
      if (confirmDeletePostId) {
        // setActionLoading(prev => ({ ...prev, [confirmDeletePostId]: false }));
      }
      setConfirmDeletePostId(null);
    }
  }, [confirmDeletePostId, deletePost, dispatch]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog(false);
    setConfirmDeletePostId(null);
    setSelectedPost(null);
  }, []);

  const canEditPost = useCallback((post) => {
    if (!currentUser || !post) {
      return false;
    }

    const currentUserId = String(currentUser.id || currentUser._id);
    const postAuthorId = String(
      post.authorId ||
      post.userId ||
      post.author?.id ||
      post.author?._id ||
      post.createdBy ||
      ''
    );

    return currentUserId === postAuthorId || isOwnProfile;
  }, [currentUser, isOwnProfile]);

  if (error) {
    return (
      <Paper sx={{ borderRadius: 3, p: 3 }}>
        <Alert severity="error">
          {error.message || 'Failed to load posts'}
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={onTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Posts" />
          <Tab label="Create Post"/>
          <Tab label="Saved" />
          {/* Add Messages tab only for own profile */}
          {isOwnProfile && <Tab label="Messages" />}
        </Tabs>
        
        <TabPanel value={tabValue} index={1}>
          <CreatePostTab 
            onPostCreated={(newPost) => {
              console.log('New post created:', newPost);
            }}
            onTabChange={onTabChange}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <SavedPosts />
        </TabPanel>

        {/* Messages Tab - only show if own profile */}
        {isOwnProfile && (
          <TabPanel value={tabValue} index={3}>
            <ChatInterface />
          </TabPanel>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => {
                const canEdit = canEditPost(post);

                return (
                  <Box key={post.id} sx={{ mb: 2, position: 'relative' }}>
                    <PostCard
                      post={post}
                      onLike={() => handleLike(post)}
                      onComment={() => handleComment(post)}
                      onSave={() => handleSave(post)}
                      showActions={true}
                      isActionLoading={actionLoading[post.id]}
                    />

                    {canEdit && (
                       <IconButton
                         onClick={(e) => handlePostMenuOpen(e, post)}
                         sx={{
                           position: 'absolute',
                           top: 8,
                           right: 8,
                           backgroundColor: 'rgba(255, 255, 255, 0.8)',
                           '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.9)',
                           }
                         }}
                         size="small"
                       >
                         <MoreVertIcon />
                       </IconButton>
                    )}
                  </Box>
                );
              })
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {isOwnProfile ? 'You haven\'t posted anything yet' : 'No posts yet'}
                </Typography>
                {isOwnProfile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Share your first post to get started!
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Post Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handlePostMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditPost}>
          Edit Post
        </MenuItem>
        <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
          Delete Post
        </MenuItem>
      </Menu>

      {/* Edit Post Dialog */}
      <Dialog
        open={editDialog}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={editContent}
            onChange={(e) => {
              console.log('TextField onChange:', e.target.value);
              setEditContent(e.target.value);
            }}
            placeholder="What's on your mind?"
            inputProps={{ maxLength: 2000 }}
            helperText={`${editContent.length}/2000 characters`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log('Update button clicked');
              console.log('Button disabled?', !editContent.trim() || editContent.length > 2000);
              console.log('selectedPost at button click:', selectedPost);
              handleEditSubmit();
            }}
            variant="contained"
            disabled={!editContent.trim() || editContent.length > 2000}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="sm"
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
          {selectedPost ? (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Post content: "{selectedPost.content?.substring(0, 100)}..."
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No post content available for preview.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={isDeletingPost}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeletingPost || !confirmDeletePostId}
          >
            {isDeletingPost ? (
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

      {/* Comments Dialog */}
      <Comments
        open={commentsDialog}
        onClose={handleCloseComments}
        postId={selectedPostForComments?.id}
        postTitle={selectedPostForComments?.content?.substring(0, 50) + '...' || 'Post'}
      />
    </>
  );
};

export default ProfileTabs;

