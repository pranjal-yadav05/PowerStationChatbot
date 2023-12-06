// AddEmployeeForm.jsx
import React, { useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddAdminForm = ({loggedInGov, onAddAdmin, onBack }) => {
  
  const [admUserName, setAdmUserName] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [password, setAdmPass] = useState('');
  const [deluser, setDeluser] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const handleAddAdmin = async () => {
    try {
      // Perform the necessary logic to add an employee
      // For example, send a request to your server
      // You might need to modify this based on your backend implementation
      const res = await axios.post('http://localhost:3001/add-admin', { admUserName, admEmail , password, loggedInGov });
      setAdmUserName('');
      setAdmEmail('');
      setAdmPass('');
      alert(res.data.message);
      // onAddEmployee(employeeName); // Update the employee list in the parent component
    } catch (error) {
      console.error('Error adding Admin:', error.message);
    }
  };
  const handleUsernameKeyDown = (e) => {
    // Check if the pressed key is Enter (key code 13)
    if (e.key === 'Enter') {
      // Move focus to the password input
      document.getElementById('email').focus();
    }
  };

  const handleEmailKeyDown = (e) => {
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
      handleAddAdmin();
    }
  };

  const handleConfigureClick = () => {
    // Toggle the showDeleteForm state when configure is clicked
    setShowDeleteForm((prev) => !prev);
  };
  const handleDeleteAdmin = async () => {
    const decision = confirm("Do you wish to Delete Admin "+deluser+" ?");
    setDeluser('')
    if(decision){
      try {
        const res = await axios.post(`http://localhost:3001/delete-employee/`,{empUserName:deluser, loggedIn: loggedInGov});
        alert(res.data.message);
        // Additional logic for updating UI or state after deletion
      } catch (error) {
        console.error('Error deleting admin:', error.message);
        alert('Error deleting admin:', error.message);
      }
    }else{
      return;
    }
  };

  const handleKey = (e) => {
    if(e.key === 'Enter'){
      handleDeleteAdmin();
    }
  }
  useEffect(() => {
    // Set focus on the username input after the component has mounted
    document.getElementById('username')?.focus();
  }, []);
  return (
    <div id='main-box' className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>
        {showDeleteForm ? 'Delete Admin' : 'Add Admin'}
      </h2>
      <div>
        <Link onClick={handleConfigureClick}>
          {showDeleteForm ? 'Add-Admin Form' : 'Delete-Admin Form'}
        </Link>
        {showDeleteForm ? (
          // Render your delete form here
          <div style={{marginTop : "20px"}}>
            <label>Admin Username:</label>
            <input onKeyDown={handleKey} id='username' value={deluser} onChange={(e) => setDeluser(e.target.value)}/>
            <button onClick={handleDeleteAdmin}>Delete Admin</button>
          </div>
        ) : (
          // Render your add form here
          <div style={{marginTop : "20px"}}>
            <label>Admin Username:</label>
            <input
              type='text'
              id='username'
              onKeyDown={handleUsernameKeyDown}
              value={admUserName}
              onChange={(e) => setAdmUserName(e.target.value)}
            />
            <br />
            <label>Admin Email:</label>
            <input
              type='email'
              id='email'
              onKeyDown={handleEmailKeyDown}
              value={admEmail}
              onChange={(e) => setAdmEmail(e.target.value)}
            />
            <br />
            <label>Admin Password:</label>
            <input
              type='text'
              id='passwordInput'
              onKeyDown={handlePasswordKeyDown}
              value={password}
              onChange={(e) => setAdmPass(e.target.value)}
            />
            <br />
            <button onClick={handleAddAdmin}>
              {showDeleteForm ? 'Delete Admin' : 'Add Admin'}
            </button>
            <br />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAdminForm;
