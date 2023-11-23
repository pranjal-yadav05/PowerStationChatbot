// UnauthorizedPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go back to the previous page
    navigate(-2);
  };
  return (
    <div id='main-box'>
      <h2>Unauthorized Access</h2>
      <p>You do not have permission to access this page.</p>
      Click<Link to='' onClick={handleGoBack}> here </Link>to go back
    </div>
  );
};

export default UnauthorizedPage;
  