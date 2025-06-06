// Initialize Gemini Pro client
const genAI = generativeai.GenerativeAI('AIzaSyC_hKlpzVqgcq9VX3E9yYP5BQtXGsAuL9Y');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Add event listener for Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && userInput.value.trim()) {
        sendMessage();
    }
});

// Add event listener for send button
sendButton.addEventListener('click', () => {
    if (userInput.value.trim()) {
        sendMessage();
    }
});

async function sendMessage() {
    const userMessage = userInput.value.trim();
    
    // Add user message to chat
    addMessage(userMessage, 'user');
    userInput.value = '';
    
    // Get response from Gemini Pro
    try {
        const response = await model.generateContent(userMessage);
        const responseText = await response.response;
        
        // Add bot message to chat
        addMessage(responseText, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, there was an error processing your request.', 'bot');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
