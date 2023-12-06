// LogoutPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = ({ setLoggedIn, setAccesstype }) => {
  const navigate = useNavigate();
    console.log("reacued logoutpage");
  useEffect(() => {
    // Perform any logout logic here
    // For simplicity, we'll just navigate back to the login page
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('accesstype');
    localStorage.removeItem('userId')
    localStorage.removeItem('forgotPasswordUsername')
    setLoggedIn(false);
    console.log("setted it to false");
    setAccesstype('');
    // navigate('/login');  // Use navigate instead of returning a Navigate component
  }, [setLoggedIn, setAccesstype, navigate]);

  return null;
};

export default LogoutPage;
