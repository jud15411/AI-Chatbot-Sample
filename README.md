# AI Chatbot with Gemini Pro

A modern, full-page chatbot application built with React, TypeScript, and Google's Gemini Pro API.

## Features

- Clean, modern UI with Tailwind CSS
- Real-time chat interface
- Integration with Google's Gemini Pro AI
- Responsive design
- TypeScript for better type safety

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini Pro API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env` file

## Usage

1. Open the application in your browser (default: http://localhost:3000)
2. Type your message in the input field
3. Press Enter or click the Send button to send your message
4. The AI will respond in real-time

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Google Generative AI SDK
- Node.js

## Security

This application requires HTTPS to function properly with the Gemini API. Make sure to run it on a secure server or use a local HTTPS development server.

## License

MIT License
