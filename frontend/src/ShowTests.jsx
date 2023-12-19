import React, { useState, useEffect } from "react";
import axios from 'axios';
import CryptoJS from 'crypto-js';

const ShowTests = ({ user, setTimer, testSelected, setTestSelected, setInTestMode, setTests, tests, encrypt, decrypt }) => {

  useEffect(() => {
    const fetchData = async () => {
      await fetchTests();
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchTests = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/gettests/${user}`);
      console.log(res.data)
      const encryptedTests = encrypt(JSON.stringify(res.data));

      // Save the encrypted tests to local storage
      localStorage.setItem('encryptedTests', encryptedTests);
      // Decrypt and set the tests state
      setTests(JSON.parse(decrypt(encryptedTests)));
    } catch (error) {
      console.error('Error fetching tests:', error.message);
    }
  };

  const startTest = async (testId) => {
    const currentStartTime = new Date();
    localStorage.setItem('testStartTime', encrypt(JSON.stringify(currentStartTime)));
    
    localStorage.setItem('selectedTest', testId);
    console.log(tests.find((test) => test.testid === testId));
    localStorage.setItem(
      'selectEncryptTest',
      encrypt(JSON.stringify(tests.find((test) => test.testid === testId)))
    );
    setTestSelected(testId);
    setInTestMode(true);
    setTimer(tests.find((test) => test.testid === testId).time)
    console.log(tests.find((test) => test.testid === testId).time)

  };

  return (
    <div id="main-box">
      <h2>Available Tests</h2>
      <ul>
        {Array.isArray(tests) ? (
          tests.map((test) => (
            <li style={{ listStyle: 'none' }} key={test.testid}>
              <i>
                {test.testid}
                <button
                  style={{ fontSize: 10, padding: '10px' }}
                  onClick={() => startTest(tests[0].testid)}
                >
                  Start Test
                </button> time : {test.time}
              </i>
            </li>
          ))
        ) : (
          <p>No tests available</p>
        )}
      </ul>
    </div>
  );
};

export default ShowTests;
