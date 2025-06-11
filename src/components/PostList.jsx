// src/components/PublicFeed/PostList.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PublicFeedPostCardWrapper from './PublicFeedPostCardWrapper'; // Adjust path

const PostList = ({
  posts,
  hasMore,
  isFetching,
  onLoadMore,
  onLoginPrompt,
  onLike,
  onComment,
  onSave,
  actionLoading,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (posts.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant={isSmallScreen ? 'subtitle1' : 'h6'}
          color="text.secondary"
          gutterBottom
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            mb: { xs: 1, sm: 2 },
          }}
        >
          No posts available
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          }}
        >
          Be the first to share something!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={{ xs: 0, sm: 1, md: 2 }}>
        <Grid item xs={12}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {posts.map((post) => (
              <PublicFeedPostCardWrapper
                key={post.id}
                post={post}
                onLoginPrompt={onLoginPrompt}
                onLike={() => onLike(post)} // Pass post directly to callback
                onComment={() => onComment(post)} // Pass post directly to callback
                onSave={() => onSave(post)} // Pass post directly to callback
                isActionLoading={actionLoading[post.id]}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>

      {hasMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 0 },
          }}
        >
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={isFetching}
            startIcon={isFetching ? <CircularProgress size={16} /> : null}
            size={isSmallScreen ? 'medium' : 'large'}
            sx={{
              minWidth: { xs: 120, sm: 140 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              py: { xs: 1, sm: 1.5 },
              px: { xs: 2, sm: 3 },
            }}
          >
            {isFetching ? 'Loading...' : 'Load More Posts'}
          </Button>
        </Box>
      )}

      {!hasMore && (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            You've reached the end of the feed
          </Typography>
        </Box>
      )}
    </>
  );
};

export default PostList;
