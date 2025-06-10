// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useActivateAccountMutation } from '../features/auth/authSlice';

// function Activate() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [activationStatus, setActivationStatus] = useState('pending'); // 'pending', 'activating', 'success', 'error'
//   const [message, setMessage] = useState('');

//   const [activateAccount, { isLoading, isSuccess, isError, error }] = useActivateAccountMutation();

//   useEffect(() => {
//     const token = searchParams.get('token'); // Get token from URL query params
//     if (token) {
//       const activate = async () => {
//         setActivationStatus('activating');
//         try {
//           await activateAccount({ token }).unwrap();
//           setActivationStatus('success');
//           setMessage('Account activated successfully! You can now log in.');
//           setTimeout(() => {
//             navigate('/login'); // Redirect to login after activation
//           }, 3000);
//         } catch (err) {
//           setActivationStatus('error');
//           setMessage(err?.data?.message || 'Account activation failed. Invalid or expired token.');
//           console.error('Activation Error:', err);
//         }
//       };
//       activate();
//     } else {
//       setActivationStatus('error');
//       setMessage('Activation token missing from URL.');
//     }
//   }, [searchParams, activateAccount, navigate]);

//   return (
//     <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
//       <h2>Account Activation</h2>
//       {activationStatus === 'pending' && <p>Looking for activation token...</p>}
//       {activationStatus === 'activating' && <p>Activating your account...</p>}
//       {activationStatus === 'success' && <p style={{ color: 'green' }}>{message}</p>}
//       {activationStatus === 'error' && <p style={{ color: 'red' }}>{message}</p>}
//       {isLoading && <p>Loading...</p>}
//     </div>
//   );
// }

// export default Activate;
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useActivateAccountMutation } from '../features/auth/authSlice';
import { Box, Paper, Typography, CircularProgress, Alert, Button, Container } from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';

function Activate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [activationStatus, setActivationStatus] = useState('activating');
  const [message, setMessage] = useState('');

  const [activateAccount, { isLoading }] = useActivateAccountMutation();

  useEffect(() => {
    if (!token) {
      setActivationStatus('error');
      setMessage('Activation token missing from URL.');
      return;
    }

    const activate = async () => {
      try {
        await activateAccount({ token }).unwrap();
        setActivationStatus('success');
        setMessage('Account activated successfully! You can now log in.');

        // ✅ Clear error message before redirecting
        setTimeout(() => {
          setMessage('');
          navigate('/login');
        }, 3000);
      } catch (err) {
        setActivationStatus('error');
        setMessage(err?.data?.message || 'Account activation failed. Invalid or expired token.');
        console.error('Activation Error:', err);
      }
    };

    activate();
  }, [token, activateAccount, navigate]);

  const renderContent = () => {
    switch (activationStatus) {
      case 'activating':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={64} sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom>Activating Your Account</Typography>
            <Typography variant="body2" color="text.secondary">Please wait while we verify your account...</Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main" fontWeight="bold">Account Activated!</Typography>
            {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Redirecting to login page...</Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/login')}>Go to Login</Button>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Error sx={{ fontSize: 64, color:"error.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error.main" fontWeight="bold">Activation Failed</Typography>
            <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The activation link may be expired or invalid. Please try registering again or contact support.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => navigate('/register')}>Register Again</Button>
              <Button variant="outlined" onClick={() => navigate('/login')}>Try Login</Button>
            </Box>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Email sx={{ fontSize: 64, color:"primary.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>Looking for activation token...</Typography>
            <CircularProgress sx={{ mt: 2 }} />
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" textAlign="center" gutterBottom fontWeight="bold">Account Activation</Typography>
          <Box sx={{ mt: 4 }}>{renderContent()}</Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Activate;
