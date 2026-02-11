import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

/* ===============================
        INITIAL STATE
================================*/
const initialState = {
    // Trending PAGES
    trendingPages: [],
    trendingPagination: null,
    trendingLoading: false,

    // Recommended PAGES
    recommendedPages: [],
    recommendedPagination: null,
    recommendedLoading: false,

    // 🔥 NEW: Trending POSTS
    trendingPosts: [],
    trendingPostsPagination: null,
    trendingPostsLoading: false,

    // ✅ NEW — SINGLE PAGE DETAIL
    pageDetail: null,
    pageDetailLoading: false,

    // 🆕 PAGE POSTS
    pagePosts: [],
    pagePostsPagination: null,
    pagePostsLoading: false,


    error: null,
};


/* ===============================
    FETCH TRENDING PAGES
================================*/
export const fetchTrendingPages = createAsyncThunk(
    "trending/fetchTrendingPages",
    async ({ page = 1, limit = 10 }, thunkAPI) => {
        try {
            const res = await axios.get(`/trends/pages?page=${page}&limit=${limit}`);

            return {
                data: res.data?.data,
                pagination: res.data?.pagination,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch trending pages"
            );
        }
    }
);


/* ===============================
    FETCH RECOMMENDED PAGES
================================*/
export const fetchRecommendedPages = createAsyncThunk(
    "trending/fetchRecommendedPages",
    async ({ page = 1, limit = 10 }, thunkAPI) => {
        try {
            const res = await axios.get(
                `/pages/recommendations/activity?page=${page}&limit=${limit}`
            );

            return {
                data: res.data?.data,
                pagination: res.data?.pagination,
            };

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch recommended pages"
            );
        }
    }
);

/* ===============================
    🆕 FETCH PAGE POSTS
    API → /posts/page/:pageId
================================*/
export const fetchPagePosts = createAsyncThunk(
    "trending/fetchPagePosts",
    async ({ pageId, page = 1, limit = 10 }, thunkAPI) => {
        try {
            const res = await axios.get(
                `/posts/page/${pageId}?page=${page}&limit=${limit}`
            );

            return {
                posts: res.data?.data?.posts || [],
                pagination: res.data?.pagination,
            };

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch page posts"
            );
        }
    }
);


/* ===============================
    🔥 NEW — FETCH TRENDING POSTS
    API → /trends/posts
================================*/
export const fetchTrendingPosts = createAsyncThunk(
    "trending/fetchTrendingPosts",
    // 🔥 Fetch all trending posts in a single page
    async (_args, thunkAPI) => {
        try {
            // Set a very high limit so backend returns all items on page 1
            const res = await axios.get(`/trends/posts?page=1&limit=100000`);

            return {
                data: res.data?.data,          // trending posts array (all)
                pagination: res.data?.pagination,
            };

        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch trending posts"
            );
        }
    }
);


/* ===============================
    FETCH PAGE DETAIL BY ID
    API → /pages/:id
================================*/
export const fetchPageById = createAsyncThunk(
    "trending/fetchPageById",
    async (pageId, thunkAPI) => {
        try {
            const res = await axios.get(`/pages/${pageId}`);
            return res.data?.data; // 👈 sirf page ka data
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch page detail"
            );
        }
    }
);




/* ===============================
             SLICE
================================*/
const trendingSlice = createSlice({
    name: "trending",
    initialState,
    reducers: {
        resetTrending(state) {
            state.error = null;
            state.trendingLoading = false;
            state.recommendedLoading = false;
            state.trendingPostsLoading = false;
        },
    },

    extraReducers: (builder) => {
        builder

            /* ===== TRENDING PAGES ===== */
            .addCase(fetchTrendingPages.pending, (state) => {
                state.trendingLoading = true;
            })
            .addCase(fetchTrendingPages.fulfilled, (state, action) => {
                state.trendingLoading = false;
                state.trendingPages = action.payload.data;
                state.trendingPagination = action.payload.pagination;
            })
            .addCase(fetchTrendingPages.rejected, (state, action) => {
                state.trendingLoading = false;
                state.error = action.payload;
            })


            /* ===== RECOMMENDED PAGES ===== */
            .addCase(fetchRecommendedPages.pending, (state) => {
                state.recommendedLoading = true;
            })
            .addCase(fetchRecommendedPages.fulfilled, (state, action) => {
                state.recommendedLoading = false;
                state.recommendedPages = action.payload.data;
                state.recommendedPagination = action.payload.pagination;
            })
            .addCase(fetchRecommendedPages.rejected, (state, action) => {
                state.recommendedLoading = false;
                state.error = action.payload;
            })


            /* ===== 🔥 TRENDING POSTS ===== */
            .addCase(fetchTrendingPosts.pending, (state) => {
                state.trendingPostsLoading = true;
            })
            .addCase(fetchTrendingPosts.fulfilled, (state, action) => {
                state.trendingPostsLoading = false;
                state.trendingPosts = action.payload.data;
                state.trendingPostsPagination = action.payload.pagination;
            })
            .addCase(fetchTrendingPosts.rejected, (state, action) => {
                state.trendingPostsLoading = false;
                state.error = action.payload;
            })

            /* ===== PAGE DETAIL ===== */
            .addCase(fetchPageById.pending, (state) => {
                state.pageDetailLoading = true;
            })
            .addCase(fetchPageById.fulfilled, (state, action) => {
                state.pageDetailLoading = false;
                state.pageDetail = action.payload;
            })
            .addCase(fetchPageById.rejected, (state, action) => {
                state.pageDetailLoading = false;
                state.error = action.payload;
            })

            /* ===== PAGE POSTS ===== */
            .addCase(fetchPagePosts.pending, (state) => {
                state.pagePostsLoading = true;
            })
            .addCase(fetchPagePosts.fulfilled, (state, action) => {
                state.pagePostsLoading = false;
                state.pagePosts = action.payload.posts;
                state.pagePostsPagination = action.payload.pagination;
            })
            .addCase(fetchPagePosts.rejected, (state, action) => {
                state.pagePostsLoading = false;
                state.error = action.payload;
            })


    },
});

export const { resetTrending } = trendingSlice.actions;
export default trendingSlice.reducer;
