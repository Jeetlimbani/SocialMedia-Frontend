// routes/Routes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Activate from '../pages/Activate';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import NotFound from '../pages/NotFound';
import SmartProfile from '../pages/ SmartProfile';


function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - redirect to profile if already logged in */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/activate" element={
        <PublicRoute>
          <Activate />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />
 
   <Route
  path="/profile/:username"
  element={
    <PrivateRoute>
      <SmartProfile />
    </PrivateRoute>
  }
/>
      {/* Protected Routes */}
      <Route path="/my-profile" element={
        <PrivateRoute>  
          <Profile />
        </PrivateRoute>
      } />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;