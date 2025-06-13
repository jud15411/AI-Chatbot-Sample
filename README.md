# AI Chatbot with Google Gemini

A simple AI chatbot powered by Google's Gemini API.

## Features

- Interactive chat interface
- Powered by Google's Gemini AI
- Environment variable configuration
- Modern development setup with Vite

## Prerequisites

- Node.js 16+ installed
- A Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-chatbot-sample
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Development

To start the development server:

```bash
npm start
```

This will start the development server at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Security Notes

- Never commit your `.env` file or share your API key
- The `.env` file is included in `.gitignore` to prevent accidental commits
- For production, consider implementing server-side API key handling instead of client-side

## License

MIT
