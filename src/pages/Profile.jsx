// // pages/Profile.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//   Box,
//   Container,
//   Paper,
//   Avatar,
//   Typography,
//   Button,
//   Grid,
//   Tab,
//   Tabs,
//   Card,
//   CardContent,
//   CardMedia,
//   IconButton,
//   Chip,
//   Skeleton,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   CircularProgress,
// } from '@mui/material';
// import {
//   Edit as EditIcon,
//   Settings as SettingsIcon,
//   CameraAlt as CameraIcon,
//   Favorite as FavoriteIcon,
//   FavoriteBorder as FavoriteBorderIcon,
//   Comment as CommentIcon,
//   Share as ShareIcon,
//   BookmarkBorder as BookmarkIcon,
//   Bookmark as BookmarkFilledIcon,
//   MoreVert as MoreVertIcon,
//   Crop as CropIcon,
// } from "@mui/icons-material";
// import { useSelector, useDispatch } from 'react-redux';
// import ReactCrop from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
// import {
//   useGetUserProfileQuery,
//   useFollowUserMutation,
//   useUnfollowUserMutation,
//   useUpdateUserProfileMutation,
//   useUploadAvatarMutation,
//   useGetCurrentUserProfileQuery,
//   clearViewedProfile,
// } from '../features/profile/profileSlice';
// import FollowersFollowingList from '../components/FollowersFollowingList';

// const TabPanel = ({ children, value, index, ...other }) => (
//   <div
//     role="tabpanel"
//     hidden={value !== index}
//     id={`profile-tabpanel-${index}`}
//     aria-labelledby={`profile-tab-${index}`}
//     {...other}
//   >
//     {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
//   </div>
// );

// const PostCard = ({ post, onLike, onComment, onSave }) => (
//   <Card sx={{ mb: 2, borderRadius: 2 }}>
//     <CardContent>
//       <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//         <Typography variant="body1" sx={{ flexGrow: 1 }}>
//           {post.content}
//         </Typography>
//         <IconButton size="small">
//           <MoreVertIcon />
//         </IconButton>
//       </Box>
      
//       {post.images && post.images.length > 0 && (
//         <CardMedia
//           component="img"
//           height="300"
//           image={post.images[0]}
//           alt="Post image"
//           sx={{ borderRadius: 1, mb: 2 }}
//         />
//       )}
      
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <IconButton 
//           onClick={() => onLike(post.id)}
//           color={post.isLiked ? 'error' : 'default'}
//           size="small"
//         >
//           {post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
//         </IconButton>
//         <Typography variant="body2" color="text.secondary">
//           {post._count.likes}
//         </Typography>
        
//         <IconButton onClick={() => onComment(post.id)} size="small">
//           <CommentIcon />
//         </IconButton>
//         <Typography variant="body2" color="text.secondary">
//           {post._count.comments}
//         </Typography>
        
//         <IconButton 
//           onClick={() => onSave(post.id)}
//           color={post.isSaved ? 'primary' : 'default'}
//           size="small"
//         >
//           {post.isSaved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
//         </IconButton>
        
//         <IconButton size="small" sx={{ ml: 'auto' }}>
//           <ShareIcon />
//         </IconButton>
//       </Box>
      
//       <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//         {new Date(post.createdAt).toLocaleDateString()}
//       </Typography>
//     </CardContent>
//   </Card>
// );

// const Profile = () => {
//   const { username } = useParams();  
//   const dispatch = useDispatch();
//   const [tabValue, setTabValue] = useState(0);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [editFormData, setEditFormData] = useState({
//     username: '',
//     firstName: '',
//     lastName: '',
//     bio: '',
//   });
//   const [showFollowList, setShowFollowList] = useState(false);
//   const [listType, setListType] = useState('');
  
//   // Image cropping states
//   const [cropDialogOpen, setCropDialogOpen] = useState(false);
//   const [imageSrc, setImageSrc] = useState(null);
//   const [crop, setCrop] = useState({
//     unit: '%',
//     width: 90,
//     height: 90,
//     x: 5,
//     y: 5,
//     aspect: 1, // Square aspect ratio for avatar
//   });
//   const [completedCrop, setCompletedCrop] = useState(null);
//   const [scale, setScale] = useState(1);
//   const [rotate, setRotate] = useState(0);
//   const imgRef = useRef(null);
//   const previewCanvasRef = useRef(null);
  
//   const authUser = useSelector((state) => state.auth.user);
//   const isAuthLoading = useSelector((state) => state.auth.isLoading);
//   const viewedProfile = useSelector((state) => state.profile.viewedProfile);
//   if (isAuthLoading) {
//     return (
//       <Container maxWidth="md" sx={{ mt: 4 }}>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   const profileIdentifier = username || (authUser?.username && !isAuthLoading ? authUser.username : null);

//   const {
//     isLoading: isFetchingProfile,
//     error: profileError,
//   } = useGetUserProfileQuery(profileIdentifier, {
//     skip: !profileIdentifier || isAuthLoading,
//   });

//   useGetCurrentUserProfileQuery(undefined, {
//     skip: !authUser?.username,
//   });

//   const [followUser] = useFollowUserMutation();
//   const [unfollowUser] = useUnfollowUserMutation();
//   const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
//   const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

//   useEffect(() => {
//     return () => {
//       dispatch(clearViewedProfile());
//     };
//   }, [username, dispatch]);

//   useEffect(() => {
//     if (viewedProfile) {
//       setEditFormData({
//         username: viewedProfile.username || '',
//         firstName: viewedProfile.firstName || '',
//         lastName: viewedProfile.lastName || '',
//         bio: viewedProfile.bio || '',
//       });
//     }
//   }, [viewedProfile]);

//   // Generate preview canvas for cropped image
//   useEffect(() => {
//     if (
//       completedCrop?.width &&
//       completedCrop?.height &&
//       imgRef.current &&
//       previewCanvasRef.current
//     ) {
//       canvasPreview(
//         imgRef.current,
//         previewCanvasRef.current,
//         completedCrop,
//         scale,
//         rotate,
//       );
//     }
//   }, [completedCrop, scale, rotate]);

//   const getAvatarUrl = (avatarPath) => {
//     if (!avatarPath) return null;
//     if (avatarPath.startsWith('http')) return avatarPath;
//     const baseUrl = import.meta.env?.VITE_API_URL || 
//                     (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : null) || 
//                     'http://localhost:4000';
//     return `${baseUrl}${avatarPath}`;
//   };

//   const canvasPreview = (
//     image,
//     canvas,
//     crop,
//     scale = 1,
//     rotate = 0,
//   ) => {
//     const ctx = canvas.getContext('2d');

//     if (!ctx) {
//       throw new Error('No 2d context');
//     }

//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;
//     const pixelRatio = window.devicePixelRatio;

//     canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
//     canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

//     ctx.scale(pixelRatio, pixelRatio);
//     ctx.imageSmoothingQuality = 'high';

//     const cropX = crop.x * scaleX;
//     const cropY = crop.y * scaleY;

//     const rotateRads = rotate * (Math.PI / 180);
//     const centerX = image.naturalWidth / 2;
//     const centerY = image.naturalHeight / 2;

//     ctx.save();

//     ctx.translate(-cropX, -cropY);
//     ctx.translate(centerX, centerY);
//     ctx.rotate(rotateRads);
//     ctx.scale(scale, scale);
//     ctx.translate(-centerX, -centerY);
//     ctx.drawImage(
//       image,
//       0,
//       0,
//       image.naturalWidth,
//       image.naturalHeight,
//       0,
//       0,
//       image.naturalWidth,
//       image.naturalHeight,
//     );

//     ctx.restore();
//   };

//   const onSelectFile = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setCrop(undefined); // Makes crop preview update between images.
//       const reader = new FileReader();
//       reader.addEventListener('load', () => {
//         setImageSrc(reader.result?.toString() || '');
//         setCropDialogOpen(true);
//       });
//       reader.readAsDataURL(e.target.files[0]);
//     }
//   };

//   const onImageLoad = (e) => {
//     imgRef.current = e.currentTarget;
//     const { width, height } = e.currentTarget;
//     setCrop(centerAspectCrop(width, height, 1));
//   };

//   const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
//     return {
//       unit: '%',
//       width: 90,
//       height: 90,
//       x: 5,
//       y: 5,
//       aspect,
//     };
//   };

//   const handleCropComplete = async () => {
//     if (
//       completedCrop?.width &&
//       completedCrop?.height &&
//       imgRef.current &&
//       previewCanvasRef.current
//     ) {
//       // Get the cropped image as a blob
//       previewCanvasRef.current.toBlob((blob) => {
//         if (!blob) {
//           console.error('Failed to create blob');
//           return;
//         }

//         const formData = new FormData();
//         formData.append('avatar', blob, 'avatar.jpg');
        
//         // Upload the cropped image
//         uploadAvatar(formData).unwrap()
//           .then(() => {
//             setCropDialogOpen(false);
//             setImageSrc(null);
//           })
//           .catch((error) => {
//             console.error('Avatar upload error:', error);
//           });
//       }, 'image/jpeg');
//     }
//   };

//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   const handleFollowToggle = async () => {
//     try {
//       if (viewedProfile.isFollowing) {
//         await unfollowUser(viewedProfile.id).unwrap();
//       } else {
//         await followUser(viewedProfile.id).unwrap();
//       }
//     } catch (error) {
//       console.error('Follow/unfollow error:', error);
//     }
//   };

//   const handleEditProfile = () => {
//     setEditDialogOpen(true);
//   };

//   const handleUpdateProfile = async () => {
//     try {
//       await updateProfile(editFormData).unwrap();
//       setEditDialogOpen(false);
//     } catch (error) {
//       console.error('Update profile error:', error);
//     }
//   };

//   const handleOpenFollowersList = () => {
//     setListType('followers');
//     setShowFollowList(true);
//   };

//   const handleOpenFollowingList = () => {
//     setListType('following');
//     setShowFollowList(true);
//   };

//   const handleCloseFollowList = () => {
//     setShowFollowList(false);
//     setListType('');
//   };

// // Early return for loading state
// if (!profileIdentifier && !isAuthLoading) {
//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       <Alert severity="info">
//         {username ? "Profile not specified. Please provide a username." : "Please log in to view your profile or specify a username in the URL."}
//       </Alert>
//     </Container>
//   );
// }

// if (isAuthLoading || (isFetchingProfile && !viewedProfile)){
//     return (
//       <Container maxWidth="md" sx={{ mt: 4 }}>
//         <Paper sx={{ p: 3, borderRadius: 3 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//             <Skeleton variant="circular" width={120} height={120} />
//             <Box sx={{ ml: 3, flexGrow: 1 }}>
//               <Skeleton variant="text" width="70%" height={32} />
//               <Skeleton variant="text" width="50%" height={24} />
//               <Skeleton variant="text" width="80%" height={20} />
//             </Box>
//           </Box>
//           <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
//         </Paper>
//       </Container>
//     );
//   }

//   if (profileError && !viewedProfile) {
//     return (
//       <Container maxWidth="md" sx={{ mt: 4 }}>
//         <Alert severity="error">
//           Failed to load profile: {profileError?.data?.error || profileError?.message || 'Unknown error'}
//         </Alert>
//       </Container>
//     );
//   }

//   if (!viewedProfile) {
//     return (
//       <Container maxWidth="md" sx={{ mt: 4 }}>
//         <Alert severity="warning">Profile not found.</Alert>
//       </Container>
//     );
//   }

//   const isOwnProfile = authUser?.id === viewedProfile.id;

//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
//         {/* Profile Header */}
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
//           <Box sx={{ position: 'relative' }}>
//             <Avatar
//               src={getAvatarUrl(viewedProfile.avatar)}
//               sx={{ width: 120, height: 120, border: '4px solid #e0e0e0' }}
//             >
//               {viewedProfile.firstName?.[0]}{viewedProfile.lastName?.[0]}
//             </Avatar>
            
//             {isOwnProfile && (
//               <>
//                 <input
//                   accept="image/*"
//                   style={{ display: 'none' }}
//                   id="avatar-upload"
//                   type="file"
//                   onChange={onSelectFile}
//                 />
//                 <label htmlFor="avatar-upload">
//                   <IconButton
//                     component="span"
//                     sx={{
//                       position: 'absolute',
//                       bottom: 0,
//                       right: 0,
//                       bgcolor: 'primary.main',
//                       color: 'white',
//                       '&:hover': { bgcolor: 'primary.dark' },
//                     }}
//                     disabled={isUploadingAvatar}
//                   >
//                     {isUploadingAvatar ? <CircularProgress size={20} color="inherit" /> : <CameraIcon />}
//                   </IconButton>
//                 </label>
//               </>
//             )}
//           </Box>
          
//           <Box sx={{ ml: 3, flexGrow: 1 }}>
//             <Typography variant="h4" component="h1" gutterBottom>
//               {viewedProfile.firstName} {viewedProfile.lastName}
//             </Typography>
//             <Typography variant="h6" color="text.secondary" gutterBottom>
//               @{viewedProfile.username}
//             </Typography>
            
//             {viewedProfile.bio && (
//               <Typography variant="body1" paragraph>
//                 {viewedProfile.bio}
//               </Typography>
//             )}
            
//             <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
//               <Box sx={{ textAlign: 'center' }}>
//                 <Typography variant="h6">{viewedProfile.postsCount}</Typography>
//                 <Typography variant="body2" color="text.secondary">Posts</Typography>
//               </Box>
//               <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleOpenFollowersList}>
//                 <Typography variant="h6">{viewedProfile.followersCount}</Typography>
//                 <Typography variant="body2" color="text.secondary">Followers</Typography>
//               </Box>
//               <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleOpenFollowingList}>
//                 <Typography variant="h6">{viewedProfile.followingCount}</Typography>
//                 <Typography variant="body2" color="text.secondary">Following</Typography>
//               </Box>
//             </Box>
            
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               {isOwnProfile ? (
//                 <>
//                   <Button
//                     variant="outlined"
//                     startIcon={<EditIcon />}
//                     onClick={handleEditProfile}
//                   >
//                     Edit Profile
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     startIcon={<SettingsIcon />}
//                   >
//                     Settings
//                   </Button>
//                 </>
//               ) : (
//                 <Button
//                   variant={viewedProfile.isFollowing ? "outlined" : "contained"}
//                   onClick={handleFollowToggle}
//                   sx={{ minWidth: 120 }}
//                 >
//                   {viewedProfile.isFollowing ? 'Unfollow' : 'Follow'}
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       </Paper>

//       {/* Profile Tabs */}
//       <Paper sx={{ borderRadius: 3 }}>
//         <Tabs 
//           value={tabValue} 
//           onChange={handleTabChange}
//           sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
//         >
//           <Tab label="Posts" />
//           <Tab label="Followers" onClick={handleOpenFollowersList} />
//           <Tab label="Following" onClick={handleOpenFollowingList} />
//         </Tabs>
        
//         <TabPanel value={tabValue} index={0}>
//           <Box sx={{ p: 2 }}>
//             {viewedProfile.posts && viewedProfile.posts.length > 0 ? (
//               viewedProfile.posts.map((post) => (
//                 <PostCard
//                   key={post.id}
//                   post={post}
//                   onLike={(postId) => console.log('Like post:', postId)}
//                   onComment={(postId) => console.log('Comment on post:', postId)}
//                   onSave={(postId) => console.log('Save post:', postId)}
//                 />
//               ))
//             ) : (
//               <Box sx={{ textAlign: 'center', py: 8 }}>
//                 <Typography variant="h6" color="text.secondary">
//                   No posts yet
//                 </Typography>
//               </Box>
//             )}
//           </Box>
//         </TabPanel>
        
//         <TabPanel value={tabValue} index={1}>
//           <Box sx={{ p: 2, textAlign: 'center' }}>
//             <Typography variant="body1" color="text.secondary">
//               Click "Followers" above or the count to view the list.
//             </Typography>
//           </Box>
//         </TabPanel>
        
//         <TabPanel value={tabValue} index={2}>
//           <Box sx={{ p: 2, textAlign: 'center' }}>
//             <Typography variant="body1" color="text.secondary">
//               Click "Following" above or the count to view the list.
//             </Typography>
//           </Box>
//         </TabPanel>
//       </Paper>

//       {/* Image Crop Dialog */}
//       <Dialog 
//         open={cropDialogOpen} 
//         onClose={() => setCropDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <CropIcon />
//             Crop Your Avatar
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             {Boolean(imageSrc) && (
//               <ReactCrop
//                 crop={crop}
//                 onChange={(_, percentCrop) => setCrop(percentCrop)}
//                 onComplete={(c) => setCompletedCrop(c)}
//                 aspect={1}
//                 minWidth={50}
//                 minHeight={50}
//                 circularCrop
//               >
//                 <img
//                   ref={imgRef}
//                   alt="Crop me"
//                   src={imageSrc}
//                   style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
//                   onLoad={onImageLoad}
//                 />
//               </ReactCrop>
//             )}
            
//             {Boolean(completedCrop) && (
//               <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//                 <Box sx={{ textAlign: 'center' }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Preview
//                   </Typography>
//                   <canvas
//                     ref={previewCanvasRef}
//                     style={{
//                       border: '1px solid black',
//                       objectFit: 'contain',
//                       width: 150,
//                       height: 150,
//                       borderRadius: '50%',
//                     }}
//                   />
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setCropDialogOpen(false)}>Cancel</Button>
//           <Button 
//             onClick={handleCropComplete}
//             variant="contained"
//             disabled={isUploadingAvatar || !completedCrop?.width || !completedCrop?.height}
//           >
//             {isUploadingAvatar ? <CircularProgress size={20} color="inherit" /> : 'Upload'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Edit Profile Dialog */}
//       <Dialog 
//         open={editDialogOpen} 
//         onClose={() => setEditDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>Edit Profile</DialogTitle>
//         <DialogContent>
//           <Box sx={{ pt: 1 }}>
//             <TextField
//               fullWidth
//               label="Username"
//               value={editFormData.username}
//               onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="First Name"
//               value={editFormData.firstName}
//               onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Last Name"
//               value={editFormData.lastName}
//               onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
//               margin="normal"
//             />
//             <TextField
//               fullWidth
//               label="Bio"
//               multiline
//               rows={3}
//               value={editFormData.bio}
//               onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
//               margin="normal"
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
//           <Button 
//             onClick={handleUpdateProfile}
//             variant="contained"
//             disabled={isUpdating}
//           >
//             {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Save'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Followers/Following List Dialog */}
//       {viewedProfile && (
//         <FollowersFollowingList
//           userId={viewedProfile.id}
//           type={listType}
//           open={showFollowList}
//           onClose={handleCloseFollowList}
//         />
//       )}
//     </Container>
//   );
// };

// export default Profile;
// pages/Profile.jsx
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
    authUser,
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
          Failed to load profile: {profileError?.data?.error || profileError?.message || 'Unknown error'}
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

      <SearchUsers
        open={searchDialogOpen}
        onClose={handleCloseSearchDialog}
      />
    </Container>
  );
};

export default Profile;

