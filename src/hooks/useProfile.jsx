// hooks/useProfile.js
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetUserProfileQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUpdateUserProfileMutation,
  useUploadAvatarMutation,
  useGetCurrentUserProfileQuery,
} from '../features/profile/profileApi';
import { clearViewedProfile} from '../features/profile/profileSlice'

export const useProfile = (usernameFromParams) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const isAuthLoading = useSelector((state) => state.auth.isLoading);
  const viewedProfile = useSelector((state) => state.profile.viewedProfile);

  // ✅ FIXED: Better logic for determining profile identifier
  const shouldLoadAuthUserProfile = !usernameFromParams && !isAuthLoading && authUser?.username;
  const profileIdentifier = usernameFromParams || (shouldLoadAuthUserProfile ? authUser.username : null);

  // ✅ FIXED: Add additional safety check
  const shouldSkipQuery = !profileIdentifier || isAuthLoading;

  // ✅ Fetch user profile conditionally with improved skip logic
  const {
    isLoading: isFetchingProfile,
    error: profileError,
    isFetching,
  } = useGetUserProfileQuery(profileIdentifier, {
    skip: shouldSkipQuery,
    // Add refetchOnMountOrArgChange to ensure fresh data
    refetchOnMountOrArgChange: true,
  });

  // ✅ Always try to fetch the current authenticated user's own profile (for side uses)
  useGetCurrentUserProfileQuery(undefined, {
    skip: !authUser?.username || isAuthLoading,
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  // ✅ FIXED: Clear profile on unmount or username change with better dependency array
  useEffect(() => {
    return () => {
      dispatch(clearViewedProfile());
    };
  }, [usernameFromParams, dispatch]);

  // ✅ FIXED: Add effect to clear viewed profile when switching between different users
  useEffect(() => {
    if (usernameFromParams) {
      dispatch(clearViewedProfile());
    }
  }, [usernameFromParams, dispatch]);

  // Handlers
  const handleFollowToggle = async () => {
    try {
      if (viewedProfile.isFollowing) {
        await unfollowUser(viewedProfile.id).unwrap();
      } else {
        await followUser(viewedProfile.id).unwrap();
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      throw error;
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      await updateProfile(formData).unwrap();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const handleAvatarUpload = async (croppedImageBlob) => {
    const formData = new FormData();
    formData.append('avatar', croppedImageBlob, 'avatar.jpg');
    
    try {
      await uploadAvatar(formData).unwrap();
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  // ✅ FIXED: Better loading state calculation
  const isProfileLoading = isAuthLoading || isFetchingProfile || isFetching;

  return {
    authUser,
    isAuthLoading,
    viewedProfile,
    profileIdentifier,
    isFetchingProfile: isProfileLoading, // Use combined loading state
    profileError,
    isUpdating,
    isUploadingAvatar,
    
    handleFollowToggle,
    handleUpdateProfile,
    handleAvatarUpload,
    
    isOwnProfile: authUser?.id === viewedProfile?.id,
  };
};

// hooks/useProfileForm.js (Unchanged, included for completeness)
export const useProfileForm = (initialData) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    ...initialData, 
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        bio: initialData.bio || '',
      });
    }
  }, [initialData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      username: initialData?.username || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      bio: initialData?.bio || '',
    });
  };

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
  };
};

// hooks/useImageCrop.js (Unchanged, included for completeness)
// Assuming this hook is correctly implemented as provided previously
// and manages its own internal state for imageSrc, crop, etc.
