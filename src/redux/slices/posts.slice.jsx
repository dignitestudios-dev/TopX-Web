import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  error: null,
  success: false,
  postsLoading: false,
  isLoading: false,
  posts: [],
  pagination: null,
  pagepostLoading: false,
  pagepost: [],
  pageposterror: null,
  pagepostpagaintion: null,
  likeLoading: false,
  comments: [],
  commentsLoading: false,
  commentsError: null,
  commentsPagination: null,
};

// ====================================================
// 🚀 CREATE POST  (POST /posts)
// ====================================================
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create post",
      );
    }
  },
);
export const createStory = createAsyncThunk(
  "posts/createStory",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create post",
      );
    }
  },
);

export const deleteStory = createAsyncThunk(
  "posts/deleteStory",
  async (storyId, thunkAPI) => {
    try {
      const res = await axios.delete(`/stories/${storyId}`);
      return { storyId, data: res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete story",
      );
    }
  },
);

// export const deleteStory = createAsyncThunk(
//   "posts/deleteStory",
//   async (storyId, thunkAPI) => {
//     try {
//       const res = await axios.delete(`/stories/${storyId}`);
//       return { storyId, data: res.data };
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to delete story"
//       );
//     }
//   }
// );

// export const deleteStory = createAsyncThunk(
//   "posts/deleteStory",
//   async (storyId, thunkAPI) => {
//     try {
//       const res = await axios.delete(`/stories/${storyId}`);
//       return { storyId, data: res.data };
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to delete story"
//       );
//     }
//   }
// );

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async ({ postId }, thunkAPI) => {
    try {
      const res = await axios.delete(`/posts/${postId}`);
      return res.data; // { success, message, data:{Post} }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete Post",
      );
    }
  },
);
export const editPost = createAsyncThunk(
  "posts/editPost",
  async ({ postId, formData, isFormData = true }, thunkAPI) => {
    try {
      const config = isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : { headers: { "Content-Type": "application/json" } };
      const res = await axios.put(`/posts/${postId}`, formData, config);
      return res.data; // { success, message, data:{Post} }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to edit Post",
      );
    }
  },
);

// ====================================================
// 🚀 GET POSTS BY PAGE ID (GET /posts/page/:id)
// ====================================================
export const getPostsByPageId = createAsyncThunk(
  "posts/getPostsByPageId",
  async ({ pageId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/posts/page/${pageId}?page=${page}&limit=${limit}`,
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts",
      );
    }
  },
);

export const likePost = createAsyncThunk(
  "posts/MyPostlikePost",
  async ({ id, likeToggle, isPost }, thunkAPI) => {
    try {
      const body = isPost
        ? { post: id, likeToggle }
        : { comment: id, likeToggle };

      const res = await axios.post("/likes/post", body);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like/unlike",
      );
    }
  },
);

export const getMyPosts = createAsyncThunk(
  "posts/getMyPosts",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(`/posts/my?page=${page}&limit=${limit}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts",
      );
    }
  },
);

// ====================================================
// 🚀 ELEVATE POST (POST /posts/elevate/:postId)
// ====================================================
// export const elevatePost = createAsyncThunk(
//   "posts/elevatePost",
//   async ({ postId, duration }, thunkAPI) => {
//     try {
//       const body = {};
//       if (duration) {
//         body.duration = duration; // "24h", "7d", "1m", "manual"
//       }
//       const res = await axios.post(`/posts/elevate/${postId}`, body);
//       return res.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to elevate post",
//       );
//     }
//   },
// );

// export const demotePost = createAsyncThunk(
//   "posts/demotePost",
//   async (postId, thunkAPI) => {
//     try {
//       const res = await axios.post(`/posts/demote/${postId}`);
//       return res.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to demote post",
//       );
//     }
//   },
// );

// ====================================================
// 🚀 ELEVATE POST (POST /posts/elevate/:postId)
// ====================================================
// export const elevatePost = createAsyncThunk(
//   "posts/elevatePost",
//   async ({ postId, duration }, thunkAPI) => {
//     try {
//       const body = {};
//       if (duration) {
//         body.duration = duration; // "24h", "7d", "1m", "manual"
//       }
//       const res = await axios.post(`/posts/elevate/${postId}`, body);
//       return res.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to elevate post"
//       );
//     }
//   }
// );

// export const demotePost = createAsyncThunk(
//   "posts/demotePost",
//   async (postId, thunkAPI) => {
//     try {
//       const res = await axios.post(`/posts/demote/${postId}`);
//       return res.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || "Failed to demote post"
//       );
//     }
//   }
// );

// ====================================================
// 🚀 ELEVATE POST (POST /posts/elevate/:postId)
// ====================================================
export const elevatePost = createAsyncThunk(
  "posts/elevatePost",
  async ({ postId, duration }, thunkAPI) => {
    try {
      const body = {};
      if (duration) {
        body.duration = duration; // "24h", "7d", "1m", "manual"
      }
      const res = await axios.post(`/posts/elevate/${postId}`, body);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to elevate post"
      );
    }
  }
);

export const demotePost = createAsyncThunk(
  "posts/demotePost",
  async (postId, thunkAPI) => {
    try {
      const res = await axios.post(`/posts/demote/${postId}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to demote post"
      );
    }
  }
);

export const commentonpost = createAsyncThunk(
  "posts/commentonpost",
  async ({ postId, text }, thunkAPI) => {
    try {
      const body = {
        post: postId,
        text,
      };

      const res = await axios.post("/comments/post", body);
      return res.data; // { post, comment }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create comment",
      );
    }
  },
);

// ====================================================
// 🚀 DELETE COMMENT (DELETE /comments/post/:commentId)
// ====================================================
export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ commentId }, thunkAPI) => {
    try {
      const res = await axios.delete(`/comments/post/${commentId}`);
      return res.data; // { success, message, data:{commentId} }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete comment",
      );
    }
  },
);

// ====================================================
// 🚀 GET COMMENTS FOR A POST (GET /comments/post/:id)
// ====================================================
export const getcommentsofpost = createAsyncThunk(
  "posts/getcommentsofpost",
  async ({ postId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/comments/post/${postId}?page=${page}&limit=${limit}`,
      );
      return res.data; // { success, message, pagination, data: [] }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

// ====================================================
// SLICE
// ====================================================
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetPosts(state) {
      state.error = null;
      state.success = false;
      state.posts = [];
      state.postsLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ------------------
      // CREATE POST
      // ------------------
      .addCase(createPost.pending, (state) => {
        state.postsLoading = true;
        state.success = false;
      })

      .addCase(createPost.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.success = true;
        state.posts = [action.payload, ...state.posts];
      })

      .addCase(createPost.rejected, (state, action) => {
        state.postsLoading = false;
        state.error = action.payload;
      })
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.success = false;
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })

      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(editPost.pending, (state) => {
        state.isLoading = true;
        state.success = false;
      })

      .addCase(editPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
      })

      .addCase(editPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ------------------
      // ELEVATE POST
      // ------------------
      .addCase(elevatePost.pending, (state) => {
        state.isLoading = true;
        state.success = false;
      })
      .addCase(elevatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Optional: if API returns updated post, merge into pagepost/posts here
      })
      .addCase(elevatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ------------------
      // DEMOTE POST
      // ------------------
      .addCase(demotePost.pending, (state) => {
        state.isLoading = true;
        state.success = false;
      })
      .addCase(demotePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Optional: if API returns updated post, merge into pagepost/posts here
      })
      .addCase(demotePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ------------------
      // CREATE Story
      // ------------------
      .addCase(createStory.pending, (state) => {
        state.postsLoading = true;
        state.success = false;
      })

      .addCase(createStory.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.success = true;
      })

      .addCase(createStory.rejected, (state, action) => {
        state.postsLoading = false;
        state.error = action.payload;
      })

      // ------------------
      // DELETE STORY
      // ------------------
      .addCase(deleteStory.pending, (state) => {
        state.postsLoading = true;
        state.success = false;
      })

      .addCase(deleteStory.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.success = true;
      })

      .addCase(deleteStory.rejected, (state, action) => {
        state.postsLoading = false;
        state.error = action.payload;
      })

      // ------------------
      // GET MY POSTS
      // ------------------
      .addCase(getMyPosts.pending, (state) => {
        state.postsLoading = true;
      })

      .addCase(getMyPosts.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.posts = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      .addCase(getMyPosts.rejected, (state, action) => {
        state.postsLoading = false;
        state.error = action.payload;
      })

      // ------------------
      // LIKE POST OR COMMENT
      // ------------------
      .addCase(likePost.pending, (state) => {
        state.likeLoading = true;
      })

      .addCase(likePost.fulfilled, (state, action) => {
        state.likeLoading = false;
        const { post, user, likeToggle } = action.payload;

        // ✅ Update both state.posts (getMyPosts) AND state.pagepost (getPostsByPageId)
        if (post) {
          // Update in getMyPosts posts
          const postIndex = state.posts.findIndex((p) => p._id === post._id);
          if (postIndex !== -1) {
            state.posts[postIndex] = {
              ...state.posts[postIndex],
              ...post,
            };
          }

          // Update in getPostsByPageId posts
          const pagePostIndex = state.pagepost.findIndex(
            (p) => p._id === post._id,
          );
          if (pagePostIndex !== -1) {
            state.pagepost[pagePostIndex] = {
              ...state.pagepost[pagePostIndex],
              ...post,
            };
          }
        }
      })

      .addCase(likePost.rejected, (state, action) => {
        state.likeLoading = false;
        state.error = action.payload;
      })

      // ------------------
      // GET POSTS BY PAGE ID
      // ------------------
      .addCase(getPostsByPageId.pending, (state) => {
        state.pagepostLoading = true;
      })

      .addCase(getPostsByPageId.fulfilled, (state, action) => {
        state.pagepostLoading = false;
        state.pagepost = action.payload.data.posts;
        state.pagepostpagaintion = action.payload.pagination;
      })

      .addCase(getPostsByPageId.rejected, (state, action) => {
        state.pagepostLoading = false;
        state.pageposterror = action.payload;
      })

      // ------------------
      // CREATE COMMENT (REAL-TIME UPDATE)
      // ------------------
      .addCase(commentonpost.pending, (state) => {
        state.postsLoading = true;
      })

      .addCase(commentonpost.fulfilled, (state, action) => {
        state.postsLoading = false;

        const { post, comment } = action.payload;
        // ☝ Backend ALWAYS returns: { success, post, comment }

        // 🔥 1) Update post in My Posts
        if (post) {
          const myPostIndex = state.posts.findIndex((p) => p._id === post._id);
          if (myPostIndex !== -1) {
            state.posts[myPostIndex] = {
              ...state.posts[myPostIndex],
              ...post,
            };
          }

          // 🔥 2) Update post in Page Posts
          const pagePostIndex = state.pagepost.findIndex(
            (p) => p._id === post._id,
          );
          if (pagePostIndex !== -1) {
            state.pagepost[pagePostIndex] = {
              ...state.pagepost[pagePostIndex],
              ...post,
            };
          }
        }

        // 🔥 3) REAL-TIME COMMENT PUSH (MOST IMPORTANT)
        if (comment) {
          state.comments.unshift(comment);
          // OR: state.comments = [comment, ...state.comments];
        }
      })

      .addCase(commentonpost.rejected, (state, action) => {
        state.postsLoading = false;
        state.error = action.payload;
      })

      // ------------------
      // GET COMMENTS BY POST ID
      // ------------------
      .addCase(getcommentsofpost.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })

      .addCase(getcommentsofpost.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload.data;
        state.commentsPagination = action.payload.pagination;
      })

      .addCase(getcommentsofpost.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      })
      // ------------------
      // DELETE COMMENT
      // ------------------
      .addCase(deleteComment.pending, (state) => {
        state.commentsLoading = true;
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        state.commentsLoading = false;

        const deletedId = action.payload?.data?.commentId;

        if (deletedId) {
          // 🔥 Remove from comments list
          state.comments = state.comments.filter((c) => c._id !== deletedId);
        }
      })

      .addCase(deleteComment.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload;
      });
  },
});

export const { resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
