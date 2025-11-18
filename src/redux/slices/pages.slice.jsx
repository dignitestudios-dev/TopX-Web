import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  isLoading: false,
  error: null,
  success: null,
  pages: null, // yahan save hoga created page
};

// ================= CREATE PAGE =================
export const createPage = createAsyncThunk(
  "pages/createPage",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/pages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data; // this is returned from backend
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create page"
      );
    }
  }
);

// ================= SLICE =================
const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    resetPages(state) {
      state.error = null;
      state.success = null;
      state.pages = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = action.payload; // CORRECT
        state.success = true;
      })
      .addCase(createPage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPages } = pagesSlice.actions;
export default pagesSlice.reducer;
