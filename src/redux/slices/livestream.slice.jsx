import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Initial state for Livestream
const initialState = {
  livestreamLoading: false,
  livestreamSuccess: false,
  livestreamError: null,
  streamData: null,
};

/* ===============================
    🚨 START STREAM (GET API)
    API → /stream/{pageId}/start
================================*/
export const startStream = createAsyncThunk(
  "livestream/startStream",
  async (pageId, thunkAPI) => {
    try {
      // Make API call to start the stream
      const res = await axios.get(`/stream/${pageId}/start`);

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to start stream"
        );
      }

      return res.data; // Return stream data if successful (should include token, appId, etc.)
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to start stream"
      );
    }
  }
);

/* ===============================
    🚨 END STREAM (PATCH API)
    API → /stream/{pageId}/end
================================*/
export const endStream = createAsyncThunk(
  "livestream/endStream",
  async (pageId, thunkAPI) => {
    try {
      // Make API call to end the stream
      const res = await axios.patch(`/stream/${pageId}/end`);

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to end stream"
        );
      }

      return res.data; // Return success message if successful
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to end stream"
      );
    }
  }
);

/* ===============================
    🚨 JOIN STREAM (GET API)
    API → /stream/{pageId}/start
    Note: Using /start endpoint for audience as well
    since backend doesn't have separate /join endpoint
================================*/
export const joinStream = createAsyncThunk(
  "livestream/joinStream",
  async (pageId, thunkAPI) => {
    try {
      // Use /start endpoint (same as host) to get stream credentials
      // Backend should return token/appId for audience to join
      const res = await axios.get(`/stream/${pageId}/join`);

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to join stream"
        );
      }

      return res.data; // Return stream data if successful (should include token, appId, etc.)
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to join stream"
      );
    }
  }
);

/* ===============================
            SLICE
================================*/
const livestreamSlice = createSlice({
  name: "livestream",
  initialState,
  reducers: {
    resetLivestreamState: (state) => {
      state.livestreamLoading = false;
      state.livestreamSuccess = false;
      state.livestreamError = null;
      state.streamData = null;
    },
  },
  extraReducers: (builder) => {
    // Handling start stream actions
    builder
      .addCase(startStream.pending, (state) => {
        state.livestreamLoading = true;
        state.livestreamSuccess = false;
        state.livestreamError = null;
        state.streamData = null;
      })
      .addCase(startStream.fulfilled, (state, action) => {
        state.livestreamLoading = false;
        state.livestreamSuccess = true;
        state.streamData = action.payload.data; // Store stream data
      })
      .addCase(startStream.rejected, (state, action) => {
        state.livestreamLoading = false;
        state.livestreamError = action.payload;
        state.streamData = null;
      })
      // Handling end stream actions
      .addCase(endStream.pending, (state) => {
        state.livestreamLoading = true;
        state.livestreamSuccess = false;
        state.livestreamError = null;
        state.streamData = null;
      })
      .addCase(endStream.fulfilled, (state, action) => {
        state.livestreamLoading = false;
        state.livestreamSuccess = true;
        state.streamData = action.payload; // Store success message
      })
      .addCase(endStream.rejected, (state, action) => {
        state.livestreamLoading = false;
        state.livestreamError = action.payload;
        state.streamData = null;
      })
      // Handling join stream actions
      .addCase(joinStream.pending, (state) => {
        state.livestreamLoading = true;
        state.livestreamSuccess = false;
        state.livestreamError = null;
        state.streamData = null;
      })
      .addCase(joinStream.fulfilled, (state, action) => {
        state.livestreamLoading = false;
        state.livestreamSuccess = true;
        state.streamData = action.payload.data; // Store join stream data
      })
      .addCase(joinStream.rejected, (state, action) => {
        state.livestreamLoading = false;
        state.livestreamError = action.payload;
        state.streamData = null;
      });
  },
});

export const { resetLivestreamState } = livestreamSlice.actions;
export default livestreamSlice.reducer;
