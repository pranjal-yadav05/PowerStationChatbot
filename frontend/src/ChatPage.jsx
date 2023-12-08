// ChatPage.jsx
import React, { useEffect , useState} from 'react';
import './styles.css'
import axios from 'axios';

var username;

const ChatPage = ({user}) => {
  console.log('user ' + user)
  username = user;
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  useEffect(()=>{
    document.getElementById('user-message').focus();
  },[])
  const handleEnter = (e) => {
    if(e.key === 'Enter'){
      document.getElementById('btn').click();
    }
  }

  const send = async function sendMessage() {
    setButtonDisabled(true);
    var userMessage = document.getElementById("user-message").value;
    displayMessage("You: " + userMessage);
    // console.log('username: '+username)
    
    document.getElementById('user-message').value = '';
    const response = await axios.post("http://localhost:3001/process-input",{
        input: userMessage, 
        username: username
      }
    );
    
    displayAI(response.data);
  }

  
  function displayMessage(message) {
    var chatDisplay = document.getElementById("chat-display");
    var newMessage = document.createElement("p");
    newMessage.textContent = message;
    newMessage.classList.add("user-message");
    chatDisplay.appendChild(newMessage);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }
  // Your existing displayAI function
  function displayAI(message) {
    var chatDisplay = document.getElementById("chat-display");
    var newMessage = document.createElement("p");
    newMessage.classList.add("ai-message");
    // Set up typing animation
    newMessage.innerHTML = '<span class="typing"></span>';
    chatDisplay.appendChild(newMessage);

    // Calculate animation duration based on message length
    var animationDuration = Math.min(3, message.length * 0.1) + 's';

    // Apply styles to the typing element
    var typingElement = newMessage.querySelector('.typing');
    typingElement.textContent = message;
    typingElement.style.animation = `typing ${animationDuration} steps(${message.length}) forwards`;

    // Scroll to the bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    setButtonDisabled(false);
  }

  return (
    <div id="chat-container" className="fade-in">
      <div id="chat-display"></div>
      <div id="user-input">
        <input
          onKeyDown={handleEnter}
          type="text"
          id="user-message"
          placeholder="What is a Distribution Transformer?...."
        />
        <button id='btn' onClick={send} disabled={isButtonDisabled}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;