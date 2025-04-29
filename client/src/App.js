import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RoleSelection from './components/RoleSelection';
import InterpreterInterface from './components/InterpreterInterface';
import './App.css';

function App() {
  const userRole = useSelector((state) => state.user.role);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Medical Interpreter</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={userRole ? <Navigate to="/interpreter" /> : <RoleSelection />} 
            />
            <Route 
              path="/interpreter" 
              element={userRole ? <InterpreterInterface /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
