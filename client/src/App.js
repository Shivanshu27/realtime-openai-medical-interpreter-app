import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserRole } from './redux/userSlice';
import { toggleSummaryView, setSummary } from './redux/summarySlice';
import { analyzeConversation } from './utils/conversationAnalyzer';
import InterpreterInterface from './components/InterpreterInterface';
import SummaryPanel from './components/SummaryPanel';
import ClinicalScenarioPicker from './components/ClinicalScenarioPicker';
import './App.css';

const IS_MOCK_MODE = process.env.REACT_APP_MOCK_MODE !== 'false';

function App() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);
  const messages = useSelector((state) => state.messages);
  const showSummary = useSelector((state) => state.summary.showSummary);
  const [globalStatus, setGlobalStatus] = useState('Ready');

  const handleRoleSelect = (role) => {
    dispatch(setUserRole(role));
    setGlobalStatus(`Role switched to ${role === 'doctor' ? 'Doctor (English)' : 'Patient (Spanish)'}`);
  };

  const handleEndConversation = () => {
    // Run clinical entity extraction & generate structured summary
    const summaryData = analyzeConversation(messages);
    dispatch(setSummary(summaryData));
    dispatch(toggleSummaryView(true));
  };

  return (
    <div className="app-container">
      {/* Top Clinical Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">⚕️</span>
          <div>
            <h1>Real-Time Medical Interpreter</h1>
            <p className="header-tagline">Sub-second duplex speech translation for clinical encounters</p>
          </div>
        </div>

        <div className="header-badges">
          <span className={`badge ${IS_MOCK_MODE ? 'badge-simulation' : 'badge-realtime'}`}>
            <span className="badge-pulse"></span>
            {IS_MOCK_MODE ? 'Simulation Mode (Zero Credit)' : 'OpenAI Realtime (WebRTC)'}
          </span>
          <span className="badge badge-tech">WebRTC · PCM16 24kHz</span>
          <span className="badge badge-hipaa">HIPAA-Aligned</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="app-main">
        {/* Left Control Panel */}
        <aside className="control-sidebar">
          {/* Active Role Selector */}
          <section className="sidebar-section">
            <h2 className="section-title">Active Speaker Role</h2>
            <div className="role-button-group">
              <button
                onClick={() => handleRoleSelect('doctor')}
                className={`role-btn ${userRole === 'doctor' ? 'active doctor-active' : ''}`}
              >
                <span className="role-emoji">🩺</span>
                <div className="role-text">
                  <strong>Doctor</strong>
                  <span>English → Spanish</span>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('patient')}
                className={`role-btn ${userRole === 'patient' ? 'active patient-active' : ''}`}
              >
                <span className="role-emoji">👤</span>
                <div className="role-text">
                  <strong>Patient</strong>
                  <span>Spanish → English</span>
                </div>
              </button>
            </div>
          </section>

          {/* Interactive Simulation Demos */}
          <section className="sidebar-section">
            <ClinicalScenarioPicker onStatusChange={setGlobalStatus} />
          </section>

          {/* Consultation Actions */}
          <section className="sidebar-section">
            <h2 className="section-title">Encounter Actions</h2>
            <button
              onClick={handleEndConversation}
              className="btn-end-encounter"
              disabled={messages.length === 0}
            >
              📋 End Call & Generate Summary
              {messages.length > 0 && <span className="turn-count">({messages.length} turns)</span>}
            </button>
          </section>
        </aside>

        {/* Right Active Viewport */}
        <section className="encounter-viewport">
          <div className="viewport-header">
            <div className="viewport-title-group">
              <h2>{showSummary ? 'Post-Encounter Clinical Synthesis' : 'Live Bilingual Consultation'}</h2>
              <span className="system-status-indicator">{globalStatus}</span>
            </div>
          </div>

          <div className="viewport-content">
            {showSummary ? <SummaryPanel /> : <InterpreterInterface />}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
