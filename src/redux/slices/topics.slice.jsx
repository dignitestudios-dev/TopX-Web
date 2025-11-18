import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  isLoading: false,
  error: null,
  success: null,
  alltopics: [],   // yahan save hoga data
};

// ================= GET TOPICS =================
export const gettopics = createAsyncThunk(
  "topics/gettopics",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/users/interests");
      return res.data?.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load topics"
      );
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
        state.alltopics = action.payload; // store array correctly
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
