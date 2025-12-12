import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  pagesLoading: false,
  error: null,
  success: null,
  pages: null, // createPage response
  myPages: [], // <-- list of pages from GET API
  recommendationPages: [], // <-- list of recommended pages
  pagination: null, // <-- pagination info
  // NEW
  pageDetailLoading: false,
  pageDetail: null,
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

export const getPageDetail = createAsyncThunk(
  "pages/getPageDetail",
  async (pageId, thunkAPI) => {
    try {
      const res = await axios.get(`/pages/${pageId}`);
      return res.data?.data; // returns page object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch page detail"
      );
    }
  }
);

// ================= FETCH MY PAGES =================
export const fetchMyPages = createAsyncThunk(
  "pages/fetchMyPages",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(`/pages/my?page=${page}&limit=${limit}`);
      return res.data; // full response with pagination + data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch pages"
      );
    }
  }
);
// ================= FETCH Other PAGES =================
export const fetchOtherPages = createAsyncThunk(
  "pages/recommendations",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/pages/recommendations?page=${page}&limit=${limit}`
      );
      return res.data; // full response with pagination + data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch pages"
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
        state.pagesLoading = true;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.pages = action.payload; // CORRECT
        state.success = true;
      })
      .addCase(createPage.rejected, (state, action) => {
        state.pagesLoading = false;
        state.error = action.payload;
      })
      .addCase(getPageDetail.pending, (state) => {
        state.pageDetailLoading = true;
      })
      .addCase(getPageDetail.fulfilled, (state, action) => {
        state.pageDetailLoading = false;
        state.pageDetail = action.payload;
      })
      .addCase(getPageDetail.rejected, (state, action) => {
        state.pageDetailLoading = false;
        state.error = action.payload;
      })
      // ******** FETCH MY PAGES ********
      .addCase(fetchMyPages.pending, (state) => {
        state.pagesLoading = true;
      })
      .addCase(fetchMyPages.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.myPages = action.payload.data; // array of pages
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchMyPages.rejected, (state, action) => {
        state.pagesLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOtherPages.pending, (state) => {
        state.pagesLoading = true;
      })
      .addCase(fetchOtherPages.fulfilled, (state, action) => {
        state.pagesLoading = false;
        state.recommendationPages = action.payload.data; // array of pages
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchOtherPages.rejected, (state, action) => {
        state.pagesLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPages } = pagesSlice.actions;
export default pagesSlice.reducer;
