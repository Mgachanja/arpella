import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify'

const showToastError = (message) => {
  toast.error(message);
};

const showToastSuccess = (message) => {
  toast.success(message);
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    isLoadind: false,
    user: null,
    error: null,
  },
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;

      if (email === 'test@example.com' && password === 'password') {
        state.isAuthenticated = true;
        state.user = { email };
        state.error = null;
        showToastSuccess('Login successful')
      } else {
        state.error =showToastError('Invalid credentials');
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },

    register: (state, action) => {
      const { firstName, lastName, email, password, phone } = action.payload;

      // Mock registration logic
      if (email && password && firstName && lastName && phone) {
        state.user = { firstName, lastName, email, phone };
        state.isAuthenticated = true;
        state.error = null;
        showToastSuccess('Registration successful');
      } else {
        state.error = 'All fields are required for registration';
        showToastError(state.error);
      }
    },
  },
});

export const { login, logout,registration } = authSlice.actions;
export default authSlice.reducer;
