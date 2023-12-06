// LoginForm.jsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const LoginForm = ({ setLoggedIn , setAccesstype}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const accesstype = localStorage.getItem('accesstype');
  useEffect(() => {
    // Check if the user is already logged in from localStorage
    const storedLoggedIn = localStorage.getItem('loggedIn');
    document.getElementById('username').focus();
  
    // if (storedLoggedIn && storedLoggedIn === 'true') {
    //   setLoggedIn(true);
    //   if(accesstype === 'emp'){
    //     navigate('/chat');
    //   }       
    // }
  }, [setLoggedIn, navigate]);
  const handleKeyPress = (e) => {
    // Check if the pressed key is Enter (key code 13)
    if (e.key === 'Enter') {
      // Submit the login form
      handleLogin();
    }
  };
  const handleLogin = async () => {
    try {
      // Simulate API call for authentication
      localStorage.removeItem('token')
      // Assume a successful login and get user details from the server
      // In a real application, replace this with your actual authentication logic
      const response = await axios.post('http://localhost:3001/login', {
        userId : username,
        password : password,
      });

      const { token } = response.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', token);

      // Decode the token to get user information (optional)
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('token : '+token +'\n username: '+decodedToken.username+'\n accesstype : '+decodedToken.accesstype)
      if (decodedToken.username) {
        // Login successful
        // const data = await response.data;
  
        // Store loggedIn status and accesstype in localStorage
        // localStorage.setItem('loggedIn', 'true');
        // localStorage.setItem('accesstype', data.accesstype);
        // localStorage.setItem('userId',username);
        // console.log(data.accesstype  +  localStorage.getItem('loggedIn'));
        setLoggedIn(true);
        setUsername(decodedToken.username)
        setAccesstype(decodedToken.accesstype)
        setAccesstype(decodedToken.accesstype);
        if(decodedToken.accesstype === 'emp'){
          navigate('/chat');
        } else if(decodedToken.accesstype === 'loc'){
          navigate('/employees');
        } else if(decodedToken.accesstype === 'gov'){
          navigate('/admins');
        } else{
          navigate('/unauthorized');
        }        
        
      } else {
        // Handle login failure (show error message, etc.)
        alert('error during login')
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };
  const handleUsernameKeyDown = (e) => {
    // Check if the pressed key is Enter (key code 13)
    if (e.key === 'Enter') {
      // Move focus to the password input
      document.getElementById('passwordInput').focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    // Check if the pressed key is Enter (key code 13)
    if (e.key === 'Enter') {
      // Submit the login form
      handleLogin();
    }
  };

  return (
    <div id="main-box" className="fade-in">
      <h2 style={{marginBottom: "20px"}}>Login Form</h2>
      <label>
        Username:
        </label>
        <input type="text" id='username' onKeyDown={handleUsernameKeyDown} value={username} onChange={(e) => setUsername(e.target.value)} />
     
      <br />
      <label>
        Password:
        </label>
        <input type="password" id="passwordInput" onKeyDown={handlePasswordKeyDown} value={password} onChange={(e) => setPassword(e.target.value)} />
      
      <br />
      <Link to='/forgotpassword'>Forgot your Password?</Link>
      <button onClick={handleLogin}>Login</button>
      
    </div>
  );
};

export default LoginForm;
