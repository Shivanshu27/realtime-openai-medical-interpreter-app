import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSummaryView } from '../redux/summarySlice';

const SummaryPanel = () => {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.summary);
  const messages = useSelector((state) => state.messages);
  
  // Count repetition requests
  const repetitionCount = messages.filter(msg => msg.isRepetition).length;
  
  const handleBackToConversation = () => {
    dispatch(toggleSummaryView(false));
  };
  
  const downloadSummary = () => {
    // Create a blob with the summary content
    const blob = new Blob([summary.content], { type: 'text/plain' });
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `conversation-summary-${new Date().toISOString().split('T')[0]}.txt`;
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  // Convert plain text to displayable HTML with line breaks
  const formatContent = (content) => {
    if (!content) return '';
    
    // Replace markdown headings with HTML
    let formattedContent = content
      .replace(/^# (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .split('\n').join('<br/>');
    
    return formattedContent;
  };
  
  return (
    <div className="summary-panel">
      <div className="summary-header">
        <h2>Conversation Summary</h2>
        <div className="summary-actions">
          <button onClick={downloadSummary} className="download-btn">
            Download Summary
          </button>
          <button onClick={handleBackToConversation} className="back-btn">
            Back to Conversation
          </button>
        </div>
      </div>
      
      {summary.actions && (
        <div className="detected-actions">
          <h3>Detected Actions:</h3>
          <div className={`action-item ${summary.actions.followUpAppointment ? 'detected' : 'not-detected'}`}>
            <span className="action-icon">{summary.actions.followUpAppointment ? '✅' : '❌'}</span>
            <span className="action-text">Follow-up Appointment</span>
          </div>
          <div className={`action-item ${summary.actions.labOrder ? 'detected' : 'not-detected'}`}>
            <span className="action-icon">{summary.actions.labOrder ? '✅' : '❌'}</span>
            <span className="action-text">Lab Order</span>
          </div>
          
          {/* Add repetition statistics if any occurred */}
          {repetitionCount > 0 && (
            <div className="action-item detected">
              <span className="action-icon">🔄</span>
              <span className="action-text">Repetition Requests: {repetitionCount}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="summary-content" 
           dangerouslySetInnerHTML={{ __html: formatContent(summary.content) }}>
      </div>
    </div>
  );
};

export default SummaryPanel;
