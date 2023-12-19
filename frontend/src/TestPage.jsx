import React, { useEffect, useState, useRef} from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const TestPage = ({ encrypt, timer, setTimer, tests, testSelected, user, setTestSelected, setInTestMode, decrypt }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleEndTest = () => {
    setTimer(0);
    setInTestMode(false);
    localStorage.removeItem('selectedTest');
    localStorage.removeItem('selectEncryptTest');
    localStorage.removeItem('testStartTime');
  };

  const handleSubmit = () => {
    console.log('Test start time : '+decrypt(localStorage.getItem('testStartTime')));
    console.log('Submitting test result...');
    var currentTest = tests.find((test) => test.testid === testSelected);
    currentTest = JSON.parse(currentTest.test)


    if (!currentTest) {
      console.error('Error: Test object is undefined.');
      return;
    }

    const testQuestions = currentTest.questions;
    const answers = currentTest.answers;

    if (!testQuestions || !Array.isArray(testQuestions)) {
      console.error('Error: Test questions are missing or not an array.');
      return;
    }

    const unansweredQuestions = testQuestions.filter((question) => !selectedOptions[question.id]);

    if (unansweredQuestions.length > 0) {
      const confirmSubmission = window.confirm('You have unanswered questions. Do you still want to submit?');
      if (!confirmSubmission) {
        return;
      }
    }

    setResult(null);


    if (currentTest && answers && Array.isArray(answers)) {
      const correctAnswers = answers.reduce((acc, answer) => {
        acc[answer.id] = answer.ans;
        return acc;
      }, {});

      const userScore = testQuestions.reduce((score, question) => {
        if (selectedOptions[question.id] === correctAnswers[question.id]) {
          return score + 1;
        }
        return score;
      }, 0);

      // localStorage.removeItem('selectedTest');
      // localStorage.removeItem('testStartTime');
      // localStorage.removeItem('selectEncryptTest');


      setResult(`You scored ${userScore} out of ${testQuestions.length}`);
      console.log(`You scored ${userScore} out of ${testQuestions.length}`);
      var test = tests.find((test) => test.testid === testSelected);
      // console.log(test);

      console.log('Making post request...');

      try{
        const res = axios.post('http://localhost:3001/addres',{
          username: user,
          result: userScore + '/' + testQuestions.length,
          testid : test.testid
        })
      }catch(error){
        console.error('Error making post request:', error);
      }
      setIsSubmitted(true);
      setTimer(0);
      
    } else {
      console.error('Invalid test structure: answers is missing or not an array.');
    }
  };

  // Extracted decryption logic into a function
  const getDecryptedTest = () => {
    const storedEncryptedTest = localStorage.getItem('selectEncryptTest');
    try {
      const decryptedData = storedEncryptedTest ? decrypt(storedEncryptedTest) : null;

      if (decryptedData) {
        const parsedData = JSON.parse(decryptedData);

        if (parsedData && parsedData.test) {
          return parsedData.test;
        } else {
          console.error('Invalid decrypted data structure: Missing "test" property.');
          return null;
        }
      } else {
        console.error('Error decrypting data: Decrypted data is null.');
        return null;
      }
    } catch (error) {
      console.error('Error parsing decrypted data:', error);
      return null;
    }
  };

  const decryptedTest = getDecryptedTest();

  if (!decryptedTest) {
    console.error('Error decrypting test');
    return null;
  }

  const test = JSON.parse(decryptedTest);

  const handleOptionChange = (questionId, option) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [questionId]: option,
    }));
  };

  useEffect(() => {
    let submitted = false; // Flag to track whether handleSubmit has been called
  
    const encryptedStartTime = localStorage.getItem('testStartTime');
    const decryptedStartTime = decrypt(encryptedStartTime);
  
    try {
      const testStartTime = JSON.parse(decryptedStartTime);
      const testDuration = tests.find((test) => test.testid === testSelected)?.time || 0;
  
      if (!isNaN(Date.parse(testStartTime))) {
        // Check if the timer is greater than 0 before setting up the interval
        if (timer > 0) {
          const interval = setInterval(() => {
            const currentTime = new Date();
            const elapsedSeconds = Math.floor((currentTime - new Date(testStartTime)) / 1000);
            const remainingTime = Math.max(testDuration - elapsedSeconds, 0);
  
            setTimer(remainingTime);
  
            if (remainingTime === 0 && !submitted && !isSubmitted) {
              clearInterval(interval);
              submitted = true; // Set the flag to true to prevent multiple calls
              console.log('Calling handleSubmit...');
              handleSubmit();
            }
          }, 1000);
  
          return () => clearInterval(interval);
        }
      }
    } catch (error) {
      console.error('Error parsing test start time:', error);
    }
  }, [testSelected, tests, decrypt, setTimer, handleSubmit, isSubmitted, timer]);
  
  



  useEffect(() => {
    if (!localStorage.getItem('testStartTime')) {
      const encryptedStartTime = encrypt(JSON.stringify(new Date()));
      localStorage.setItem('testStartTime', encryptedStartTime);
    }
  }, [testSelected, tests, encrypt]);

  const handleShowTests = () => {
    localStorage.removeItem('selectedTest');
    localStorage.removeItem('testStartTime');
    localStorage.removeItem('selectEncryptTest');
    setTestSelected('');
    setInTestMode(false);
  };

  return (
    <div>
      <h1>Timer: {timer} seconds</h1>
      {isSubmitted ? (
        <>
          <p>{result}</p>
          <button onClick={handleShowTests}>Go to Show Tests</button>
        </>
      ) : (
        <>
          {test.questions.map((question) => (
            <div key={question.id}>
              <p>Question: {question.text}</p>
              <label>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value="A"
                  onChange={() => handleOptionChange(question.id, 'A')}
                />
                Option A: {question.optionA}
              </label>
              <label>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value="B"
                  onChange={() => handleOptionChange(question.id, 'B')}
                />
                Option B: {question.optionB}
              </label>
            </div>
          ))}
          <br />
          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </div>
  );
};

export default TestPage;
