document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');
    
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const API_KEY = "AIzaSyCDnOgI8gQnxs8su_JRnnMDs8_lJcVxaxU";
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash"
        });
        console.log('Model initialized successfully');

        let chat = null;

        async function sendMessage() {
            console.log('sendMessage called');
            const inputElement = document.querySelector(".chat-window input");
            const chatElement = document.querySelector(".chat-window .chat");
            
            if (!inputElement || !chatElement) {
                console.error('Required elements not found');
                return;
            }

            const userMessage = inputElement.value;
            console.log('User message:', userMessage);
            
            if (!userMessage.length) {
                console.log('Empty message');
                return;
            }

            try {
                inputElement.value = "";
                chatElement.insertAdjacentHTML("beforeend", `
                    <div class="user">
                        <p>${userMessage}</p>
                    </div>
                `);

                // Initialize chat instance only once
                if (!chat) {
                    chat = model.startChat();
                    console.log('Chat instance created');
                }

                // Send message and get response
                const result = await chat.sendMessage(userMessage);
                console.log('Got response:', result.response.text());
                
                chatElement.insertAdjacentHTML("beforeend", `
                    <div class="model">
                        <p>${result.response.text()}</p>
                    </div>
                `);

            } catch (error) {
                console.error('Error:', error);
                chatElement.insertAdjacentHTML("beforeend", `
                    <div class="error">
                        <p>The message could not be sent. Please try again.</p>
                    </div>
                `);
            }
        }

        // Add event listener for Enter key
        const input = document.querySelector(".chat-window input");
        if (input) {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Add event listener for click
        const button = document.querySelector(".chat-window .input-area button");
        if (button) {
            button.addEventListener("click", sendMessage);
        }

    } catch (error) {
        console.error('Failed to initialize model:', error);
    }
});