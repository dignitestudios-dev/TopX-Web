import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
 
const initialState = {
  isLoading: false,
  error: null,
  success: null,
  user: null,
  accessToken: null,
};
 
// ================= LOGIN =================
export const login = createAsyncThunk(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      const res = await axios.post("/auth/signIn", payload);
 
      const api = res.data; // full API response
      const token = api?.data?.token || null;
      const user = api?.data?.user || null;
      const message = api?.message || "Login successful";
 
      if (!token) {
        return thunkAPI.rejectWithValue("Token not found in response");
      }
 
      return {
        message,
        accessToken: token,
        user,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);
 
// ================= GET PROFILE =================
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/user/profile");
      return res.data?.user || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load profile"
      );
    }
  }
);
 
// ================= LOGOUT =================
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axios.get("/user/logout");
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);
 
// ================= SLICE =================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.success = action.payload.message;
 
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
 
      // GET PROFILE
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
 
      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.success = "Logout successful";
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
 
        // even if API call fails → clear local session
        state.user = null;
        state.accessToken = null;
 
        state.error = action.payload;
      });
  },
});
 
export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;