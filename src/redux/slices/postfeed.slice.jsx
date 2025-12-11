import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Initial state for the post feed
const initialState = {
    allfeedposts: [], // Storing posts fetched from the API
    pagination: null,
    postsLoading: false,
    error: null,
};

// Fetch posts API call
export const fetchpostfeed = createAsyncThunk(
    "posts/fetchpostfeed",
    async ({ page = 1, limit = 10 }, thunkAPI) => {
        try {
            const res = await axios.get(`/posts/feed?page=${page}&limit=${limit}`);
            return {
                posts: res.data?.data, // The posts fetched from API
                pagination: res.data?.pagination, // Pagination info
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch posts");
        }
    }
);

// Like/Unlike post API call
export const likePost = createAsyncThunk(
    "posts/likePost",
    async ({ postId, likeToggle }, thunkAPI) => {
        try {
            const res = await axios.post("/likes/post", {
                post: postId,
                likeToggle: likeToggle, // true for like, false for unlike
            });

            return {
                postId,
                likeToggle: res.data.data.likeToggle, // true for like, false for unlike
                likesCount: res.data.data.likesCount, // Get the actual likes count from API response
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to like/unlike post");
        }
    }
);


/* ===============================
             SLICE
================================*/
const postFeedSlice = createSlice({
    name: "postsfeed",
    initialState,
    reducers: {
        resetPosts(state) {
            state.allfeedposts = []; // Ensure consistency here with "allfeedposts"
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Posts
        builder
            .addCase(fetchpostfeed.pending, (state) => {
                state.postsLoading = true;
            })
            .addCase(fetchpostfeed.fulfilled, (state, action) => {
                state.postsLoading = false;
                state.allfeedposts = action.payload.posts; // Storing fetched posts in "allfeedposts"
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchpostfeed.rejected, (state, action) => {
                state.postsLoading = false;
                state.error = action.payload;
            })
           // Like/Unlike Post
            .addCase(likePost.pending, (state, action) => {
                // Don't update the UI optimistically
            })
            .addCase(likePost.fulfilled, (state, action) => {
                // Use the API response to update the like status and count
                const postIndex = state.allfeedposts.findIndex(
                    (post) => post._id === action.payload.postId
                );
                if (postIndex !== -1) {
                    state.allfeedposts[postIndex].isLiked = action.payload.likeToggle;
                    state.allfeedposts[postIndex].likesCount = action.payload.likesCount; // Use the correct likes count from the API response
                }
            })
            .addCase(likePost.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { resetPosts } = postFeedSlice.actions;
export default postFeedSlice.reducer;