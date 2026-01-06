import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  isLoading: false,
  error: null,
  success: null,
  globalSearch: [], // yahan save hoga data
  apiTrigger: false,
};

// ================= GET TOPICS =================
// redux/globalSlice.js
export const getGlobalSearch = createAsyncThunk(
  "global/search",
  async (query, thunkAPI) => {
    try {
      const res = await axios.get(`/global/search?page=1&limit=10&q=${query}`);
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load topics"
      );
    }
  }
);

// ================= SLICE =================
const globalSlice = createSlice({
  name: "globalSearch",
  initialState,
  reducers: {
    resetSearch(state) {
      state.error = null;
      state.success = null;
      state.globalSearch = null;
    },
    setApiTrigger(state, action) {
      state.apiTrigger = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET TOPICS
      .addCase(getGlobalSearch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGlobalSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.globalSearch = action.payload; // store array correctly
        state.success = true;
      })
      .addCase(getGlobalSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSearch, setApiTrigger } = globalSlice.actions;
export default globalSlice.reducer;
