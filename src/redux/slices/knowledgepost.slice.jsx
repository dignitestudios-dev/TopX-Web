import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
    loading: false,
    error: null,
    success: null,
    loadingCreate: false,
    knowledgePages: [],   // list of pages
    pagination: null,     // pagination info

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

};

/* ===============================
     FETCH KNOWLEDGE PAGES
     API → /pages/knowledge?page=1&limit=10
================================*/
export const fetchMyKnowledgePages = createAsyncThunk(
    "knowledgepost/fetchMyKnowledgePages",
    async ({ page = 1, limit = 10 }, thunkAPI) => {
        try {
            const res = await axios.get(`/pages/knowledge?page=${page}&limit=${limit}`);
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

            return res.data?.data;   // created post object
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
            const res = await axios.get(`/knowledgeposts/page/${pageId}?page=${page}&limit=${limit}`);
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
            const res = await axios.get(`/knowledgeposts/feed?page=${page}&limit=${limit}`);

            return {
                data: res.data?.data,          // array of posts
                pagination: res.data?.pagination,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch feed posts"
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
            });

    },
});

export const { resetKnowledge } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
