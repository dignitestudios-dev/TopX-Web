import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";
const initialState = {
  error: null,
  success: false,
  subcriptionLoading: false,
  mySubscriptions: null,
  mySubscriptionspagaintion: null,
  isLoading: false,
};
// ====================================================
// 🚀 Get My Collections  (Get)
// ====================================================
export const getMySubsctiptions = createAsyncThunk(
  "subscriptions/getMySubsctiptions",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/collections/my?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

// =============================
// ADD PAGE TO COLLECTIONS (SUBSCRIBE)
// =============================
export const createPageToCollections = createAsyncThunk(
  "collections/createPageToCollections",
  async ({ pages, collectionId }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");     
      const res = await axios.post(
        `/collections/addPages/${collectionId}`,
        { pages },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to add page"
        );
      }

      return {
        message: res.data.message,
      };
    } catch (error) {
      console.log("API ERROR:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add page"
      );
    }
  }
);

// ====================================================
// SLICE
// ====================================================
const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    resetSubscriptions(state) {
      state.error = null;
      state.success = false;
      state.mySubscriptions = [];
      state.subcriptionLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------
      // GET POSTS BY PAGE ID
      // ------------------
      .addCase(getMySubsctiptions.pending, (state) => {
        state.subcriptionLoading = true;
      })
      .addCase(getMySubsctiptions.fulfilled, (state, action) => {
        state.subcriptionLoading = false;
        state.mySubscriptions = action.payload.data;
        state.mySubscriptionspagaintion = action.payload.pagination;
      })
      .addCase(getMySubsctiptions.rejected, (state, action) => {
        state.subcriptionLoading = false;
        state.error = action.payload;
      })
      // ------------------
      // Add Pages  To Collections
      // ------------------
      .addCase(createPageToCollections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPageToCollections.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPageToCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubscriptions } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
