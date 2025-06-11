import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useProfile, useProfileForm } from '../hooks/useProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileTabs from '../components/Profile/ProfileTabs';
import EditProfileDialog from '../components/Profile/EditProfileDialog';
import AvatarCropDialog from '../components/Profile/AvatarCropDialog';
import FollowersFollowingList from '../components/FollowersFollowingList';
import LoadingSkeleton from '../components/Profile/LoadingSkeleton';
import SearchUsers from '../components/SearchUsers'; // 🆕 Add import

const Profile = () => {
  const { username } = useParams();

  // Custom hooks
  const {
    isAuthLoading,
    viewedProfile,
    profileIdentifier,
    isFetchingProfile,
    profileError,
    isUpdating,
    isUploadingAvatar,
    isOwnProfile,
    handleFollowToggle,
    handleUpdateProfile,
    handleAvatarUpload,
  } = useProfile(username);

  const { formData, setFormData } = useProfileForm(viewedProfile);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showFollowList, setShowFollowList] = useState(false);
  const [listType, setListType] = useState('');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false); // 🆕 SearchUsers state

  // 🟡 Loading indicator
  if (isAuthLoading || isFetchingProfile) return <LoadingSkeleton />;

  // 🟥 Profile identifier missing
  if (!profileIdentifier) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          {username
            ? 'Profile not specified. Please provide a valid username.'
            : 'Please log in to view your profile or specify a username in the URL.'}
        </Alert>
      </Container>
    );
  }

  // 🟧 Profile failed to load
  if (profileError && !viewedProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load profile:{' '}
          {profileError?.data?.error || profileError?.message || 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  // 🟨 Profile not found
  if (!viewedProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Profile not found.</Alert>
      </Container>
    );
  }

  // Event handlers
  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleEditProfile = () => setEditDialogOpen(true);
  const handleSaveProfile = async () => {
    try {
      await handleUpdateProfile(formData);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Update profile error:', error);
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

  const handleAvatarSelect = () => {
    setCropDialogOpen(true);
  };

  const handleAvatarUploadComplete = async (croppedImageBlob) => {
    try {
      await handleAvatarUpload(croppedImageBlob);
      setCropDialogOpen(false);
    } catch (error) {
      console.error('Avatar upload error:', error);
    }
  };

  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
  };

  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
  };

  // ✅ Main render
  return (
    <Container maxWidth="md" sx={{ mt: 4, position: 'relative' }}>
      {/* 🔍 Search Icon */}
      <Tooltip title="Search Users">
        <IconButton
          sx={{ position: 'absolute', top: 16, right: 16 }}
          onClick={handleOpenSearchDialog}
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>

      <ProfileHeader
        profile={viewedProfile}
        isOwnProfile={isOwnProfile}
        isUploadingAvatar={isUploadingAvatar}
        onEditProfile={handleEditProfile}
        onFollowToggle={handleFollowToggle}
        onOpenFollowersList={handleOpenFollowersList}
        onOpenFollowingList={handleOpenFollowingList}
        onAvatarSelect={handleAvatarSelect}
      />

      <ProfileTabs
        tabValue={tabValue}
        onTabChange={handleTabChange}
        posts={viewedProfile.posts}
        onOpenFollowersList={handleOpenFollowersList}
        onOpenFollowingList={handleOpenFollowingList}
        isOwnProfile={isOwnProfile}
      />

      <AvatarCropDialog
        open={cropDialogOpen}
        onClose={handleCropDialogClose}
        onUpload={handleAvatarUploadComplete}
        isUploading={isUploadingAvatar}
      />

      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveProfile}
        isUpdating={isUpdating}
      />

      <FollowersFollowingList
        key={`${listType}-${showFollowList}`}
        userId={viewedProfile.id}
        type={listType}
        open={showFollowList}
        onClose={handleCloseFollowList}
      />

      <SearchUsers open={searchDialogOpen} onClose={handleCloseSearchDialog} />
    </Container>
  );
};

export default Profile;
