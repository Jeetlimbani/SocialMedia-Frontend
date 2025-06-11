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
  Divider,
  Drawer,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

import { useGetUserProfileQuery } from '../features/profile/profileApi';
import LoadingSkeleton from '../components/Profile/LoadingSkeleton';
import FollowersFollowingList from '../components/FollowersFollowingList';
import SearchUsers from '../components/SearchUsers';
import PublicFeed from '../components/PublicFeed';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigationItems = [{ id: 'profile', label: 'My Profile', icon: <PersonIcon /> }];

  if (isFetchingProfile) return <LoadingSkeleton />;

  if (profileError && !viewedProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: { xs: 0.5, sm: 1 } }}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isSmallScreen ? 'subtitle1' : 'h6'} fontWeight={600}>
            Profile
          </Typography>
        </Box>
        <Alert severity="error">
          Failed to load profile:{' '}
          {profileError?.data?.error || profileError?.message || 'User not found'}
        </Alert>
      </Container>
    );
  }

  if (!viewedProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: { xs: 0.5, sm: 1 } }}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isSmallScreen ? 'subtitle1' : 'h6'} fontWeight={600}>
            Profile
          </Typography>
        </Box>
        <Alert severity="warning">Profile not found.</Alert>
      </Container>
    );
  }

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
    // Close mobile nav after selection
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const renderMainContent = () => {
    return <PublicFeed />;
  };

  // Navigation content for both desktop sidebar and mobile drawer
  const NavigationContent = () => (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography
        variant={isSmallScreen ? 'subtitle1' : 'h6'}
        fontWeight={600}
        gutterBottom
        sx={{ px: { xs: 1, sm: 0 } }}
      >
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
              minHeight: { xs: 44, sm: 48 },
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
                minWidth: { xs: 36, sm: 40 },
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: selectedNavItem === item.id ? 600 : 400,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 0, // Allow text truncation
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: { xs: 0.5, sm: 1 } }}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              mr: 2,
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant={isSmallScreen ? 'subtitle1' : 'h6'}
              fontWeight={600}
              noWrap
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              {viewedProfile.firstName} {viewedProfile.lastName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              @{viewedProfile.username}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Mobile navigation toggle */}
          {isMobile && (
            <Tooltip title="Navigation">
              <IconButton onClick={toggleMobileNav} size={isSmallScreen ? 'small' : 'medium'}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Search Users">
            <IconButton onClick={handleOpenSearchDialog} size={isSmallScreen ? 'small' : 'medium'}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content Layout */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 0, md: 3 },
          position: 'relative',
        }}
      >
        {/* Desktop Sidebar Navigation */}
        {!isMobile && (
          <Paper
            elevation={1}
            sx={{
              width: { md: 250, lg: 280 },
              height: 'fit-content',
              position: 'sticky',
              top: { md: 20, lg: 24 },
              display: { xs: 'none', md: 'block' },
            }}
          >
            <NavigationContent />
          </Paper>
        )}

        {/* Mobile Drawer Navigation */}
        <Drawer
          anchor="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: { xs: 250, sm: 280 },
              boxSizing: 'border-box',
            },
          }}
        >
          <NavigationContent />
        </Drawer>

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          {renderMainContent()}
        </Box>
      </Box>

      {/* Mobile FAB for quick navigation (optional) */}
      {isMobile && (
        <Fab
          color="primary"
          size="medium"
          onClick={toggleMobileNav}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
            zIndex: 1000,
          }}
        >
          <MenuIcon />
        </Fab>
      )}

      <FollowersFollowingList
        userId={viewedProfile.id}
        type={listType}
        open={showFollowList}
        onClose={handleCloseFollowList}
      />

      <SearchUsers open={searchDialogOpen} onClose={handleCloseSearchDialog} />
    </Container>
  );
};

export default UserProfile;
