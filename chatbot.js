(function() {
    // Wait for generativeai library to load
    if (typeof generativeai === 'undefined') {
        console.log('Waiting for generativeai library to load...');
        return;
    }

    // Initialize Gemini Pro
    const model = generativeai.GenerativeModel({
        model: 'gemini-pro',
        apiKey: 'AIzaSyC_hKlpzVqgcq9VX3E9yYP5BQtXGsAuL9Y'
    });

    console.log('Gemini Pro initialized successfully');

    function initChatbot() {
        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');

        console.log('DOM Elements found:', {
            chatMessages: chatMessages ? 'Found' : 'Not found',
            userInput: userInput ? 'Found' : 'Not found',
            sendButton: sendButton ? 'Found' : 'Not found'
        });

        if (!chatMessages || !userInput || !sendButton) {
            console.error('One or more required DOM elements not found');
            return;
        }

        console.log('Chatbot initialized with elements:', {
            chatMessages: !!chatMessages,
            userInput: !!userInput,
            sendButton: !!sendButton
        });

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendMessage(message) {
            console.log('Starting sendMessage with:', message);
            addMessage(message, 'user');
            userInput.value = '';
            userInput.disabled = true;
            sendButton.disabled = true;
            
            try {
                // Get response from Gemini Pro
                const response = await model.generateContent(message);
                const responseText = await response.response;
                
                // Add bot message to chat
                addMessage(responseText, 'bot');
            } catch (error) {
                console.error('Gemini Pro error:', error);
                addMessage('Sorry, there was an error processing your request. Please try again.', 'bot');
            } finally {
                userInput.disabled = false;
                sendButton.disabled = false;
            }
        }

        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            const message = userInput.value.trim();
            if (!message) return;

            try {
                console.log('Sending message:', message);
                sendMessage(message);
            } catch (error) {
                console.error('Send button error:', error);
                addMessage('Failed to send message. Please try again.', 'bot');
            }
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && userInput.value.trim()) {
                sendMessage(userInput.value.trim());
            }
        });

        console.log('Chatbot initialized successfully');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();