import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";
const initialState = {
  error: null,
  success: false,
  isLoading: false,
  topicPages: null,
  userCollections: null,
  userKnowledgePost: null,
};
// ====================================================
// 🚀 Get My Collections  (Get)
// ====================================================
export const getUserTopicPages = createAsyncThunk(
  "other-profile/getUserTopicPages",
  async ({ id, page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/pages/user/${id}?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const getUserCollections = createAsyncThunk(
  "other-profile/getUserCollections",
  async ({ id, page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/collections/user/${id}?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const getUserKnowledgePost = createAsyncThunk(
  "other-profile/getUserKnowledgePost",
  async ({ id, page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/pages/knowledge/${id}?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

// ====================================================
// SLICE
// ====================================================
const otherProfileSlice = createSlice({
  name: "otherProfile",
  initialState,
  reducers: {
    resetOtherProfile(state) {
      state.error = null;
      state.success = false;
      state.isLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------
      // GET POSTS BY PAGE ID
      // ------------------
      .addCase(getUserTopicPages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserTopicPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topicPages = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(getUserTopicPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserCollections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userCollections = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(getUserCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserKnowledgePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserKnowledgePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userKnowledgePost = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(getUserKnowledgePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOtherProfile } = otherProfileSlice.actions;
export default otherProfileSlice.reducer;
