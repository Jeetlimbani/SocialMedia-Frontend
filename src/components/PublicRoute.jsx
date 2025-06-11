import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }
  return user ? <Navigate to={`/profile/${user.username}`} replace /> : children;
};

export default PublicRoute;
