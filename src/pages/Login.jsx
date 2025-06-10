import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation, reset } from '../features/auth/authSlice';
import {
  Alert,
  Stack,
  Box,
  Link
} from '@mui/material';
import { Login as LoginIcon, Person } from '@mui/icons-material';
import AuthFormContainer from '../components/common/AuthFormContainer';
import InputField from '../components/common/InputField';
import PasswordField from '../components/common/PasswordField';
import SubmitButton from '../components/common/SubmitButton';

function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const { identifier, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading, isError, isSuccess, error }] = useLoginMutation();
  const { user, isLoading: isAuthLoading } = useSelector((state) => state.auth);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isAuthLoading) {
      navigate(`/profile/${user.username}`, { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  // Clear form and reset state on component mount
  useEffect(() => {
    sessionStorage.removeItem('identifier');
    setFormData({ identifier: '', password: '' });
    setErrorMessage('');
    dispatch(reset());
  }, [dispatch]);

  // Handle login response states - FIXED VERSION
  useEffect(() => {
    if (isError) {
      setErrorMessage(error?.data?.message || 'Invalid credentials. Please try again.');
      dispatch(reset()); // Reset only on error
    }
  }, [isError, error, dispatch]);

  // Separate effect for successful login navigation - FIXED
  useEffect(() => {
    // Wait for both success and user data to be available, and auth loading to be complete
    if (isSuccess && user && !isAuthLoading) {
      setErrorMessage('');
      
      // Add a small delay to ensure Redux state is fully updated
      const timer = setTimeout(() => {
  
        // Navigate to the user's profile using their username from the Redux state
        navigate(`/profile/${user.username}`, { replace: true });
        dispatch(reset()); // Reset only after successful navigation
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, user, isAuthLoading, navigate, dispatch]);

  const validateFields = () => {
    if (!identifier.trim()) return 'Username or email is required';
    if (!password.trim()) return 'Password is required';
    return null;
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
    // Clear error message when user starts typing
    if (errorMessage) setErrorMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous error messages
    setErrorMessage('');
    
    const validationError = validateFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await loginUser({ identifier, password }).unwrap();
    } catch (err) {
      console.error('Login error:', err);
      // Error will be handled by useEffect hook
    }
  };

  // Don't render login form if user is already logged in
  if (user && !isAuthLoading) {
    return null; // or a loading spinner
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <AuthFormContainer
        title="Welcome Back"
        subtitle="Sign in to your account"
        icon={<LoginIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />}
      >
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={onSubmit} autoComplete="off">
          {/* Anti-autofill hidden inputs */}
          <input
            type="text"
            name="fakeUsername"
            autoComplete="username"
            style={{ display: 'none' }}
          />
          <input
            type="password"
            name="fakePassword"
            autoComplete="new-password"
            style={{ display: 'none' }}
          />

          <Stack spacing={3} sx={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
            <InputField
              name="identifier"
              label="Username or Email"
              value={identifier}
              onChange={onChange}
              icon={<Person color="action" />}
              error={errorMessage.includes('Username or email')}
              autoComplete="off"
            />
            <PasswordField
              name="password"
              label="Password"
              value={password}
              onChange={onChange}
              error={errorMessage.includes('Password')}
              autoComplete="off"
            />
            <SubmitButton isLoading={isLoading || isAuthLoading} label="Sign In" />
          </Stack>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Forgot your password?
          </Link>
        </Box>
      </AuthFormContainer>
    </Box>
  );
}

export default Login;