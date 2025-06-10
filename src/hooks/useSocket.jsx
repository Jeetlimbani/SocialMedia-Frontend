// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', { // Your backend Socket.IO URL
  autoConnect: false, // Don't connect automatically
  auth: {
    token: localStorage.getItem('token'), // Pass token for authentication
  },
  query: {
    // You might want to pass user ID or other initial data here if needed
  }
});

// Event listeners for basic socket events
socket.on('connect', () => {
  console.log('Connected to Socket.IO server!');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from Socket.IO server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
  // Handle authentication errors specifically
  if (error.message === 'Authentication error') {
    console.error('Socket authentication failed. Redirecting to login...');
    // Optionally redirect to login or show an alert
    // window.location.href = '/login';
  }
});

export default socket;