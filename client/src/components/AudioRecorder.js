import React, { useState, useRef, useEffect } from 'react';
import { translateAndSpeak } from '../services/translationService';

const MOCK_MODE = process.env.REACT_APP_MOCK_MODE === 'true';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const OPENAI_API_URL = process.env.REACT_APP_OPENAI_API_URL || 'https://api.openai.com/v1/realtime';

const AudioRecorder = ({ onNewMessage, userRole, userLanguage, setStatus }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const ephemeralKeyRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const audioElementRef = useRef(null);
  const processedTextRef = useRef('');
  const functionCallsRef = useRef({});
  const translationResultRef = useRef({
    originalText: '',
    translatedText: ''
  });
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Request an ephemeral key from the server
  const getEphemeralKey = async () => {
    try {
      setStatus('Getting authentication...');
      const response = await fetch(`${API_URL}/generate-ephemeral-key`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get ephemeral key');
      }
      
      const data = await response.json();
      
      // Handle both old and new response formats
      const key = data.key || (data.client_secret && data.client_secret.value);
      
      if (!key) {
        console.error('Invalid ephemeral key response format:', data);
        throw new Error('Invalid ephemeral key format received from server');
      }
      
      console.log('Ephemeral key received:', key);
      ephemeralKeyRef.current = key;
      return key;
    } catch (error) {
      console.error('Error getting ephemeral key:', error);
      setStatus('Error: Could not authenticate');
      return null;
    }
  };

  // Implementation of function handlers for OpenAI API function calling
  const functionHandlers = {
    translateText: ({ text, sourceLanguage, targetLanguage }) => {
      console.log(`Translating from ${sourceLanguage} to ${targetLanguage}: ${text}`);
      translationResultRef.current.originalText = text;
      translationResultRef.current.translatedText = ''; // Reset until we get the translation
      return { success: true, received: true };
    },
    
    providedTranslation: ({ translatedText }) => {
      console.log(`Received translation: ${translatedText}`);
      translationResultRef.current.translatedText = translatedText;
      // Now that we have the translation, update the UI with both original and translated text
      onNewMessage(
        translationResultRef.current.translatedText,
        translationResultRef.current.originalText
      );
      return { success: true };
    },
    
    transcribeAudio: ({ audioUrl }) => {
      // This would be called if OpenAI wants to handle audio transcription
      // In our case, we're doing this ourselves, but we could implement this
      console.log(`Would transcribe audio from: ${audioUrl}`);
      return { success: true, handled: 'client-side' };
    }
  };

  // Configure the data channel with function definitions
  const configureDataChannel = () => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error("Data channel not ready for configuration");
      return;
    }

    console.log('Configuring data channel with translation tools');
    
    const event = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        tools: [
          {
            type: 'function',
            name: 'translateText',
            description: 'Translates text from one language to another',
            parameters: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'Text to translate' },
                sourceLanguage: { type: 'string', description: 'Source language code (e.g., "en", "es")' },
                targetLanguage: { type: 'string', description: 'Target language code (e.g., "en", "es")' }
              },
              required: ['text', 'sourceLanguage', 'targetLanguage']
            }
          },
          {
            type: 'function',
            name: 'providedTranslation',
            description: 'Provides the translated text from the model to display to the user',
            parameters: {
              type: 'object',
              properties: {
                translatedText: { type: 'string', description: 'The translated text to be displayed' }
              },
              required: ['translatedText']
            }
          },
          {
            type: 'function',
            name: 'transcribeAudio',
            description: 'Transcribes audio to text',
            parameters: {
              type: 'object',
              properties: {
                audioUrl: { type: 'string', description: 'URL of the audio to transcribe' }
              },
              required: ['audioUrl']
            }
          }
        ]
      }
    };
    
    dataChannelRef.current.send(JSON.stringify(event));
  };

  // Handle function calls from the OpenAI model
  const handleFunctionCall = async (message) => {
    try {
      const fnName = message.name;
      const handler = functionHandlers[fnName];
      
      if (handler) {
        const args = JSON.parse(message.arguments);
        console.log(`Calling function ${fnName} with args:`, args);
        
        const result = await handler(args);
        
        // Send the function result back to the model
        const event = {
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: message.call_id,
            output: JSON.stringify(result)
          }
        };
        
        dataChannelRef.current.send(JSON.stringify(event));
      } else {
        console.error(`Function ${fnName} not implemented`);
      }
    } catch (error) {
      console.error('Error handling function call:', error);
    }
  };

  // Set up WebRTC connection with OpenAI for real-time audio
  const setupRealTimeConnection = async (ephemeralKey) => {
    if (MOCK_MODE) {
      // In mock mode, just simulate a successful connection
      setStatus('Connected to interpreter service (Mock Mode)');
      return true;
    }
    
    try {
      setStatus('Connecting to interpreter service...');
      
      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;
      
      // Create audio element for playback
      audioElementRef.current = document.createElement("audio");
      audioElementRef.current.autoplay = true;
      
      // Set up to play remote audio from the model
      peerConnection.ontrack = (e) => {
        audioElementRef.current.srcObject = e.streams[0];
        console.log("Received audio track from OpenAI");
      };
      
      // Get audio stream for microphone input
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      
      // Add the audio track to peer connection
      peerConnection.addTrack(mediaStream.getTracks()[0]);
      
      // Set up data channel for sending and receiving events
      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannelRef.current = dataChannel;
      
      dataChannel.onopen = () => {
        setStatus('Connected to OpenAI real-time audio service');
        console.log("Data channel opened");
        configureDataChannel();
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received data:", data);
          
          // Handle function calls
          if (data.type === 'response.function_call_arguments.done') {
            handleFunctionCall(data);
            return;
          }
          
          // Handle different types of messages from OpenAI
          if (data.type === 'text_delta' && data.text) {
            processedTextRef.current += data.text;
          }
        } catch (error) {
          console.error("Error handling data channel message:", error);
        }
      };
      
      dataChannel.onerror = (error) => {
        console.error("Data channel error:", error);
        setStatus('Error: Connection problem with interpreter service');
      };
      
      dataChannel.onclose = () => {
        console.log("Data channel closed");
        setStatus('Interpreter service disconnected');
      };
      
      // Create and set local description (offer)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Determine which model to use
      const model = "gpt-4o-realtime-preview-2024-12-17"; // Updated to most recent model
      
      // Send offer to OpenAI and get answer
      const sdpResponse = await fetch(`${OPENAI_API_URL}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });
      
      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`Failed to connect to OpenAI: ${errorText}`);
      }
      
      // Set remote description from OpenAI's answer
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      
      await peerConnection.setRemoteDescription(answer);
      
      return true;
    } catch (error) {
      console.error('Error setting up WebRTC connection:', error);
      setStatus(`Error: Could not connect to interpreter service - ${error.message}`);
      return false;
    }
  };

  // Send a message through the data channel
  const sendMessage = (message) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannelRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.error("Cannot send message, data channel not open");
      return false;
    }
  };

  // Send audio text to process
  const sendTextToProcess = (text, sourceLanguage) => {
    const targetLanguage = sourceLanguage === 'english' ? 'spanish' : 'english';
    const sourceLangCode = sourceLanguage === 'english' ? 'en' : 'es';
    const targetLangCode = sourceLangCode === 'en' ? 'es' : 'en';
    
    // Create an event to send to OpenAI
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: `You are a medical interpreter. Translate the following from ${sourceLanguage} to ${targetLanguage}. Focus on being accurate and natural: "${text}"`
          },
        ],
      },
    };
    
    sendMessage(event);
    
    // Additionally use function calling to facilitate the translation
    // This provides more structured data and helps the model understand the task
    const functionEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Please translate this text using the translateText function first to inform me what you're translating, then call providedTranslation with the result.`
          }
        ],
      },
    };
    
    // Send the text to be translated via function call
    functionHandlers.translateText({
      text,
      sourceLanguage: sourceLangCode,
      targetLanguage: targetLangCode
    });
    
    // Request a response
    sendMessage({ type: "response.create" });
  };

  const startRecording = async () => {
    try {
      setStatus('Preparing microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create AudioContext with proper options
      const audioContextOptions = {
        latencyHint: 'interactive'
      };
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);
      
      // Log the actual sample rate for debugging
      console.log('Audio context sample rate:', audioContextRef.current.sampleRate);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      audioChunksRef.current = [];
      processedTextRef.current = ''; // Reset processed text
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        setStatus('Recording...');
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setStatus('Processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Close WebRTC connection if using real API
        if (!MOCK_MODE && peerConnectionRef.current) {
          // Don't close the connection right away as we need it for translation
          // peerConnectionRef.current.close();
        }
        
        if (MOCK_MODE) {
          // Mock mode - use simulated translation
          const sourceLanguage = userLanguage;
          const targetLanguage = userLanguage === 'english' ? 'spanish' : 'english';
          const originalText = userRole === 'doctor' 
            ? "I need to check your symptoms" 
            : "Me duele la cabeza desde hace dos días";
          
          const { translatedText, speechAudio } = await translateAndSpeak(
            originalText, 
            sourceLanguage,
            targetLanguage
          );
          
          onNewMessage(translatedText, originalText);
          
          // Play the translated audio
          const audioUrl = URL.createObjectURL(speechAudio);
          const audio = new Audio(audioUrl);
          audio.play();
        } else {
          // Real API mode - use the accumulated text
          let originalText = "Processing...";
          
          // Transcribe the audio using the blob
          try {
            // Send the audio blob to a server endpoint for transcription
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('language', userLanguage);
            
            const transcriptionResponse = await fetch(`${API_URL}/transcribe`, {
              method: 'POST',
              body: formData,
            });
            
            if (transcriptionResponse.ok) {
              const transcriptionData = await transcriptionResponse.json();
              originalText = transcriptionData.text;
              
              // Use the data channel to get translation
              sendTextToProcess(originalText, userLanguage);
              
              // The UI will be updated when we receive the translation via function call
              // in the providedTranslation function handler
              setStatus('Translating...');
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            setStatus('Error: Transcription failed');
          }
        }
      };
      
      // Get ephemeral key
      const ephemeralKey = await getEphemeralKey();
      if (!ephemeralKey) return;
      
      // Set up WebRTC connection (real) or simulated connection (mock)
      const connected = await setupRealTimeConnection(ephemeralKey);
      if (!connected) return;
      
      mediaRecorderRef.current.start(100); // Collect 100ms chunks for real-time processing
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('Error: Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="audio-recorder">
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`record-btn ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioBlob && (
        <div className="audio-preview">
          <audio controls src={URL.createObjectURL(audioBlob)}></audio>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
