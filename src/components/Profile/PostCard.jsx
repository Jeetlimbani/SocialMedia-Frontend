// components/Profile/PostCard.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

// Component to display images with pagination
const PostImagePagination = ({ images = [], baseUrl = "http://localhost:4000" }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      {/* Main Image Container */}
      <Box sx={{ 
        width: '100%', 
        maxHeight: 400, 
        overflow: 'hidden', 
        borderRadius: 2,
        position: 'relative'
      }}>
        <img
          src={`${baseUrl}${images[currentImageIndex]}`}
          alt={`Post image ${currentImageIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '400px',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Navigation Arrows - Only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 1
              }}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 1
              }}
              size="small"
            >
              <ChevronRightIcon />
            </IconButton>

            {/* Image Counter */}
            <Box sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '0.75rem',
              zIndex: 1
            }}>
              {currentImageIndex + 1} / {images.length}
            </Box>
          </>
        )}
      </Box>

      {/* Pagination Dots - Only show if more than 1 image */}
      {images.length > 1 && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 1,
          gap: 0.5
        }}>
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={(e) => handleDotClick(index, e)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentImageIndex 
                  ? 'primary.main' 
                  : 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: index === currentImageIndex 
                    ? 'primary.dark' 
                    : 'rgba(0, 0, 0, 0.5)',
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const PostCard = ({ post, onLike, onComment, onSave, showActions = true }) => {
  // Safely access nested properties with fallbacks
  const likesCount = post?.likesCount || post?._count?.likes || 0;
  const commentsCount =
  post?.commentsCount !== undefined
    ? post.commentsCount
    : post?._count?.comments || 0;

  const isLiked = Boolean(post?.isLiked);
  const isSaved = Boolean(post?.isSaved);

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    if (onComment) {
      onComment(post);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(post);
    }
  };

  if (!post) {
    return null;
  }

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          {/* Author info */}
          {post.author && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {post.author.username || post.author.name || 'Unknown User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                • {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Post content */}
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>
        
        {/* Post images with pagination */}
        {post.images && post.images.length > 0 && (
          <PostImagePagination images={post.images} />
        )}

        {/* Action buttons */}
        {showActions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={handleLike}
              color={isLiked ? 'error' : 'default'}
              size="small"
              disabled={!onLike}
            >
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {likesCount}
            </Typography>
            
            <IconButton 
              onClick={handleComment} 
              size="small"
              disabled={!onComment}
            >
              <CommentIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {commentsCount}
            </Typography>
            
            <IconButton 
              onClick={handleSave}
              color={isSaved ? 'primary' : 'default'}
              size="small"
              disabled={!onSave}
            >
              {isSaved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </IconButton>
            
            <IconButton size="small" sx={{ ml: 'auto' }}>
              <ShareIcon />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;