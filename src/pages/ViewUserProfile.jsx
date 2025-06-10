import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Alert, 
  IconButton, 
  Tooltip, 
  Box, 
  Typography, 
  Paper,
  Avatar,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { useGetUserProfileQuery } from '../features/profile/profileApi';
import { useFollowUserMutation, useUnfollowUserMutation } from '../features/profile/profileApi';
import LoadingSkeleton from '../components/Profile/LoadingSkeleton';
import FollowersFollowingList from '../components/FollowersFollowingList';
import SearchUsers from '../components/SearchUsers';
import PublicFeed from '../components/PublicFeed';
import { getAvatarUrl } from '../utils/profileUtils';

const ViewUserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const {
    data: userProfile,
    isLoading: isFetchingProfile,
    error: profileError,
  } = useGetUserProfileQuery(username, {
    skip: !username,
  });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const [showFollowList, setShowFollowList] = useState(false);
  const [listType, setListType] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const isFollowLoading = isFollowing || isUnfollowing;

  if (isFetchingProfile) return <LoadingSkeleton />;

  if (profileError && !userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Profile</Typography>
        </Box>
        <Alert severity="error">
          Failed to load profile: {profileError?.data?.error || profileError?.message || 'User not found'}
        </Alert>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Profile</Typography>
        </Box>
        <Alert severity="warning">Profile not found.</Alert>
      </Container>
    );
  }

  const handleFollowToggle = async () => {
    try {
      if (userProfile.isFollowing) {
        await unfollowUser(userProfile.id).unwrap();
      } else {
        await followUser(userProfile.id).unwrap();
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handleOpenFollowersList = () => {
    setListType('followers');
    setShowFollowList(true);
  };

  const handleOpenFollowingList = () => {
    setListType('following');
    setShowFollowList(true);
  };

  const handleCloseFollowList = () => {
    setShowFollowList(false);
    setListType('');
  };

  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={600}>
              {userProfile.firstName} {userProfile.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{userProfile.username}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Search Users">
          <IconButton onClick={handleOpenSearchDialog}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profile Header */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={getAvatarUrl(userProfile.avatar)}
            sx={{ width: 120, height: 120, border: '4px solid #e0e0e0' }}
          >
            {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
          </Avatar>
          
          <Box sx={{ ml: 3, flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {userProfile.firstName} {userProfile.lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              @{userProfile.username}
            </Typography>
            
            {userProfile.bio && (
              <Typography variant="body1" paragraph>
                {userProfile.bio}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{userProfile.postsCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Posts</Typography>
              </Box>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                  p: 0.5,
                  transition: 'background-color 0.2s'
                }} 
                onClick={handleOpenFollowersList}
              >
                <Typography variant="h6">{userProfile.followersCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Followers</Typography>
              </Box>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                  p: 0.5,
                  transition: 'background-color 0.2s'
                }} 
                onClick={handleOpenFollowingList}
              >
                <Typography variant="h6">{userProfile.followingCount || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Following</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant={userProfile.isFollowing ? "outlined" : "contained"}
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                sx={{ 
                  minWidth: 120,
                  position: 'relative'
                }}
              >
                {isFollowLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  userProfile.isFollowing ? 'Following' : 'Follow'
                )}
              </Button>
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                sx={{ minWidth: 100 }}
              >
                Message
              </Button>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Dialogs */}
      <FollowersFollowingList
        userId={userProfile.id}
        type={listType}
        open={showFollowList}
        onClose={handleCloseFollowList}
      />

      <SearchUsers
        open={searchDialogOpen}
        onClose={handleCloseSearchDialog}
      />
    </Container>
  );
};

export default ViewUserProfile;