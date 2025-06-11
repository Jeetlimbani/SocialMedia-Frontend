// src/components/PublicFeed/PostSkeleton.jsx
import React from 'react';
import { Card, CardContent, Box, Skeleton, useTheme, useMediaQuery } from '@mui/material';

const PostSkeleton = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        mb: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1, sm: 2 },
        mx: { xs: 0, sm: 0 },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          '&:last-child': { pb: { xs: 2, sm: 3 } },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          <Skeleton
            variant="circular"
            width={isSmallScreen ? 36 : 40}
            height={isSmallScreen ? 36 : 40}
          />
          <Box sx={{ ml: { xs: 1.5, sm: 2 }, flexGrow: 1 }}>
            <Skeleton variant="text" width="30%" height={isSmallScreen ? 18 : 20} />
            <Skeleton variant="text" width="20%" height={isSmallScreen ? 14 : 16} />
          </Box>
        </Box>
        <Skeleton variant="text" width="100%" height={isSmallScreen ? 18 : 20} />
        <Skeleton variant="text" width="80%" height={isSmallScreen ? 18 : 20} />
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            mt: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          <Skeleton variant="text" width={60} height={24} />
          <Skeleton variant="text" width={60} height={24} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostSkeleton;
