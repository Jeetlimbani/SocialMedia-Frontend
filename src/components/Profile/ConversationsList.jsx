import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Button,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Message as MessageIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ConversationsList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onStartNewChat,
  loading
}) => {
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const getLastMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    
    if (message.type === 'IMAGE') {
      return '📷 Image';
    }
    
    return message.content?.length > 50 
      ? `${message.content.substring(0, 50)}...` 
      : message.content || 'No messages yet';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Messages
          </Typography>
          <IconButton onClick={onStartNewChat} color="primary">
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No conversations yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start a conversation with someone
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onStartNewChat}
              size="small"
            >
              New Message
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {conversations.map((conversation, index) => {
              const participant = conversation.participant;
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <React.Fragment key={conversation.id}>
                  <ListItem
                    button
                    selected={isSelected}
                    onClick={() => onSelectConversation(conversation)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unreadCount || 0}
                        color="error"
                        invisible={!conversation.unreadCount}
                      >
                        <Avatar 
                          src={participant?.avatar} 
                          alt={participant?.username}
                          sx={{ width: 48, height: 48 }}
                        >
                          {participant?.firstName?.[0] || participant?.username?.[0] || '?'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: conversation.unreadCount ? 'bold' : 'normal',
                              color: isSelected ? 'primary.contrastText' : 'text.primary'
                            }}
                          >
                            {participant?.firstName && participant?.lastName
                              ? `${participant.firstName} ${participant.lastName}`
                              : participant?.username || 'Unknown User'
                            }
                          </Typography>
                          
                          {conversation.lastMessageAt && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: isSelected ? 'primary.contrastText' : 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              {formatLastMessageTime(conversation.lastMessageAt)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: isSelected ? 'primary.contrastText' : 'text.secondary',
                            fontWeight: conversation.unreadCount ? 'medium' : 'normal',
                            mt: 0.5
                          }}
                        >
                          {conversation.lastMessage?.sender?.id !== participant?.id && 
                           conversation.lastMessage?.sender ? 'You: ' : ''}
                          {getLastMessagePreview(conversation.lastMessage)}
                        </Typography>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                  
                  {index < conversations.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ConversationsList;