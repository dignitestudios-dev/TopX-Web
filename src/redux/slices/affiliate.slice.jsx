import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";
const initialState = {
  error: null,
  success: false,
  isLoading: false,
  AllRewards: null,
  ReferralUsers: null,
  mySubscriptionspagaintion: null,
  referralLink: null,
  isGenerateLoading: false,
};
// ====================================================
// 🚀 Get My Collections  (Get)
// ====================================================
export const getAllRewards = createAsyncThunk(
  "affiliate/rewards",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/affiliate?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const getAllRefferals = createAsyncThunk(
  "affiliate/referrals",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/affiliate/referrals?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const generateRefferalLink = createAsyncThunk(
  "affiliate/generate-referral-link",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/affiliate/generate-referral-link?type=referral`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const availRedeemCode = createAsyncThunk(
  "/affiliate/69085875ec1261c3b31804a2",
  async (payload, thunkAPI) => {
    try {
      const res = await axios.post(`/affiliate/${payload}`);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

// ====================================================
// SLICE
// ====================================================
const AffiliateSlice = createSlice({
  name: "affiliate",
  initialState,
  reducers: {
    resetAffiliate(state) {
      state.error = null;
      state.success = false;
      state.AllRewards = [];
      state.isLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------
      // GET POSTS BY PAGE ID
      // ------------------
      .addCase(getAllRewards.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllRewards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.AllRewards = action.payload.data;
      })
      .addCase(getAllRewards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllRefferals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllRefferals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ReferralUsers = action.payload.data;
      })
      .addCase(getAllRefferals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(generateRefferalLink.pending, (state) => {
        state.isGenerateLoading = true;
      })
      .addCase(generateRefferalLink.fulfilled, (state, action) => {
        state.isGenerateLoading = false;
        state.referralLink = action.payload.data;
      })
      .addCase(generateRefferalLink.rejected, (state, action) => {
        state.isGenerateLoading = false;
        state.error = action.payload;
      })
      .addCase(availRedeemCode.pending, (state) => {
        state.isRedeemLoading = true;
      })
      .addCase(availRedeemCode.fulfilled, (state, action) => {
        state.isRedeemLoading = false;
        state.success =action.payload.success;
      })
      .addCase(availRedeemCode.rejected, (state, action) => {
        state.isRedeemLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAffiliate } = AffiliateSlice.actions;
export default AffiliateSlice.reducer;
