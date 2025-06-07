import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCDnOgI8gQnxs8su_JRnnMDs8_lJcVxaxU";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
    }
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

// Function implementations
async function generatePost(args) {
    if (!args.description) {
        return { error: "Please provide a description for the post" };
    }
    
    try {
        const prompt = `Generate a social media post about ${args.subject} that includes the following details: ${args.description}. The post should be engaging and contain personal information that could be used in the cyber training game.`;
        
        const chat = model.startChat();
        const result = await chat.sendMessage(prompt);
        
        return {
            type: "post",
            content: result.text,
            subject: args.subject,
            description: args.description
        };
    } catch (error) {
        console.error('Post generation error:', error);
        return { error: "Failed to generate post" };
    }
}

async function generateEmail(args) {
    if (!args.description) {
        return { error: "Please provide a description for the email" };
    }
    
    try {
        const prompt = `Generate an email about ${args.subject} that includes the following details: ${args.description}. The email should be convincing and contain personal information that could be used in the cyber training game.`;
        
        const chat = model.startChat();
        const result = await chat.sendMessage(prompt);
        
        return {
            type: "email",
            content: result.text,
            subject: args.subject,
            description: args.description
        };
    } catch (error) {
        console.error('Email generation error:', error);
        return { error: "Failed to generate email" };
    }
}

async function generateMessage(args) {
    if (!args.description) {
        return { error: "Please provide a description for the message" };
    }
    
    try {
        const prompt = `Generate a direct message about ${args.subject} that includes the following details: ${args.description}. The message should be personal and contain information that could be used in the cyber training game.`;
        
        const chat = model.startChat();
        const result = await chat.sendMessage(prompt);
        
        return {
            type: "message",
            content: result.text,
            subject: args.subject,
            description: args.description
        };
    } catch (error) {
        console.error('Message generation error:', error);
        return { error: "Failed to generate message" };
    }
}

async function generateNotification(args) {
    if (!args.description) {
        return { error: "Please provide a description for the notification" };
    }
    
    try {
        const prompt = `Generate a notification about ${args.subject} that includes the following details: ${args.description}. The notification should be relevant and contain information that could be used in the cyber training game.`;
        
        const chat = model.startChat();
        const result = await chat.sendMessage(prompt);
        
        return {
            type: "notification",
            content: result.text,
            subject: args.subject,
            description: args.description
        };
    } catch (error) {
        console.error('Notification generation error:', error);
        return { error: "Failed to generate notification" };
    }
}

// Function to execute functions
async function executeFunction(functionCall) {
    const functionName = functionCall.name;
    const functionArgs = functionCall.arguments;
    
    switch (functionName) {
        case 'generatePost':
            return await generatePost(functionArgs);
        case 'generateEmail':
            return await generateEmail(functionArgs);
        case 'generateMessage':
            return await generateMessage(functionArgs);
        case 'generateNotification':
            return await generateNotification(functionArgs);
        default:
            throw new Error(`Unknown function: ${functionName}`);
    }
}

async function sendMessage() {
    const userMessage = document.querySelector(".chat-window input").value;
    if (userMessage.length) {
        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            // Check if the request is valid before showing loader
            const allowedPatterns = [
                /^create post\s+/,
                /^write post\s+/,
                /^generate post\s+/,
                /^create email\s+/,
                /^write email\s+/,
                /^generate email\s+/,
                /^create message\s+/,
                /^write message\s+/,
                /^generate message\s+/,
                /^create notification\s+/,
                /^write notification\s+/,
                /^generate notification\s+/
            ];

            const cleanedMessage = userMessage.toLowerCase().trim();
            const isValidRequest = allowedPatterns.some(pattern => pattern.test(cleanedMessage));

            if (!isValidRequest) {
                // If not a valid request, do not show any response
                return;
            }

            // If valid request, show loader and continue
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            // Create a chat with a restrictive system prompt
            const chat = model.startChat({
                systemPrompt: "You are a cyber security training assistant. Only generate social media posts, emails, messages, or notifications. Do not respond to any other requests.",
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40
                }
            });

            // Get the type of content being requested (second word)
            const requestType = cleanedMessage.split(' ')[1];
            
            // Get the remaining text after the command
            const remainingText = cleanedMessage
                .replace(/^create |^write |^generate /, '')
                .trim()
                .replace(/^(post|email|message|notification)\s+/, '')
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
                case 'text':
                    functionName = 'generateMessage';
                    break;
                case 'notification':
                    functionName = 'generateNotification';
                    break;
                default:
                    // Should never get here if we matched a pattern
                    return;
            }

            if (!functionName) {
                return;
            }

            // Create the prompt
            let prompt;
            switch(functionName) {
                case 'generatePost':
                    prompt = `Generate a social media post about ${remainingText}. The post should be engaging and contain personal information that could be used in the cyber training game.`;
                    break;
                case 'generateEmail':
                    prompt = `Generate an email about ${remainingText}. The email should be convincing and contain personal information that could be used in the cyber training game.`;
                    break;
                case 'generateMessage':
                    prompt = `Generate a direct message about ${remainingText}. The message should be personal and contain information that could be used in the cyber training game.`;
                    break;
                case 'generateNotification':
                    prompt = `Generate a notification about ${remainingText}. The notification should be relevant and contain information that could be used in the cyber training game.`;
                    break;
            }

            // Create a new model response container
            const modelDiv = document.createElement('div');
            modelDiv.className = 'model';
            const modelContent = document.createElement('p');
            modelDiv.appendChild(modelContent);
            document.querySelector('.chat-window .chat').appendChild(modelDiv);

            // Get the model messages again
            const modelMessages = document.querySelectorAll('.chat-window .chat div.model');
            const lastMessage = modelMessages[modelMessages.length - 1];

            // Send the message stream
            try {
                const result = await chat.sendMessageStream(prompt);
                let fullResponse = '';

                // Process the stream
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                        fullResponse += chunkText;
                        lastMessage.querySelector('p').textContent = `
                            <strong>Generated ${functionName}:</strong><br>
                            ${fullResponse}
                        `;
                    }
                }

                // Add to history
                messages.history.push({
                    role: "user",
                    parts: [{ text: userMessage }],
                });

                // Add model response to history
                messages.history.push({
                    role: "model",
                    parts: [{ text: fullResponse }],
                });

                // Remove loader
                const loader = document.querySelector(".chat-window .chat .loader");
                if (loader) {
                    loader.remove();
                }

                // Scroll to bottom
                const container = document.querySelector(".chat");
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            } catch (error) {
                console.error('Error:', error);
                // Remove loader
                const loader = document.querySelector(".chat-window .chat .loader");
                if (loader) {
                    loader.remove();
                }
                // Show error message
                document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                    <div class="error">
                        <p>The message could not be sent. Please try again.</p>
                    </div>
                `);
                // Scroll to bottom on error
                const container = document.querySelector(".chat");
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }

            // Add to history
            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            // Add model response to history
            messages.history.push({
                role: "model",
                parts: [{ text: fullResponse }],
            });

            // Scroll to bottom
            const container = document.querySelector(".chat");
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        } catch (error) {
            console.error('Error:', error);
            // Remove loader
            const loader = document.querySelector(".chat-window .chat .loader");
            if (loader) {
                loader.remove();
            }
            // Show error message
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
            // Scroll to bottom on error
            const container = document.querySelector(".chat");
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }
}

// Add event listeners
const input = document.querySelector(".chat-window input");
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

const button = document.querySelector(".chat-window .input-area button");
button.addEventListener("click", sendMessage);