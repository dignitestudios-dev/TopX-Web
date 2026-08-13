import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const initialState = {
  plans: [],
  plansLoading: false,
  plansError: null,

  checkoutLoading: false,
  checkoutData: null,
  checkoutError: null,

  verificationLoading: false,
  verificationData: null,
  verificationError: null,

  createBoostLoading: false,
  createdBoost: null,
  createBoostError: null,

  myBoosts: [],
  myBoostsPagination: null,
  myBoostsLoading: false,
  myBoostsError: null,

  analytics: null,
  analyticsBoost: null,
  analyticsLoading: false,
  analyticsError: null,

  cancelLoading: false,
  cancelSuccess: false,
  cancelError: null,

  userLocation: null,
  locationLoading: false,
};

// ====================================================
// 🚀 1. LIST PLANS (GET /api/boosts/plans)
// ====================================================
export const fetchBoostPlans = createAsyncThunk(
  "boost/fetchPlans",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/api/boosts/plans");
      return res.data?.data || [];
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch boost plans";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 2. CREATE STRIPE CHECKOUT SESSION (POST /api/boosts/stripe/checkout-session)
// ====================================================
export const createStripeCheckoutSession = createAsyncThunk(
  "boost/createStripeCheckoutSession",
  async ({ planId }, thunkAPI) => {
    try {
      const res = await axios.post("/api/boosts/stripe/checkout-session", {
        planId,
      });
      return res.data?.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to create checkout session";
      ErrorToast(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 3. VERIFY PURCHASE (POST /api/boosts/verify-purchase)
// ====================================================
export const verifyPurchase = createAsyncThunk(
  "boost/verifyPurchase",
  async (payload, thunkAPI) => {
    try {
      // payload: { platform: "stripe", checkoutSessionId }
      // or { platform: "apple", receiptData }
      // or { platform: "google", productId, purchaseToken }
      const res = await axios.post("/api/boosts/verify-purchase", payload);
      return res.data?.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to verify purchase";
      ErrorToast(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 4. CREATE ACTIVE BOOST (POST /api/boosts)
// ====================================================
export const createBoost = createAsyncThunk(
  "boost/createBoost",
  async (payload, thunkAPI) => {
    try {
      const res = await axios.post("/api/boosts", payload);
      SuccessToast(res.data?.message || "Boost campaign created successfully!");
      return res.data?.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create boost";
      ErrorToast(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 5. RECORD IMPRESSION (POST /api/boosts/:boostId/impression)
// ====================================================
export const recordImpression = createAsyncThunk(
  "boost/recordImpression",
  async ({ boostId, sessionId }, thunkAPI) => {
    try {
      const res = await axios.post(`/api/boosts/${boostId}/impression`, {
        sessionId,
      });
      return { boostId, data: res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to record impression"
      );
    }
  }
);

// ====================================================
// 🚀 6. LIST MY BOOSTS (GET /api/boosts/my)
// ====================================================
export const fetchMyBoosts = createAsyncThunk(
  "boost/fetchMyBoosts",
  async ({ page = 1, limit = 10, status } = {}, thunkAPI) => {
    try {
      let url = `/api/boosts/my?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      const res = await axios.get(url);
      return {
        boosts: res.data?.data || [],
        pagination: res.data?.pagination || null,
      };
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to fetch boost campaigns";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 7. GET BOOST ANALYTICS (GET /api/boosts/:boostId/analytics)
// ====================================================
export const fetchBoostAnalytics = createAsyncThunk(
  "boost/fetchBoostAnalytics",
  async (boostId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/boosts/${boostId}/analytics`);
      return res.data?.data; // { boost: {}, analytics: {} }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to fetch boost analytics";
      ErrorToast(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 8. CANCEL ACTIVE BOOST (DELETE /api/boosts/:boostId)
// ====================================================
export const cancelBoost = createAsyncThunk(
  "boost/cancelBoost",
  async (boostId, thunkAPI) => {
    try {
      const res = await axios.delete(`/api/boosts/${boostId}`);
      SuccessToast(res.data?.message || "Boost cancelled successfully");
      return { boostId, message: res.data?.message };
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to cancel boost";
      ErrorToast(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// ====================================================
// 🚀 9. UPDATE VIEWER LOCATION (PATCH /users/location)
// ====================================================
export const updateViewerLocation = createAsyncThunk(
  "boost/updateViewerLocation",
  async ({ latitude, longitude }, thunkAPI) => {
    try {
      const res = await axios.patch("/users/location", {
        latitude,
        longitude,
      });
      return res.data?.data?.location;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update location"
      );
    }
  }
);

// ====================================================
// SLICE
// ====================================================
const boostSlice = createSlice({
  name: "boost",
  initialState,
  reducers: {
    resetBoostState(state) {
      state.checkoutLoading = false;
      state.checkoutData = null;
      state.checkoutError = null;
      state.verificationLoading = false;
      state.verificationData = null;
      state.verificationError = null;
      state.createBoostLoading = false;
      state.createdBoost = null;
      state.createBoostError = null;
    },
    clearAnalytics(state) {
      state.analytics = null;
      state.analyticsBoost = null;
      state.analyticsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchBoostPlans.pending, (state) => {
        state.plansLoading = true;
        state.plansError = null;
      })
      .addCase(fetchBoostPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchBoostPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.plansError = action.payload;
      })

      // Create Stripe Checkout Session
      .addCase(createStripeCheckoutSession.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(createStripeCheckoutSession.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutData = action.payload;
      })
      .addCase(createStripeCheckoutSession.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload;
      })

      // Verify Purchase
      .addCase(verifyPurchase.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(verifyPurchase.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.verificationData = action.payload;
      })
      .addCase(verifyPurchase.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
      })

      // Create Boost
      .addCase(createBoost.pending, (state) => {
        state.createBoostLoading = true;
        state.createBoostError = null;
      })
      .addCase(createBoost.fulfilled, (state, action) => {
        state.createBoostLoading = false;
        state.createdBoost = action.payload;
        // Prepend or update in myBoosts if present
        if (action.payload) {
          state.myBoosts = [action.payload, ...state.myBoosts];
        }
      })
      .addCase(createBoost.rejected, (state, action) => {
        state.createBoostLoading = false;
        state.createBoostError = action.payload;
      })

      // Fetch My Boosts
      .addCase(fetchMyBoosts.pending, (state) => {
        state.myBoostsLoading = true;
        state.myBoostsError = null;
      })
      .addCase(fetchMyBoosts.fulfilled, (state, action) => {
        state.myBoostsLoading = false;
        state.myBoosts = action.payload.boosts;
        state.myBoostsPagination = action.payload.pagination;
      })
      .addCase(fetchMyBoosts.rejected, (state, action) => {
        state.myBoostsLoading = false;
        state.myBoostsError = action.payload;
      })

      // Fetch Analytics
      .addCase(fetchBoostAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchBoostAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload?.analytics;
        state.analyticsBoost = action.payload?.boost;
      })
      .addCase(fetchBoostAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })

      // Cancel Boost
      .addCase(cancelBoost.pending, (state) => {
        state.cancelLoading = true;
        state.cancelSuccess = false;
        state.cancelError = null;
      })
      .addCase(cancelBoost.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.cancelSuccess = true;
        // Update local status in myBoosts and analytics
        const cancelledId = action.payload.boostId;
        state.myBoosts = state.myBoosts.map((b) =>
          b._id === cancelledId ? { ...b, status: "cancelled" } : b
        );
        if (state.analyticsBoost?._id === cancelledId) {
          state.analyticsBoost = {
            ...state.analyticsBoost,
            status: "cancelled",
          };
        }
        if (state.analytics) {
          state.analytics = { ...state.analytics, status: "cancelled" };
        }
      })
      .addCase(cancelBoost.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
      })

      // Update Location
      .addCase(updateViewerLocation.fulfilled, (state, action) => {
        state.userLocation = action.payload;
      });
  },
});

export const { resetBoostState, clearAnalytics } = boostSlice.actions;
export default boostSlice.reducer;
