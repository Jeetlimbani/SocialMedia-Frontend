import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useRegisterMutation, reset } from '../features/auth/authSlice';
import {
  Alert,
  Stack,
  Box
} from '@mui/material';
import { PersonAdd, Person, Email } from '@mui/icons-material';
import AuthFormContainer from '../components/common/AuthFormContainer';
import InputField from '../components/common/InputField';
import PasswordField from '../components/common/PasswordField';
import SubmitButton from '../components/common/SubmitButton';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { username, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading, isError, isSuccess, error }] = useRegisterMutation();

  // Clear states on component mount
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    dispatch(reset());
  }, [dispatch]);

  // Handle registration response states
  useEffect(() => {
    if (isSuccess) {
      // Clear any error messages and show success
      setErrorMessage('');
      setSuccessMessage('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 3000);
    } else if (isError) {
      // Clear success message and show error
      setSuccessMessage('');
      setErrorMessage(error?.data?.message || 'Registration failed. Please try again.');
    }
    
    // Reset Redux state after handling
    if (isError || isSuccess) {
      dispatch(reset());
    }
  }, [isError, isSuccess, error, navigate, dispatch]);

  const validateFields = () => {
    if (!username.trim()) return 'Username is required';
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    if (!password.trim()) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!confirmPassword.trim()) return 'Confirm password is required';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous messages
    setErrorMessage('');
    setSuccessMessage('');
    
    const validationError = validateFields();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await registerUser(formData).unwrap();
    } catch (err) {
      console.error('Registration error:', err);
      // Error will be handled by useEffect hook
    }
  };

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
        title="Create Account"
        subtitle="Join our community today"
        icon={<PersonAdd color="primary" sx={{ fontSize: 48, mb: 2 }} />}
      >
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && !successMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={onSubmit} autoComplete="off">
          {/* Hidden fake inputs to prevent Chrome autofill */}
          <input type="text" name="fakeUser" autoComplete="username" style={{ display: 'none' }} />
          <input type="password" name="fakePass" autoComplete="new-password" style={{ display: 'none' }} />

          <Stack spacing={3} sx={{ width: '100%', maxWidth: 350, alignItems: 'center' }}>
            <InputField
              name="username"
              label="Username"
              value={username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              icon={<Person color="action" />}
              error={errorMessage.includes('Username')}
              autoComplete="off"
            />
            <InputField
              name="email"
              label="Email Address"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              icon={<Email color="action" />}
              error={errorMessage.includes('Email')}
              autoComplete="off"
            />
            <PasswordField
              name="password"
              label="Password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errorMessage.includes('Password')}
              autoComplete="off"
            />
            <PasswordField
              name="confirmPassword"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={errorMessage.includes('Confirm password')}
              autoComplete="off"
            />
            <SubmitButton isLoading={isLoading} label="Register" />
          </Stack>
        </form>
      </AuthFormContainer>
    </Box>
  );
}

export default Register;



// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useRegisterMutation, reset } from '../features/auth/authSlice';
// import {
//   Box,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   Alert,
//   InputAdornment,
//   IconButton,
//   CircularProgress,
//   LinearProgress,
//   Stack,
//   Divider,
// } from '@mui/material';
// import {
//   Visibility,
//   VisibilityOff,
//   Person,
//   Email,
//   Lock,
//   PersonAdd,
// } from '@mui/icons-material';

// function Register() {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   const { username, email, password, confirmPassword } = formData;

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const [registerUser, { isLoading, isError, isSuccess, error }] = useRegisterMutation();
//   const { user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (isError) {
//       setErrorMessage(
//         error?.data?.message || 
//         error?.data?.errors?.[0]?.msg || 
//         'Registration failed. Please try again.'
//       );
//     }
//     if (isSuccess && !user) {
//       setSuccessMessage('Registration successful! Please check your email to activate your account.');
//       setTimeout(() => {
//         navigate('/login');
//       }, 3000);
//     }
//     dispatch(reset());
//   }, [isError, isSuccess, user, navigate, dispatch, error]);

//   const calculatePasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 25;
//     if (/[a-z]/.test(password)) strength += 25;
//     if (/[A-Z]/.test(password)) strength += 25;
//     if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
//     return strength;
//   };

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));

//     if (name === 'password') {
//       setPasswordStrength(calculatePasswordStrength(value));
//     }

//     // Clear messages when user starts typing
//     if (errorMessage) setErrorMessage('');
//     if (successMessage) setSuccessMessage('');
//   };

//   const getPasswordColor = () => {
//     if (passwordStrength < 50) return 'error';
//     if (passwordStrength < 75) return 'warning';
//     return 'success';
//   };

//   const getPasswordText = () => {
//     if (passwordStrength < 25) return 'Very Weak';
//     if (passwordStrength < 50) return 'Weak';
//     if (passwordStrength < 75) return 'Good';
//     return 'Strong';
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');

//     // Client-side validation
//     if (!username.trim()) {
//       setErrorMessage('Username is required');
//       return;
//     }
//     if (!email.trim()) {
//       setErrorMessage('Email is required');
//       return;
//     }
//     if (!password.trim()) {
//       setErrorMessage('Password is required');
//       return;
//     }
//     if (password !== confirmPassword) {
//       setErrorMessage('Passwords do not match');
//       return;
//     }
//     if (passwordStrength < 50) {
//       setErrorMessage('Please choose a stronger password');
//       return;
//     }

//     try {
//       await registerUser(formData).unwrap();
//     } catch (err) {
//       console.error('Failed to register:', err);
//     }
//   };

//   const handleClickShowPassword = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '80vh',
//       }}
//     >
//       <Paper
//         elevation={3}
//         sx={{
//           p: 4,
//           maxWidth: 450,
//           width: '100%',
//           borderRadius: 2,
//         }}
//       >
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <PersonAdd color="primary" sx={{ fontSize: 48, mb: 2 }} />
//           <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
//             Create Account
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Join our community today
//           </Typography>
//         </Box>

//         {errorMessage && (
//           <Alert severity="error" sx={{ mb: 3 }}>
//             {errorMessage}
//           </Alert>
//         )}

//         {successMessage && (
//           <Alert severity="success" sx={{ mb: 3 }}>
//             {successMessage}
//           </Alert>
//         )}

//         <form onSubmit={onSubmit}>
//           <Stack spacing={3}>
//             <TextField
//               name="username"
//               label="Username"
//               value={username}
//               onChange={onChange}
//               fullWidth
//               variant="outlined"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Person color="action" />
//                   </InputAdornment>
//                 ),
//               }}
//               error={errorMessage && !username.trim()}
//             />

//             <TextField
//               name="email"
//               label="Email Address"
//               type="email"
//               value={email}
//               onChange={onChange}
//               fullWidth
//               variant="outlined"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Email color="action" />
//                   </InputAdornment>
//                 ),
//               }}
//               error={errorMessage && !email.trim()}
//             />

//             <Box>
//               <TextField
//                 name="password"
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={onChange}
//                 fullWidth
//                 variant="outlined"
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <Lock color="action" />
//                     </InputAdornment>
//                   ),
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         aria-label="toggle password visibility"
//                         onClick={handleClickShowPassword}
//                         edge="end"
//                       >
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//                 error={errorMessage && !password.trim()}
//               />
//               {password && (
//                 <Box sx={{ mt: 1 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//                     <LinearProgress
//                       variant="determinate"
//                       value={passwordStrength}
//                       color={getPasswordColor()}
//                       sx={{ flexGrow: 1, mr: 1, height: 6, borderRadius: 3 }}
//                     />
//                     <Typography variant="caption" color={`${getPasswordColor()}.main`}>
//                       {getPasswordText()}
//                     </Typography>
//                   </Box>
//                   <Typography variant="caption" color="text.secondary">
//                     Use 8+ characters with uppercase, lowercase, and numbers/symbols
//                   </Typography>
//                 </Box>
//               )}
//             </Box>

//             <TextField
//               name="confirmPassword"
//               label="Confirm Password"
//               type="password"
//               value={confirmPassword}
//               onChange={onChange}
//               fullWidth
//               variant="outlined"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Lock color="action" />
//                   </InputAdornment>
//                 ),
//               }}
//               error={password !== confirmPassword && confirmPassword !== ''}
//               helperText={
//                 password !== confirmPassword && confirmPassword !== ''
//                   ? 'Passwords do not match'
//                   : ''
//               }
//             />

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               size="large"
//               disabled={isLoading}
//               sx={{
//                 py: 1.5,
//                 mt: 2,
//                 position: 'relative',
//               }}
//             >
//               {isLoading ? (
//                 <CircularProgress size={24} color="inherit" />
//               ) : (
//                 'Create Account'
//               )}
//             </Button>
//           </Stack>
//         </form>

//         <Divider sx={{ my: 3 }}>
//           <Typography variant="body2" color="text.secondary">
//             OR
//           </Typography>
//         </Divider>

//         <Box sx={{ textAlign: 'center' }}>
//           <Typography variant="body2" color="text.secondary">
//             Already have an account?{' '}
//             <Link
//               component={RouterLink}
//               to="/login"
//               sx={{
//                 color: 'primary.main',
//                 textDecoration: 'none',
//                 fontWeight: 'bold',
//                 '&:hover': {
//                   textDecoration: 'underline',
//                 },
//               }}
//             >
//               Sign in here
//             </Link>
//           </Typography>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }

// export default Register;