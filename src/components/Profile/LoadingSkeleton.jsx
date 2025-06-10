// components/Profile/LoadingSkeleton.jsx
import React from 'react';
import {
  Box,
  Container,
  Paper,
  Skeleton,
} from '@mui/material';

const LoadingSkeleton = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={120} height={120} />
          <Box sx={{ ml: 3, flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="text" width="50%" height={24} />
            <Skeleton variant="text" width="80%" height={20} />
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Skeleton variant="text" width={60} height={40} />
              <Skeleton variant="text" width={60} height={40} />
              <Skeleton variant="text" width={60} height={40} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Skeleton variant="rectangular" width={120} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Box>
          </Box>
        </Box>
      </Paper>
      <Paper sx={{ mt: 3, borderRadius: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Paper>
    </Container>
  );
};

export default LoadingSkeleton;