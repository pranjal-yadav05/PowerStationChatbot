// SignupForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'

const SignupForm = ({ onSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:3001/signup', { username, password });
      if (response.data === 'registered') {
        onSignup(username);
      } else {
        alert(response.data);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div id="main-box">
      <h2>Sign Up</h2>
      <label>
        Username:
        </label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      
      <br />
      <label>
        Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      
      <br />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default SignupForm;
