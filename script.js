// Replace with your actual API key
const API_KEY = 'AIzaSyCDnOgI8gQnxs8su_JRnnMDs8_lJcVxaxU';

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Function to add a message to the chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot typing-indicator';
    indicator.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
}

// Function to remove typing indicator
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

// Function to verify API key and available models
async function verifyAPIKey() {
    try {
        console.log('Verifying API key...');
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('API Key Error:', data);
            addMessage('Error: API key verification failed. Please check your API key permissions.', false);
            return false;
        }
        
        console.log('API Key verified successfully. Available models:', data);
        return true;
    } catch (error) {
        console.error('API Key verification error:', error);
        addMessage('Error: Could not verify API key. Please check your internet connection.', false);
        return false;
    }
}

// Function to handle the chat with Gemini Pro
async function handleChat(userMessage) {
    try {
        console.log('Sending message to Gemini API:', userMessage);
        
        // First verify the API key
        const isVerified = await verifyAPIKey();
        if (!isVerified) {
            return 'Please check your API key configuration and try again.';
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: userMessage
                }]
            }]
        };
        
        console.log('Request body:', requestBody);
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response from API');
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error. Please try again.';
    }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    console.log('Form submitted with message:', message);
    
    // Add user message
    addMessage(message, true);
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Get AI response
    const response = await handleChat(message);
    
    // Remove typing indicator and add AI response
    removeTypingIndicator(typingIndicator);
    addMessage(response);
});

// Handle Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// Verify API key when the page loads
window.addEventListener('load', () => {
    console.log('Page loaded, verifying API key...');
    verifyAPIKey();
}); 