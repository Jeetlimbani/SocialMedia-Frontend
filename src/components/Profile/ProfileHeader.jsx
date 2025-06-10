// components/Profile/ProfileHeader.jsx
import React from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  CameraAlt as CameraIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { getAvatarUrl } from '../../utils/profileUtils';

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isUploadingAvatar,
  onEditProfile,
  onFollowToggle,
  onOpenFollowersList,
  onOpenFollowingList,
  onAvatarSelect,
  isFollowLoading = false 
}) => {

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onAvatarSelect(e.target.files[0]);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={getAvatarUrl(profile.avatar)}
            sx={{ width: 120, height: 120, border: '4px solid #e0e0e0' }}
          >
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </Avatar>
          
          {isOwnProfile && (
            <>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={onSelectFile}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? <CircularProgress size={20} color="inherit" /> : <CameraIcon />}
                </IconButton>
              </label>
            </>
          )}
        </Box>
        
        <Box sx={{ ml: 3, flexGrow: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {profile.firstName} {profile.lastName}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            @{profile.username}
          </Typography>
          
          {profile.bio && (
            <Typography variant="body1" paragraph>
              {profile.bio}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{profile.postsCount || 0}</Typography>
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
              onClick={onOpenFollowersList}
            >
              <Typography variant="h6">{profile.followersCount || 0}</Typography>
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
              onClick={onOpenFollowingList}
            >
              <Typography variant="h6">{profile.followingCount || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Following</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {isOwnProfile ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onEditProfile}
                >
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={profile.isFollowing ? "outlined" : "contained"}
                  onClick={onFollowToggle}
                  disabled={isFollowLoading}
                  sx={{ 
                    minWidth: 120,
                    position: 'relative'
                  }}
                >
                  {isFollowLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    profile.isFollowing ? 'Following' : 'Follow'
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
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;