import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PasswordChangeForm = ({ username, otp }) => {
  // Load form visibility flag from localStorage on component mount
  useEffect(() => {
    const isFormVisible = localStorage.getItem('isPasswordChangeFormVisible') === 'true';
    setShowPasswordChangeForm(isFormVisible);
  }, []);

  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const handlePasswordChange = async () => {
    try {
      // Check if the new password and confirmed password match
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }
  
      // Send a request to the server to change the password
      const response = await axios.post('http://localhost:3001/change-password', {
        username,
        otp,
        newPassword: formData.newPassword,
      });
  
      if (response.data === 'success') {
        setMessage('Password changed successfully.');
  
        // Clear form visibility flag from localStorage after successful password change
        localStorage.removeItem('isPasswordChangeFormVisible');
      } else {
        setMessage('Error changing password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Error changing password.');
    }
  };
  
  return (
    <div className="fade-in">
      {message === 'Password changed successfully.' ? (
        <>
          <i style={{ color: 'green' }}>Password Changed Successfully</i>
          <br />
          <Link to='/login'><i>You can Login here</i></Link>
        </>
      ) : (
        <>
          <h3 style={{ marginBottom: '20px' }}>Password Change</h3>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
          <button onClick={handlePasswordChange}>Change Password</button>
          <i>{message}</i>
        </>
      )}
    </div>
  );
};

export default PasswordChangeForm;
