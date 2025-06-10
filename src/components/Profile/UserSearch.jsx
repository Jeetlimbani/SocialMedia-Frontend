// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Avatar,
//   Typography,
//   CircularProgress,
//   Box,
//   IconButton,
//   InputAdornment,
//   Divider,
//   Alert
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Close as CloseIcon,
//   Person as PersonIcon
// } from '@mui/icons-material';
// import { useChatApi } from '../../hooks/useChatApi';

// const UserSearch = ({ open, onClose, onSelectUser }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchTimeout, setSearchTimeout] = useState(null);

//   const { searchUsers } = useChatApi();

//   // Clear search when dialog closes
//   useEffect(() => {
//     if (!open) {
//       setSearchQuery('');
//       setSearchResults([]);
//       setError(null);
//     }
//   }, [open]);

//   // Debounced search
//   useEffect(() => {
//     if (searchTimeout) {
//       clearTimeout(searchTimeout);
//     }

//     if (searchQuery.trim().length >= 2) {
//       const timeout = setTimeout(() => {
//         performSearch(searchQuery.trim());
//       }, 500); // 500ms delay

//       setSearchTimeout(timeout);
//     } else {
//       setSearchResults([]);
//       setError(null);
//     }

//     return () => {
//       if (searchTimeout) {
//         clearTimeout(searchTimeout);
//       }
//     };
//   }, [searchQuery]);

//   const performSearch = async (query) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const results = await searchUsers(query);
//       setSearchResults(results || []);
      
//       if (results?.length === 0) {
//         setError('No users found matching your search');
//       }
//     } catch (error) {
//       console.error('Error searching users:', error);
//       setError('Failed to search users. Please try again.');
//       setSearchResults([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUserSelect = useCallback((user) => {
//     onSelectUser(user);
//     onClose();
//   }, [onSelectUser, onClose]);

//   const handleClose = useCallback(() => {
//     setSearchQuery('');
//     setSearchResults([]);
//     setError(null);
//     onClose();
//   }, [onClose]);

//   const getDisplayName = (user) => {
//     if (user.firstName && user.lastName) {
//       return `${user.firstName} ${user.lastName}`;
//     }
//     return user.username || 'Unknown User';
//   };

//   const getSecondaryText = (user) => {
//     if (user.firstName && user.lastName && user.username) {
//       return `@${user.username}`;
//     }
//     return user.firstName || user.lastName || '';
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       maxWidth="sm"
//       fullWidth
//       PaperProps={{
//         sx: { borderRadius: 2, maxHeight: '80vh' }
//       }}
//     >
//       <DialogTitle sx={{ pb: 1 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <Typography variant="h6" component="div">
//             Start New Conversation
//           </Typography>
//           <IconButton onClick={handleClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </Box>
//       </DialogTitle>

//       <DialogContent sx={{ pt: 1 }}>
//         {/* Search Input */}
//         <TextField
//           fullWidth
//           placeholder="Search users by name or username..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           variant="outlined"
//           size="medium"
//           autoFocus
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon color="action" />
//               </InputAdornment>
//             ),
//             endAdornment: loading ? (
//               <InputAdornment position="end">
//                 <CircularProgress size={20} />
//               </InputAdornment>
//             ) : null,
//             sx: { borderRadius: 2 }
//           }}
//           sx={{ mb: 2 }}
//         />

//         {/* Search Results */}
//         <Box sx={{ minHeight: 200, maxHeight: 400 }}>
//           {/* Empty state - no search query */}
//           {searchQuery.length === 0 && (
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: 'column',
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               height: 200,
//               color: 'text.secondary'
//             }}>
//               <SearchIcon sx={{ fontSize: 48, mb: 2 }} />
//               <Typography variant="body1" gutterBottom>
//                 Search for users
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Enter a name or username to find people
//               </Typography>
//             </Box>
//           )}

//           {/* Loading state */}
//           {loading && searchQuery.length > 0 && (
//             <Box sx={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               height: 200 
//             }}>
//               <CircularProgress />
//             </Box>
//           )}

//           {/* Error state */}
//           {error && !loading && (
//             <Alert severity="info" sx={{ mt: 2 }}>
//               {error}
//             </Alert>
//           )}

//           {/* Search query too short */}
//           {searchQuery.length > 0 && searchQuery.length < 2 && !loading && (
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: 'column',
//               alignItems: 'center', 
//               justifyContent: 'center', 
//               height: 200,
//               color: 'text.secondary'
//             }}>
//               <Typography variant="body2">
//                 Type at least 2 characters to search
//               </Typography>
//             </Box>
//           )}

//           {/* Search Results List */}
//           {searchResults.length > 0 && !loading && (
//             <List sx={{ pt: 0 }}>
//               {searchResults.map((user, index) => (
//                 <React.Fragment key={user.id}>
//                   <ListItem
//                     button
//                     onClick={() => handleUserSelect(user)}
//                     sx={{
//                       borderRadius: 1,
//                       mb: 0.5,
//                       '&:hover': {
//                         backgroundColor: 'action.hover'
//                       }
//                     }}
//                   >
//                     <ListItemAvatar>
//                       <Avatar
//                         src={user.avatar}
//                         alt={getDisplayName(user)}
//                         sx={{ width: 48, height: 48 }}
//                       >
//                         {user.firstName?.[0] || user.username?.[0] || <PersonIcon />}
//                       </Avatar>
//                     </ListItemAvatar>

//                     <ListItemText
//                       primary={
//                         <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
//                           {getDisplayName(user)}
//                         </Typography>
//                       }
//                       secondary={
//                         <Typography variant="body2" color="text.secondary">
//                           {getSecondaryText(user)}
//                         </Typography>
//                       }
//                     />
//                   </ListItem>

//                   {index < searchResults.length - 1 && (
//                     <Divider variant="inset" component="li" />
//                   )}
//                 </React.Fragment>
//               ))}
//             </List>
//           )}
//         </Box>

//         {/* Helper Text */}
//         <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
//           <Typography variant="caption" color="text.secondary">
//             💡 Tip: You can search by first name, last name, or username to find people to chat with.
//           </Typography>
//         </Box>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default UserSearch;
// src/components/UserSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchUsersQuery, useCreateConversationMutation } from '../../features/profile/chatApi';

const UserSearch = ({ onConversationCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [createConversation] = useCreateConversationMutation();

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data: users, isLoading, isError, error } = useSearchUsersQuery(debouncedSearchTerm, {
    skip: debouncedSearchTerm.length < 2, // Skip query if search term is too short
  });

  const handleCreateConversation = async (participantId) => {
    try {
      const newConv = await createConversation(participantId).unwrap();
      onConversationCreated(newConv); // Pass the new conversation back to ChatInterface
      setSearchTerm(''); // Clear search input
      setDebouncedSearchTerm('');
    } catch (err) {
      console.error('Failed to create conversation:', err);
      alert(err.data?.message || 'Failed to create conversation.');
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Start a New Chat</h3>
      <input
        type="text"
        placeholder="Search users by username, first name, or last name..."
        className="w-full border border-gray-300 rounded-md py-2 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading && debouncedSearchTerm.length >= 2 && <p>Searching users...</p>}
      {isError && debouncedSearchTerm.length >= 2 && <p className="text-red-500">Error: {error.message || 'Failed to search users'}</p>}

      {users && users.length > 0 ? (
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white rounded-md shadow-sm">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleCreateConversation(user.id)}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm mr-3">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName} ({user.username})
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        debouncedSearchTerm.length >= 2 && !isLoading && !isError && (
          <p className="text-center text-gray-500">No users found.</p>
        )
      )}
    </div>
  );
};

export default UserSearch;