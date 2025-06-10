import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton, Avatar, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '../features/auth/authSlice';

function UserMenu({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutBackend] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDashboard = () => { handleClose(); navigate('/'); };

  const handleLogout = async () => {
    try {
      await logoutBackend().unwrap();
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      dispatch({ type: 'auth/logoutUser' });
      handleClose();
      navigate('/');
    }
  };

  return (
    <>
      <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
        Welcome, {user.username}
      </Typography>
      <IconButton size="large" aria-label="user account" onClick={handleMenu} color="inherit">
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
          {user.username?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleDashboard}><AccountCircle sx={{ mr: 1 }} /> Dashboard</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;
