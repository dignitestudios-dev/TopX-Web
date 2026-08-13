import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import { deduplicateInterestsList } from "../../lib/helpers";

const initialState = {
  isLoading: false,
  error: null,
  success: null,
  alltopics: [],   // Stores interests/categories array
};

// ================= GET TOPICS / INTERESTS =================
export const gettopics = createAsyncThunk(
  "topics/gettopics",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/interests");
      return res.data?.data; 
    } catch (error) {
      try {
        const res2 = await axios.get("/users/interests");
        return res2.data?.data;
      } catch (err) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || "Failed to load topics"
        );
      }
    }
  }
);

// ================= SLICE =================
const topicsSlice = createSlice({
  name: "topics",
  initialState,
  reducers: {
    resetTopics(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET TOPICS
      .addCase(gettopics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(gettopics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alltopics = deduplicateInterestsList(action.payload || []);
        state.success = true;
      })
      .addCase(gettopics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetTopics } = topicsSlice.actions;
export default topicsSlice.reducer;
