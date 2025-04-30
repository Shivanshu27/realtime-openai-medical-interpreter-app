import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './messagesSlice';
import userReducer from './userSlice';
import summaryReducer from './summarySlice';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
    user: userReducer,
    summary: summaryReducer,
  },
});

export default store;
