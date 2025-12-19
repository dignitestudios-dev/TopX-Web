import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";
const initialState = {
  error: null,
  success: false,
  updateLoader: false,
  isLoading: false,
  stage: "idle", // idle | otpSentOld | oldVerified | newUpdated | otpSentNew | newVerified | success
  lastResponse: null,
  blockedUsers: [],
  recentActivity: [],
  settings: null,
};
// ====================================================
// 🚀 Get My Collections  (Get)
// ====================================================
export const getBlockedUsers = createAsyncThunk(
  "profile/blocks/",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/blocks?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

export const unblockUser = createAsyncThunk(
  `/blocks/id`,
  async (payload, thunkAPI) => {
    try {
      const res = await axios.put(`/blocks/${payload}`);

      return res?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

export const changePassword = createAsyncThunk(
  "/auth/changePassword",
  async (payload, thunkAPI) => {
    try {
      const res = await axios.post(`/auth/changePassword/`, payload);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

export const sendOtp = createAsyncThunk(
  "changePhone/sendOtp",
  async ({ phone } = {}, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/phoneVerificationOTP`, {
        phone: phone,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 2) verify old phone OTP
export const verifyOld = createAsyncThunk(
  "changePhone/verifyOld",
  async ({ otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/verifyOldPhone`, { otp: otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 3) update phone (send new phone to server)
export const updateNewPhone = createAsyncThunk(
  "changePhone/updatePhone",
  async ({ phone }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/updatePhone`, { phone: phone });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 4) verify new phone OTP
export const verifyNew = createAsyncThunk(
  "changePhone/verifyNew",
  async ({ otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/verifyNewPhone`, otp);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete Account

export const deleteAccount = createAsyncThunk(
  "/auth/delete",
  async (token, thunkAPI) => {
    try {
      const res = await axios.post("/auth/delete");

      return res?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);
// get recent Activity
export const getSettings = createAsyncThunk(
  "/get/settings",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/settings?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const getRecentActivity = createAsyncThunk(
  "/get/activities",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/activities?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

export const updateActivityStatus = createAsyncThunk(
  "/settings/activity-status",
  async ({ activityStatus }, thunkAPI) => {
    try {
      const res = await axios.put("/settings", {
        activityStatus, // "on" | "off"
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update activity status"
      );
    }
  }
);

// ====================================================
// SLICE
// ====================================================
const profileSettingSlice = createSlice({
  name: "profileSetting",
  initialState,
  reducers: {
    resetProfileSetting(state) {
      state.error = null;
      state.success = false;
      state.isLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------
      // GET POSTS BY PAGE ID
      // ------------------
      .addCase(getBlockedUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlockedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blockedUsers = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(getBlockedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(unblockUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage =
          state.stage === "oldVerified" ? "otpSentNew" : "otpSentOld";
        state.lastResponse = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyOld.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOld.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "oldVerified";
        state.lastResponse = action.payload;
      })
      .addCase(verifyOld.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateNewPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNewPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "newUpdated";
        state.lastResponse = action.payload;
      })
      .addCase(updateNewPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyNew.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyNew.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "newVerified";
        state.lastResponse = action.payload;
      })
      .addCase(verifyNew.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.success;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getRecentActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecentActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentActivity = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(getRecentActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload.data;
        state.success = action.payload.success;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateActivityStatus.pending, (state) => {
        state.updateLoader = true;
        state.updateError = null;
      })

      .addCase(updateActivityStatus.fulfilled, (state, action) => {
        state.updateLoader = false;
        state.settings.activityStatus = action.payload.activityStatus;
      })

      .addCase(updateActivityStatus.rejected, (state, action) => {
        state.updateLoader = false;
        state.updateError = action.payload;
      });
  },
});

export const { resetProfileSetting, resetChangePhone } =
  profileSettingSlice.actions;
export default profileSettingSlice.reducer;
