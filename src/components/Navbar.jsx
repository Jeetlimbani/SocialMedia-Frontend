import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import UserMenu from './UserMenu';
import { useSelector } from 'react-redux';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || { user: null });

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="home" onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <HomeIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Social Media Platform
        </Typography>

        {!user ? (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
              Login
            </Button>
            <Button 
              color="inherit" 
              variant="outlined" 
              onClick={() => navigate('/register')} 
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            }>
              Register
            </Button>
          </Box>
        ) : (
          <UserMenu user={user} />
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
