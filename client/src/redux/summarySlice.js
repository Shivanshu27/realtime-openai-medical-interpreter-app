import { createSlice } from '@reduxjs/toolkit';

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    content: '',
    actions: {
      followUpAppointment: false,
      labOrder: false
    },
    showSummary: false
  },
  reducers: {
    setSummary: (state, action) => {
      state.content = action.payload.content;
      state.actions = action.payload.actions;
    },
    toggleSummaryView: (state, action) => {
      state.showSummary = action.payload !== undefined ? action.payload : !state.showSummary;
    },
    resetSummary: (state) => {
      state.content = '';
      state.actions = {
        followUpAppointment: false,
        labOrder: false
      };
      state.showSummary = false;
    }
  },
});

export const { setSummary, toggleSummaryView, resetSummary } = summarySlice.actions;
export default summarySlice.reducer;
