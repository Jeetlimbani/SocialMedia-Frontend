// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   IconButton,
//   Avatar,
//   Paper,
//   CircularProgress,
//   Alert,
//   Chip,
//   Divider,
//   Tooltip
// } from '@mui/material';
// import { 
//   Send as SendIcon, 
//   EmojiEmotions as EmojiIcon,
//   AttachFile as AttachFileIcon,
//   MoreVert as MoreVertIcon 
// } from '@mui/icons-material';
// import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
// import { useChatApi } from '../../hooks/useChatApi';

// const ChatWindow = ({ conversation, currentUser, socket }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);

//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const inputRef = useRef(null);

//   const { getMessages, sendMessage, markAsRead } = useChatApi();

//   // Load messages when conversation changes
//   useEffect(() => {
//     if (conversation?.id) {
//       loadMessages();
//       markMessagesAsRead();
//     }
//   }, [conversation?.id]);

//   // Socket event listeners
//   useEffect(() => {
//     if (!socket || !conversation?.id) return;

//     const handleNewMessage = (message) => {
//       if (message.conversationId === conversation.id) {
//         setMessages(prev => [...prev, message]);
//         markMessagesAsRead();
//         scrollToBottom();
//       }
//     };

//     const handleTypingStart = ({ userId, conversationId }) => {
//       if (conversationId === conversation.id && userId !== currentUser.id) {
//         setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
//       }
//     };

//     const handleTypingStop = ({ userId, conversationId }) => {
//       if (conversationId === conversation.id) {
//         setTypingUsers(prev => prev.filter(id => id !== userId));
//       }
//     };

//     socket.on('new_message', handleNewMessage);
//     socket.on('typing_start', handleTypingStart);
//     socket.on('typing_stop', handleTypingStop);

//     // Join conversation room
//     socket.emit('join_conversation', conversation.id);

//     return () => {
//       socket.off('new_message', handleNewMessage);
//       socket.off('typing_start', handleTypingStart);
//       socket.off('typing_stop', handleTypingStop);
//       socket.emit('leave_conversation', conversation.id);
//     };
//   }, [socket, conversation?.id, currentUser.id]);

//   // Auto-scroll to bottom for new messages
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const loadMessages = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await getMessages(conversation.id, 1, 50);
//       setMessages(data || []);
//       setPage(1);
//       setHasMore(data?.length === 50);
//     } catch (error) {
//       console.error('Error loading messages:', error);
//       setError('Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const markMessagesAsRead = async () => {
//     try {
//       await markAsRead(conversation.id);
//     } catch (error) {
//       console.error('Error marking messages as read:', error);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
    
//     if (!newMessage.trim() || sending) return;

//     const messageContent = newMessage.trim();
//     setNewMessage('');
//     setSending(true);

//     try {
//       const message = await sendMessage(conversation.id, messageContent);
      
//       // Emit via socket for real-time delivery
//       if (socket) {
//         socket.emit('send_message', {
//           conversationId: conversation.id,
//           message: message
//         });
//       }

//       // Add to local state immediately for optimistic UI
//       setMessages(prev => [...prev, message]);
//       stopTyping();
      
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setError('Failed to send message');
//       setNewMessage(messageContent); // Restore message on error
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleTyping = useCallback((e) => {
//     setNewMessage(e.target.value);

//     if (!socket || !conversation?.id) return;

//     // Start typing indicator
//     if (!isTyping) {
//       setIsTyping(true);
//       socket.emit('typing_start', {
//         conversationId: conversation.id,
//         userId: currentUser.id
//       });
//     }

//     // Clear existing timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Set new timeout to stop typing
//     typingTimeoutRef.current = setTimeout(() => {
//       stopTyping();
//     }, 2000);
//   }, [socket, conversation?.id, currentUser.id, isTyping]);

//   const stopTyping = useCallback(() => {
//     if (isTyping && socket && conversation?.id) {
//       setIsTyping(false);
//       socket.emit('typing_stop', {
//         conversationId: conversation.id,
//         userId: currentUser.id
//       });
//     }
    
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = null;
//     }
//   }, [isTyping, socket, conversation?.id, currentUser.id]);

//   const formatMessageTime = (timestamp) => {
//     const date = new Date(timestamp);
    
//     if (isToday(date)) {
//       return format(date, 'HH:mm');
//     } else if (isYesterday(date)) {
//       return `Yesterday ${format(date, 'HH:mm')}`;
//     } else {
//       return format(date, 'MMM dd, HH:mm');
//     }
//   };

//   const shouldShowDateSeparator = (currentMsg, previousMsg) => {
//     if (!previousMsg) return true;
    
//     const currentDate = new Date(currentMsg.createdAt);
//     const previousDate = new Date(previousMsg.createdAt);
    
//     return currentDate.toDateString() !== previousDate.toDateString();
//   };

//   const formatDateSeparator = (timestamp) => {
//     const date = new Date(timestamp);
    
//     if (isToday(date)) {
//       return 'Today';
//     } else if (isYesterday(date)) {
//       return 'Yesterday';
//     } else {
//       return format(date, 'MMMM dd, yyyy');
//     }
//   };

//   if (!conversation) {
//     return (
//       <Box sx={{ 
//         height: '100%', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center',
//         color: 'text.secondary'
//       }}>
//         <Typography variant="h6">Select a conversation to start chatting</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//       {/* Chat Header */}
//       <Paper 
//         elevation={1} 
//         sx={{ 
//           p: 2, 
//           borderBottom: 1, 
//           borderColor: 'divider',
//           display: 'flex',
//           alignItems: 'center',
//           gap: 2
//         }}
//       >
//         <Avatar 
//           src={conversation.participant?.avatar} 
//           alt={conversation.participant?.username}
//           sx={{ width: 40, height: 40 }}
//         >
//           {conversation.participant?.firstName?.[0] || conversation.participant?.username?.[0] || '?'}
//         </Avatar>
        
//         <Box sx={{ flexGrow: 1 }}>
//           <Typography variant="h6" sx={{ fontWeight: 500 }}>
//             {conversation.participant?.firstName && conversation.participant?.lastName
//               ? `${conversation.participant.firstName} ${conversation.participant.lastName}`
//               : conversation.participant?.username || 'Unknown User'
//             }
//           </Typography>
          
//           {typingUsers.length > 0 && (
//             <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
//               Typing...
//             </Typography>
//           )}
//         </Box>

//         <IconButton>
//           <MoreVertIcon />
//         </IconButton>
//       </Paper>

//       {/* Messages Container */}
//       <Box 
//         ref={messagesContainerRef}
//         sx={{ 
//           flexGrow: 1, 
//           overflow: 'auto', 
//           p: 1,
//           display: 'flex',
//           flexDirection: 'column'
//         }}
//       >
//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
//             <CircularProgress />
//           </Box>
//         ) : error ? (
//           <Alert severity="error" sx={{ m: 2 }}>
//             {error}
//           </Alert>
//         ) : messages.length === 0 ? (
//           <Box sx={{ 
//             display: 'flex', 
//             flexDirection: 'column',
//             alignItems: 'center', 
//             justifyContent: 'center', 
//             height: '100%',
//             textAlign: 'center',
//             color: 'text.secondary'
//           }}>
//             <Typography variant="h6" gutterBottom>
//               Start the conversation
//             </Typography>
//             <Typography variant="body2">
//               Send a message to {conversation.participant?.firstName || conversation.participant?.username}
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             {messages.map((message, index) => {
//               const previousMessage = messages[index - 1];
//               const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
//               const isOwn = message.senderId === currentUser.id;
//               const showAvatar = !isOwn && (!messages[index + 1] || messages[index + 1].senderId !== message.senderId);

//               return (
//                 <React.Fragment key={message.id}>
//                   {/* Date Separator */}
//                   {showDateSeparator && (
//                     <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
//                       <Divider sx={{ flexGrow: 1 }} />
//                       <Chip 
//                         label={formatDateSeparator(message.createdAt)} 
//                         size="small" 
//                         sx={{ mx: 2, fontSize: '0.75rem' }}
//                       />
//                       <Divider sx={{ flexGrow: 1 }} />
//                     </Box>
//                   )}

//                   {/* Message */}
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       justifyContent: isOwn ? 'flex-end' : 'flex-start',
//                       mb: 1,
//                       alignItems: 'flex-end',
//                       gap: 1
//                     }}
//                   >
//                     {/* Avatar for received messages */}
//                     {!isOwn && (
//                       <Avatar
//                         src={message.sender?.avatar}
//                         alt={message.sender?.username}
//                         sx={{ 
//                           width: 32, 
//                           height: 32,
//                           visibility: showAvatar ? 'visible' : 'hidden'
//                         }}
//                       >
//                         {message.sender?.firstName?.[0] || message.sender?.username?.[0] || '?'}
//                       </Avatar>
//                     )}

//                     <Box
//                       sx={{
//                         maxWidth: '70%',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         alignItems: isOwn ? 'flex-end' : 'flex-start'
//                       }}
//                     >
//                       {/* Message Bubble */}
//                       <Paper
//                         elevation={1}
//                         sx={{
//                           p: 1.5,
//                           backgroundColor: isOwn ? 'primary.main' : 'grey.100',
//                           color: isOwn ? 'primary.contrastText' : 'text.primary',
//                           borderRadius: 2,
//                           borderTopRightRadius: isOwn ? 0.5 : 2,
//                           borderTopLeftRadius: isOwn ? 2 : 0.5,
//                           wordBreak: 'break-word'
//                         }}
//                       >
//                         <Typography variant="body2">
//                           {message.content}
//                         </Typography>
//                       </Paper>

//                       {/* Message Time */}
//                       <Typography 
//                         variant="caption" 
//                         color="text.secondary" 
//                         sx={{ mt: 0.5, px: 0.5 }}
//                       >
//                         {formatMessageTime(message.createdAt)}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </React.Fragment>
//               );
//             })}
            
//             {/* Typing Indicator */}
//             {typingUsers.length > 0 && (
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
//                 <Avatar
//                   src={conversation.participant?.avatar}
//                   sx={{ width: 32, height: 32 }}
//                 >
//                   {conversation.participant?.firstName?.[0] || conversation.participant?.username?.[0] || '?'}
//                 </Avatar>
//                 <Paper
//                   elevation={1}
//                   sx={{
//                     p: 1.5,
//                     backgroundColor: 'grey.100',
//                     borderRadius: 2,
//                     borderTopLeftRadius: 0.5
//                   }}
//                 >
//                   <Box sx={{ display: 'flex', gap: 0.5 }}>
//                     {[0, 1, 2].map((dot) => (
//                       <Box
//                         key={dot}
//                         sx={{
//                           width: 6,
//                           height: 6,
//                           borderRadius: '50%',
//                           backgroundColor: 'text.secondary',
//                           animation: 'typing 1.4s infinite',
//                           animationDelay: `${dot * 0.2}s`,
//                           '@keyframes typing': {
//                             '0%, 60%, 100%': { opacity: 0.3 },
//                             '30%': { opacity: 1 }
//                           }
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </Paper>
//               </Box>
//             )}
            
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </Box>

//       {/* Message Input */}
//       <Paper 
//         elevation={1} 
//         sx={{ 
//           p: 2, 
//           borderTop: 1, 
//           borderColor: 'divider' 
//         }}
//       >
//         <Box 
//           component="form" 
//           onSubmit={handleSendMessage}
//           sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
//         >
//           <IconButton size="small" disabled>
//             <AttachFileIcon />
//           </IconButton>
          
//           <TextField
//             ref={inputRef}
//             fullWidth
//             placeholder="Type a message..."
//             value={newMessage}
//             onChange={handleTyping}
//             onBlur={stopTyping}
//             disabled={sending}
//             variant="outlined"
//             size="small"
//             multiline
//             maxRows={4}
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: 3
//               }
//             }}
//           />
          
//           <IconButton size="small" disabled>
//             <EmojiIcon />
//           </IconButton>
          
//           <Tooltip title="Send message">
//             <IconButton 
//               type="submit" 
//               disabled={!newMessage.trim() || sending}
//               color="primary"
//               sx={{
//                 backgroundColor: 'primary.main',
//                 color: 'white',
//                 '&:hover': {
//                   backgroundColor: 'primary.dark'
//                 },
//                 '&.Mui-disabled': {
//                   backgroundColor: 'action.disabledBackground'
//                 }
//               }}
//             >
//               {sending ? <CircularProgress size={20} /> : <SendIcon />}
//             </IconButton>
//           </Tooltip>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default ChatWindow;
// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
} from '../../features/profile/chatApi';
import { useSelector } from 'react-redux'; // If you store user info in Redux state

const ChatWindow = ({ conversation, socket }) => {
  // Replace with actual user ID from your auth state
  // const currentUserId = useSelector((state) => state.auth.user?.id);
  const currentUserId = localStorage.getItem('userId'); // Example if stored in localStorage

  const {
    data: messages,
    isLoading,
    isError,
    error,
    refetch: refetchMessages,
  } = useGetMessagesQuery({ conversationId: conversation.id });
  const [sendMessage] = useSendMessageMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Join socket room for this conversation
    socket.emit('join_conversation', conversation.id);

    // Mark messages as read when conversation is opened
    markMessagesAsRead(conversation.id);

    // Listen for new messages specific to this conversation
    const handleNewMessage = (message) => {
        if (message.conversationId === conversation.id) {
            // Optimistically update the UI if possible, or trigger refetch
            // For now, we rely on RTK Query's invalidation to refetch messages
            refetchMessages();
            // Also, mark messages as read immediately after receiving a new one
            markMessagesAsRead(conversation.id);
        }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', ({ userId, username, conversationId }) => {
        if (conversationId === conversation.id && userId !== currentUserId) {
            console.log(`${username} is typing...`);
            // You can update a state here to show a "typing..." indicator
        }
    });

    socket.on('user_stop_typing', ({ userId, conversationId }) => {
        if (conversationId === conversation.id && userId !== currentUserId) {
            console.log(`${userId} stopped typing.`);
            // Clear typing indicator
        }
    });

    // Scroll to bottom on messages load/update
    scrollToBottom();

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.emit('leave_conversation', conversation.id);
    };
  }, [conversation.id, socket, markMessagesAsRead, refetchMessages, currentUserId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom when messages array changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        await sendMessage({ conversationId: conversation.id, content: newMessage.trim() }).unwrap();
        setNewMessage('');
        // Stop typing indicator after sending message
        socket.emit('typing_stop', { conversationId: conversation.id });
      } catch (err) {
        console.error('Failed to send message:', err);
        alert('Failed to send message.');
      }
    }
  };

  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);

    // Emit typing start
    if (typingTimeoutRef.current === null) {
      socket.emit('typing_start', { conversationId: conversation.id });
    }

    // Clear previous timeout and set a new one
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: conversation.id });
      typingTimeoutRef.current = null;
    }, 1000); // Stop typing after 1 second of no activity
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Loading messages...</div>;
  if (isError) return <div className="flex-1 flex items-center justify-center text-red-500">Error: {error.message || 'Failed to load messages'}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">
          Chat with {conversation.participant?.firstName} {conversation.participant?.lastName || conversation.participant?.username}
        </h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages?.length === 0 ? (
          <p className="text-center text-gray-500">Start the conversation!</p>
        ) : (
          messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-4 ${
                msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  msg.senderId === currentUserId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <span
                  className={`block text-xs mt-1 ${
                    msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={handleTypingChange}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="ml-3 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;