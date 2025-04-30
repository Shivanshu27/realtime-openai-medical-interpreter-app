import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../redux/messagesSlice';
import { setUserRole } from '../redux/userSlice';
import AudioRecorder from './AudioRecorder';
import MessageList from './MessageList';

const InterpreterInterface = ({ showConversationOnly = false }) => {
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

  // Toggle role handler
  const toggleUserRole = () => {
    const newRole = userRole === 'doctor' ? 'patient' : 'doctor';
    dispatch(setUserRole(newRole));
    setStatus(`Role changed to ${newRole === 'doctor' ? 'Doctor (English)' : 'Patient (Spanish)'}`);
  };

  if (showConversationOnly) {
    return (
      <div className="conversation-container">
        <MessageList messages={messages} userRole={userRole} />
        <div ref={messageEndRef} />
      </div>
    );
  }

  return (
    <div className="interpreter-interface">
      <div className="role-header">
        <h2>
          {userRole === 'doctor' ? 'Doctor (English → Spanish)' : 'Patient (Spanish → English)'}
        </h2>
        <button 
          className="toggle-role-btn"
          onClick={toggleUserRole}
        >
          Switch to {userRole === 'doctor' ? 'Patient' : 'Doctor'} Role
        </button>
      </div>
      
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