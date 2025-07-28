import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axios from 'axios';
import { baseUrl } from '../../../constants';
import { loginUserApi, registerUserApi } from '../../../services/Auth';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUserApi(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editUser = createAsyncThunk(
  'auth/editUser',
  async ({ phoneNumber, payload }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${baseUrl}/user-details/${phoneNumber}`,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
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
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          phone: action.payload.phoneNumber,
          email: action.payload.email,
          role: action.payload.role,
          passwordHash: action.payload.passwordHash || '',
        };
        toast.success(`Welcome, ${state.user.firstName}!`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          phone: action.payload.phoneNumber,
          email: action.payload.email,
          role: action.payload.role,
          passwordHash: action.payload.passwordHash || '',
        };
        toast.success('Registration successful');
        if (action.meta.arg.rememberMe) {
          localStorage.setItem('user', btoa(JSON.stringify(state.user)));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(editUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          email: action.payload.email,
          passwordHash: action.payload.passwordHash,
          phone: action.payload.phoneNumber,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          role: state.user.role,
        };
        toast.success('Profile updated successfully');
        localStorage.setItem('user', btoa(JSON.stringify(state.user)));
      })
      .addCase(editUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
