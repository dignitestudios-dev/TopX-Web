import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";
import Cookies from "js-cookie";

const initialState = {
  isLoading: false,
  error: null,
  success: null,
  allcollections: [],
  pagination: null,
  savedCollections: [],
  savedCollectionsPagination: null,
  removePageLoading: false,
  collectionNames: [],
  collectionNamesLoading: false,
};

// =============================
// GET COLLECTION NAMES (for unsubscribe modal)
// =============================
export const getCollectionNames = createAsyncThunk(
  "collections/getCollectionNames",
  async ({ limit = 10 }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.get(
        `/collections/names?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to fetch collections"
        );
      }

      return {
        list: res.data.data,
        pagination: res.data.pagination,
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch collections"
      );
    }
  }
);

// =============================
// GET MY COLLECTIONS
// =============================
export const getMyCollections = createAsyncThunk(
  "collections/getMyCollections",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.get(
        `/collections/my?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to fetch collections"
        );
      }

      return {
        list: res.data.data,
        pagination: res.data.pagination,
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch collections"
      );
    }
  }
);

// =============================
// GET MY Saved COLLECTIONS
// =============================

export const getMySavedCollections = createAsyncThunk(
  "collections/getMySavedCollections",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.get(
        `/collections/saved?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to fetch collections"
        );
      }

      return {
        list: res.data.data,
        pagination: res.data.pagination,
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch collections"
      );
    }
  }
);

// =============================
// Update MY Saved COLLECTIONS
// =============================
export const updateSavedCollections = createAsyncThunk(
  "collections/updateSavedCollections",
  async (payload, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.patch(`/collections/${payload}/save`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to create collection"
        );
      }

      return {
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create collection"
      );
    }
  }
);
// =============================
// ADD PAGE TO COLLECTIONS (SUBSCRIBE)
// =============================
export const addPageToCollections = createAsyncThunk(
  "collections/addPageToCollections",
  async ({ collections, page }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post(
        "/collections/addPage",
        { collections, page },
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
        collections,
        page,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add page"
      );
    }
  }
);

// =============================
// REMOVE PAGE FROM COLLECTIONS (UNSUBSCRIBE)
// =============================
export const removePageFromCollections = createAsyncThunk(
  "collections/removePageFromCollections",
  async ({ collections, page }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post(
        "/collections/removePage",
        { collections, page },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to remove page"
        );
      }

      return {
        message: res.data.message,
        collections,
        page,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove page"
      );
    }
  }
);

// =============================
// CREATE NEW COLLECTION
// =============================
export const createCollection = createAsyncThunk(
  "collections/createCollection",
  async (formData, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post("/collections", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to create collection"
        );
      }

      return {
        newCollection: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create collection"
      );
    }
  }
);
export const updateCollection = createAsyncThunk(
  "collections/updateCollection",
  async ({ formData, collectionId }, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.put(
        `/collections/names/${collectionId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to create collection"
        );
      }

      return {
        newCollection: res.data.data,
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create collection"
      );
    }
  }
);
export const RemoveSubscriptionCollection = createAsyncThunk(
  "collections/RemoveSubscriptionCollection",
  async (payload, thunkAPI) => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return thunkAPI.rejectWithValue("No access token found");

      const res = await axios.post(`/collections/delete/${payload}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to remove page"
        );
      }

      return {
        message: res.data.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove page"
      );
    }
  }
);
// =============================
// SLICE
// =============================
const collectionSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    resetCollections(state) {
      state.isLoading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ========== GET MY COLLECTIONS ==========
      .addCase(getMyCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(getMyCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allcollections = action.payload.list;
        state.pagination = action.payload.pagination;
        state.success = action.payload.message;
      })
      .addCase(getMyCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getMySavedCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(getMySavedCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedCollections = action.payload.list;
        state.success = action.payload.message;
      })
      .addCase(getMySavedCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSavedCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateSavedCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(updateSavedCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ========== CREATE COLLECTION ==========
      .addCase(createCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.allcollections.unshift(action.payload.newCollection);
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.allcollections.unshift(action.payload.newCollection);
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(RemoveSubscriptionCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(RemoveSubscriptionCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(RemoveSubscriptionCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addPageToCollections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addPageToCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;

        // realtime update (increment pagesCount)
        const affected = action.payload.collections;

        state.allcollections = state.allcollections.map((col) => {
          if (affected.includes(col._id)) {
            return {
              ...col,
              pagesCount: (col.pagesCount || 0) + 1,
            };
          }
          return col;
        });
      })
      .addCase(addPageToCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removePageFromCollections.pending, (state) => {
        state.removePageLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(removePageFromCollections.fulfilled, (state, action) => {
        state.removePageLoading = false;
        state.success = action.payload.message;

        const affected = action.payload.collections;

        state.allcollections = state.allcollections.map((col) => {
          if (affected?.includes(col._id)) {
            return {
              ...col,
              pagesCount: Math.max((col.pagesCount || 1) - 1, 0),
            };
          }
          return col;
        });
      })
      .addCase(removePageFromCollections.rejected, (state, action) => {
        state.removePageLoading = false;
        state.error = action.payload;
      })
      // ========== GET COLLECTION NAMES ==========
      .addCase(getCollectionNames.pending, (state) => {
        state.collectionNamesLoading = true;
        state.error = null;
      })
      .addCase(getCollectionNames.fulfilled, (state, action) => {
        state.collectionNamesLoading = false;
        state.collectionNames = action.payload.list;
      })
      .addCase(getCollectionNames.rejected, (state, action) => {
        state.collectionNamesLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCollections } = collectionSlice.actions;
export default collectionSlice.reducer;
