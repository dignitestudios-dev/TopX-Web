import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  loading: false,
  error: null,
  success: null,
  loadingCreate: false,
  knowledgePages: [], // list of pages
  pagination: null, // pagination info

  //get knowleadgepost detail
  knowledgePageDetail: null,
  knowledgePagePosts: [],
  knowledgePagePagination: null,
  knowledgePageLoading: false,
  deleteLoading: false,
  deleteSuccess: false,

  //Knowleadge Feed
  knowledgeFeed: [],
  knowledgeFeedPagination: null,
  knowledgeFeedLoading: false,

  commentLoading: false,
  getCommentsLoading: false,
  deleteCommentLoading: false,
  postComments: [],
};

/* ===============================
     FETCH KNOWLEDGE PAGES
     API → /pages/knowledge?page=1&limit=10
================================*/
export const fetchMyKnowledgePages = createAsyncThunk(
  "knowledgepost/fetchMyKnowledgePages",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/pages/knowledge?page=${page}&limit=${limit}`
      );
      return {
        data: res.data?.data,
        pagination: res.data?.pagination,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch knowledge pages"
      );
    }
  }
);

/* ===============================
      CREATE KNOWLEDGE PAGE
      API → POST /pages
      BODY → FormData
================================*/
export const createKnowledgePage = createAsyncThunk(
  "knowledgepost/createKnowledgePage",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/pages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data?.data; // created page object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create knowledge page"
      );
    }
  }
);

export const createKnowledgePost = createAsyncThunk(
  "knowledgepost/createKnowledgePost",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/knowledgeposts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data?.data; // created post object
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create knowledge post"
      );
    }
  }
);

export const getKnowledgePostDetail = createAsyncThunk(
  "knowledgepost/getKnowledgePostDetail",
  async ({ pageId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/knowledgeposts/page/${pageId}?page=${page}&limit=${limit}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch knowledge page detail"
      );
    }
  }
);

/* ===============================
   DELETE KNOWLEDGE POST
   API → DELETE /knowledgeposts/:postId
================================*/
export const deleteKnowledgePost = createAsyncThunk(
  "knowledgepost/deleteKnowledgePost",
  async (postId, thunkAPI) => {
    try {
      const res = await axios.delete(`/knowledgeposts/${postId}`);
      return { postId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

/* ===============================
     FETCH KNOWLEDGE FEED (GLOBAL)
     API → /knowledgeposts/feed?page=1&limit=10
================================*/
export const fetchKnowledgeFeed = createAsyncThunk(
  "knowledgepost/fetchKnowledgeFeed",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/knowledgeposts/feed?page=${page}&limit=${limit}`
      );

      return {
        data: res.data?.data, // array of posts
        pagination: res.data?.pagination,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch feed posts"
      );
    }
  }
);

// Comment


// Like/Unlike post API call
export const likePost = createAsyncThunk(
  "likes/Knowledge",
  async ({ postId, likeToggle }, thunkAPI) => {
    try {
      const res = await axios.post("/likes/Knowledge", {
        knowledgePost: postId,
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

export const KnowledgeCreateComment = createAsyncThunk(
  "comments/knowledge",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post("/comments/knowledge", data);

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to like/unlike post"
      );
    }
  }
);

export const KnowledgeUpdateComment = createAsyncThunk(
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

export const KnowledgeDeleteComment = createAsyncThunk(
  "comments/post/delete/id",
  async (data, thunkAPI) => {
    try {
      const res = await axios.delete(`/comments/knowledge/${data}`);

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

export const KnowledgeGetComment = createAsyncThunk(
  "posts/commentsGet",
  async (postId, thunkAPI) => {
    try {
      const res = await axios.get(`/comments/knowledge/post/${postId}`);

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
const knowledgeSlice = createSlice({
  name: "knowledgepost",
  initialState,
  reducers: {
    resetKnowledge(state) {
      state.error = null;
      state.success = false;
      state.deleteSuccess = false;
      // state.knowledgePages = [];
      // state.pagination = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyKnowledgePages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyKnowledgePages.fulfilled, (state, action) => {
        state.loading = false;
        state.knowledgePages = action.payload.data;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchMyKnowledgePages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createKnowledgePage.pending, (state) => {
        state.loadingCreate = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createKnowledgePage.fulfilled, (state, action) => {
        state.loadingCreate = false;
        state.success = true;

        // Optional: add new page on top
        state.knowledgePages.unshift(action.payload);
      })
      .addCase(createKnowledgePage.rejected, (state, action) => {
        state.loadingCreate = false;
        state.error = action.payload;
      })

      //Create Knowleadge Post
      .addCase(createKnowledgePost.pending, (state) => {
        state.loadingCreate = true;
        state.error = null;
      })
      .addCase(createKnowledgePost.fulfilled, (state, action) => {
        state.loadingCreate = false;
        state.success = true;

        // Optional: Push newly created POST inside selected page
        // or manage separately depending on UI need
      })
      .addCase(createKnowledgePost.rejected, (state, action) => {
        state.loadingCreate = false;
        state.error = action.payload;
      })
      //getknowledgepost detail
      .addCase(getKnowledgePostDetail.pending, (state) => {
        state.knowledgePageLoading = true;
      })

      .addCase(getKnowledgePostDetail.fulfilled, (state, action) => {
        state.knowledgePageLoading = false;
        state.knowledgePageDetail = action.payload.data.page;
        state.knowledgePagePosts = action.payload.data.posts;
        state.knowledgePagePagination = action.payload.pagination;
      })

      .addCase(getKnowledgePostDetail.rejected, (state, action) => {
        state.knowledgePageLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteKnowledgePost.pending, (state) => {
        state.deleteLoading = true;
        state.deleteSuccess = false;
      })

      .addCase(deleteKnowledgePost.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;

        state.knowledgePagePosts = state.knowledgePagePosts.filter(
          (post) => post._id !== action.payload.postId
        );
      })

      .addCase(deleteKnowledgePost.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = false;
        state.error = action.payload;
      })

      // FETCH KNOWLEDGE FEED
      .addCase(fetchKnowledgeFeed.pending, (state) => {
        state.knowledgeFeedLoading = true;
        state.error = null;
      })
      .addCase(fetchKnowledgeFeed.fulfilled, (state, action) => {
        state.knowledgeFeedLoading = false;
        state.knowledgeFeed = action.payload.data;
        state.knowledgeFeedPagination = action.payload.pagination;
      })
      .addCase(fetchKnowledgeFeed.rejected, (state, action) => {
        state.knowledgeFeedLoading = false;
        state.error = action.payload;
      })
      //   Knowledge POst COmment

      //   Comment on Post
      .addCase(KnowledgeCreateComment.pending, (state) => {
        state.commentLoading = true;
      })
      .addCase(KnowledgeCreateComment.fulfilled, (state, action) => {
        state.commentLoading = false;
      })
      .addCase(KnowledgeCreateComment.rejected, (state, action) => {
        state.commentLoading = false;
        state.error = action.payload;
      })
      .addCase(KnowledgeUpdateComment.pending, (state) => {
        state.commentLoading = true;
      })
      .addCase(KnowledgeUpdateComment.fulfilled, (state, action) => {
        state.commentLoading = false;
      })
      .addCase(KnowledgeUpdateComment.rejected, (state, action) => {
        state.commentLoading = false;
        state.error = action.payload;
      })
      .addCase(KnowledgeGetComment.pending, (state) => {
        state.getCommentsLoading = true;
      })
      .addCase(KnowledgeGetComment.fulfilled, (state, action) => {
        state.getCommentsLoading = false;
        state.postComments = action.payload;
      })
      .addCase(KnowledgeGetComment.rejected, (state, action) => {
        state.getCommentsLoading = false;
        state.error = action.payload;
      })
      .addCase(KnowledgeDeleteComment.pending, (state) => {
        state.deleteCommentLoading = true;
      })
      .addCase(KnowledgeDeleteComment.fulfilled, (state, action) => {
        state.deleteCommentLoading = false;
      })
      .addCase(KnowledgeDeleteComment.rejected, (state, action) => {
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
        const { postId, likeToggle } = action.meta.arg;

        // Optimistic update
        const post = state.knowledgeFeed.find((p) => p._id === postId);
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

        const post = state.knowledgeFeed.find((p) => p._id === postId);
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

export const { resetKnowledge } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
