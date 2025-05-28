import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../../../constants";

// Async thunk to fetch staff members
export const fetchStaffMembers = createAsyncThunk("staff/fetchStaff", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${baseUrl}/special-users`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch staff");
  }
});

// Staff slice with extraReducers
const staffSlice = createSlice({
  name: "staff",
  initialState: {
    staffList: [],
    isLoading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffList = action.payload;
        console.log(state.staffList)
      })
      .addCase(fetchStaffMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Selector to get active staff count
export const selectStaffCount = (state) => {
  return state.staff.staffList.filter(staff => staff.isActive).length;
};

export default staffSlice.reducer;
