import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEY = "AIzaSyCDnOgI8gQnxs8su_JRnnMDs8_lJcVxaxU";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash"
});

let chat = null;

async function sendMessage() {
    const userMessage = document.querySelector(".chat-window input").value;
    
    if (!userMessage.length) return;

    try {
        document.querySelector(".chat-window input").value = "";
        document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="user">
                <p>${userMessage}</p>
            </div>
        `);

        // Initialize chat instance only once
        if (!chat) {
            chat = model.startChat();
        }

        // Send message and get response
        const result = await chat.sendMessage(userMessage);
        
        document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="model">
                <p>${result.response.text()}</p>
            </div>
        `);

    } catch (error) {
        console.error('Error:', error);
        document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="error">
                <p>The message could not be sent. Please try again.</p>
            </div>
        `);
    }
}

// Add event listener for Enter key
const input = document.querySelector(".chat-window input");
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Add event listener for click
const button = document.querySelector(".chat-window .input-area button");
button.addEventListener("click", sendMessage);