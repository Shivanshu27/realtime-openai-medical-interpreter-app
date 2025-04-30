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
  
  // Watch for userRole changes and reconfigure the data channel if needed
  useEffect(() => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      configureDataChannel();
    }
  }, [userRole, userLanguage]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      closeConnection();
    };
  }, []);

  // Close the WebRTC connection
  const closeConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
  };

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

  // Configure the data channel with function definitions and translation instructions based on user role
  const configureDataChannel = () => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error("Data channel not ready for configuration");
      return;
    }

    // Determine source and target languages based on user role
    const sourceLanguage = userRole === 'doctor' ? 'English' : 'Spanish';
    const targetLanguage = userRole === 'doctor' ? 'Spanish' : 'English';
    
    console.log(`Configuring data channel for ${sourceLanguage} to ${targetLanguage} translation`);
    
    const event = {
      type: 'session.update',
      event_id: crypto.randomUUID(),
      session: {
        modalities: ['text', 'audio'],
        instructions: `You are a PURE TRANSLATOR. Your sole purpose is to translate the user's speech from ${sourceLanguage} to ${targetLanguage}, nothing more. DO NOT respond to questions or engage in conversation. DO NOT provide any additional information. Your response should ONLY consist of the ${targetLanguage} translation of what the user said. Follow medical terminology accurately if present.`,
        voice: userRole === 'doctor' ? 'alloy' : 'coral', // Use alloy for Spanish, nova for English
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true
        },
        temperature: 0.6, // Lower temperature for more accurate translations
        max_response_output_tokens: "inf"
      }
    };
    
    dataChannelRef.current.send(JSON.stringify(event));
    console.log('Translation session configuration sent');
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
        setStatus('Connected to translation service');
        console.log("Data channel opened");
        configureDataChannel();
      };
      
      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received data:", data);
          
          // Process transcription from the user's audio
          if (data.type === 'audio_transcript' && data.text) {
            processedTextRef.current = data.text;
            console.log("Transcribed original text:", data.text);
          }
          
          // Handle different types of messages from OpenAI
          if (data.type === 'text_delta' && data.text) {
            translationResultRef.current.translatedText += data.text;
          } else if (data.type === 'message') {
            // Handle complete messages that might contain the translation
            if (data.role === 'assistant' && data.content && data.content.length > 0) {
              // Find text content in the response
              const textContent = data.content.find(item => item.type === 'text');
              if (textContent && textContent.text) {
                // Use the transcribed original text if available
                const originalText = processedTextRef.current || "Unknown input";
                const translatedText = textContent.text;
                
                // Pass both original and translated text to the handler
                onNewMessage(translatedText, originalText);
                
                // Reset for next translation
                processedTextRef.current = '';
                translationResultRef.current.translatedText = '';
                translationResultRef.current.originalText = '';
              }
            }
          } else if (data.type === 'conversation.item.update' || data.type === 'response.final') {
            // Check for final response containing the translation
            if (data.item && data.item.content && data.item.content.length > 0) {
              const textContent = data.item.content.find(item => item.type === 'text');
              if (textContent && textContent.text) {
                // Use the transcribed original text if available
                const originalText = processedTextRef.current || "Unknown input";
                const translatedText = textContent.text;
                
                // Pass both original and translated text to the handler
                onNewMessage(translatedText, originalText);
              }
            }
          }
        } catch (error) {
          console.error("Error handling data channel message:", error);
        }
      };
      
      dataChannel.onerror = (error) => {
        console.error("Data channel error:", error);
        setStatus('Error: Connection problem with translation service');
      };
      
      dataChannel.onclose = () => {
        console.log("Data channel closed");
        setStatus('Translation service disconnected');
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
      setStatus(`Error: Could not connect to translation service - ${error.message}`);
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
      translationResultRef.current = { originalText: '', translatedText: '' }; // Reset translation results
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        const sourceLanguage = userRole === 'doctor' ? 'English' : 'Spanish';
        setStatus(`Recording... Speak in ${sourceLanguage}`);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setStatus('Processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        if (MOCK_MODE) {
          // Mock mode - use simulated translation
          const sourceLanguage = userRole === 'doctor' ? 'english' : 'spanish';
          const targetLanguage = userRole === 'doctor' ? 'spanish' : 'english';
          
          // Example mock texts based on role
          let originalText;
          if (userRole === 'doctor') {
            originalText = "I need to check your symptoms. How long have you been feeling this way?";
          } else {
            originalText = "Me duele la cabeza desde hace dos días y tengo fiebre alta.";
          }
          
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
        }
        // In real mode, the onmessage handler will process the translations
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
      
      // Stop sending audio to OpenAI by closing the connection
      if (!MOCK_MODE) {
        closeConnection();
        setStatus('Recording stopped. Connection closed.');
      }
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