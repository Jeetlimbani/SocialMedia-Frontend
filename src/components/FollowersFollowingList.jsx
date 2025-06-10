// components/FollowersFollowingList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Typography,
  Skeleton,
  Alert,
  Pagination,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '../features/profile/profileApi';

const UserListItem = ({ user, onFollowToggle, isLoading }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${user.username || user.id}`);
  };

  // Handle different possible user object structures
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.name || user.username || 'Unknown User';
  
  const avatarFallback = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : (user.name ? user.name[0] : (user.username ? user.username[0] : 'U'));

  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1,
        '&:hover': { bgcolor: 'action.hover' },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={user.avatar || user.profilePicture || user.image}
          sx={{ width: 50, height: 50, cursor: 'pointer' }}
          onClick={handleProfileClick}
        >
          {avatarFallback}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Typography
            variant="subtitle1"
            sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={handleProfileClick}
          >
            {displayName}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              @{user.username || user.id}
            </Typography>
            {user.bio && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.bio}
              </Typography>
            )}
          </Box>
        }
      />
      
      {/* Only show follow/unfollow button if it's not the current user */}
      {!user.isCurrentUser && (
        <Button
          variant={user.isFollowing ? "outlined" : "contained"}
          size="small"
          onClick={() => onFollowToggle(user.id || user._id, user.isFollowing)}
          disabled={isLoading}
          sx={{ minWidth: 100 }}
        >
          {user.isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </ListItem>
  );
};

const FollowersFollowingList = ({ userId, type, open, onClose }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [localUsers, setLocalUsers] = useState([]);
  const [followActionLoading, setFollowActionLoading] = useState(false);
  const limit = 20;

  // RTK Query hook for fetching followers
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
    refetch: refetchFollowers,
  } = useGetFollowersQuery(
    { userId, page, limit, search: searchQuery },
    { 
      skip: type !== 'followers' || !open || !userId,
      refetchOnMountOrArgChange: true
    }
  );

  // RTK Query hook for fetching following
  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
    refetch: refetchFollowing,
  } = useGetFollowingQuery(
    { userId, page, limit, search: searchQuery },
    { 
      skip: type !== 'following' || !open || !userId,
      refetchOnMountOrArgChange: true
    }
  );

  // RTK Query mutations for follow/unfollow actions
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // Dynamically select data, loading, error, and refetch based on 'type' prop
  const data = type === 'followers' ? followersData : followingData;
  const isLoading = type === 'followers' ? isLoadingFollowers : isLoadingFollowing;
  const error = type === 'followers' ? followersError : followingError;
  const refetch = type === 'followers' ? refetchFollowers : refetchFollowing;

  // Handle different possible data structures and update local users
  useEffect(() => {
    if (data) {
      let users = [];
      
      // Handle different possible response structures
      if (Array.isArray(data)) {
        // Direct array of users
        users = data;
      } else if (data.users && Array.isArray(data.users)) {
        // Object with users array
        users = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        // Object with data array
        users = data.data;
      } else if (data.followers && Array.isArray(data.followers)) {
        // Object with followers array
        users = data.followers;
      } else if (data.following && Array.isArray(data.following)) {
        // Object with following array
        users = data.following;
      }
      
      console.log('Processed users:', users);
      setLocalUsers(users);
    } else {
      setLocalUsers([]);
    }
  }, [data]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Handler for follow/unfollow toggle
  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    setFollowActionLoading(true);
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(targetUserId).unwrap();
      } else {
        await followUser(targetUserId).unwrap();
      }
      
      // Optimistically update the local state
      setLocalUsers(prevUsers => 
        prevUsers.map(user => 
          (user.id || user._id) === targetUserId 
            ? { ...user, isFollowing: !isCurrentlyFollowing }
            : user
        )
      );
      
      // Refetch the list after a successful follow/unfollow action
      refetch();
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      // TODO: Implement user-friendly error feedback (e.g., Snackbar)
    } finally {
      setFollowActionLoading(false);
    }
  };

  // Handler for pagination change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handler for search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Reset search and page when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setPage(1);
      setLocalUsers([]);
    }
  }, [open]);

  // Get pagination info from different possible structures
  const getPaginationInfo = () => {
    if (!data) return null;
    
    // Try different pagination structures
    if (data.pagination) return data.pagination;
    if (data.meta) return data.meta;
    if (data.pageInfo) return data.pageInfo;
    
    // If no pagination info, try to infer from data
    if (localUsers.length > 0) {
      return {
        total: localUsers.length,
        totalPages: 1,
        currentPage: 1
      };
    }
    
    return null;
  };

  const paginationInfo = getPaginationInfo();

  // FIXED: Remove the problematic refetch effect and use a callback instead
  const handleDialogOpen = useCallback(() => {
    if (open && userId) {
      console.log(`Dialog opened for ${type}, refetching data...`);
      // Use a small delay to ensure the query is properly initialized
      setTimeout(() => {
        refetch();
      }, 0);
    }
  }, [open, userId, type, refetch]);

  // Trigger refetch when dialog opens
  useEffect(() => {
    handleDialogOpen();
  }, [handleDialogOpen]);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {type === 'followers' ? 'Followers' : 'Following'}
          {paginationInfo?.total && ` (${paginationInfo.total})`}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {/* Search Input Field */}
        <TextField
          fullWidth
          placeholder={`Search ${type}...`}
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Loading State Skeleton */}
        {isLoading && (
          <Box>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
                <Skeleton variant="rectangular" width={80} height={32} />
              </Box>
            ))}
          </Box>
        )}

        {/* Error State Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load {type}. Please try again.
            <br />
            <Typography variant="caption">
              Error: {error?.data?.message || error?.message || JSON.stringify(error)}
            </Typography>
          </Alert>
        )}

        {/* Users List Display */}
        {!isLoading && !error && (
          <>
            {localUsers && localUsers.length > 0 ? (
              <List sx={{ p: 0 }}>
                {localUsers.map((user, index) => (
                  <UserListItem
                    key={user.id || user._id || index}
                    user={user}
                    onFollowToggle={handleFollowToggle}
                    isLoading={followActionLoading}
                  />
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery 
                    ? `No ${type} found matching "${searchQuery}"`
                    : `No ${type} yet`
                  }
                </Typography>
              </Box>
            )}

            {/* Pagination Controls */}
            {paginationInfo && paginationInfo.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={paginationInfo.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowersFollowingList;