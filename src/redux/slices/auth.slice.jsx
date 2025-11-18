import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";


const initialState = {
  isLoading: false,
  error: null,
  success: null,
  user: null,
  accessToken: null,
  forgotLoading: false,
  forgotSuccess: null,
  forgotError: null,
  verifyOtpLoading: false,
  verifyOtpSuccess: null,
  verifyOtpError: null,
  otpVerified: false,
  updatePassLoading: false,
  updatePassSuccess: null,
  updatePassError: null,
};

// ================= LOGIN =================
export const login = createAsyncThunk(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      const res = await axios.post("/auth/signIn", payload);

      const api = res.data; // full API response
      const token = api?.data?.token || null;
      const user = api?.data?.user || null;
      const message = api?.message || "Login successful";

      if (!token) {
        return thunkAPI.rejectWithValue("Token not found in response");
      }

      return {
        message,
        accessToken: token,
        user,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);


export const signUp = createAsyncThunk(
  "auth/signUp",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/auth/signUp", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const api = res.data;
      const token = api?.data?.token || null;
      const user = api?.data?.user || null;

      if (!token) {
        return thunkAPI.rejectWithValue("Token missing");
      }

      return {
        message: api?.message || "Signup successful",
        accessToken: token,
        user,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Signup failed"
      );
    }
  }
);


// ================= GET PROFILE =================
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/user/profile");
      return res.data?.user || res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load profile"
      );
    }
  }
);

// ================= LOGOUT =================
export const logout = createAsyncThunk(
  "auth/logout",
  async (token, thunkAPI) => {
    try {
      const res = await axios.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);


export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email, role }, thunkAPI) => {
    try {
      const res = await axios.post("/auth/forgot", { email, role });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(res.data?.message || "Failed to send OTP");
      }

      return res.data.message; // "OTP Sent Successfully"
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);


export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, role, otp }, thunkAPI) => {
    try {
      const res = await axios.post("/auth/verifyOTP", { email, role, otp });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(res.data?.message || "Invalid OTP");
      }

      // extract token
      const token = res.data?.data?.token;

      if (token) {
        Cookies.set("reset_token", token);  // ← cookie bhi set
      }

      return {
        message: res.data.message,
        token, // ← NOW frontend will receive token here
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "OTP verification failed"
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async ({ password, token }, thunkAPI) => {
    try {
      if (!token) {
        return thunkAPI.rejectWithValue("Reset token missing");
      }

      const res = await axios.post(
        "/auth/updatePassword",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to update password"
        );
      }

      return res.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update password"
      );
    }
  }
);


// ================= SLICE =================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.success = action.payload.message;

      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // SIGNUP
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.success = action.payload.message;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Signup failed";
      })

      // GET PROFILE
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.success = "Logout successful";
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;

        // even if API call fails → clear local session
        state.user = null;
        state.accessToken = null;

        state.error = action.payload;
      })
      // ===== FORGOT PASSWORD =====
      .addCase(forgotPassword.pending, (state) => {
        state.forgotLoading = true;
        state.forgotError = null;
        state.forgotSuccess = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotLoading = false;
        state.forgotSuccess = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotLoading = false;
        state.forgotError = action.payload;
      })
      // ===== VERIFY OTP =====
      .addCase(verifyOTP.pending, (state) => {
        state.verifyOtpLoading = true;
        state.verifyOtpError = null;
        state.verifyOtpSuccess = null;
        state.otpVerified = false;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpSuccess = action.payload.message;
        state.otpVerified = true;
      })

      .addCase(verifyOTP.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload;
        state.otpVerified = false;
      })
      // ===== UPDATE PASSWORD =====
      .addCase(updatePassword.pending, (state) => {
        state.updatePassLoading = true;
        state.updatePassError = null;
        state.updatePassSuccess = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.updatePassLoading = false;
        state.updatePassSuccess = action.payload;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.updatePassLoading = false;
        state.updatePassError = action.payload;
      })
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;

