// SettingsPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const SettingsPage = ({user}) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object to send the file to the server
    const formData = new FormData();
    formData.append('profilePic', file); // Assuming 'file' is the image file
    formData.append('username', user);

    axios.post('http://localhost:3001/uploadProfilePic', formData)
    .then(response => {
      console.log(response.data);
      window.location.reload();
    })
    .catch(error => {
      console.error('Error uploading profile picture:', error);
    });

  };

  return (
    <div id='main-box' className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>Settings</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="profilePic">Profile Picture:</label>
        <input type="file" id="profilePic" onChange={handleFileChange} />
        <button type="submit">Upload Profile Picture</button>
      </form>
    </div>
  );
};

export default SettingsPage;
