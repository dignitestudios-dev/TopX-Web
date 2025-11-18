import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
    loading: false,
    error: null,
    success: null,
    loadingCreate: false,
    knowledgePages: [],   // list of pages
    pagination: null,     // pagination info
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


/* ===============================
             SLICE
================================*/
const knowledgeSlice = createSlice({
    name: "knowledgepost",
    initialState,
    reducers: {
        resetKnowledge(state) {
            state.error = null;
            state.success = null;
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
            });

    },
});

export const { resetKnowledge } = knowledgeSlice.actions;
export default knowledgeSlice.reducer;
