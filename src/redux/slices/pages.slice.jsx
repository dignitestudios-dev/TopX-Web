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
  deletePageLoading: false,
  deletePageSuccess: false,
  updatePageLoading: false,
  updatePageSuccess: false,
  expertStatusLoading: false,
  expertStatusSuccess: false,
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
export const repostPostToPages = createAsyncThunk(
  "posts/repostPostToPages",
  async ({ postId, pageIds }, thunkAPI) => {
    try {
      const res = await axios.post("/posts/share", {
        post: postId,
        pages: pageIds,
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to repost post"
      );
    }
  }
);

// ================= DELETE PAGE =================
export const deletePage = createAsyncThunk(
  "pages/deletePage",
  async (pageId, thunkAPI) => {
    try {
      const res = await axios.delete(`/pages/${pageId}`);
      return res.data?.data || res.data; // returns deleted page data or success message
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete page"
      );
    }
  }
);

// ================= UPDATE PAGE =================
export const updatePage = createAsyncThunk(
  "pages/updatePage",
  async ({ pageId, formData }, thunkAPI) => {
    try {
      const res = await axios.patch(`/pages/${pageId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data || res.data; // returns updated page data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update page"
      );
    }
  }
);

// ================= APPLY FOR EXPERT STATUS =================
export const applyExpertStatus = createAsyncThunk(
  "pages/applyExpertStatus",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/expertisestatus", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data || res.data; // returns expert status application data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to apply for expert status"
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
    resetDeletePageSuccess(state) {
      state.deletePageSuccess = false;
      state.error = null;
    },
    resetUpdatePageSuccess(state) {
      state.updatePageSuccess = false;
      state.error = null;
    },
    resetExpertStatusSuccess(state) {
      state.expertStatusSuccess = false;
      state.error = null;
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
      })
      // ******** DELETE PAGE ********
      .addCase(deletePage.pending, (state) => {
        state.deletePageLoading = true;
        state.deletePageSuccess = false;
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.deletePageLoading = false;
        state.deletePageSuccess = true;
        state.success = true;
        // Remove deleted page from myPages if it exists
        state.myPages = state.myPages.filter(
          (page) => page._id !== action.payload?._id
        );
        // Clear pageDetail if it was the deleted page
        if (state.pageDetail?._id === action.payload?._id) {
          state.pageDetail = null;
        }
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.deletePageLoading = false;
        state.deletePageSuccess = false;
        state.error = action.payload;
      })
      // ******** UPDATE PAGE ********
      .addCase(updatePage.pending, (state) => {
        state.updatePageLoading = true;
        state.updatePageSuccess = false;
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.updatePageLoading = false;
        state.updatePageSuccess = true;
        state.success = true;
        // Update pageDetail if it's the updated page
        if (state.pageDetail?._id === action.payload?._id) {
          state.pageDetail = action.payload;
        }
        // Update myPages if it exists there
        state.myPages = state.myPages.map((page) =>
          page._id === action.payload?._id ? action.payload : page
        );
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.updatePageLoading = false;
        state.updatePageSuccess = false;
        state.error = action.payload;
      })
      // ******** APPLY EXPERT STATUS ********
      .addCase(applyExpertStatus.pending, (state) => {
        state.expertStatusLoading = true;
        state.expertStatusSuccess = false;
        state.error = null;
      })
      .addCase(applyExpertStatus.fulfilled, (state, action) => {
        state.expertStatusLoading = false;
        state.expertStatusSuccess = true;
        state.success = true;
      })
      .addCase(applyExpertStatus.rejected, (state, action) => {
        state.expertStatusLoading = false;
        state.expertStatusSuccess = false;
        state.error = action.payload;
      });
  },
});

export const { resetPages, resetDeletePageSuccess, resetUpdatePageSuccess, resetExpertStatusSuccess } = pagesSlice.actions;
export default pagesSlice.reducer;
