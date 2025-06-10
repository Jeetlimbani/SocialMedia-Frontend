// components/SearchUsers.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,TextField,InputAdornment,List,ListItem,ListItemAvatar,ListItemText,Avatar,Button,Typography,Paper,Skeleton,Alert,Pagination,Chip,IconButton, Divider,Dialog,DialogTitle,DialogContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useDebounce } from '../../src/hooks/useDebounce';
import {
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  // Remove clearViewedProfile import - we won't use it
} from '../features/profile/profileApi';


const UserSearchItem = ({ user, onFollow, isLoading, onProfileClick }) => {

  const handleProfileClick = () => {
    // Call the parent's profile click handler first (to close dialog)
    if (onProfileClick) {
      onProfileClick(user.username); // Pass the username to parent
    }
    // Navigate to the user profile
    
  };
  const avatarUrl = user.avatar?.startsWith('http')
  ? user.avatar
  : `http://localhost:4000${user.avatar}`; 

  const handleFollowClick = (e) => {
    e.stopPropagation(); // Prevents bubbling to parent click
    onFollow(user.id, user.isFollowing);
  };

  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1,
        p: 2,
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
      onClick={handleProfileClick}
    >
      <ListItemAvatar>
      <Avatar src={avatarUrl || undefined} sx={{ width: 56, height: 56 }}>
  {user.firstName?.[0]}{user.lastName?.[0]}
</Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              {user.firstName} {user.lastName}
            </Typography>
            {user.isVerified && (
              <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
            {user.bio && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {user.bio}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {user.followersCount} followers
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.postsCount} posts
              </Typography>
            </Box>
          </Box>
        }
      />
      
      <Button
        variant={user.isFollowing ? "outlined" : "contained"}
        size="small"
        onClick={handleFollowClick}
        disabled={isLoading}
        sx={{ minWidth: 90, flexShrink: 0 }}
      >
        {user.isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </ListItem>
  );
};

const SearchUsers = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();
  
  const {
    data: searchResults,
    isLoading,
    error,
    isFetching,
  } = useSearchUsersQuery(
    { 
      query: debouncedSearchQuery, 
      page,
      limit: 10 
    },
    { 
      skip: !debouncedSearchQuery || debouncedSearchQuery.length < 2,
      refetchOnMountOrArgChange: true,
    }
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleFollow = async (userId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId).unwrap();
      } else {
        await followUser(userId).unwrap();
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };
  const navigate = useNavigate();
  // FIXED: Handle profile click - just close dialog, don't clear any state
  const handleProfileClick = (username) => {
    console.log('Navigating to profile:', username); 
    navigate(`/profile/${username}`);// Debug log
    handleClose();
    // Don't clear any profile state - let the profile component handle loading
  };

  const handleClose = () => {
    setSearchQuery('');
    setPage(1);
    onClose();
  };

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setPage(1);
    }
  }, [open]);

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <ListItem key={index} sx={{ borderRadius: 2, mb: 1, p: 2 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" width={56} height={56} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton variant="text" width={200} height={24} />}
          secondary={
            <Box>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={300} height={16} sx={{ mt: 0.5 }} />
              <Skeleton variant="text" width={150} height={14} sx={{ mt: 0.5 }} />
            </Box>
          }
        />
        <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: 1 }} />
      </ListItem>
    ));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Search Users
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          fullWidth
          placeholder="Search for users..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          autoFocus
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to search users. Please try again.
          </Alert>
        )}

        {!debouncedSearchQuery ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start typing to search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter at least 2 characters to search for users
            </Typography>
          </Box>
        ) : debouncedSearchQuery.length < 2 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Please enter at least 2 characters
            </Typography>
          </Box>
        ) : isLoading || isFetching ? (
          <List>
            {renderSkeletons()}
          </List>
        ) : searchResults?.users?.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try searching with different keywords
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Found {searchResults?.totalCount || 0} users
              </Typography>
              {searchResults?.totalCount > 0 && (
                <Chip 
                  label={`Page ${page}`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {searchResults?.users?.map((user, index) => (
                <React.Fragment key={user.id}>
                  <UserSearchItem
                    user={user}
                    onFollow={handleFollow}
                    onProfileClick={handleProfileClick}
                    isLoading={isFollowing || isUnfollowing}
                  />
                  {index < searchResults.users.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {searchResults?.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={searchResults.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchUsers;