// // src/components/PublicFeed/PublicFeedPostCardWrapper.jsx
// import React from 'react';
// import { Card, CardContent, Box, Typography, Avatar, IconButton, useTheme, useMediaQuery } from '@mui/material';
// import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
// import { useSelector } from 'react-redux';
// import { getAvatarUrl } from '../utils/profileUtils'; // Adjust path
// import PostCard from '../components/Profile/PostCard'; // Adjust path

// const PublicFeedPostCardWrapper = ({ post, onLoginPrompt, onLike, onComment, onSave, isActionLoading }) => {
//   const currentUser = useSelector(state => state.auth.user);
//   const isLoggedIn = !!currentUser;
//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

//   const handleAction = (actionCallback) => {
//     if (!isLoggedIn) {
//       onLoginPrompt();
//       return;
//     }
//     actionCallback();
//   };

//   const enhancedPost = {
//     ...post,
//     timeAgo: post.timeAgo || new Date(post.createdAt).toLocaleDateString(),
//     author: {
//       ...post.author,
//       name: `${post.author.firstName} ${post.author.lastName}`,
//       username: post.author.username
//     }
//   };

//   return (
//     <Card sx={{
//       mb: { xs: 1.5, sm: 2 },
//       borderRadius: { xs: 1, sm: 2 },
//       boxShadow: { xs: 1, sm: 2 },
//       mx: { xs: 0, sm: 0 }
//     }}>
//       <CardContent sx={{
//         p: { xs: 2, sm: 3 },
//         '&:last-child': { pb: { xs: 2, sm: 3 } }
//       }}>
//         <Box sx={{
//           display: 'flex',
//           alignItems: 'center',
//           mb: { xs: 1.5, sm: 2 },
//           gap: { xs: 1, sm: 1.5 }
//         }}>
//           <Avatar
//             src={getAvatarUrl(post.author.avatar)}
//             sx={{
//               width: { xs: 36, sm: 40 },
//               height: { xs: 36, sm: 40 },
//               fontSize: { xs: '0.875rem', sm: '1rem' }
//             }}
//           >
//             {post.author.firstName?.[0]}{post.author.lastName?.[0]}
//           </Avatar>

//           <Box sx={{
//             flexGrow: 1,
//             minWidth: 0,
//             mr: { xs: 1, sm: 2 }
//           }}>
//             <Typography
//               variant={isSmallScreen ? "body2" : "subtitle2"}
//               fontWeight="bold"
//               noWrap
//               sx={{
//                 fontSize: { xs: '0.875rem', sm: '1rem' },
//                 lineHeight: { xs: 1.2, sm: 1.4 }
//               }}
//             >
//               {post.author.firstName} {post.author.lastName}
//             </Typography>
//             <Typography
//               variant="caption"
//               color="text.secondary"
//               noWrap
//               sx={{
//                 fontSize: { xs: '0.7rem', sm: '0.75rem' },
//                 display: 'block'
//               }}
//             >
//               @{post.author.username} • {enhancedPost.timeAgo}
//             </Typography>
//           </Box>

//           <IconButton
//             size={isSmallScreen ? "small" : "medium"}
//             color="primary"
//             onClick={onLoginPrompt}
//             title={isLoggedIn ? "Follow" : "Login to follow"}
//             sx={{
//               flexShrink: 0,
//               p: { xs: 0.5, sm: 1 }
//             }}
//           >
//             <PersonAddIcon fontSize={isSmallScreen ? "small" : "medium"} />
//           </IconButton>
//         </Box>

//         <PostCard
//           post={enhancedPost}
//           onLike={() => handleAction(onLike)}
//           onComment={() => handleAction(onComment)}
//           onSave={isLoggedIn ? () => handleAction(onSave) : null}
//           showActions={true}
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default PublicFeedPostCardWrapper;
// src/components/PublicFeed/PublicFeedPostCardWrapper.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getAvatarUrl } from '../utils/profileUtils'; // Adjust path
import PostCard from '../components/Profile/PostCard'; // Adjust path

const PublicFeedPostCardWrapper = ({ post, onLoginPrompt, onLike, onComment, onSave }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const isLoggedIn = !!currentUser;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine if the current post is saved by the current user
  const isPostSaved =
    isLoggedIn &&
    currentUser.savedPosts &&
    currentUser.savedPosts.some((savedPost) => savedPost._id === post._id);

  const handleAction = (actionCallback) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    actionCallback();
  };

  const enhancedPost = {
    ...post,
    timeAgo: post.timeAgo || new Date(post.createdAt).toLocaleDateString(),
    author: {
      ...post.author,
      name: `${post.author.firstName} ${post.author.lastName}`,
      username: post.author.username,
    },
  };

  return (
    <Card
      sx={{
        mb: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1, sm: 2 },
        boxShadow: { xs: 1, sm: 2 },
        mx: { xs: 0, sm: 0 },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          '&:last-child': { pb: { xs: 2, sm: 3 } },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <Avatar
            src={getAvatarUrl(post.author.avatar)}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {post.author.firstName?.[0]}
            {post.author.lastName?.[0]}
          </Avatar>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              mr: { xs: 1, sm: 2 },
            }}
          >
            <Typography
              variant={isSmallScreen ? 'body2' : 'subtitle2'}
              fontWeight="bold"
              noWrap
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: { xs: 1.2, sm: 1.4 },
              }}
            >
              {post.author.firstName} {post.author.lastName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                display: 'block',
              }}
            >
              @{post.author.username} • {enhancedPost.timeAgo}
            </Typography>
          </Box>

          <IconButton
            size={isSmallScreen ? 'small' : 'medium'}
            color="primary"
            onClick={onLoginPrompt}
            title={isLoggedIn ? 'Follow' : 'Login to follow'}
            sx={{
              flexShrink: 0,
              p: { xs: 0.5, sm: 1 },
            }}
          >
            <PersonAddIcon fontSize={isSmallScreen ? 'small' : 'medium'} />
          </IconButton>
        </Box>

        <PostCard
          post={enhancedPost}
          onLike={() => handleAction(onLike)}
          onComment={() => handleAction(onComment)}
          onSave={() => handleAction(onSave)} // Always pass onSave, let PostCard handle isLoggedIn state
          isSaved={isPostSaved} // Pass the saved status
          showActions={true}
        />
      </CardContent>
    </Card>
  );
};

export default PublicFeedPostCardWrapper;
