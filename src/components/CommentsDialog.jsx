// src/components/PublicFeed/CommentsDialog.jsx
import React from 'react';
import Comments from '../components/Profile/Comment'; // Adjust path
import { useTheme, useMediaQuery } from '@mui/material';

const CommentsDialog = ({ open, onClose, postId, postTitle, onCommentCountChange }) => {
  const theme = useTheme();
  // Using useMediaQuery for responsive dialog sizing
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Comments
      open={open}
      onClose={onClose}
      postId={postId}
      postTitle={postTitle}
      onCommentCountChange={onCommentCountChange}
      PaperProps={{
        sx: {
          width: {
            xs: '95%',
            sm: isSmallScreen ? '90%' : '80%', // Even more controlled for sm
            md: '600px',
          },
          maxWidth: {
            xs: '95vw',
            sm: isSmallScreen ? '90vw' : '80vw',
            md: '600px',
          },
          maxHeight: { xs: '90vh', sm: '85vh', md: '80vh' },
          m: { xs: 1, sm: 2 },
        },
      }}
    />
  );
};

export default CommentsDialog;
