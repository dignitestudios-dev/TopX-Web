import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  // Current active contest
  currentContest: null,
  referralCounts: {
    contest: 0,
    lifetime: 0,
  },
  hasPrizeDeliveryAddress: false,
  prizeDeliveryDetails: null,
  noActiveContest: false,
  isContestLoading: false,
  contestError: null,

  // Permanent referral link & share status
  referralLink: null,
  contestId: null,
  isLinkLoading: false,
  linkError: null,

  // Prize delivery details form state
  isDeliveryDetailsLoading: false,
  isSavingDeliveryDetails: false,
  deliveryDetailsError: null,

  // Referral history list
  referrals: [],
  pagination: {
    itemsPerPage: 20,
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
  },
  isReferralsLoading: false,
  referralsError: null,
};

// ====================================================
// 1. GET CURRENT CONTEST, COUNTS, AND DELIVERY READINESS
// GET /affiliate/contest/current
// ====================================================
export const getCurrentContest = createAsyncThunk(
  "affiliate/getCurrentContest",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/affiliate/contest/current");
      return res.data;
    } catch (error) {
      // 404 indicates no active contest - this is a standard product state
      if (error.response?.status === 404) {
        return {
          noActiveContest: true,
          data: {
            contest: null,
            referralCounts: { contest: 0, lifetime: 0 },
            hasPrizeDeliveryAddress: false,
            prizeDeliveryDetails: null,
          },
        };
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch current referral contest"
      );
    }
  }
);

// ====================================================
// 2. GET PRIZE DELIVERY DETAILS
// GET /affiliate/prize-delivery-details
// ====================================================
export const getPrizeDeliveryDetails = createAsyncThunk(
  "affiliate/getPrizeDeliveryDetails",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/affiliate/prize-delivery-details");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch prize delivery details"
      );
    }
  }
);

// ====================================================
// 3. SAVE OR UPDATE PRIZE DELIVERY DETAILS
// PUT /affiliate/prize-delivery-details
// ====================================================
export const updatePrizeDeliveryDetails = createAsyncThunk(
  "affiliate/updatePrizeDeliveryDetails",
  async (deliveryData, thunkAPI) => {
    try {
      // Clean up values: trim strings, address is required, postalCode remains string
      const payload = {
        address: typeof deliveryData.address === "string" ? deliveryData.address.trim() : "",
        ...(deliveryData.name?.trim() ? { name: deliveryData.name.trim() } : {}),
        ...(deliveryData.email?.trim() ? { email: deliveryData.email.trim() } : {}),
        ...(deliveryData.phone?.trim() ? { phone: deliveryData.phone.trim() } : {}),
        ...(deliveryData.apartment?.trim() ? { apartment: deliveryData.apartment.trim() } : {}),
        ...(deliveryData.city?.trim() ? { city: deliveryData.city.trim() } : {}),
        ...(deliveryData.state?.trim() ? { state: deliveryData.state.trim() } : {}),
        ...(deliveryData.postalCode !== undefined && deliveryData.postalCode !== null && String(deliveryData.postalCode).trim()
          ? { postalCode: String(deliveryData.postalCode).trim() }
          : {}),
        ...(deliveryData.country?.trim() ? { country: deliveryData.country.trim() } : {}),
      };

      const res = await axios.put("/affiliate/prize-delivery-details", payload);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to save prize delivery details",
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  }
);

// ====================================================
// 4. GET THE PERMANENT REFERRAL LINK
// GET /affiliate/referral-link
// ====================================================
export const getReferralLink = createAsyncThunk(
  "affiliate/getReferralLink",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/affiliate/referral-link");
      return res.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data || {};

      // Missing delivery address requirement (HTTP 422)
      if (status === 422 && data.code === "PRIZE_DETAILS_REQUIRED") {
        return thunkAPI.rejectWithValue({
          code: "PRIZE_DETAILS_REQUIRED",
          message: data.message || "Add your prize delivery address before sharing your referral link.",
          missingFields: data.missingFields || ["address"],
        });
      }

      // No active contest (HTTP 404)
      if (status === 404) {
        return thunkAPI.rejectWithValue({
          code: "NO_ACTIVE_CONTEST",
          message: data.message || "There is no active referral contest at this time.",
        });
      }

      return thunkAPI.rejectWithValue({
        code: "SERVER_ERROR",
        message: data.message || "Failed to retrieve referral link",
      });
    }
  }
);

// ====================================================
// 5. GET REFERRAL COUNTS AND SUCCESSFUL REFERRAL HISTORY
// GET /affiliate/referrals?page=1&limit=20
// ====================================================
export const getReferralsHistory = createAsyncThunk(
  "affiliate/getReferralsHistory",
  async ({ page = 1, limit = 20 } = {}, thunkAPI) => {
    try {
      const res = await axios.get(`/affiliate/referrals?page=${page}&limit=${limit}`);
      return {
        ...res.data,
        requestedPage: page,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch referral history"
      );
    }
  }
);

// ====================================================
// SLICE DEFINITION
// ====================================================
const affiliateSlice = createSlice({
  name: "affiliate",
  initialState,
  reducers: {
    resetAffiliate(state) {
      state.contestError = null;
      state.linkError = null;
      state.deliveryDetailsError = null;
      state.referralsError = null;
    },
    setHasPrizeDeliveryAddress(state, action) {
      state.hasPrizeDeliveryAddress = Boolean(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Current Contest
    builder
      .addCase(getCurrentContest.pending, (state) => {
        state.isContestLoading = true;
        state.contestError = null;
      })
      .addCase(getCurrentContest.fulfilled, (state, action) => {
        state.isContestLoading = false;
        if (action.payload?.noActiveContest) {
          state.noActiveContest = true;
          state.currentContest = null;
        } else {
          state.noActiveContest = false;
          const contestData = action.payload?.data;
          state.currentContest = contestData?.contest || null;
          if (contestData?.referralCounts) {
            state.referralCounts = contestData.referralCounts;
          }
          if (typeof contestData?.hasPrizeDeliveryAddress === "boolean") {
            state.hasPrizeDeliveryAddress = contestData.hasPrizeDeliveryAddress;
          }
          if (contestData?.prizeDeliveryDetails) {
            state.prizeDeliveryDetails = contestData.prizeDeliveryDetails;
          }
        }
      })
      .addCase(getCurrentContest.rejected, (state, action) => {
        state.isContestLoading = false;
        state.contestError = action.payload;
      });

    // Prize Delivery Details (GET)
    builder
      .addCase(getPrizeDeliveryDetails.pending, (state) => {
        state.isDeliveryDetailsLoading = true;
      })
      .addCase(getPrizeDeliveryDetails.fulfilled, (state, action) => {
        state.isDeliveryDetailsLoading = false;
        state.prizeDeliveryDetails = action.payload?.data || null;
        if (action.payload?.data?.address) {
          state.hasPrizeDeliveryAddress = true;
        }
      })
      .addCase(getPrizeDeliveryDetails.rejected, (state) => {
        state.isDeliveryDetailsLoading = false;
      });

    // Save Prize Delivery Details (PUT)
    builder
      .addCase(updatePrizeDeliveryDetails.pending, (state) => {
        state.isSavingDeliveryDetails = true;
        state.deliveryDetailsError = null;
      })
      .addCase(updatePrizeDeliveryDetails.fulfilled, (state, action) => {
        state.isSavingDeliveryDetails = false;
        state.hasPrizeDeliveryAddress = true;
        state.prizeDeliveryDetails = action.payload?.data || null;
      })
      .addCase(updatePrizeDeliveryDetails.rejected, (state, action) => {
        state.isSavingDeliveryDetails = false;
        state.deliveryDetailsError = action.payload?.message || "Failed to save delivery details";
      });

    // Permanent Referral Link (GET)
    builder
      .addCase(getReferralLink.pending, (state) => {
        state.isLinkLoading = true;
        state.linkError = null;
      })
      .addCase(getReferralLink.fulfilled, (state, action) => {
        state.isLinkLoading = false;
        state.referralLink = action.payload?.data?.referralLink || null;
        state.contestId = action.payload?.data?.contestId || null;
      })
      .addCase(getReferralLink.rejected, (state, action) => {
        state.isLinkLoading = false;
        state.linkError = action.payload;
      });

    // Referral History & Counts (GET)
    builder
      .addCase(getReferralsHistory.pending, (state) => {
        state.isReferralsLoading = true;
        state.referralsError = null;
      })
      .addCase(getReferralsHistory.fulfilled, (state, action) => {
        state.isReferralsLoading = false;
        const requestedPage = action.payload?.requestedPage || 1;
        const resData = action.payload?.data || {};

        if (resData.referralCounts) {
          state.referralCounts = resData.referralCounts;
        }

        const newReferrals = Array.isArray(resData.referrals) ? resData.referrals : [];

        if (requestedPage === 1) {
          state.referrals = newReferrals;
        } else {
          // Merge avoiding duplicates by _id
          const existingIds = new Set(state.referrals.map((r) => r._id));
          const toAdd = newReferrals.filter((r) => !existingIds.has(r._id));
          state.referrals = [...state.referrals, ...toAdd];
        }

        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getReferralsHistory.rejected, (state, action) => {
        state.isReferralsLoading = false;
        state.referralsError = action.payload;
      });
  },
});

export const { resetAffiliate, setHasPrizeDeliveryAddress } = affiliateSlice.actions;
export default affiliateSlice.reducer;
