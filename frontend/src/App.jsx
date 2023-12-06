// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import ChatPage from './ChatPage';
import EmployeeList from './EmployeeList';
import AdminList from './AdminList';
import UnauthorizedPage from './UnauthorizedPage';
import axios from 'axios';
// import  jwt  from 'jsonwebtoken';
import { useNavigate } from 'react-router-dom';
import AddEmployeeForm from './AddEmployeeForm';
import PDFupload from './PDFupload';
import PrivateRoute from './PrivateRoute';
import AddAdminForm from './AddAdminForm';
import ForgotPassword from './ForgotPassword';
import defaultProfileImage from './assets/defaultProfileImage.png';
import SettingsPage from './SettingsPage';

import './styles.css';

const LogoutPage = ({ setLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform any logout logic here
    // For simplicity, we'll just navigate back to the login page
    setLoggedIn(false);
    navigate('/login');
  }, [setLoggedIn, navigate]);

  return null;
};

const App = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const[user, setUsername] = useState('')
  const [accesstype, setAccesstype] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleImageHover = (isHovered) => {
    setShowImage(isHovered);
  };
  useEffect(() => {
    const checkSessionStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          setUsername(decodedToken.username);
          setAccesstype(decodedToken.accesstype);

          const response = await axios.get(`http://localhost:3001/profilePic/${decodedToken.username}`, {
            responseType: 'arraybuffer'
          });

          if (response.data && response.data.byteLength > 0) {
            const base64 = btoa(
              new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
              )
            );
            setProfilePic(`data:image/jpeg;base64,${base64}`);
          } else {
            setProfilePic(defaultProfileImage);
          }

          setLoggedIn(true);
        } catch (error) {
          console.error('Error decoding token or fetching profile picture:', error.message);
        }
      }
      
      setLoading(false);
    };

    checkSessionStatus();
  }, [loggedIn]);
  
  
  // useEffect(() => {
  //   // Check if the user is already logged in from localStorage
  //   const storedToken = localStorage.getItem('token');

  //   if (storedToken) {
  //     // Decode the token to check its validity
  //     const decodedToken = JSON.parse(atob(storedToken.split('.')[1]));
  //     const expirationTime = decodedToken.exp * 1000; // Convert seconds to milliseconds

  //     // Check if the token is expired
  //     if (Date.now() < expirationTime) {
  //       setLoggedIn(true);
  //     } else {
  //       // Token is expired, perform logout
  //       logoutfunction();
  //     }
  //   }
  // }, []);


  const logoutfunction = () => {
    // const user = localStorage.getItem('userId')
    const res = axios.get(`http://localhost:3001/logout/${user}`)
    // localStorage.removeItem('loggedIn');
    // localStorage.removeItem('accesstype');
    // localStorage.removeItem('userId');
    // localStorage.removeItem('forgotPasswordUsername')
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUsername('');
    setAccesstype('');

  }

  // const checkSessionStatus = () => {
  //   // Check if the token is present in localStorage
  //   const token = localStorage.getItem('token');

  //   if (token) {
  //     // Decode the token to get user information (optional)
  //     const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
  //     setLoggedIn(true);
  //     setUsername(decodedToken.username);
  //     setAccesstype(decodedToken.accesstype);
  //     fetchProfilePic();

  //   }

  //   setLoading(false);
  // };

  const fetchProfilePic = () => {
    console.log('fetching profile of : '+user);
    // Make a GET request to retrieve the profile picture
    axios.get(`http://localhost:3001/profilePic/${user}`, { responseType: 'arraybuffer' })
      .then((response) => {
  
        // Check if the response contains valid image data
        if (response.data && response.data.byteLength > 0) {
          // Convert the received ArrayBuffer to a base64-encoded string
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          // Set the base64 string as the source for the profile picture
          setProfilePic(`data:image/jpeg;base64,${base64}`);
          
        } else {
          // If no valid profile picture is available, set the default image
          setProfilePic(defaultProfileImage);
        }
        
      })
      .catch((error) => {
        console.error('Error retrieving profile picture:', error.message);
        // If there's an error, set the default image
        setProfilePic(defaultProfileImage);
      });
  };
  
  
  

  if (loading) {
    // Loading state, show a spinner or a loading message
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
       <i style={{fontSize:"20px"}}>Loading...</i> 
      </div>
    );
  }

  return (
    <Router  className="app-container">
      <div id='head'><h2 style={{ fontSize:'40px' ,fontFamily: 'Kdam Thmor Pro, sans-serif', textAlign:'center'}}>PowerAI</h2></div>
      <nav className="fade-in">
      <ul style={{display: 'flex', alignItems: 'center', padding: '0', listStyle: 'none' }}>
          {/* User profile image */}
          {loggedIn ? (
            <li style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
              <img
                src={profilePic || defaultProfileImage}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  marginRight: '5px',
                  marginTop:'5px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="profile-image"
              />
              <Link to="/settings" className='profileLink'>
                {user}
              </Link>
            </li>) : <></>}

          
          {loggedIn ? (
            <>
              {(accesstype === 'loc' || accesstype === 'emp') && (<li>
                <Link to="/chat">Chat</Link>
              </li>)}
              {accesstype === 'loc' && (
                <>
                <li>
                  <Link to="/employees">Employees</Link>
                </li>
                <li>
                  <Link to="/addEmp">Configure</Link>
                </li>
                <li>
                  <Link to="/pdfUpload">Manual</Link>
                </li>
                </>
              )}
              {accesstype === 'gov' && (
                <>
                <li>
                  <Link to="/admins">Admins</Link>
                </li>
                <li>
                  <Link to="/addAdm">Configure</Link>
                </li>
                <li>
                  <Link to="/pdfUpload">Manual</Link>
                </li>
              </>
              )}
              <li>
                <Link onClick={logoutfunction} to="/login">Logout</Link>
              </li>
            </>
          ) : (
           <></> 
          )}
        </ul>
      </nav>
      <Routes>
        <Route
          path="/login"
          element={<LoginForm setLoggedIn={setLoggedIn} setAccesstype={setAccesstype} />}
        />
        <Route
          path="/chat"
          element={loggedIn && (accesstype === 'emp' || accesstype === 'loc') ? <ChatPage /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path="/employees"
          element={loggedIn && accesstype === 'loc' ? <EmployeeList loggedInAdmin={user} /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path="/admins"
          element={loggedIn && accesstype === 'gov' ? <AdminList loggedInGov={user} /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path="/unauthorized" 
          element={ <UnauthorizedPage />}
        />
        <Route
          path="/addAdm"
          element={loggedIn && accesstype === 'gov' ? <AddAdminForm loggedInGov={user} /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path="/addEmp"
          element={loggedIn && accesstype === 'loc' ? <AddEmployeeForm loggedInAdmin={user} /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path="/settings"
          element={<SettingsPage user={user}/>}
        />
        <Route
          path="/pdfUpload"
          element={loggedIn ? <PDFupload /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path='/forgotpassword'
          element={<ForgotPassword />}
        />
        <Route
          path="/logout"
          element={<LogoutPage setLoggedIn={setLoggedIn} />}
        />
        <Route
          path='/'
          element={loggedIn ? (<></>) : (<LoginForm setAccesstype={setAccesstype} setLoggedIn={setLoggedIn}/>)}
         /> 
      </Routes>
      {isHovered && (
        <div
        style={{
          position: 'fixed',
          zIndex: 2,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 0,
          width: 'fit-content',
          height: 'fit-content',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius:'10px',
          background: 'rgba(0, 0, 0, 0.5)', // Adjust the opacity for the desired blur effect
          backdropFilter: 'blur(5px)', // Add a slight blur effect
        }}
      >
        <img
          src={profilePic || defaultProfileImage}
          className='larger'
          alt="larger-profile"
          style={{ borderRadius: '10px', width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      
      )}
    </Router>
  );
};

export default App;
