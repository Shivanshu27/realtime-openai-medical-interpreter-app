import React from 'react';

const MessageList = ({ messages, userRole }) => {
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Start recording to translate.</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender}`}
          >
            <div className="message-header">
              <strong>{message.sender === 'doctor' ? 'Doctor' : 'Patient'}</strong>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-body">
              <div className="translation">
                <p><strong>Translation:</strong> {message.text}</p>
              </div>
              <div className="original-text">
                <p><strong>Original:</strong> {message.originalText}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;