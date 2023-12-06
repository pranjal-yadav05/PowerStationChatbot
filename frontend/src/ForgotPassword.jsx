import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PasswordChangeForm from './PasswordChangeForm';
import axios from 'axios';

const ForgotPassword = () => {
  const [username, setUser] = useState(localStorage.getItem('forgotPasswordUsername') || '');
  const [otp, setOtp] = useState('');
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    localStorage.setItem('forgotPasswordUsername', username);
  }, [username]);

  useEffect(() => {
    const isFormVisible = localStorage.getItem('isPasswordChangeFormVisible') === 'true';
    setShowPasswordChangeForm(isFormVisible);
  }, []); // empty dependency array ensures the effect runs only once on mount
  
  const handleForgotPassword = async () => {
    try {
      setMessage('Loading....');
      const response = await axios.post('http://localhost:3001/forgot-password', { username });
      setMessage(response.data);
    } catch (error) {
      console.error('Error sending forgot password request:', error);
      setMessage('Error sending forgot password request.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/verify/${username}`);
      const otpFromServer = response.data.otp;
      // otp = parInt(otp);
      // Compare the received OTP with the one entered by the user
      if (otp == otpFromServer) {
        setShowPasswordChangeForm(true);

        // Set form visibility flag to true in localStorage
        localStorage.setItem('isPasswordChangeFormVisible', 'true');
      } else {
        // Invalid OTP
        console.log('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div id='main-box' className="fade-in">
      <h2 style={{ marginBottom: '40px' }}>Forgot Password </h2>
      {!showPasswordChangeForm ? (
        <>
          <div>
            <label>Username:</label>
            <input value={username} onChange={(e) => setUser(e.target.value)} />
          </div>
          <button onClick={handleForgotPassword}>Send OTP</button>

          <div style={{ marginTop: '40px' }}>
            <label>Enter OTP:</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
          <button onClick={handleVerifyOtp}>Verify OTP</button>
          <br /><br />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link style={{ fontSize: '15px' }} to='/login'>
              Back
            </Link>
            <p style={{ color: 'brown', textAlign: 'center', flex: 1 }}>
              {message}
            </p>
          </div>
        </>
      ) : (
        <PasswordChangeForm username={username} otp={otp} />
      )}
    </div>
  );
};

export default ForgotPassword;
