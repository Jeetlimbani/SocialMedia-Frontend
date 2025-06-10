// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { useResetPasswordMutation } from '../features/auth/authSlice';

// function ResetPassword() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     token: '',
//     newPassword: '',
//     confirmNewPassword: '',
//   });
//   const [message, setMessage] = useState('');

//   const { token, newPassword, confirmNewPassword } = formData;
//   const [resetPassword, { isLoading, isSuccess, isError, error }] = useResetPasswordMutation();

//   useEffect(() => {
//     const urlToken = searchParams.get('token');
//     if (urlToken) {
//       setFormData((prev) => ({ ...prev, token: urlToken }));
//     }
//   }, [searchParams]);

//   useEffect(() => {
//     if (isSuccess) {
//       setMessage('Password has been reset successfully! You can now log in with your new password.');
//       setTimeout(() => {
//         navigate('/login'); // Redirect to login after successful reset
//       }, 3000);
//     }
//     if (isError) {
//       setMessage(error?.data?.message || error?.data?.errors?.[0]?.msg || 'Failed to reset password.');
//     }
//   }, [isSuccess, isError, error, navigate]);

//   const onChange = (e) => {
//     setFormData((prevState) => ({
//       ...prevState,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setMessage(''); // Clear previous messages

//     if (newPassword !== confirmNewPassword) {
//       setMessage('Passwords do not match.');
//       return;
//     }

//     try {
//       await resetPassword({ token, newPassword, confirmNewPassword }).unwrap();
//     } catch (err) {
//       console.error('Reset password error:', err);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
//       <h2>Reset Password</h2>
//       <form onSubmit={onSubmit}>
//         <div style={{ marginBottom: '10px' }}>
//           <label>Token (from email):</label>
//           <input
//             type="text"
//             name="token"
//             value={token}
//             onChange={onChange}
//             required
//             readOnly={!!searchParams.get('token')} // Make it read-only if token is from URL
//             style={{ width: '100%', padding: '8px', backgroundColor: searchParams.get('token') ? '#eee' : 'white' }}
//           />
//         </div>
//         <div style={{ marginBottom: '10px' }}>
//           <label>New Password:</label>
//           <input
//             type="password"
//             name="newPassword"
//             value={newPassword}
//             onChange={onChange}
//             required
//             style={{ width: '100%', padding: '8px' }}
//           />
//         </div>
//         <div style={{ marginBottom: '10px' }}>
//           <label>Confirm New Password:</label>
//           <input
//             type="password"
//             name="confirmNewPassword"
//             value={confirmNewPassword}
//             onChange={onChange}
//             required
//             style={{ width: '100%', padding: '8px' }}
//           />
//         </div>
//         <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
//           {isLoading ? 'Resetting...' : 'Reset Password'}
//         </button>
//       </form>
//       {message && <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>}
//     </div>
//   );
// }

// export default ResetPassword;
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../features/auth/authSlice'; 
import { Alert, Stack, Box, Container, LinearProgress } from '@mui/material';
import { LockReset, Person } from '@mui/icons-material';
import AuthFormContainer from '../components/common/AuthFormContainer';
import InputField from '../components/common/InputField';
import PasswordField from '../components/common/PasswordField';
import SubmitButton from '../components/common/SubmitButton';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice'; 

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [resetPassword] = useResetPasswordMutation(); 
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setFormData((prev) => ({ ...prev, token: urlToken }));
    }
  }, [searchParams]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    else if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await resetPassword({ 
        token: formData.token, 
        newPassword: formData.newPassword, 
        confirmNewPassword: formData.confirmNewPassword 
      }).unwrap();

      console.log('Backend response:', response); 

    
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      dispatch(logoutUser());

      setMessage('Password reset successful! Redirecting to login...');
      setMessageType('success');


      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Password reset failed:', err);
      setMessage(err?.data?.message || 'Password reset failed. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <AuthFormContainer title="Reset Password" subtitle="Enter your new password" icon={<LockReset color="primary" sx={{ fontSize: 48, mb: 2 }} />}>
          {message && <Alert severity={messageType} sx={{ mb: 3 }}>{message}</Alert>}
          <form onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
              <InputField 
                name="token" 
                label="Reset Token" 
                value={formData.token} 
                onChange={onChange} 
                icon={<Person color="action" />} 
                error={!formData.token.trim() && messageType === 'error'} 
              />
              <PasswordField 
                name="newPassword" 
                label="New Password" 
                value={formData.newPassword} 
                onChange={onChange} 
                error={!formData.newPassword.trim() && messageType === 'error'} 
              />
              {formData.newPassword && (
                <Box sx={{ mt: 1, width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    color={passwordStrength < 50 ? 'error' : passwordStrength < 75 ? 'warning' : 'success'}
                    sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}
              <PasswordField 
                name="confirmNewPassword" 
                label="Confirm New Password" 
                value={formData.confirmNewPassword} 
                onChange={onChange} 
                error={formData.newPassword && formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword} 
              />
              <SubmitButton isLoading={false} label="Reset Password" />
            </Stack>
          </form>
        </AuthFormContainer>
      </Box>
    </Container>
  );
}

export default ResetPassword;

