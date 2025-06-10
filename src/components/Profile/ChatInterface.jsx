// import React, { useState, useEffect } from 'react';
// import { Box, Grid, Paper, Typography } from '@mui/material';
// import { useSelector } from 'react-redux';
// import ConversationsList from './ConversationsList';
// import ChatWindow from './ChatWindow';
// import UserSearch from './UserSearch';
// import { useSocket } from '../../hooks/useSocket';
// import { useChatApi } from '../../hooks/useChatApi';

// const ChatInterface = () => {
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showUserSearch, setShowUserSearch] = useState(false);

//   const currentUser = useSelector(state => state.auth.user);
//   const socket = useSocket();
//   const { getConversations, createConversation } = useChatApi();

//   // Load conversations on mount
//   useEffect(() => {
//     loadConversations();
//   }, []);

//   // Socket event listeners
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (message) => {
//       setConversations(prev => 
//         prev.map(conv => {
//           if (conv.id === message.conversationId) {
//             return {
//               ...conv,
//               lastMessage: message,
//               lastMessageAt: message.createdAt,
//               unreadCount: selectedConversation?.id === conv.id ? 0 : conv.unreadCount + 1
//             };
//           }
//           return conv;
//         })
//       );
//     };

//     const handleNewMessageNotification = ({ conversationId, message, fromUser }) => {
//       if (selectedConversation?.id !== conversationId) {
//         setConversations(prev =>
//           prev.map(conv => {
//             if (conv.id === conversationId) {
//               return {
//                 ...conv,
//                 lastMessage: message,
//                 lastMessageAt: message.createdAt,
//                 unreadCount: conv.unreadCount + 1
//               };
//             }
//             return conv;
//           })
//         );
//       }
//     };

//     socket.on('new_message', handleNewMessage);
//     socket.on('new_message_notification', handleNewMessageNotification);

//     return () => {
//       socket.off('new_message', handleNewMessage);
//       socket.off('new_message_notification', handleNewMessageNotification);
//     };
//   }, [socket, selectedConversation]);

//   const loadConversations = async () => {
//     try {
//       setLoading(true);
//       const data = await getConversations();
//       setConversations(data || []);
//     } catch (error) {
//       console.error('Error loading conversations:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectConversation = (conversation) => {
//     setSelectedConversation(conversation);
    
//     // Mark messages as read
//     if (conversation.unreadCount > 0) {
//       setConversations(prev => 
//         prev.map(conv => 
//           conv.id === conversation.id 
//             ? { ...conv, unreadCount: 0 }
//             : conv
//         )
//       );
//     }
//   };

//   const handleStartNewConversation = async (user) => {
//     try {
//       const conversation = await createConversation(user.id);
      
//       // Check if conversation already exists in list
//       const existingConv = conversations.find(conv => conv.id === conversation.id);
//       if (!existingConv) {
//         setConversations(prev => [conversation, ...prev]);
//       }
      
//       setSelectedConversation(conversation);
//       setShowUserSearch(false);
//     } catch (error) {
//       console.error('Error creating conversation:', error);
//     }
//   };

//   return (
//     <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
//       <Grid container sx={{ flexGrow: 1, height: '100%' }}>
//         {/* Conversations List */}
//         <Grid item xs={12} md={4} sx={{ height: '100%' }}>
//           <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//             <ConversationsList
//               conversations={conversations}
//               selectedConversation={selectedConversation}
//               onSelectConversation={handleSelectConversation}
//               onStartNewChat={() => setShowUserSearch(true)}
//               loading={loading}
//             />
//           </Paper>
//         </Grid>

//         {/* Chat Window */}
//         <Grid item xs={12} md={8} sx={{ height: '100%' }}>
//           <Paper sx={{ height: '100%' }}>
//             {selectedConversation ? (
//               <ChatWindow 
//                 conversation={selectedConversation}
//                 currentUser={currentUser}
//                 socket={socket}
//               />
//             ) : (
//               <Box 
//                 sx={{ 
//                   height: '100%', 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   justifyContent: 'center',
//                   flexDirection: 'column',
//                   color: 'text.secondary'
//                 }}
//               >
//                 <Typography variant="h6" gutterBottom>
//                   Welcome to Messages
//                 </Typography>
//                 <Typography variant="body2">
//                   Select a conversation to start chatting or start a new conversation
//                 </Typography>
//               </Box>
//             )}
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* User Search Modal */}
//       <UserSearch
//         open={showUserSearch}
//         onClose={() => setShowUserSearch(false)}
//         onSelectUser={handleStartNewConversation}
//       />
//     </Box>
//   );
// };

// export default ChatInterface;
// src/components/ChatInterface.jsx
import React, { useState, useEffect } from 'react';
import { useGetConversationsQuery } from '../../features/profile/chatApi';
import ChatWindow from './ChatWindow'; // Import your ChatWindow component
import UserSearch from './UserSearch'; // Import your UserSearch component
import socket from '../../hooks/useSocket'; // Import your Socket.IO client

const ChatInterface = () => {
  const { data: conversations, isLoading, isError, error, refetch } = useGetConversationsQuery();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Effect to handle Socket.IO connection and events
  useEffect(() => {
    // Attempt to connect socket if not already connected
    if (!socketConnected && localStorage.getItem('token')) {
      socket.auth.token = localStorage.getItem('token'); // Ensure token is up-to-date
      socket.connect();
    }

    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('ChatInterface: Socket Connected');
    });

    socket.on('disconnect', (reason) => {
      setSocketConnected(false);
      console.log('ChatInterface: Socket Disconnected', reason);
    });

    socket.on('new_message', (message) => {
      console.log('New message received via socket:', message);
      // Invalidate the conversations list to show new unread counts or last message
      // and invalidate the specific conversation's messages if it's the active one
      refetch();
      if (selectedConversation && selectedConversation.id === message.conversationId) {
        // This is a simple refetch; a more advanced approach might use Redux updates
        // to append the message directly without refetching the whole list.
        // For now, this invalidation will trigger the RTK Query to re-fetch messages.
        socket.emit('mark_messages_read', { conversationId: message.conversationId });
      }
    });

    socket.on('new_message_notification', (data) => {
      console.log('New message notification:', data);
      // This is for notifications outside the active chat window
      refetch(); // Update conversation list (unread counts)
      // You might want to show a toast notification here
    });

    socket.on('messages_read', (data) => {
      console.log('Messages read notification:', data);
      refetch(); // To update unread counts on the conversation list
    });

    socket.on('user_status_change', (data) => {
      console.log('User status change:', data);
      // You might want to update participant status in your UI
      refetch(); // A blunt way to update, better is direct state update
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.message === 'Authentication error') {
        // Handle unauthenticated socket, e.g., redirect to login
        alert('Socket connection failed: Authentication required. Please log in.');
        // window.location.href = '/login'; // Example redirect
      }
    });


    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_message');
      socket.off('new_message_notification');
      socket.off('messages_read');
      socket.off('user_status_change');
      socket.off('error');
      // socket.disconnect(); // Disconnect on unmount if no other component uses it
    };
  }, [selectedConversation, refetch, socketConnected]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowUserSearch(false); // Hide search when a conversation is selected
  };

  const handleNewChat = () => {
    setSelectedConversation(null); // Deselect any active conversation
    setShowUserSearch(true); // Show the user search interface
  };

  const handleConversationCreated = (newConv) => {
    setSelectedConversation(newConv);
    setShowUserSearch(false);
    refetch(); // Re-fetch conversations to include the new one
  };

  if (isLoading) return <div className="p-4">Loading conversations...</div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error.message || 'Failed to load conversations'}</div>;

  return (
    <div className="flex h-full border border-gray-200 rounded-lg shadow-sm">
      {/* Conversation List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <button
            onClick={handleNewChat}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            + New Chat
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {conversations?.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No conversations yet. Start a new one!</li>
          ) : (
            conversations?.map((conv) => (
              <li
                key={conv.id}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                {conv.participant?.avatar ? (
                  <img
                    src={conv.participant.avatar}
                    alt={conv.participant.username}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
                    {conv.participant?.username ? conv.participant.username[0].toUpperCase() : '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-md font-medium text-gray-900 truncate">
                    {conv.participant?.firstName} {conv.participant?.lastName || conv.participant?.username}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage?.content || 'No messages yet.'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Chat Window / User Search Area */}
      <div className="w-2/3 bg-gray-50 flex flex-col">
        {showUserSearch ? (
          <UserSearch onConversationCreated={handleConversationCreated} />
        ) : selectedConversation ? (
          <ChatWindow conversation={selectedConversation} socket={socket} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or start a new chat.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;