// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice'; // We'll create this next
// import { apiSlice } from '../features/api/apiSlice';
// import profileReducer from '../features/profile/profileSlice'; 
// import { publicFeedApi } from '../features/profile/publicFeedApi';
// // We'll create this next

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     profile: profileReducer,
//     [apiSlice.reducerPath]: apiSlice.reducer,
//     [publicFeedApi.reducerPath]: publicFeedApi.reducer, // Add the API slice reducer
//   },
//   // Adding the api middleware enables caching, invalidation, polling,
//   // and other useful features of RTK Query.
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(apiSlice.middleware),
//   devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
// });
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { apiSlice } from '../features/api/apiSlice';
import profileReducer from '../features/profile/profileSlice'; 
import { publicFeedApi } from '../features/profile/publicFeedApi';
import { commentsApi } from '../features/profile/commentsApi';
import { chatApi } from '../features/profile/chatApi';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [publicFeedApi.reducerPath]: publicFeedApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  // Add both middlewares - this is the key fix!
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(publicFeedApi.middleware)
      .concat(chatApi.middleware)
      .concat(commentsApi.middleware),// Add this line
  devTools: process.env.NODE_ENV !== 'production',
});