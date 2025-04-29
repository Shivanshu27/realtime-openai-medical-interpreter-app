import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../redux/messagesSlice';
import AudioRecorder from './AudioRecorder';
import MessageList from './MessageList';

const InterpreterInterface = () => {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);
  const userLanguage = useSelector((state) => state.user.language);
  const messages = useSelector((state) => state.messages);
  const [status, setStatus] = useState('Ready');
  const messageEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new message from audio recording
  const handleNewMessage = (text, originalText) => {
    const newMessage = {
      sender: userRole,
      text,
      originalText: originalText || text,
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(newMessage));
  };

  return (
    <div className="interpreter-interface">
      <h2>
        {userRole === 'doctor' ? 'Doctor (English)' : 'Patient (Spanish)'} View
      </h2>
      
      <div className="conversation-container">
        <MessageList messages={messages} userRole={userRole} />
        <div ref={messageEndRef} />
      </div>
      
      <div className="controls">
        <p className="status">{status}</p>
        <AudioRecorder 
          onNewMessage={handleNewMessage} 
          userRole={userRole}
          userLanguage={userLanguage}
          setStatus={setStatus}
        />
      </div>
    </div>
  );
};

export default InterpreterInterface;
