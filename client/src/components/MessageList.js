import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🩺</div>
          <h4>No Consultation Dialogue Yet</h4>
          <p>
            Select your role and click <strong>Start Recording</strong> to speak, or choose a
            pre-configured clinical case from the <strong>Simulation Demos</strong> panel to run an
            automated bilingual encounter.
          </p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isDoctor = message.sender === 'doctor';
          return (
            <div
              key={index}
              className={`message-bubble ${isDoctor ? 'doctor-bubble' : 'patient-bubble'} ${
                message.isRepetition ? 'repeated-bubble' : ''
              }`}
            >
              <div className="message-meta-header">
                <span className="sender-indicator">
                  <span className="role-icon">{isDoctor ? '🩺' : '👤'}</span>
                  <strong>{isDoctor ? 'Doctor (Physician)' : 'Patient'}</strong>
                  <span className="lang-tag">{isDoctor ? 'EN → ES' : 'ES → EN'}</span>
                </span>
                <span className="timestamp">
                  {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                  {message.isRepetition && (
                    <span className="repetition-badge">🔄 Clarification Replay</span>
                  )}
                </span>
              </div>

              <div className="message-content-body">
                <div className="translated-line">
                  <span className="line-label">Interpreted:</span>
                  <p className="line-text highlight">{message.text}</p>
                </div>
                {message.originalText && message.originalText !== message.text && (
                  <div className="original-line">
                    <span className="line-label">Original:</span>
                    <p className="line-text">{message.originalText}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;