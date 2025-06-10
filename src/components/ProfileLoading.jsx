// components/ProfileLoading.jsx
import React from 'react';
import {
  Container,
  Paper,
  Box,
  Skeleton,
} from '@mui/material';

const ProfileLoading = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={120} height={120} />
          <Box sx={{ ml: 3, flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="text" width="50%" height={24} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Paper>
    </Container>
  );
};

export default ProfileLoading;