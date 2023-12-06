import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { resolvePath } from 'react-router-dom';

const EmployeeList = ({loggedInAdmin}) => {

  const [employees, setEmployees] = useState([]);
  useEffect(() => {

    // Fetch the list of employees when the component mounts
    if(loggedInAdmin){
    axios.get(`http://localhost:3001/employees/${loggedInAdmin}`)
      .then(response => {
        // Set the employees in the state
        setEmployees(response.data);
        
      })
      .catch(error => {
        console.error('Error fetching employees:', error.message);
      });
    }
      
  }, [loggedInAdmin]); // Empty dependency array ensures this effect runs only once after mount

  return (
    <div id='main-box' className="fade-in">
      <h2 style={{marginBottom : "20px"}}>Employee List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
      <tr>
        <th style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', textAlign: 'left', padding: '8px' }}>Employee</th>
        <th style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', textAlign: 'right', padding: '8px' }}>Status</th>
      </tr>
    </thead>
    <tbody>
      {employees.map((employee, index) => (
        <tr key={index} style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc' }}>
          <td style={{ padding: '8px' }}>{employee.belongs}</td>
          <td style={{ color: employee.status === 'Online' ? 'green' : 'grey', padding: '8px', textAlign: 'right' }}>
            {employee.status}
          </td>
        </tr>
      ))}
    </tbody>
    </table>
    </div>
  );
};

export default EmployeeList;
