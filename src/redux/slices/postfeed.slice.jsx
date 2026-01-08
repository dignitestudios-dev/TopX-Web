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

// utils/localLikes.js
export const getLocalLikes = () => {
  return JSON.parse(localStorage.getItem("postLikes") || "{}");
};

export const saveLocalLike = (postId, isLiked, likesCount) => {
  const likes = getLocalLikes();
  likes[postId] = { isLiked, likesCount };
  localStorage.setItem("postLikes", JSON.stringify(likes));
};

export const mergeLikesWithAPI = (posts) => {
  const localLikes = getLocalLikes();
  return posts.map((post) => {
    const local = localLikes[post._id];
    return {
      ...post,
      isLiked: local?.isLiked ?? post.isLiked,
      likesCount: local?.likesCount ?? post.likesCount,
    };
  });
};

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

export const updateComment = createAsyncThunk(
  "posts/updateComment",
  async ({ commentId, text }, thunkAPI) => {
    try {
      const res = await axios.patch(`/comments/post/${commentId}`, {
        text,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update comment"
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

export const likeComment = createAsyncThunk(
  "posts/likeComment",
  async ({ commentId, likeToggle }, thunkAPI) => {
    try {
      const res = await axios.post("/likes/post", {
        comment: commentId,
        likeToggle, // true or false
      });

      return {
        commentId,
        likeToggle: res.data.data.likeToggle,
        likesCount: res.data.data.likesCount,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like/unlike comment"
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
        const postsFromAPI = action.payload.posts;

        state.postsLoading = false;
        state.allfeedposts = postsFromAPI.map((post) => {
          const localLikes = JSON.parse(
            localStorage.getItem("postLikes") || "{}"
          );
          const local = localLikes[post._id];

          return {
            ...post,
            isLiked: local?.isLiked ?? post.isLiked,
            likesCount: local?.likesCount ?? post.likesCount,
          };
        });
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
      .addCase(updateComment.pending, (state) => {
        state.commentLoading = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.commentLoading = false;
      })
      .addCase(updateComment.rejected, (state, action) => {
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
        // Update the comment in postComments to mark it as elevated
        const updateCommentElevated = (comments) => {
          return comments.map((comment) => {
            if (comment._id === action.payload?._id) {
              return { ...comment, isElevated: true };
            }
            if (comment.replies?.length) {
              return {
                ...comment,
                replies: updateCommentElevated(comment.replies),
              };
            }
            return comment;
          });
        };
        if (state.postComments?.length) {
          state.postComments = updateCommentElevated(state.postComments);
        }
      })
      .addCase(elevateComment.rejected, (state, action) => {
        state.deleteCommentLoading = false;
        state.error = action.payload;
      })
      // Like/Unlike Post
      .addCase(likePost.pending, (state, action) => {
        const { postId, likeToggle } = action.meta.arg;

        // Optimistic update
        const post = state.allfeedposts?.find((p) => p._id === postId);
        if (post) {
          post.isLiked = likeToggle;
          post.likesCount = likeToggle
            ? post.likesCount + 1
            : post.likesCount - 1;

          // Save to localStorage
          const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
          likes[postId] = {
            isLiked: post.isLiked,
            likesCount: post.likesCount,
          };
          localStorage.setItem("postLikes", JSON.stringify(likes));
        }
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likeToggle, likesCount: apiLikes } = action.payload;

        const post = state.allfeedposts?.find((p) => p._id === postId);
        if (post) {
          // Merge API likes with local increment/decrement
          const localLikes = JSON.parse(
            localStorage.getItem("postLikes") || "{}"
          );
          const local = localLikes[postId];

          post.isLiked = likeToggle;
          post.likesCount = local?.likesCount ?? apiLikes; // Use local increment if exists

          // Save merged to localStorage
          localLikes[postId] = {
            isLiked: post.isLiked,
            likesCount: post.likesCount,
          };
          localStorage.setItem("postLikes", JSON.stringify(localLikes));
        }
      })

      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(likeComment.pending, (state, action) => {
        const { commentId, likeToggle } = action.meta.arg;
        const updateLike = (commentsList) => {
          commentsList.forEach((c) => {
            if (c._id === commentId) {
              const prevLiked = c.isLiked ?? false;
              c.isLiked = likeToggle;

              // Correct likesCount, never negative
              if (likeToggle && !prevLiked) {
                // Like: increment
                c.likesCount = (c.likesCount ?? 0) + 1;
              } else if (!likeToggle && prevLiked) {
                // Unlike: decrement, but minimum 0
                c.likesCount = Math.max((c.likesCount ?? 1) - 1, 0);
              }

              // Save to localStorage
              const localLikes = JSON.parse(
                localStorage.getItem("commentLikes") || "{}"
              );
              localLikes[commentId] = {
                isLiked: c.isLiked,
                likesCount: c.likesCount,
              };
              localStorage.setItem("commentLikes", JSON.stringify(localLikes));
            }

            // Recurse into replies
            if (c.replies && c.replies.length > 0) updateLike(c.replies);
          });
        };

        updateLike(state.postComments);
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, likeToggle, likesCount } = action.payload;

        const updateLike = (commentsList) => {
          commentsList.forEach((c) => {
            if (c._id === commentId) {
              const localLikes = JSON.parse(
                localStorage.getItem("commentLikes") || "{}"
              );
              const local = localLikes[commentId];

              // Merge API likes with local optimistic value
              c.isLiked = likeToggle;
              c.likesCount = local?.likesCount ?? likesCount;

              localLikes[commentId] = {
                isLiked: c.isLiked,
                likesCount: c.likesCount,
              };
              localStorage.setItem("commentLikes", JSON.stringify(localLikes));
            }

            if (c.replies && c.replies.length > 0) updateLike(c.replies);
          });
        };

        updateLike(state.postComments);
      })
      .addCase(likeComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetPosts } = postFeedSlice.actions;
export default postFeedSlice.reducer;
