import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, clearMessages } from '../redux/messagesSlice';
import { setSummary, toggleSummaryView } from '../redux/summarySlice';
import { setUserRole } from '../redux/userSlice';
import { CLINICAL_SCENARIOS } from '../services/scenarioData';
import { analyzeConversation } from '../utils/conversationAnalyzer';
import { translateAndSpeak } from '../services/translationService';

const ClinicalScenarioPicker = ({ onStatusChange }) => {
  const dispatch = useDispatch();
  const [selectedScenarioId, setSelectedScenarioId] = useState(CLINICAL_SCENARIOS[0].id);
  const [isRunning, setIsRunning] = useState(false);

  const selectedScenario = CLINICAL_SCENARIOS.find(s => s.id === selectedScenarioId) || CLINICAL_SCENARIOS[0];

  const handleSimulateScenario = async () => {
    if (isRunning) return;
    setIsRunning(true);
    dispatch(clearMessages());
    dispatch(toggleSummaryView(false));

    if (onStatusChange) onStatusChange(`Simulating: ${selectedScenario.title}`);

    const accumulatedMessages = [];

    for (let i = 0; i < selectedScenario.turns.length; i++) {
      const turn = selectedScenario.turns[i];
      dispatch(setUserRole(turn.role));

      if (onStatusChange) {
        onStatusChange(`${turn.role === 'doctor' ? 'Doctor speaking (English)' : 'Patient speaking (Spanish)'}...`);
      }

      // Synthesize audio in browser
      const targetLang = turn.role === 'doctor' ? 'spanish' : 'english';
      await translateAndSpeak(turn.text, turn.language, targetLang);

      const msgObj = {
        sender: turn.role,
        text: turn.translation,
        originalText: turn.text,
        timestamp: new Date().toISOString(),
        isRepetition: Boolean(turn.isRepetition)
      };

      accumulatedMessages.push(msgObj);
      dispatch(addMessage(msgObj));

      // Realistic conversational cadence pause
      await new Promise(res => setTimeout(res, 900));
    }

    if (onStatusChange) onStatusChange('Encounter completed. Analyzing clinical summary...');

    // Automatically generate clinical summary
    const summaryData = analyzeConversation(accumulatedMessages);
    dispatch(setSummary(summaryData));
    dispatch(toggleSummaryView(true));

    setIsRunning(false);
    if (onStatusChange) onStatusChange('Clinical Summary generated.');
  };

  const handleClear = () => {
    dispatch(clearMessages());
    dispatch(toggleSummaryView(false));
    if (onStatusChange) onStatusChange('Ready');
  };

  return (
    <div className="scenario-picker-card">
      <div className="scenario-picker-header">
        <span className="badge-demo">Interactive Simulation Mode</span>
        <h3>Zero-Credit Clinical Demos</h3>
      </div>
      <p className="scenario-picker-desc">
        Evaluate complete bilingual encounters with synthetic audio, turn-taking, and clinical extraction without an OpenAI API key:
      </p>

      <div className="scenario-select-group">
        <label htmlFor="scenario-select">Clinical Encounter:</label>
        <select
          id="scenario-select"
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value)}
          disabled={isRunning}
        >
          {CLINICAL_SCENARIOS.map(sc => (
            <option key={sc.id} value={sc.id}>
              {sc.title} ({sc.department})
            </option>
          ))}
        </select>
      </div>

      <p className="scenario-detail-text">
        <em>{selectedScenario.description}</em>
      </p>

      <div className="scenario-action-row">
        <button
          onClick={handleSimulateScenario}
          className={`btn-simulate ${isRunning ? 'running' : ''}`}
          disabled={isRunning}
        >
          {isRunning ? 'Simulating Encounter...' : '▶ Run Scenario'}
        </button>
        <button
          onClick={handleClear}
          className="btn-clear"
          disabled={isRunning}
        >
          Reset Session
        </button>
      </div>
    </div>
  );
};

export default ClinicalScenarioPicker;
