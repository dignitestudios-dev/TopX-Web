import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";

const initialState = {
  isLoading: false,
  error: null,
  success: null,
  otpVerified: false,
  interestsList: [],
};

// =============================
// SEND OTP USING BACKEND ACCESS TOKEN
// =============================
export const sendPhoneOTP = createAsyncThunk(
  "onboarding/sendPhoneOTP",
  async (_, thunkAPI) => {
    try {
      // token cookies se uthao
      const token = Cookies.get("access_token");

      if (!token) {
        return thunkAPI.rejectWithValue("No access token found");
      }

      const res = await axios.post("/auth/phoneVerificationOTP", {
        token: token,
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to send OTP"
        );
      }

      // "OTP Sent to Phone Successfully"
      return res.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);


export const verifyPhoneOTP = createAsyncThunk(
  "onboarding/verifyPhoneOTP",
  async (otp, thunkAPI) => {
    try {
      const res = await axios.post("/auth/verifyPhone", { otp });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "OTP verification failed"
        );
      }

      // assume API returns: { success: true, message: "Phone verified successfully" }
      return res.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const checkUsername = createAsyncThunk(
  "onboarding/checkUsername",
  async (username, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post(
        "/users/username",
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(res.data?.message || "Username not available");
      }

      return res.data.message; // "Username available"
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to check username"
      );
    }
  }
);

export const completeProfile = createAsyncThunk(
  "onboarding/completeProfile",
  async (formData, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post("/users/completeProfile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to complete profile"
        );
      }

      return res.data.message; // success message
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to complete profile"
      );
    }
  }
);

export const getInterests = createAsyncThunk(
  "onboarding/getInterests",
  async (_, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.get("/users/interests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to load interests"
        );
      }

      return res.data.data;  // <-- backend should return list of interests
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load interests"
      );
    }
  }
);

export const updateInterests = createAsyncThunk(
  "onboarding/updateInterests",
  async (interests, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post(
        "/users/interests",
        { interests },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to update interests"
        );
      }

      return res.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update interests"
      );
    }
  }
);



const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    resetOnboarding(state) {
      state.isLoading = false;
      state.error = null;
      state.success = null;
      state.otpVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== SEND OTP ==========
      .addCase(sendPhoneOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(sendPhoneOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload; // "OTP Sent to Phone Successfully"
      })
      .addCase(sendPhoneOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== VERIFY OTP ==========
      .addCase(verifyPhoneOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
        state.otpVerified = false;
      })
      .addCase(verifyPhoneOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload; // success message
        state.otpVerified = true;
      })
      .addCase(verifyPhoneOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.otpVerified = false;
      })
      //Check UserName
      .addCase(checkUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(checkUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload;
      })
      .addCase(checkUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
    // COMPLETE PROFILE
    builder
      .addCase(completeProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getInterests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInterests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.interestsList = action.payload; // Store list of interests
      })
      .addCase(getInterests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateInterests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInterests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload; // success message
      })
      .addCase(updateInterests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
