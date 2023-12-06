// PrivateRoute.jsx
import React from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';

const PrivateRoute = ({ element, accesstype, ...rest }) => {
  const isLoggedIn = localStorage.getItem('loggedIn');

  if (!isLoggedIn) {
    // Redirect to login if the user is not logged in
    return <Navigate to="/login" />;
  }
rest.path = useLocation().pathname;
  // Access control based on accesstype
  switch (accesstype) {
    case 'loc':
      // Loc type can access these routes
      if (rest.path.includes('employees') || rest.path.includes('addEmp') || rest.path.includes('pdfUpload')) {
        return <Route {...rest} element={element} />;
      }
      break;
    case 'gov':
      // Gov type can access these routes
      if (rest.path.includes('admins') || rest.path.includes('addAdm') || rest.path.includes('pdfUpload')) {
        return <Route {...rest} element={element} />;
      }
      break;
    // Add more cases for other accesstypes if needed

    default:
      // Redirect to unauthorized for unknown accesstype
      return <Navigate to="/unauthorized" />;
  }

  // If none of the conditions match, redirect to unauthorized
  return <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
