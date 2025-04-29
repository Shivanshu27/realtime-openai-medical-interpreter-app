import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    role: null, // 'doctor' or 'patient'
    language: null // 'english' or 'spanish'
  },
  reducers: {
    setUserRole: (state, action) => {
      state.role = action.payload;
      state.language = action.payload === 'doctor' ? 'english' : 'spanish';
    },
  },
});

export const { setUserRole } = userSlice.actions;
export default userSlice.reducer;
