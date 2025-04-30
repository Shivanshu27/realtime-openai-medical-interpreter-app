/**
 * Analyzes conversation messages to detect specific actions and generate a summary
 */
export const analyzeConversation = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      content: "No conversation recorded.",
      actions: {
        followUpAppointment: false,
        labOrder: false
      }
    };
  }

  // Combine all messages for full-text analysis
  const fullText = messages.map(msg => `${msg.sender === 'doctor' ? 'Doctor' : 'Patient'}: ${msg.text}`).join('\n');
  
  // Extract basic conversation stats
  const doctorMessages = messages.filter(msg => msg.sender === 'doctor').length;
  const patientMessages = messages.filter(msg => msg.sender === 'patient').length;
  const repetitionRequests = messages.filter(msg => msg.isRepetition).length;
  
  // Detect actions based on keywords in the conversation
  const followUpAppointment = detectFollowUpAppointment(fullText);
  const labOrder = detectLabOrder(fullText);
  
  // Generate a summary of the conversation
  const summary = generateSummary(messages, { 
    doctorMessages, 
    patientMessages,
    repetitionRequests,
    followUpAppointment, 
    labOrder 
  });
  
  return {
    content: summary,
    actions: {
      followUpAppointment,
      labOrder
    }
  };
};

/**
 * Detects if a follow-up appointment was mentioned in the conversation
 */
function detectFollowUpAppointment(text) {
  // Keywords related to scheduling follow-up appointments
  const followUpKeywords = [
    'follow-up', 'follow up', 'appointment', 'schedule', 'come back', 
    'see you', 'next visit', 'next week', 'next month',
    'return visit', 'check again', 'come again',
    'cita', 'programar', 'próxima visita', 'siguiente cita',
    'volver', 'regresar', 'revisión'
  ];
  
  return followUpKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()));
}

/**
 * Detects if lab orders were mentioned in the conversation
 */
function detectLabOrder(text) {
  // Keywords related to lab orders
  const labKeywords = [
    'lab', 'test', 'blood', 'specimen', 'sample', 
    'analysis', 'urine', 'x-ray', 'scan', 'mri', 'ct scan',
    'laboratorio', 'examen', 'sangre', 'muestra', 'análisis',
    'orina', 'radiografía', 'rayos x', 'tomografía'
  ];
  
  return labKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()));
}

/**
 * Generates a summary of the conversation
 */
function generateSummary(messages, stats) {
  let summary = '# Conversation Summary\n\n';
  
  // Add basic statistics
  summary += `Total exchanges: ${messages.length}\n`;
  summary += `Doctor messages: ${stats.doctorMessages}\n`;
  summary += `Patient messages: ${stats.patientMessages}\n`;
  
  // Add repetition statistics if any occurred
  if (stats.repetitionRequests > 0) {
    summary += `Number of repetition requests: ${stats.repetitionRequests}\n`;
  }
  
  summary += '\n';
  
  // Add detected actions
  summary += '## Actions Detected\n\n';
  
  if (stats.followUpAppointment) {
    summary += '- ✅ Follow-up appointment mentioned\n';
  } else {
    summary += '- ❌ No follow-up appointment discussed\n';
  }
  
  if (stats.labOrder) {
    summary += '- ✅ Lab order mentioned\n';
  } else {
    summary += '- ❌ No lab orders discussed\n';
  }
  
  summary += '\n## Conversation Highlights\n\n';
  
  // Add key exchanges (first, last, and up to 3 in the middle)
  if (messages.length > 0) {
    // Add first exchange
    const first = messages[0];
    summary += `- Initial contact: ${first.sender === 'doctor' ? 'Doctor' : 'Patient'} said "${first.text}"\n`;
    
    // Add up to 3 messages from the middle if there are enough messages
    if (messages.length > 5) {
      const middleStart = Math.floor(messages.length / 4);
      const middleEnd = Math.floor(messages.length * 3 / 4);
      
      for (let i = 0; i < 3; i++) {
        const idx = middleStart + Math.floor((middleEnd - middleStart) * (i / 2));
        if (idx > 0 && idx < messages.length - 1) {
          const msg = messages[idx];
          summary += `- ${msg.sender === 'doctor' ? 'Doctor' : 'Patient'} said "${msg.text}"${msg.isRepetition ? ' (repeated)' : ''}\n`;
        }
      }
    }
    
    // Add last exchange if there's more than one message
    if (messages.length > 1) {
      const last = messages[messages.length - 1];
      summary += `- Final exchange: ${last.sender === 'doctor' ? 'Doctor' : 'Patient'} said "${last.text}"${last.isRepetition ? ' (repeated)' : ''}\n`;
    }
  }
  
  // Add full transcript reference
  summary += '\n## Full Transcript\n\n';
  messages.forEach((msg, index) => {
    summary += `${msg.sender === 'doctor' ? 'Doctor' : 'Patient'} (${new Date(msg.timestamp).toLocaleTimeString()})${msg.isRepetition ? ' [REPEATED]' : ''}: ${msg.text}\n`;
    if (msg.originalText && msg.originalText !== msg.text) {
      summary += `  Original: ${msg.originalText}\n`;
    }
    if (index < messages.length - 1) summary += '\n';
  });
  
  return summary;
}
