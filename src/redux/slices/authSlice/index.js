import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../../../constants';
import { loginUserApi, registerUserApi } from '../../../services/Auth';

// Replaced by authApi.ts RTK Query mutations

import { authApi } from '../api/authApi';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null, // Add token property
    isLoading: false,
    user: null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null; // Clear token
      state.user = null;
      state.error = null;
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
    loadUserFromStorage: (state) => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          state.user = JSON.parse(atob(stored));
          state.isAuthenticated = true;
        } catch {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        // The backend payload structure: { token, user: { firstName, lastName, role, ... } }
        state.token = action.payload.token;
        state.user = action.payload.user;
        toast.success(`Welcome, ${state.user?.firstName || 'User'}!`);
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || 'Login failed';
        toast.error(state.error);
      })

      // REGISTER
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload; // Register payload may vary
        toast.success('Registration successful');
        // if (action.meta.arg.originalArgs.rememberMe) {
        //   localStorage.setItem('user', btoa(JSON.stringify(state.user)));
        // }
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || 'Registration failed';
        toast.error(state.error);
      })

      // EDIT USER
      .addMatcher(authApi.endpoints.editUser.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.editUser.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
        toast.success('Profile updated successfully');
        localStorage.setItem('user', btoa(JSON.stringify(state.user)));
      })
      .addMatcher(authApi.endpoints.editUser.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || 'Update failed';
        toast.error(state.error);
      });
  },
});

export const { logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
