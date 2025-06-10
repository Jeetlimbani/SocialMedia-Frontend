// import React, { useState, useEffect } from 'react';
// import { useForgotPasswordMutation } from '../features/auth/authSlice';

// function ForgotPassword() {
//   const [email, setEmail] = useState('');
//   const [forgotPassword, { isLoading, isSuccess, isError, error }] = useForgotPasswordMutation();
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     if (isSuccess) {
//       setMessage('If an account with that email exists, a password reset link has been sent. Check your email for the reset token.');
//       setEmail('');
//     }
//     if (isError) {
//       setMessage(error?.data?.message || 'Failed to send reset link.');
//     }
//   }, [isSuccess, isError, error]);

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setMessage(''); // Clear previous messages
//     try {
//       await forgotPassword({ email }).unwrap();
//     } catch (err) {
//       console.error('Forgot password error:', err);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
//       <h2>Forgot Password</h2>
//       <form onSubmit={onSubmit}>
//         <div style={{ marginBottom: '10px' }}>
//           <label>Email:</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             style={{ width: '100%', padding: '8px' }}
//           />
//         </div>
//         <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}>
//           {isLoading ? 'Sending...' : 'Send Reset Link'}
//         </button>
//       </form>
//       {message && <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>}
//     </div>
//   );
// }

// export default ForgotPassword;
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPasswordMutation } from '../features/auth/authSlice';
import { Alert, Stack, Box, Container } from '@mui/material';
import { LockReset, Email, ArrowBack } from '@mui/icons-material';
import AuthFormContainer from '../components/common/AuthFormContainer';
import InputField from '../components/common/InputField';
import SubmitButton from '../components/common/SubmitButton';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [forgotPassword, { isLoading, isSuccess, isError, error }] = useForgotPasswordMutation();

  useEffect(() => {
    if (isSuccess) {
      setMessage('If an account with that email exists, a password reset link has been sent. Check your email for the reset token.');
      setMessageType('success');
      setEmail('');
    }
    if (isError) {
      setMessage(error?.data?.message || 'Failed to send reset link. Please try again.');
      setMessageType('error');
    }
  }, [isSuccess, isError, error]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <AuthFormContainer title="Forgot Password?" subtitle="No worries! Enter your email to get a reset link." icon={<LockReset color="primary" sx={{ fontSize: 48, mb: 2 }} />}>
          {message && <Alert severity={messageType} sx={{ mb: 3 }}>{message}</Alert>}
          <form onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
              <InputField 
                name="email" 
                label="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                icon={<Email color="action" />} 
                error={messageType === 'error' && !email.trim()} 
              />
              <SubmitButton isLoading={isLoading} label="Send Reset Link" />
            </Stack>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <RouterLink to="/login" style={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}>
              <ArrowBack sx={{ mr: 1, fontSize: 16 }} />
              Back to Login
            </RouterLink>
          </Box>
        </AuthFormContainer>
      </Box>
    </Container>
  );
}

export default ForgotPassword;
