import messagesReducer, { addMessage, clearMessages } from './messagesSlice';

describe('Messages Slice Reducer', () => {
  it('should initialize with an empty array', () => {
    expect(messagesReducer(undefined, { type: 'unknown' })).toEqual([]);
  });

  it('should handle addMessage', () => {
    const message = {
      sender: 'doctor',
      text: 'Hello, how can I help?',
      originalText: 'Hello, how can I help?',
      timestamp: '2026-09-27T06:00:00Z',
      isRepetition: false
    };

    const nextState = messagesReducer([], addMessage(message));
    expect(nextState.length).toBe(1);
    expect(nextState[0].sender).toBe('doctor');
  });

  it('should handle clearMessages', () => {
    const initialState = [
      { sender: 'doctor', text: 'One' },
      { sender: 'patient', text: 'Two' }
    ];
    const nextState = messagesReducer(initialState, clearMessages());
    expect(nextState).toEqual([]);
  });
});
