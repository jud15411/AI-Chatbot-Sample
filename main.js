import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if we're on HTTPS
if (window.location.protocol !== 'https:') {
    addMessage("error", `
        This page must be served over HTTPS to work with Google Gemini API.
        Please host this on a secure server or use a local HTTPS server.
    `);
    return;
}

// Replace with your actual API key
const API_KEY = "AIzaSyC_hKlpzVqgcq9VX3E9yYP5BQtXGsAuL9Y";

// Validate API key format
if (!API_KEY.startsWith("AIza")) {
    addMessage("error", `
        Invalid API key format. Please ensure you're using a valid Google API key.
        Your key should start with "AIza".
    `);
    return;
}

// Initialize the Gemini model
const genAI = new GoogleGenerativeAI(API_KEY);

// Store conversation history
let messages = [];

// Function to test API connection
async function testAPI() {
    try {
        console.log("Attempting to initialize model...");
        const testModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        console.log("Model initialized successfully");
        
        // Test a simple message
        const chat = testModel.startChat();
        const result = await chat.sendMessage("Hello");
        console.log("Test message sent successfully", result);
        
        addMessage("model", "API connection successful! You can now start chatting.");
    } catch (error) {
        console.error("API connection failed:", error);
        console.error("Error details:", {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack
        });
        
        addMessage("error", `
            API connection failed. Please ensure:
            1. You have a valid API key
            2. Billing is enabled in Google Cloud
            3. The Generative AI API is enabled
            4. Your website is served over HTTPS
            
            Error details: ${error.message}
            Error code: ${error.code}
        `);
    }
}

async function sendMessage() {
    const input = document.querySelector(".chat-container input");
    const userInput = input.value.trim();
    
    if (!userInput) return;

    try {
        // Clear input and add user message to chat
        input.value = "";
        addMessage("user", userInput);

        // Add loading indicator
        const loader = document.createElement("div");
        loader.className = "loader";
        document.querySelector(".chat-container .chat").appendChild(loader);

        // Get response from Gemini
        const chat = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }).startChat({ history: messages });
        const result = await chat.sendMessageStream(userInput);

        // Create model message element
        const modelMessage = document.createElement("div");
        modelMessage.className = "model";
        const modelParagraph = document.createElement("p");
        modelMessage.appendChild(modelParagraph);
        document.querySelector(".chat-container .chat").appendChild(modelMessage);

        // Stream the response
        let responseText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            responseText += chunkText;
            modelParagraph.innerHTML = responseText;
        }

        // Update chat history
        messages.push({
            role: "user",
            parts: [{ text: userInput }]
        });
        messages.push({
            role: "model",
            parts: [{ text: responseText }]
        });

        // Scroll to bottom
        document.querySelector(".chat-container .chat").scrollTop = 
            document.querySelector(".chat-container .chat").scrollHeight;

    } catch (error) {
        console.error("Error:", error);
        let errorMessage = "Sorry, there was an error processing your request.";
        if (error.message) {
            errorMessage += `\nError details: ${error.message}`;
        }
        addMessage("error", errorMessage);
    } finally {
        const loader = document.querySelector(".chat-container .chat .loader");
        if (loader) loader.remove();
    }
}

function addMessage(role, text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = role;
    const p = document.createElement("p");
    p.innerHTML = text; // Use innerHTML to support line breaks
    messageDiv.appendChild(p);
    document.querySelector(".chat-container .chat").appendChild(messageDiv);
}

// Event listeners
const sendButton = document.querySelector(".chat-container .input-area button");
const input = document.querySelector(".chat-container input");
const closeButton = document.querySelector(".chat-container .close");

// Initialize with a test message
document.addEventListener('DOMContentLoaded', () => {
    addMessage("model", "Hi! I'm here to help you set up Google Gemini. Let's get started!");
    testAPI(); // Test API connection on page load
});

sendButton.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
closeButton.addEventListener("click", () => {
    window.close();
});

// Auto-focus input field
input.focus();

