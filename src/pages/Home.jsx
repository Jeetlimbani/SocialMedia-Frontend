import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { People, Chat, Share, Security, Speed, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const features = [
  {
    icon: <People fontSize="large" color="primary" />,
    title: 'Connect with Friends',
    description: 'Build meaningful connections with people who share your interests.',
  },
  {
    icon: <Chat fontSize="large" color="primary" />,
    title: 'Real-time Messaging',
    description: 'Chat instantly with your friends and family members.',
  },
  {
    icon: <Share fontSize="large" color="primary" />,
    title: 'Share Moments',
    description: 'Share your favorite moments, photos, and thoughts with your network.',
  },
  {
    icon: <Security fontSize="large" color="primary" />,
    title: 'Privacy First',
    description: 'Your data is secure with our advanced privacy protection.',
  },
  {
    icon: <Speed fontSize="large" color="primary" />,
    title: 'Fast & Reliable',
    description: 'Lightning-fast performance with 99.9% uptime guarantee.',
  },
  {
    icon: <Favorite fontSize="large" color="primary" />,
    title: 'Community Driven',
    description: 'Join a community that values authentic connections.',
  },
];

function Home() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          mb: 6,
          color: 'white',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Welcome to Your Social World
        </Typography>
        <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
          Connect, share, and discover amazing content with friends and communities
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Chip label="🚀 Fast" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />
          <Chip
            label="🔒 Secure"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
          <Chip
            label="🌍 Global"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Stack>

        {!user ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Get Started Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Sign In
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(`/profile/${user?.username}`)}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Go to Dashboard
          </Button>
        )}
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
          color="text.primary"
        >
          Why Choose Our Platform?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Discover the features that make us unique
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Section */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          mb: 8,
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Join Thousands of Happy Users
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" component="div" fontWeight="bold">
              10K+
            </Typography>
            <Typography variant="h6">Active Users</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" component="div" fontWeight="bold">
              1M+
            </Typography>
            <Typography variant="h6">Messages Sent</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" component="div" fontWeight="bold">
              99.9%
            </Typography>
            <Typography variant="h6">Uptime</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* CTA Section */}
      {!user && (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
            bgcolor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join our community today and start connecting with amazing people
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ px: 4, py: 1.5 }}
          >
            Create Your Account
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Home;
