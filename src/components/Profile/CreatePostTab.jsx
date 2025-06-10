import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  PhotoCamera,
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useCreatePostMutation } from '../../features/profile/profileApi';

const CreatePostTab = ({ onPostCreated }) => {
  const currentUser = useSelector(state => state.auth.user);
  const [createPost, { isLoading, error }] = useCreatePostMutation();

  // Form state
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Validation state
  const [contentError, setContentError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Constants
  const MAX_CONTENT_LENGTH = 2000;
  const MAX_IMAGES = 4;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Handle content change with validation
  const handleContentChange = useCallback((e) => {
    const value = e.target.value;
    setContent(value);
    
    if (value.length > MAX_CONTENT_LENGTH) {
      setContentError(`Content too long (max ${MAX_CONTENT_LENGTH} characters)`);
    } else {
      setContentError('');
    }
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  }, [submitError]);

  // Handle image selection
  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > MAX_IMAGES) {
      setSubmitError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate each file
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name}: Invalid file type`);
      } else if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name}: File too large (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setSubmitError(`Invalid files: ${invalidFiles.join(', ')}`);
      return;
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setSubmitError('');
    
    // Clear the input
    e.target.value = '';
  }, [selectedImages.length]);

  // Remove image
  const handleRemoveImage = useCallback((index) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, [previewUrls]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validation
    if (!content.trim()) {
      setSubmitError('Post content is required');
      return;
    }
    
    if (content.length > MAX_CONTENT_LENGTH) {
      setSubmitError(`Content too long (max ${MAX_CONTENT_LENGTH} characters)`);
      return;
    }

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('content', content.trim());
      
      // Append images
      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      // Submit the post
      const result = await createPost(formData).unwrap();
      
      // Clear form on success
      setContent('');
      setSelectedImages([]);
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      
      setSubmitError('');
      setContentError('');
      
      // Notify parent component if callback provided
      if (onPostCreated) {
        onPostCreated(result.post);
      }
      
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Handle different error types
      if (error.status === 400) {
        setSubmitError(error.data?.error || 'Invalid post data');
      } else if (error.status === 401) {
        setSubmitError('Please log in to create posts');
      } else if (error.status === 413) {
        setSubmitError('Files too large. Please reduce image sizes.');
      } else if (error.status === 500) {
        setSubmitError('Server error. Please try again later.');
      } else {
        setSubmitError('Failed to create post. Please check your connection and try again.');
      }
    }
  }, [content, selectedImages, previewUrls, createPost, onPostCreated]);

  // Check if form is valid
  const isFormValid = content.trim().length > 0 && 
                     content.length <= MAX_CONTENT_LENGTH && 
                     !contentError;

  return (
    <Paper sx={{ borderRadius: 3, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar 
          src={currentUser?.avatar} 
          sx={{ width: 40, height: 40, mr: 2 }}
        >
          {!currentUser?.avatar && <PersonIcon />}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            {currentUser?.firstName && currentUser?.lastName 
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : currentUser?.username || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            What's on your mind?
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <form onSubmit={handleSubmit}>
        <TextField
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={content}
          onChange={handleContentChange}
          placeholder="Share your thoughts..."
          error={!!contentError}
          helperText={
            contentError || 
            `${content.length}/${MAX_CONTENT_LENGTH} characters`
          }
          sx={{ mb: 2 }}
          inputProps={{ maxLength: MAX_CONTENT_LENGTH + 100 }} // Allow slight overflow for validation
        />

        {/* Image Upload Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="image-upload-input"
              disabled={isLoading || selectedImages.length >= MAX_IMAGES}
            />
            <label htmlFor="image-upload-input">
              <IconButton
                color="primary"
                component="span"
                disabled={isLoading || selectedImages.length >= MAX_IMAGES}
                sx={{
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  px: 2,
                  py: 1
                }}
              >
                <PhotoCamera sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Add Photos ({selectedImages.length}/{MAX_IMAGES})
                </Typography>
              </IconButton>
            </label>
            
            {selectedImages.length > 0 && (
              <Chip
                label={`${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected`}
                variant="outlined"
                color="primary"
                size="small"
              />
            )}
          </Box>

          {/* Image Preview Grid */}
          {previewUrls.length > 0 && (
            <ImageList 
              sx={{ width: '100%', maxHeight: 300 }} 
              cols={Math.min(previewUrls.length, 2)}
              rowHeight={200}
            >
              {previewUrls.map((url, index) => (
                <ImageListItem key={index} sx={{ position: 'relative' }}>
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 8
                    }}
                  />
                  <ImageListItemBar
                    sx={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      borderRadius: '8px 8px 0 0'
                    }}
                    position="top"
                    actionIcon={
                      <IconButton
                        sx={{ color: 'white' }}
                        onClick={() => handleRemoveImage(index)}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Box>

        {/* Error Display */}
        {(submitError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError || error?.data?.error || 'An error occurred'}
          </Alert>
        )}

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{
              borderRadius: 25,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </form>

      {/* Helper Text */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ mt: 2, display: 'block' }}
      >
        Supported formats: JPEG, PNG, GIF • Max file size: 5MB • Max {MAX_IMAGES} images
      </Typography>
    </Paper>
  );
};

export default CreatePostTab;