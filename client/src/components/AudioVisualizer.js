import React from 'react';

/**
 * Lightweight SVG Audio Visualizer component.
 * Animates waveform bars based on recording / speech state.
 */
const AudioVisualizer = ({ isRecording = false, status = 'Ready' }) => {
  return (
    <div className={`audio-visualizer-container ${isRecording ? 'active' : ''}`}>
      <div className="waveform-bars">
        <span className="bar bar-1"></span>
        <span className="bar bar-2"></span>
        <span className="bar bar-3"></span>
        <span className="bar bar-4"></span>
        <span className="bar bar-5"></span>
        <span className="bar bar-6"></span>
        <span className="bar bar-7"></span>
        <span className="bar bar-8"></span>
      </div>
      <span className="visualizer-status">{status}</span>
    </div>
  );
};

export default AudioVisualizer;
