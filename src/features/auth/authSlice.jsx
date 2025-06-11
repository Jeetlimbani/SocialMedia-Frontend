import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice'; // Import apiSlice

// Backend Base URL
const API_URL = 'http://localhost:4000/api/auth/';

// Utility to get user from localStorage (for initial state)
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null, // User data and tokens
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '', // For error/success messages
};

// --- RTK Query Endpoints for Auth ---
// Extend the base apiSlice with auth-specific endpoints
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: `${API_URL}register`,
        method: 'POST',
        body: userData,
      }),
    }),
    activateAccount: builder.mutation({
      query: (tokenData) => ({
        url: `${API_URL}activate`,
        method: 'POST',
        body: tokenData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: `${API_URL}login`,
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // Store user data and tokens in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('accessToken', data.token); // Store token separately for easier access
          localStorage.setItem('refreshToken', data.refreshToken);

          // Update Redux state directly with the logged-in user
          dispatch(setUser(data.user)); // Dispatch action to update state
        } catch (error) {
          console.error('Login failed:', error);
          // Handle error in component, mutation hook will expose it
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${API_URL}logout`,
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          // Clear user data from localStorage and Redux state on successful logout
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch(logoutUser()); // Dispatch action to clear state
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },
    }),
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: `${API_URL}forgot-password`,
        method: 'POST',
        body: emailData,
      }),
    }),
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: `${API_URL}reset-password`,
        method: 'POST',
        body: resetData,
      }),
    }),
  }),
});

// Export the generated hooks
export const {
  useRegisterMutation,
  useActivateAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApiSlice;

// --- Regular Redux Slice (for managing user state, not API calls) ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to manually set user data (e.g., after login mutation success)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.message = '';
    },
    // Reducer to clear user data (e.g., after logout mutation success)
    logoutUser: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.message = 'Logged out successfully';
    },
    // Reducer to reset state (e.g., after an error or success message displayed)
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  // You can define extraReducers here if you need to handle actions from createAsyncThunk,
  // but with RTK Query, many state updates are handled by onQueryStarted.
});

export const { setUser, logoutUser, reset } = authSlice.actions;
export default authSlice.reducer;
