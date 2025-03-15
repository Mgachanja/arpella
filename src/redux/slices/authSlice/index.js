import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { loginUserApi, registerUserApi } from '../../../services/Auth';

const showToastSuccess = (message) => {
  toast.success(message);
};

const showToastError = (message) => {
  toast.error(message);
};

// Async thunk for login
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

// Async thunk for register
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
      showToastSuccess('Logged out successfully');
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = {
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          phone: action.payload.phoneNumber,
          email: action.payload.email,
          role: action.payload.role, // Store role from API
        };  
        state.isLoading = false;
        showToastSuccess(`Welcome, ${state.user.firstName || 'User'}!`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToastError(action.payload);
      })

      // Handle register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = {
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          phone: action.payload.phoneNumber,
          email: action.payload.email,
          role: action.payload.role,
        };  
        state.isLoading = false;
        showToastSuccess('Registration successful');
        showToastSuccess(`Welcome ${state.user.firstName}!`);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        showToastError(action.payload);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
