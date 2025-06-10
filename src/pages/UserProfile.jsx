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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { useGetUserProfileQuery } from '../features/profile/profileApi';
import LoadingSkeleton from '../components/Profile/LoadingSkeleton';
import FollowersFollowingList from '../components/FollowersFollowingList';
import SearchUsers from '../components/SearchUsers';
import PublicFeed from '../components/PublicFeed';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const isOwnProfile = currentUser?.username === username;

  const {
    data: viewedProfile,
    isLoading: isFetchingProfile,
    error: profileError,
  } = useGetUserProfileQuery(username, {
    skip: !username,
  });

  const [selectedNavItem, setSelectedNavItem] = useState('discover');
  const [showFollowList, setShowFollowList] = useState(false);
  const [listType, setListType] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const navigationItems = [
    { id: 'profile', label: 'My Profile', icon: <PersonIcon /> },
  ];

  if (isFetchingProfile) return <LoadingSkeleton />;

  if (profileError && !viewedProfile) {
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

  if (!viewedProfile) {
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

  const handleNavItemClick = (itemId) => {
    setSelectedNavItem(itemId);
    if (itemId === 'profile') {
      navigate('/my-profile');
    }
  };

  const renderMainContent = () => {
    return <PublicFeed />;
  };
  

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {viewedProfile.firstName} {viewedProfile.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{viewedProfile.username}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Search Users">
          <IconButton onClick={handleOpenSearchDialog}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            width: 280, 
            height: 'fit-content',
            position: 'sticky',
            top: 20
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Navigation
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List component="nav" disablePadding>
              {navigationItems.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  selected={selectedNavItem === item.id}
                  onClick={() => handleNavItemClick(item.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: selectedNavItem === item.id ? 'inherit' : 'text.secondary',
                      minWidth: 40 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: selectedNavItem === item.id ? 600 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {renderMainContent()}
        </Box>
      </Box>

      <FollowersFollowingList
        userId={viewedProfile.id}
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

export default UserProfile;
