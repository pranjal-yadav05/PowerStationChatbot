// AddEmployeeForm.jsx
import React, { useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddEmployeeForm = ({loggedInAdmin, onAddEmployee, onBack }) => {
  
  const [empUserName, setEmpUserName] = useState('');
  const[deluser, setDeluser] = useState('');
  const[empEmail,setEmpEmail] = useState('');
  const [password, setEmpPass] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const handleAddEmployee = async () => {
    try {
      // Perform the necessary logic to add an employee
      // For example, send a request to your server
      // You might need to modify this based on your backend implementation
      const res = await axios.post('http://localhost:3001/add-employee', { empUserName, empEmail , password, loggedInAdmin });
      setEmpUserName('');
      setEmpEmail('');
      setEmpPass('');
      alert(res.data.message);
      // onAddEmployee(employeeName); // Update the employee list in the parent component
    } catch (error) {
      console.error('Error adding employee:', error.message);
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
      handleAddEmployee();
    }
  };
  const handleConfigureClick = () => {
    // Toggle the showDeleteForm state when configure is clicked
    setShowDeleteForm((prev) => !prev);
  };
  const handleDeleteEmployee = async () => {
    const decision = confirm("Do you wish to Delete Employee "+deluser+" ?");
    setDeluser('')
    if(decision){
      try {
        // Perform the necessary logic to delete an employee
        // For example, send a request to your server
        // You might need to modify this based on your backend implementation
        const res = await axios.post(`http://localhost:3001/delete-employee/`,{empUserName:deluser, loggedIn: loggedInAdmin});
        alert(res.data.message);
        // Additional logic for updating UI or state after deletion
      } catch (error) {
        console.error('Error deleting employee:', error.message);
      }
    }else{
      return;
    }
  };

  const handleKey = (e) => {
    if(e.key === 'Enter'){
      handleAddEmployee();
    }
  }

  useEffect(() => {
    // Set focus on the username input after the component has mounted
    document.getElementById('username').focus();
  }, []);
  return (
    <div id='main-box' className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>
        {showDeleteForm ? 'Delete Employee' : 'Add Employee'}
      </h2>
      <div>
        <Link onClick={handleConfigureClick}>
          {showDeleteForm ? 'Add-Employee Form' : 'Delete-Employee Form'}
        </Link>
        {showDeleteForm ? (
          // Render your delete form here
          <div style={{marginTop : "20px"}}>
            <label>Employee Username:</label>
            <input onKeyDown={handleKey} id='username' value={deluser} onChange={(e) => setDeluser(e.target.value)}/>
            <button onClick={handleDeleteEmployee}>Delete Employee</button>
          </div>
        ) : (
          // Render your add form here
          <div style={{marginTop : "20px"}}>
            <label>Employee Username:</label>
            <input
              type='text'
              id='username'
              onKeyDown={handleUsernameKeyDown}
              value={empUserName}
              onChange={(e) => setEmpUserName(e.target.value)}
            />
            <br />
            <label>Employee Email:</label>
            <input
              type='email'
              id='email'
              onKeyDown={handleEmailKeyDown}
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
            />
            <br />
            <label>Employee Password:</label>
            <input
              type='text'
              id='passwordInput'
              onKeyDown={handlePasswordKeyDown}
              value={password}
              onChange={(e) => setEmpPass(e.target.value)}
            />
            <br />
            <button onClick={handleAddEmployee}>
              {showDeleteForm ? 'Delete Employee' : 'Add Employee'}
            </button>
            <br />
          </div>
        )}
      </div>
    </div>

  );
};

export default AddEmployeeForm;
