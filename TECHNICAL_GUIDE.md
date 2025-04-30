# Medical Interpreter - Technical Guide

This document provides an overview of the application's architecture, code organization, and key implementation details.

## Project Structure

The application follows a client-server architecture:

```
interpreter-app-1/
├── client/                 # React frontend application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # UI components
│       ├── redux/          # Redux state management
│       ├── services/       # API service wrappers
│       └── utils/          # Helper functions
├── server/                 # Node.js backend server
│   ├── index.js            # Server entry point
│   └── config.js           # Server configuration
```

## Core Components

### Client-Side Components

1. **InterpreterInterface**: Main component coordinating recording, translation, and display
2. **AudioRecorder**: Handles microphone recording and WebRTC connection with OpenAI
3. **MessageList**: Displays the conversation history with original and translated text
4. **SummaryPanel**: Shows an analysis of the conversation with detected actions

### Redux Store Structure

The application state is managed through Redux with three main slices:

1. **userSlice**: Manages the current user role (doctor/patient) and language preference
2. **messagesSlice**: Stores the conversation history with translations
3. **summarySlice**: Contains the post-conversation analysis and summary content

## Key Implementation Details

### Translation Flow

The translation process follows these steps:

1. **Audio Recording**: The AudioRecorder component captures voice input
2. **Streaming**: Audio is sent to OpenAI's Real-time API using WebRTC
3. **Processing**: The API transcribes the audio and translates it
4. **Response**: The translated text is returned and displayed in the interface
5. **Playback**: The translation is spoken back using either the Web Speech API (mock mode) or OpenAI's TTS

Code flow:
```
AudioRecorder.js
→ startRecording()
→ setupRealTimeConnection()
→ dataChannel.onmessage (processes transcription/translation)
→ onNewMessage() callback to InterpreterInterface.js
→ Added to Redux store via messagesSlice
→ Displayed in MessageList component
```

### Repetition Detection

The application can detect when a user asks for repetition:

1. Analyzes transcribed text for phrases like "repeat that" or "say again"
2. Retrieves the previous message from the conversation history
3. Marks the repeated message with an "isRepetition" flag
4. Plays the translation again and displays it with special styling

### WebRTC Implementation

For real-time communication with OpenAI's API:

1. The client gets an ephemeral API key from the server
2. Establishes a peer connection with OpenAI's Realtime API
3. Creates data channels for exchanging control messages
4. Streams audio data for processing
5. Receives transcription and translation events in real-time

### Conversation Analysis

After a conversation ends:

1. The `analyzeConversation` utility processes the conversation history
2. It detects key actions such as follow-up appointments and lab orders
3. Generates a structured summary with conversation highlights
4. The summary can be viewed and downloaded by the user

## Mock Mode vs. Real API Mode

The application supports two operational modes:

### Mock Mode

- No external API calls are made
- Translations are simulated using predefined mappings
- Audio output uses the browser's Web Speech API
- Useful for development, testing, or demos without API credentials

### Real API Mode

- Authentication via ephemeral keys generated from the server
- Live streaming audio to OpenAI's Realtime API
- Real-time transcription and translation
- Higher quality and accuracy in translations

## Important Services

### translationService.js

Provides methods for translating text and detecting repetition requests. It handles:
- Text translation via API or mock responses
- Speech synthesis for translated content
- Detection of repetition phrases

### conversationAnalyzer.js

Processes conversation data to:
- Detect follow-up appointment mentions
- Identify lab order requests
- Generate a structured conversation summary with highlights

## Deployment Considerations

1. **Environment Variables**: Ensure all necessary environment variables are set
2. **API Key Security**: Never expose OpenAI API keys in client-side code
3. **MongoDB Setup**: Configure a production-ready MongoDB instance
4. **CORS Configuration**: Update CORS settings for production environments
5. **WebRTC Support**: Ensure target browsers support WebRTC for audio streaming
