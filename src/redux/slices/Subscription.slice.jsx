import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";
const initialState = {
  error: null,
  success: false,
  subcriptionLoading: false,
  mySubscriptions: null,
  CollectionFeeds: null,
  PageStories: null,
  mySubscriptionspagaintion: null,
  pagination: null,
  isLoading: false,
};
// ====================================================
// 🚀 Get My Collections  (Get)
// ====================================================
export const getMySubsctiptions = createAsyncThunk(
  "subscriptions/getMySubsctiptions",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/collections/my?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

// =============================
// get Collections Feeds By Id
// =============================

export const getCollectionFeed = createAsyncThunk(
  "subscriptions/getCollectionFeed",
  async ({ id, page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/posts/feed/collection/${id}?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const getPageStories = createAsyncThunk(
  "/stories/page/id",
  async ({ id, page = 1, limit = 100, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/stories/page/${id}?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);
export const getCollectionStories = createAsyncThunk(
  "/stories/collection/id",
  async ({ id, page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/stories/collection/${id}?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

// =============================
// ADD PAGE TO COLLECTIONS (SUBSCRIBE)
// =============================
export const createPageToCollections = createAsyncThunk(
  "collections/createPageToCollections",
  async ({ pages, collectionId }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");
      const res = await axios.post(
        `/collections/addPages/${collectionId}`,
        { pages },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to add page"
        );
      }

      return {
        message: res.data.message,
      };
    } catch (error) {
      console.log("API ERROR:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add page"
      );
    }
  }
);
export const LikeOtherStories = createAsyncThunk(
  "stories/id/like",
  async ({ storyId }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");
      const res = await axios.post(`/stories/${storyId}/like`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to add page"
        );
      }

      return {
        message: res.data.message,
      };
    } catch (error) {
      console.log("API ERROR:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add page"
      );
    }
  }
);
export const viewOtherStories = createAsyncThunk(
  "stories/id/view",
  async ({ storyId }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");
      const res = await axios.post(`/stories/${storyId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to add page"
        );
      }

      return {
        message: res.data.message,
      };
    } catch (error) {
      console.log("API ERROR:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add page"
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

// ====================================================
// SLICE
// ====================================================
const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    resetSubscriptions(state) {
      state.error = null;
      state.success = false;
      state.mySubscriptions = [];
      state.subcriptionLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------
      // GET POSTS BY PAGE ID
      // ------------------
      .addCase(getMySubsctiptions.pending, (state) => {
        state.subcriptionLoading = true;
      })
      .addCase(getMySubsctiptions.fulfilled, (state, action) => {
        state.subcriptionLoading = false;
        state.mySubscriptions = action.payload.data;
        state.mySubscriptionspagaintion = action.payload.pagination;
      })
      .addCase(getMySubsctiptions.rejected, (state, action) => {
        state.subcriptionLoading = false;
        state.error = action.payload;
      })
      .addCase(getCollectionFeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCollectionFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.CollectionFeeds = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getCollectionFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getPageStories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPageStories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.PageStories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPageStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getCollectionStories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCollectionStories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.PageStories = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getCollectionStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ------------------
      // Add Pages  To Collections
      // ------------------
      .addCase(createPageToCollections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPageToCollections.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPageToCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(LikeOtherStories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(LikeOtherStories.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(LikeOtherStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(viewOtherStories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(viewOtherStories.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(viewOtherStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Like/Unlike Post
      .addCase(likePost.pending, (state, action) => {
        const { postId, likeToggle } = action.meta.arg;

        // Optimistic update
        const post = state.CollectionFeeds.find((p) => p._id === postId);
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
      });
  },
});

export const { resetSubscriptions } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
