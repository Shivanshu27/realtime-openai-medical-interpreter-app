import React from 'react';

const MessageList = ({ messages, userRole }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`message ${message.sender}`}
        >
          <div className="message-header">
            <strong>{message.sender === 'doctor' ? 'Doctor' : 'Patient'}</strong>
          </div>
          <div className="message-body">
            <p>{message.text}</p>
            {message.originalText !== message.text && (
              <p className="original-text">
                <small>Original: {message.originalText}</small>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
