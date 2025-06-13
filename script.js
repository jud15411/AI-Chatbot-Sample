import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set');
    // Show error message to the user
    const chat = document.querySelector('.chat');
    if (chat) {
        chat.insertAdjacentHTML('beforeend', `
            <div class="error">
                <p>Error: API key is not configured. Please check your .env file.</p>
            </div>
        `);
    }
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
    },
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
    ]
});

// Define available functions for cyber training game
const functions = {
    generatePost: {
        description: "Generate a social media post for the cyber training game",
        parameters: {
            type: "object",
            properties: {
                subject: {
                    type: "string",
                    description: "The subject or topic of the post"
                },
                description: {
                    type: "string",
                    description: "Additional details or context for the post"
                }
            },
            required: ["subject"]
        }
    },
    generateEmail: {
        description: "Generate an email for the cyber training game",
        parameters: {
            type: "object",
            properties: {
                subject: {
                    type: "string",
                    description: "The subject or topic of the email"
                },
                description: {
                    type: "string",
                    description: "Additional details or context for the email"
                }
            },
            required: ["subject"]
        }
    },
    generateMessage: {
        description: "Generate a direct message for the cyber training game",
        parameters: {
            type: "object",
            properties: {
                subject: {
                    type: "string",
                    description: "The subject or topic of the message"
                },
                description: {
                    type: "string",
                    description: "Additional details or context for the message"
                }
            },
            required: ["subject"]
        }
    },
    generateNotification: {
        description: "Generate a notification for the cyber training game",
        parameters: {
            type: "object",
            properties: {
                subject: {
                    type: "string",
                    description: "The subject or topic of the notification"
                },
                description: {
                    type: "string",
                    description: "Additional details or context for the notification"
                }
            },
            required: ["subject"]
        }
    }
};

let messages = {
    history: [],
    functions: functions
};

// Function to create a streaming response
async function streamResponse(prompt, model, chatWindow) {
    // Create model response element
    const modelDiv = document.createElement('div');
    modelDiv.className = 'model';
    const modelContent = document.createElement('p');
    modelDiv.appendChild(modelContent);
    chatWindow.appendChild(modelDiv);
    
    // Start a chat session
    const chat = model.startChat({
        generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
        ],
        history: []
    });

    try {
        // For the current version, we'll simulate streaming with a non-streaming response
        // since the streaming API might not be fully supported in this version
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();
        
        // Simulate streaming by adding text character by character
        let i = 0;
        const speed = 20; // milliseconds per character
        
        return new Promise((resolve) => {
            const typeWriter = () => {
                if (i < responseText.length) {
                    modelContent.textContent = responseText.substring(0, i + 1);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                    i++;
                    setTimeout(typeWriter, speed);
                } else {
                    // Remove loading indicator when done
                    const loaders = chatWindow.querySelectorAll('.typing-indicator, .loader');
                    loaders.forEach(loader => {
                        if (loader && loader.parentNode) {
                            chatWindow.removeChild(loader);
                        }
                    });
                    resolve(responseText);
                }
            };
            typeWriter();
        });
    } catch (error) {
        console.error('Error generating response:', error);
        modelContent.textContent = 'Sorry, there was an error generating the response. Please try again.';
        return '';
    }
}

async function sendMessage() {
    const userMessage = document.querySelector(".chat-window input").value;
    if (userMessage.length) {
        const chatWindow = document.querySelector(".chat-window .chat");
        const input = document.querySelector(".chat-window input");
        
        // Clear input and show user message
        input.value = "";
        chatWindow.insertAdjacentHTML("beforeend", `
            <div class="user">
                <p>${userMessage}</p>
            </div>
        `);

        // Show loader
        chatWindow.insertAdjacentHTML("beforeend", `
            <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `);

        try {
            let responseText = '';
            
            // Check if this is a command-based request
            const commandPatterns = [
                /^(create|write|generate) (post|social|email|message|notification)\s+/i
            ];

            const isCommand = commandPatterns.some(pattern => pattern.test(userMessage));

            if (isCommand) {
                // Handle command-based requests
                const cleanedMessage = userMessage.toLowerCase().trim();
                const requestType = cleanedMessage.split(' ')[1];
                
                // Get the remaining text after the command
                const remainingText = cleanedMessage
                    .replace(/^create |^write |^generate /, '')
                    .trim()
                    .replace(/^(post|social|email|message|notification)\s+/, '')
                    .trim();

                // Determine the function based on the request type
                let functionName;
                switch(requestType) {
                    case 'post':
                    case 'social':
                        functionName = 'generatePost';
                        break;
                    case 'email':
                        functionName = 'generateEmail';
                        break;
                    case 'message':
                        functionName = 'generateMessage';
                        break;
                    case 'notification':
                        functionName = 'generateNotification';
                        break;
                    default:
                        throw new Error(`Unknown request type: ${requestType}`);
                }

                // Generate a prompt for the AI
                let prompt = '';
                switch(functionName) {
                    case 'generatePost':
                        prompt = `Create a social media post about: ${remainingText}`;
                        break;
                    case 'generateEmail':
                        prompt = `Write an email about: ${remainingText}`;
                        break;
                    case 'generateMessage':
                        prompt = `Write a direct message about: ${remainingText}`;
                        break;
                    case 'generateNotification':
                        prompt = `Create a notification about: ${remainingText}`;
                        break;
                }

                // Use the streaming function
                responseText = await streamResponse(prompt, model, chatWindow);
            } else {
                // Use the streaming function for general chat
                responseText = await streamResponse(userMessage, model, chatWindow);
            }

            // The response and loader are managed by the streamResponse function

        } catch (error) {
            console.error('Error:', error);
            // Remove loader
            const loader = chatWindow.querySelector(".typing-indicator");
            if (loader) {
                chatWindow.removeChild(loader);
                loader.remove();
            }
            // Show error message
            chatWindow.insertAdjacentHTML("beforeend", `
                <div class="error">
                    <p>Sorry, I encountered an error: ${error.message}</p>
                </div>
            `);
            // Scroll to bottom on error
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    const input = document.querySelector(".chat-window input");
    const button = document.querySelector(".input-area button");

    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    } else {
        console.error('Input element not found');
    }

    if (button) {
        button.addEventListener("click", sendMessage);
    } else {
        console.error('Send button not found');
    }
});