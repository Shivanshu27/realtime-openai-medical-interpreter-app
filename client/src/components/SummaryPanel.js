import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSummaryView } from '../redux/summarySlice';

const SummaryPanel = () => {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.summary);
  const messages = useSelector((state) => state.messages);
  const [copied, setCopied] = useState(false);

  // Count repetition requests
  const repetitionCount = messages.filter(msg => msg.isRepetition).length;

  const handleBackToConversation = () => {
    dispatch(toggleSummaryView(false));
  };

  const downloadMarkdown = () => {
    const blob = new Blob([summary.content], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clinical-summary-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const payload = {
      summaryDate: new Date().toISOString(),
      stats: summary.stats,
      actions: summary.actions,
      messages: messages
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clinical-encounter-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert plain text markdown to displayable HTML
  const formatContent = (content) => {
    if (!content) return '';
    return content
      .replace(/^# (.*?)$/gm, '<h2 class="summary-h2">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h4 class="summary-h4">$1</h4>')
      .replace(/^## (.*?)$/gm, '<h3 class="summary-h3">$1</h3>')
      .replace(/^- \[(x|X)\] (.*?)$/gm, '<div class="check-item checked">✅ $2</div>')
      .replace(/^- \[ \] (.*?)$/gm, '<div class="check-item unchecked">⚪ $2</div>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n').join('<br/>');
  };

  return (
    <div className="summary-panel">
      <div className="summary-header">
        <div>
          <h2>Clinical Encounter Summary</h2>
          <p className="summary-subtitle">Automated extraction & bilingual consultation audit trail</p>
        </div>
        <div className="summary-actions">
          <button onClick={copyToClipboard} className="btn-secondary">
            {copied ? '✓ Copied' : 'Copy Text'}
          </button>
          <button onClick={downloadMarkdown} className="download-btn">
            Export Markdown
          </button>
          <button onClick={downloadJSON} className="btn-secondary">
            Export JSON
          </button>
          <button onClick={handleBackToConversation} className="back-btn">
            Back to Call
          </button>
        </div>
      </div>

      {summary.actions && (
        <div className="detected-actions-grid">
          <div className={`action-card ${summary.actions.followUpAppointment ? 'detected' : 'not-detected'}`}>
            <span className="action-icon">{summary.actions.followUpAppointment ? '📅' : '➖'}</span>
            <div className="action-meta">
              <strong>Follow-Up Appointment</strong>
              <span>{summary.actions.followUpAppointment ? 'Visit Scheduled' : 'None Discussed'}</span>
            </div>
          </div>

          <div className={`action-card ${summary.actions.labOrder ? 'detected' : 'not-detected'}`}>
            <span className="action-icon">{summary.actions.labOrder ? '🧪' : '➖'}</span>
            <div className="action-meta">
              <strong>Laboratory Orders</strong>
              <span>{summary.actions.labOrder ? 'Diagnostic Tests' : 'None Ordered'}</span>
            </div>
          </div>

          <div className={`action-card ${summary.actions.imagingOrder ? 'detected' : 'not-detected'}`}>
            <span className="action-icon">{summary.actions.imagingOrder ? '🩻' : '➖'}</span>
            <div className="action-meta">
              <strong>Diagnostic Imaging</strong>
              <span>{summary.actions.imagingOrder ? 'X-Ray / Scan' : 'None Indicated'}</span>
            </div>
          </div>

          <div className={`action-card ${summary.actions.medicationDiscussion ? 'detected' : 'not-detected'}`}>
            <span className="action-icon">{summary.actions.medicationDiscussion ? '💊' : '➖'}</span>
            <div className="action-meta">
              <strong>Pharmacotherapy</strong>
              <span>{summary.actions.medicationDiscussion ? 'Rx Discussed' : 'No Changes'}</span>
            </div>
          </div>

          {repetitionCount > 0 && (
            <div className="action-card detected repetition">
              <span className="action-icon">🔄</span>
              <div className="action-meta">
                <strong>Clarifications Replayed</strong>
                <span>{repetitionCount} Directive(s)</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className="summary-content"
        dangerouslySetInnerHTML={{ __html: formatContent(summary.content) }}
      />
    </div>
  );
};

export default SummaryPanel;
