import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../features/auth/authSlice';
import { Alert, Stack, Box, Container } from '@mui/material'; // Removed LinearProgress
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

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setFormData((prev) => ({ ...prev, token: urlToken }));
    }
  }, [searchParams]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
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
        confirmNewPassword: formData.confirmNewPassword,
      }).unwrap();

      console.log('Backend response:', response);

      // Clear local storage and session storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      dispatch(logoutUser()); // Dispatch Redux logout action

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
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <AuthFormContainer
          title="Reset Password"
          subtitle="Enter your new password"
          icon={<LockReset color="primary" sx={{ fontSize: 48, mb: 2 }} />}
        >
          {message && (
            <Alert severity={messageType} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          <form onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
              <InputField
                name="token"
                label="Reset Token"
                value={formData.token}
                onChange={onChange}
                icon={<Person color="action" />}
                error={!formData.token.trim() && messageType === 'error'}
                readOnly // Token should typically not be editable by the user
              />
              <PasswordField
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={onChange}
                error={!formData.newPassword.trim() && messageType === 'error'}
              />
              <PasswordField
                name="confirmNewPassword"
                label="Confirm New Password"
                value={formData.confirmNewPassword}
                onChange={onChange}
                error={
                  formData.newPassword &&
                  formData.confirmNewPassword &&
                  formData.newPassword !== formData.confirmNewPassword
                }
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
