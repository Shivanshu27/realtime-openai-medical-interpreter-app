# Medical Interpreter Application

A real-time interpretation application that facilitates communication between healthcare providers (English) and patients (Spanish) during medical consultations.

## Features

- **Real-time Translation**: Seamless audio interpretation between English and Spanish with minimal delay
- **Role-based Interface**: Specialized interfaces for both doctor (English → Spanish) and patient (Spanish → English)
- **Conversation History**: Full transcript of exchanges with original text and translations
- **Repetition Support**: Ability to detect and handle requests to repeat previous statements
- **Post-conversation Analysis**: Automated detection of follow-up appointments and lab orders mentioned in conversation
- **Conversation Summary**: Generate structured summaries with key points and action items
- **Mock Mode**: Ability to run without external API dependencies for testing and demo purposes

## Requirements

- Node.js 14.0 or higher
- MongoDB (for conversation storage)
- OpenAI API key (for translation and speech capabilities)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm run install-all
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` in the project root
   - Copy `client/.env.example` to `client/.env`
   - Copy `server/.env.example` to `server/.env`

4. Set up your OpenAI API key in `server/.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Start the application:
   ```
   npm start
   ```

   This will start both the client on port 3000 and server on port 5000.

## Using Mock Mode

If you don't have an OpenAI API key, you can run the application in mock mode:

1. Set `MOCK_MODE=true` in `server/.env`
2. Set `REACT_APP_MOCK_MODE=true` in `client/.env`
3. Start the application as normal

In mock mode, the application simulates translations and audio responses without making external API calls.

## Usage Guide

1. Open the application in your browser (http://localhost:3000)
2. Select your role:
   - Doctor (English-speaking provider)
   - Patient (Spanish-speaking patient)
3. Use the recording controls to capture speech
4. View real-time translations and listen to spoken interpretations
5. Switch roles as needed using the role toggle button
6. When the consultation is complete, click "End Conversation & Generate Summary"
7. Review the conversation summary including detected follow-up appointments and lab orders
8. Download the summary for your records if needed

## Technologies

- **Frontend**: React, Redux, Web Speech API
- **Backend**: Node.js, Express
- **APIs**: OpenAI's Real-time API for translation and speech services
- **Database**: MongoDB for conversation storage
- **Real-time Communication**: WebRTC for audio streaming

## License

This project is provided for educational and demonstration purposes only.
