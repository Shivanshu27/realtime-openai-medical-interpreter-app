import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserRole } from './redux/userSlice';
import { toggleSummaryView, setSummary } from './redux/summarySlice';
import { analyzeConversation } from './utils/conversationAnalyzer';
import InterpreterInterface from './components/InterpreterInterface';
import SummaryPanel from './components/SummaryPanel';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);
  const messages = useSelector((state) => state.messages);
  const showSummary = useSelector((state) => state.summary.showSummary);

  const handleRoleSelect = (role) => {
    dispatch(setUserRole(role));
  };

  const handleEndConversation = () => {
    // Generate summary from conversation messages
    const summaryData = analyzeConversation(messages);
    
    // Update the summary in Redux
    dispatch(setSummary(summaryData));
    
    // Switch to summary view
    dispatch(toggleSummaryView(true));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Medical Interpreter</h1>
      </header>
      <main className="app-main">
        <div className="left-panel">
          <h2>Role Selection</h2>
          <button 
            onClick={() => handleRoleSelect('doctor')} 
            className={userRole === 'doctor' ? 'active' : ''}
          >
            Doctor (English)
          </button>
          <button 
            onClick={() => handleRoleSelect('patient')} 
            className={userRole === 'patient' ? 'active' : ''}
          >
            Patient (Spanish)
          </button>
          
          <div className="left-panel-divider"></div>
          
          <h2>Actions</h2>
          <button 
            onClick={handleEndConversation}
            className="end-conversation-btn"
          >
            End Conversation & Generate Summary
          </button>
        </div>
        <div className="right-panel">
          <h2>{showSummary ? 'Conversation Summary' : 'Conversation'}</h2>
          {showSummary ? <SummaryPanel /> : <InterpreterInterface />}
        </div>
      </main>
    </div>
  );
}

export default App;
