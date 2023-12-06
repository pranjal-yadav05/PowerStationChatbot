// ChatPage.jsx
import React, { useEffect } from 'react';
import './styles.css'

const send = async function sendMessage() {
  var userMessage = document.getElementById("user-message").value;
  displayMessage("You: " + userMessage);

  fetch("http://localhost:3001/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: userMessage,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      var aiResponse = data.aa;
      displayAI("AI: " + aiResponse);
    })
    .catch((error) => console.error("Error:", error));
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
}



const ChatPage = ({ username }) => {
  useEffect(()=>{
    document.getElementById('user-message').focus();
  },[])
  const handleEnter = (e) => {
    if(e.key === 'Enter'){
      send();
    }
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
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
// ChatPage.jsx
// import React from 'react';
// import { useAuth } from './AuthContext';

// const ChatPage = () => {
//   const { userId, accesstype } = useAuth();

//   return (
//     <div>
//       <h2>Welcome, {userId}!</h2>
//       <p>Access Type: {accesstype}</p>
//       {/* Your chat content */}
//     </div>
//   );
// };

// export default ChatPage;
