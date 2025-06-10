// hooks/useChatApi.js
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export const useChatApi = () => {
  const token = useSelector(state => state.auth.token);
  
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log('Making API call to:', `/api/chat${endpoint}`);
      console.log('With config:', config);

      const response = await fetch(`/api/chat${endpoint}`, config);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is HTML (likely a redirect to login page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML response, likely redirected to login page');
        throw new Error('Authentication required - received HTML instead of JSON');
      }

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (parseError) {
          // If we can't parse the error response, create a generic error
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {};
      }

      // Try to parse JSON response
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from server');
      }

    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, [token]);

  // Get all conversations for the current user
  const getConversations = useCallback(async () => {
    try {
      console.log('Fetching conversations...');
      const data = await apiCall('/conversations');
      console.log('Conversations fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }, [apiCall]);

  // Get or create a conversation with another user
  const createConversation = useCallback(async (participantId) => {
    try {
      console.log('Creating conversation with participant:', participantId);
      const data = await apiCall('/conversations', {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      });
      console.log('Conversation created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, [apiCall]);

  // Get messages for a specific conversation
  const getMessages = useCallback(async (conversationId, page = 1, limit = 50) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const data = await apiCall(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
      console.log('Messages fetched successfully:', data?.length || 0, 'messages');
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }, [apiCall]);

  // Send a message to a conversation
  const sendMessage = useCallback(async (conversationId, content, type = 'TEXT') => {
    try {
      console.log('Sending message to conversation:', conversationId);
      const data = await apiCall(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, type }),
      });
      console.log('Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [apiCall]);

  // Mark messages as read in a conversation
  const markAsRead = useCallback(async (conversationId) => {
    try {
      console.log('Marking messages as read for conversation:', conversationId);
      const data = await apiCall(`/conversations/${conversationId}/messages/read`, {
        method: 'PATCH',
      });
      console.log('Messages marked as read:', data);
      return data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }, [apiCall]);

  // Search for users to start new conversations
  const searchUsers = useCallback(async (query) => {
    try {
      console.log('Searching users with query:', query);
      const data = await apiCall(`/users/search?q=${encodeURIComponent(query)}`);
      console.log('Users found:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }, [apiCall]);

  // Get conversation details
  const getConversation = useCallback(async (conversationId) => {
    try {
      console.log('Fetching conversation details:', conversationId);
      const data = await apiCall(`/conversations/${conversationId}`);
      console.log('Conversation details fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }, [apiCall]);

  return {
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
    markAsRead,
    searchUsers,
    getConversation,
  };
};