import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";


const initialState = {
    reportLoading: false,
    reportSuccess: false,
    reportError: null,
};

/* ===============================
    🚨 SEND REPORT (POST API)
    API → /reports
================================*/
export const sendReport = createAsyncThunk(
    "reports/sendReport",
    async (data, thunkAPI) => {
        try {
            const res = await axios.post("/reports", data);

            if (!res.data?.success) {
                return thunkAPI.rejectWithValue(
                    res.data?.message || "Report failed"
                );
            }

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Report failed"
            );
        }
    }
);

/* ===============================
            SLICE
================================*/
const reportsSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        resetReportState: (state) => {
            state.reportLoading = false;
            state.reportSuccess = false;
            state.reportError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* ===== SEND REPORT ===== */
            .addCase(sendReport.pending, (state) => {
                state.reportLoading = true;
                state.reportSuccess = false;
                state.reportError = null;
            })
            .addCase(sendReport.fulfilled, (state) => {
                state.reportLoading = false;
                state.reportSuccess = true;
            })
            .addCase(sendReport.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload;
            });
    },
});

export const { resetReportState } = reportsSlice.actions;
export default reportsSlice.reducer;
