import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";

const initialState = {
  isLoading: false,
  error: null,
  success: false,
  stage: "idle", // idle | oldOtpSent | oldVerified | newOtpSent | newVerified | success
  lastResponse: null,
};

// ✅ 1) Send OTP to old email
export const sendOtpToOldEmail = createAsyncThunk(
  "changeEmail/sendOtpOld",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/emailVerificationOTP`, {
        email: email,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ 2) Verify OTP from old email
export const verifyOldEmailOtp = createAsyncThunk(
  "changeEmail/verifyOldOtp",
  async ({ otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/validateOTP`, { otp: Number(otp) });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ 3) Validate new email (sends OTP)
export const sendOtpToNewEmail = createAsyncThunk(
  "changeEmail/sendOtpNew",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/validateEmail`, {
        email: email,
        role: "user",
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ✅ 4) Verify OTP from new email
export const verifyNewEmailOtp = createAsyncThunk(
  "changeEmail/verifyNewOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/auth/updateEmail`, {
        email: email,
        otp: Number(otp),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ====================================================
// SLICE
// ====================================================
const changeEmailSlice = createSlice({
  name: "changeEmail",
  initialState,
  reducers: {
    resetChangeEmail(state) {
      state.error = null;
      state.success = false;
      state.isLoading = false;
      state.stage = "idle";
      state.lastResponse = null;
    },
  },
  extraReducers: (builder) => {
    // Send OTP to old email
    builder
      .addCase(sendOtpToOldEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtpToOldEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "oldOtpSent";
        state.lastResponse = action.payload;
      })
      .addCase(sendOtpToOldEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Verify OTP from old email
    builder
      .addCase(verifyOldEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOldEmailOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "oldVerified";
        state.lastResponse = action.payload;
      })
      .addCase(verifyOldEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Send OTP to new email
    builder
      .addCase(sendOtpToNewEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtpToNewEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "newOtpSent";
        state.lastResponse = action.payload;
      })
      .addCase(sendOtpToNewEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Verify OTP from new email
    builder
      .addCase(verifyNewEmailOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyNewEmailOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stage = "newVerified";
        state.success = true;
        state.lastResponse = action.payload;
      })
      .addCase(verifyNewEmailOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetChangeEmail } = changeEmailSlice.actions;
export default changeEmailSlice.reducer;