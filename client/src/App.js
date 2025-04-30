import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserRole } from './redux/userSlice';
import InterpreterInterface from './components/InterpreterInterface';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);

  const handleRoleSelect = (role) => {
    dispatch(setUserRole(role));
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
        </div>
        <div className="right-panel">
          <h2>Conversation</h2>
          <InterpreterInterface />
        </div>
      </main>
    </div>
  );
}

export default App;
