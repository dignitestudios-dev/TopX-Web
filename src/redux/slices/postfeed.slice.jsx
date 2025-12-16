import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Initial state for the post feed
const initialState = {
  allfeedposts: [], // Storing posts fetched from the API
  pagination: null,
  postsLoading: false,
  commentLoading: false,
  getCommentsLoading: false,
  deleteCommentLoading: false,
  postComments: [],
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
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
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like/unlike post"
      );
    }
  }
);

// Comment

export const createComment = createAsyncThunk(
  "posts/commentPost",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post("/comments/post", data);

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like/unlike post"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/post/delete/id",
  async (data, thunkAPI) => {
    try {
      const res = await axios.delete(`/comments/post/${data}`);

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);
export const elevateComment = createAsyncThunk(
  "comments/post/elevate/id",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post(`/comments/post/${data}/elevate`);

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

export const getComment = createAsyncThunk(
  "posts/commentsGet",
  async (postId, thunkAPI) => {
    try {
      const res = await axios.get(`/comments/post/${postId}`);

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like/unlike post"
      );
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
      //   Comment on Post
      .addCase(createComment.pending, (state) => {
        state.commentLoading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.commentLoading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.commentLoading = false;
        state.error = action.payload;
      })
      .addCase(getComment.pending, (state) => {
        state.getCommentsLoading = true;
      })
      .addCase(getComment.fulfilled, (state, action) => {
        state.getCommentsLoading = false;
        state.postComments = action.payload;
      })
      .addCase(getComment.rejected, (state, action) => {
        state.getCommentsLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteComment.pending, (state) => {
        state.deleteCommentLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deleteCommentLoading = false;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteCommentLoading = false;
        state.error = action.payload;
      })
      .addCase(elevateComment.pending, (state) => {
        state.deleteCommentLoading = true;
      })
      .addCase(elevateComment.fulfilled, (state, action) => {
        state.deleteCommentLoading = false;
      })
      .addCase(elevateComment.rejected, (state, action) => {
        state.deleteCommentLoading = false;
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
