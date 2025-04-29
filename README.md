# Medical Interpreter Application

A proof-of-concept application for real-time interpretation between clinicians (English) and patients (Spanish).

## Features

- Real-time audio interpretation between English and Spanish
- Text-to-speech output for each utterance
- Display of conversation in both languages
- Support for doctor and patient roles

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm run install-all
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in the project root
   - Copy `client/.env.example` to `client/.env`
   - Copy `server/.env.example` to `server/.env`
   - Update the values in these files as needed

4. Make sure to set your OpenAI API key in `server/.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Start MongoDB locally or update the connection string in `.env`
6. Start the application:
   ```
   npm start
   ```

## Development

- Run the client only: `npm run client`
- Run the server only: `npm run server`
- Run both in development mode: `npm start`

## Git Setup

1. This repository comes with a `.gitignore` file to exclude sensitive information
2. Make sure not to commit any `.env` files containing API keys or credentials
3. If you're pushing to a public repository, verify no sensitive data is included

## Usage

1. Open the application in your browser
2. Select your role (Doctor or Patient)
3. Click "Start Recording" and speak
4. The application will interpret your speech and play the translated audio
5. The conversation history will be displayed on the screen

## Technologies Used

- Frontend: React, Redux, React Router
- Backend: Node.js, Express
- Database: MongoDB
- APIs: OpenAI Realtime API for interpretation
