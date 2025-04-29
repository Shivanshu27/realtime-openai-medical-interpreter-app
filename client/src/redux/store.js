import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './messagesSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    messages: messagesReducer,
    user: userReducer,
  },
});

export default store;
