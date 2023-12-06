import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminList = ({ loggedInGov }) => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    // Fetch the list of admins when the component mounts
    if(loggedInGov){
    axios.get(`http://localhost:3001/employees/${loggedInGov}`)
      .then(response => {
        setAdmins(response.data);
      })
      .catch(error => {
        console.error('Error fetching admins:', error.message);
      });
    } 
  }, [loggedInGov]);

  return (
    <div id='main-box'>
      <h2 style={{marginBottom : "20px"}}>Admin List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
      <tr>
        <th style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', textAlign: 'left', padding: '8px' }}>Admin</th>
        <th style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc', textAlign: 'right', padding: '8px' }}>Status</th>
      </tr>
    </thead>
    <tbody>
      {admins.map((admin, index) => (
        <tr key={index} style={{ fontSize: '1.2em', borderBottom: '1px solid #ccc' }}>
          <td style={{ padding: '8px' }}>{admin.belongs}</td>
          <td style={{ color: admin.status === 'Online' ? 'green' : 'grey', padding: '8px', textAlign: 'right' }}>
            {admin.status}
          </td>
        </tr>
      ))}
    </tbody>
    </table>
    </div>
  );
};

export default AdminList;
