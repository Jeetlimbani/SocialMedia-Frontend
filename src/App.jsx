// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Register from './pages/Register';
// import Login from './pages/Login';
// import Activate from './pages/Activate'; // For account activation
// import ForgotPassword from './pages/ForgotPassword'; // For initiating password reset
// import ResetPassword from './pages/ResetPassword'; // For actual password reset
// import Dashboard from './pages/Dashboard'; // A protected page example
// import Home from './pages/Home'; // A public home page
// import PrivateRoute from './components/PrivateRoute'; // We'll create this
// import { useDispatch, useSelector } from 'react-redux';
// import { useLogoutMutation, logoutUser } from './features/auth/authSlice';


// function App() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const [logoutBackend] = useLogoutMutation();

//   const handleLogout = async () => {
//     try {
//       await logoutBackend().unwrap(); // Call the RTK Query logout mutation
//       // RTK Query's onQueryStarted already dispatches logoutUser, but keep this for clarity or if not using onQueryStarted
//     } catch (error) {
//       console.error('Failed to logout:', error);
//     } finally {
//       dispatch(logoutUser()); // Ensure state is cleared even if backend call fails (optional, depending on desired behavior)
//     }
//   };

//   return (
//     <Router>
//       <nav style={{ padding: '1rem', background: '#f4f4f4' }}>
//         <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
//         {!user ? (
//           <>
//             <Link to="/register" style={{ marginRight: '1rem' }}>Register</Link>
//             <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
//             <Link to="/forgot-password" style={{ marginRight: '1rem' }}>Forgot Password</Link>
//           </>
//         ) : (
//           <>
//             <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
//             <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'blue' }}>Logout</button>
//           </>
//         )}
//       </nav>
//       <div className="container">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/activate" element={<Activate />} /> {/* Add this route */}
//           <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add this route */}
//           <Route path="/reset-password" element={<ResetPassword />} /> {/* Add this route */}

//           {/* Protected Route */}
//           <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Box,
//   Container,
//   IconButton,
//   Menu,
//   MenuItem,
//   Avatar,
// } from '@mui/material';
// import { AccountCircle, Home as HomeIcon } from '@mui/icons-material';

// // Import your page components
// import Register from './pages/Register';
// import Login from './pages/Login';
// import Activate from './pages/Activate';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
// import Dashboard from './pages/Dashboard';
// import Home from './pages/Home';
// import PrivateRoute from './components/PrivateRoute';

// // Redux and RTK Query imports
// import { useDispatch, useSelector } from 'react-redux';

// // Mock useLogoutMutation and logoutUser for standalone testing
// const useLogoutMutation = () => {
//   const logoutBackend = async () => {
//     return new Promise(resolve => setTimeout(() => resolve(), 500));
//   };
//   return [logoutBackend];
// };

// const logoutUser = () => ({ type: 'auth/logoutUser' });

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#1976d2',
//     },
//     secondary: {
//       main: '#dc004e',
//     },
//     background: {
//       default: '#f5f5f5',
//     },
//   },
//   typography: {
//     fontFamily: 'Roboto, Arial, sans-serif',
//   },
// });

// function AppContent() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth || { user: null });
//   const [logoutBackend] = useLogoutMutation();
//   const [anchorEl, setAnchorEl] = React.useState(null);

//   const handleMenu = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutBackend().unwrap();
//     } catch (error) {
//       console.error('Failed to logout from backend:', error);
//     } finally {
//       localStorage.removeItem('user');
//       localStorage.removeItem('token');
//       localStorage.removeItem('refreshToken');
//       dispatch(logoutUser());
//       handleClose();
//       navigate('/');
//     }
//   };

//   const handleDashboard = () => {
//     handleClose();
//     navigate('/dashboard');
//   };

//   return (
//     <>
//       <AppBar position="static" elevation={2}>
//         <Toolbar>
//           <IconButton
//             edge="start"
//             color="inherit"
//             aria-label="home"
//             onClick={() => navigate('/')}
//             sx={{ mr: 2 }}
//           >
//             <HomeIcon />
//           </IconButton>
          
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//             Social Media Platform
//           </Typography>

//           {!user ? (
//             <Box>
//               <Button 
//                 color="inherit" 
//                 onClick={() => navigate('/login')}
//                 sx={{ mr: 1 }}
//               >
//                 Login
//               </Button>
//               <Button 
//                 color="inherit" 
//                 variant="outlined"
//                 onClick={() => navigate('/register')}
//                 sx={{ 
//                   mr: 1,
//                   borderColor: 'white',
//                   '&:hover': {
//                     borderColor: 'white',
//                     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//                   }
//                 }}
//               >
//                 Register
//               </Button>

//             </Box>
//           ) : (
//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//               <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
//                 Welcome, {user.username}
//               </Typography>
//               <IconButton
//                 size="large"
//                 aria-label="account of current user"
//                 aria-controls="menu-appbar"
//                 aria-haspopup="true"
//                 onClick={handleMenu}
//                 color="inherit"
//               >
//                 <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
//                   {user.username?.charAt(0).toUpperCase()}
//                 </Avatar>
//               </IconButton>
//               <Menu
//                 id="menu-appbar"
//                 anchorEl={anchorEl}
//                 anchorOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 open={Boolean(anchorEl)}
//                 onClose={handleClose}
//               >
//                 <MenuItem onClick={handleDashboard}>
//                   <AccountCircle sx={{ mr: 1 }} />
//                   Dashboard
//                 </MenuItem>
//                 <MenuItem onClick={handleLogout}>
//                   Logout
//                 </MenuItem>
//               </Menu>
//             </Box>
//           )}
//         </Toolbar>
//       </AppBar>

//       <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/activate" element={<Activate />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//         </Routes>
//       </Container>
//     </>
//   );
// }

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <AppContent />
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import AppRoutes from './routes/Routes';
import theme from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
