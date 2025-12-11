import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Initial state for notifications, follow requests, and notification requests
const initialState = {
    notifications: [],
    unreadCount: 0,
    pagination: null,
    notificationsLoading: false,
    followRequestLoading: false,
    notificationRequestLoading: false,
    error: null,
    followRequestError: null,
    notificationRequestError: null,
};

// Fetch Notifications API call
export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async ({ page = 1, limit = 100 }, thunkAPI) => {
        try {
            const res = await axios.get(`/notifications?page=${page}&limit=${limit}`);
            return {
                data: res.data?.data,
                unreadCount: res.data?.unreadCount,
                pagination: res.data?.pagination,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
        }
    }
);

// Notification Follow Request API call
export const notificationfollowrequest = createAsyncThunk(
    "notifications/notificationfollowrequest",
    async ({ status, followRequestId, notificationId }, thunkAPI) => {
        try {
            const res = await axios.post(`/requests/${followRequestId}/follow`, { status, notificationId });
            return res.data; // Assuming the response returns success data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to send follow request");
        }
    }
);

// Notification Request API call
export const notificationpostrequest = createAsyncThunk(
    "notifications/notificationpostrequest",
    async ({ status, postRequestId, notificationId }, thunkAPI) => {
        try {
            const res = await axios.post(`/requests/${postRequestId}`, { status, notificationId });
            return res.data; // Assuming the response returns success data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to send notification request");
        }
    }
);

// Mark notification as read API call
export const markNotificationAsRead = createAsyncThunk(
    "notifications/markNotificationAsRead",
    async (notificationId, thunkAPI) => {
        try {
            const res = await axios.post(`/notifications/read`, { notificationId });
            return { notificationId }; // Return the notificationId to update the state
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
        }
    }
);

/* ===============================
             SLICE
================================*/
const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        resetNotifications(state) {
            state.error = null;
            state.notificationsLoading = false;
            state.followRequestLoading = false;
            state.notificationRequestLoading = false;
            state.followRequestError = null;
            state.notificationRequestError = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.notificationsLoading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notificationsLoading = false;
                state.notifications = action.payload.data;
                state.unreadCount = action.payload.unreadCount;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.notificationsLoading = false;
                state.error = action.payload;
            })
            // Follow Request API
            .addCase(notificationfollowrequest.pending, (state) => {
                state.followRequestLoading = true;
            })
            .addCase(notificationfollowrequest.fulfilled, (state, action) => {
                state.followRequestLoading = false;
                // You can update the notifications state or any other relevant state based on the response.
            })
            .addCase(notificationfollowrequest.rejected, (state, action) => {
                state.followRequestLoading = false;
                state.followRequestError = action.payload;
            })
            // Notification Request API
            .addCase(notificationpostrequest.pending, (state) => {
                state.notificationRequestLoading = true;
            })
            .addCase(notificationpostrequest.fulfilled, (state, action) => {
                state.notificationRequestLoading = false;
                // You can update the notifications state or any other relevant state based on the response.
            })
            .addCase(notificationpostrequest.rejected, (state, action) => {
                state.notificationRequestLoading = false;
                state.notificationRequestError = action.payload;
            })
            // Mark notification as read
            .addCase(markNotificationAsRead.pending, (state) => {
                // Optional: Add loading state if you need to handle loading during this request
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                // Update the state to mark the notification as read
                state.notifications = state.notifications.map((notification) =>
                    notification.id === action.payload.notificationId
                        ? { ...notification, read: true } // Assuming there's a "read" field in notification
                        : notification
                );
                state.unreadCount -= 1; // Decrease unread count
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                // Handle error if needed
            });
    },
});

export const { resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
