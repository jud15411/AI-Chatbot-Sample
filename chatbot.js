(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Initialize chatbot UI
            const chatMessages = document.getElementById('chat-messages');
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-button');

            if (!chatMessages || !userInput || !sendButton) {
                console.error('One or more required DOM elements not found');
                return;
            }

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
                    // Mock API response - replace with actual API call when ready
                    const mockResponse = `I received your message: "${message}". This is a mock response.`;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
                    addMessage(mockResponse, 'bot');
                } catch (error) {
                    console.error('Error:', error);
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
                sendMessage(message);
            });

            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && userInput.value.trim()) {
                    sendMessage(userInput.value.trim());
                }
            });

            console.log('Chatbot initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
        }
    });
})();

            // Initialize chatbot UI
            const chatMessages = document.getElementById('chat-messages');
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-button');

            if (!chatMessages || !userInput || !sendButton) {
                console.error('One or more required DOM elements not found');
                return;
            }

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
                    const response = await model.generateContent(message);
                    const responseText = await response.response;
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
                sendMessage(message);
            });

            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && userInput.value.trim()) {
                    sendMessage(userInput.value.trim());
                }
            });

            console.log('Chatbot initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
        }
    });
})();
            // Initialize Gemini Pro once
            const model = generativeai.GenerativeModel({
                model: 'gemini-pro',
                apiKey: 'AIzaSyC_hKlpzVqgcq9VX3E9yYP5BQtXGsAuL9Y'
            });
            
            // Store the model in window object for reuse
            window.geminiModel = model;
            initializeChatbot(model);
        } catch (error) {
            console.error('Failed to initialize Gemini Pro:', error);
            setTimeout(waitForReady, 500); // Wait longer if there's an error
            return;
        }
    }

    function initializeChatbot(model) {
        try {
            if (isInitialized) {
                console.log('Already initialized, skipping');
                return;
            }

            isInitialized = true;
            // Initialize Gemini Pro
            const model = generativeai.GenerativeModel({
                model: 'gemini-pro',
                apiKey: 'AIzaSyC_hKlpzVqgcq9VX3E9yYP5BQtXGsAuL9Y'
            });
            console.log('Gemini Pro initialized successfully');

            // DOM Elements
            const chatMessages = document.getElementById('chat-messages');
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-button');

            if (!chatMessages || !userInput || !sendButton) {
                console.error('One or more required DOM elements not found');
                return;
            }

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
                    const response = await model.generateContent(message);
                    const responseText = await response.response;
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
        } catch (error) {
            console.error('Failed to initialize Gemini Pro:', error);
        }
    }

    // Start waiting for everything to be ready
    waitForReady();
})();