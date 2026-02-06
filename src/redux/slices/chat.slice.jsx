import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

const initialState = {
  chats: [],
  groupChats: [],
  chatDetail: null,
  chatDetailMessages: [],
  chatDetailPagination: null,
  currentChatId: null,
  pagination: null,
  groupChatsPagination: null,
  chatsLoading: false,
  groupChatsLoading: false,
  chatDetailLoading: false,
  error: null,
  chatDetailError: null,
  // Group related
  searchUsers: [],
  searchUsersPagination: null,
  searchUsersLoading: false,
  groupInfo: null,
  groupInfoLoading: false,
  updateGroupLoading: false,
  toggleMuteLoading: false,
  createGroupLoading: false,
  addMemberLoading: false,
};

export const fetchIndividualChats = createAsyncThunk(
  "chat/fetchIndividualChats",
  async ({ page = 1, limit = 5, type = "active" }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/chats/individual/recent?page=${page}&limit=${limit}&type=${type}`,
      );

      return {
        data: res.data?.data,
        pagination: res.data?.pagination,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch chats",
      );
    }
  },
);

/* ===============================
   GET INDIVIDUAL CHAT DETAIL
================================*/
export const fetchIndividualChatDetail = createAsyncThunk(
  "chat/fetchIndividualChatDetail",
  async ({ chatId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      // Try with history endpoint first
      let res;
      try {
        res = await axios.get(
          `/chats/individual/${chatId}/history?page=${page}&limit=${limit}`,
        );
      } catch (historyError) {
        // Fallback to old endpoint if history endpoint doesn't exist
        res = await axios.get(`/chats/individual/${chatId}`);
      }
      return {
        messages: res.data?.data || [],
        pagination: res.data?.pagination || null,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat detail",
      );
    }
  },
);

/* ===============================
   ACCEPT CHAT REQUEST
   API → PUT /chats/individual/{chatId}
================================*/
export const acceptChatRequest = createAsyncThunk(
  "chat/acceptChatRequest",
  async (chatId, thunkAPI) => {
    try {
      const res = await axios.post(`/chats/individual/${chatId}`);
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to accept chat request",
        );
      }
      return { chatId, data: res.data?.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to accept chat request",
      );
    }
  },
);

/* ===============================
   REJECT CHAT REQUEST
   API → DELETE /chats/individual/{chatId}
================================*/
export const rejectChatRequest = createAsyncThunk(
  "chat/rejectChatRequest",
  async (chatId, thunkAPI) => {
    try {
      const res = await axios.delete(`/chats/individual/${chatId}`);
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to reject chat request",
        );
      }
      return { chatId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reject chat request",
      );
    }
  },
);

/* ===============================
   SEARCH USERS FOR GROUP
   API → GET /users/search?page=1&limit=10
================================*/
export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const url = `/users/search?page=${page}&limit=${limit}&search=${search}`;
      const res = await axios.get(url);
      return {
        data: res.data?.data || [],
        pagination: res.data?.pagination || null,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to search users",
      );
    }
  },
);

/* ===============================
   CREATE GROUP
   API → POST /chats/group
   Body: FormData (name, bio, image)
================================*/
export const createGroup = createAsyncThunk(
  "chat/createGroup",
  async (formData, thunkAPI) => {
    try {
      const res = await axios.post("/chats/group", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to create group",
        );
      }
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create group",
      );
    }
  },
);

/* ===============================
   GET GROUP INFO
   API → GET /chats/group/{groupId}
================================*/
export const getGroupInfo = createAsyncThunk(
  "chat/getGroupInfo",
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/chats/group/${groupId}`);
      // API returns { data: { info: {...}, members: [...], isNotificationMute: false, gallary: [] } }
      return res.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch group info",
      );
    }
  },
);

/* ===============================
   UPDATE GROUP INFO
   API → PUT /chats/group/{groupId}
   Body: FormData (name, bio, image)
================================*/
export const updateGroupInfo = createAsyncThunk(
  "chat/updateGroupInfo",
  async ({ groupId, formData }, thunkAPI) => {
    try {
      const res = await axios.put(`/chats/group/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to update group info",
        );
      }
      return { groupId, data: res.data?.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update group info",
      );
    }
  },
);

/* ===============================
   TOGGLE GROUP MUTE
   API → PATCH /chats/group/{groupId}
   Body: { mute: "enable" | "disable" }
================================*/
export const toggleGroupMute = createAsyncThunk(
  "chat/toggleGroupMute",
  async ({ groupId, mute }, thunkAPI) => {
    try {
      const res = await axios.patch(`/chats/group/${groupId}`, { mute });
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to toggle mute",
        );
      }
      return { groupId, isNotificationMute: mute === "enable" };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to toggle mute",
      );
    }
  },
);

/* ===============================
   ADD GROUP MEMBERS
   API → POST /chats/group/{groupId}/member
   Body: { memberIds: ["id1", "id2"], groupId: "..." }
================================*/
export const addGroupMembers = createAsyncThunk(
  "chat/addGroupMembers",
  async ({ groupId, memberIds }, thunkAPI) => {
    try {
      const res = await axios.post(`/chats/group/${groupId}/member`, {
        memberIds,
        groupId,
      });
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to add members",
        );
      }
      return { groupId, members: res.data?.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add members",
      );
    }
  },
);

/* ===============================
   REMOVE GROUP MEMBER
   API → POST /chats/group/member/remove
   Body: { memberId: "...", groupId: "..." }
================================*/
export const removeGroupMember = createAsyncThunk(
  "chat/removeGroupMember",
  async ({ memberId, groupId }, thunkAPI) => {
    try {
      const res = await axios.post("/chats/group/member/remove", {
        memberId,
        groupId,
      });
      if (!res.data?.success) {
        return thunkAPI.rejectWithValue(
          res.data?.message || "Failed to remove member",
        );
      }
      return { memberId, groupId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove member",
      );
    }
  },
);

/* ===============================
   FETCH GROUP CHATS
   API → GET /chats/group/recent?page=1&limit=5
================================*/
export const fetchGroupChats = createAsyncThunk(
  "chat/fetchGroupChats",
  async ({ page = 1, limit = 5 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/chats/group/recent?page=${page}&limit=${limit}`,
      );
      return {
        data: res.data?.data || [],
        pagination: res.data?.pagination || null,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch group chats",
      );
    }
  },
);

/* ===============================
   FETCH GROUP CHAT HISTORY
   API → GET /chats/group/{groupId}/history?page=1&limit=5
================================*/
export const fetchGroupChatHistory = createAsyncThunk(
  "chat/fetchGroupChatHistory",
  async ({ groupId, page = 1, limit = 5 }, thunkAPI) => {
    try {
      const res = await axios.get(
        `/chats/group/${groupId}/history?page=${page}&limit=${limit}`,
      );
      // API returns { data: { messages: [...], isRemoved: false, selfRemoved: false }, pagination: {...} }
      return {
        messages: res.data?.data?.messages || res.data?.data || [],
        pagination: res.data?.pagination || null,
        isRemoved: res.data?.data?.isRemoved || false,
        selfRemoved: res.data?.data?.selfRemoved || false,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch group chat history",
      );
    }
  },
);

//Fetch LiveChat History
export const fetchLiveChatHistory = createAsyncThunk(
  "chat/fetchLiveChatHistory",
  async ({ chatId, page = 1, limit = 5 }, thunkAPI) => {
    try {
        console.log(chatId,"chatId")
      const res = await axios.get(
        `/chats/live/${chatId}/history?page=${page}&limit=${limit}`,
      );
      return {
        messages: res.data?.data || [],
        pagination: res.data?.pagination || null,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch live chat history",
      );
    }
  },
);

/* ===============================
             SLICE
================================*/
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChatState(state) {
      state.error = null;
      state.chatDetailError = null;
      state.chatsLoading = false;
      state.chatDetailLoading = false;
    },

    resetChatDetail(state) {
      state.chatDetail = null;
      state.chatDetailMessages = [];
      state.chatDetailPagination = null;
      state.chatDetailError = null;
      state.currentChatId = null;
    },

    setCurrentChatId(state, action) {
      state.currentChatId = action.payload;
    },

    addMessage(state, action) {
      const { chatId, message, unreadCount } = action.payload;
      // Add to chatDetailMessages if it's the current chat
      if (state.currentChatId === chatId) {
        // Check if message already exists to prevent duplicates
        const messageExists = state.chatDetailMessages.some(
          (msg) => msg._id === message._id,
        );
        if (!messageExists) {
          state.chatDetailMessages = [...state.chatDetailMessages, message];
        }
      }
      // Update the chat list lastMessage
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = message;
        if (state.currentChatId !== chatId) {
          state.chats[chatIndex].unreadCount =
            (state.chats[chatIndex].unreadCount || 0) + unreadCount;
        }
      }
      // Also check group chats
      const groupChatIndex = state.groupChats.findIndex(
        (chat) => chat._id === chatId,
      );
      if (groupChatIndex !== -1) {
        state.groupChats[groupChatIndex].lastMessage = message;
        if (state.currentChatId !== chatId) {
          state.groupChats[groupChatIndex].unreadCount =
            (state.groupChats[groupChatIndex].unreadCount || 0) + unreadCount;
        }
      }
    },

    markChatAsRead(state, action) {
      const { chatId } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
      const groupChatIndex = state.groupChats.findIndex(
        (chat) => chat._id === chatId,
      );
      if (groupChatIndex !== -1) {
        state.groupChats[groupChatIndex].unreadCount = 0;
      }
    },

    increaseUnread(state, action) {
      const { chatId } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount =
          (state.chats[chatIndex].unreadCount || 0) + 1;
      }
      const groupChatIndex = state.groupChats.findIndex(
        (chat) => chat._id === chatId,
      );
      if (groupChatIndex !== -1) {
        state.groupChats[groupChatIndex].unreadCount =
          (state.groupChats[groupChatIndex].unreadCount || 0) + 1;
      }
    },

    removeChat(state, action) {
      const { chatId } = action.payload;
      state.chats = state.chats.filter((chat) => chat._id !== chatId);
      state.groupChats = state.groupChats.filter((chat) => chat._id !== chatId);
      if (state.currentChatId === chatId) {
        state.chatDetail = null;
        state.chatDetailMessages = [];
        state.currentChatId = null;
      }
    },

    blockChat(state, action) {
      const { chatId } = action.payload;
      // Mark as blocked, perhaps disable sending
      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].blocked = true;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== FETCH CHAT LIST ===== */
      .addCase(fetchIndividualChats.pending, (state) => {
        state.chatsLoading = true;
      })
      .addCase(fetchIndividualChats.fulfilled, (state, action) => {
        state.chatsLoading = false;
        state.chats = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchIndividualChats.rejected, (state, action) => {
        state.chatsLoading = false;
        state.error = action.payload;
      })

      /* ===== FETCH CHAT DETAIL ===== */
      .addCase(fetchIndividualChatDetail.pending, (state) => {
        state.chatDetailLoading = true;
      })
      .addCase(fetchIndividualChatDetail.fulfilled, (state, action) => {
        state.chatDetailLoading = false;
        state.chatDetailMessages = (action.payload.messages || []).reverse();
        state.chatDetailPagination = action.payload.pagination;
        state.currentChatId = action.meta.arg?.chatId || action.meta.arg; // chatId
      })
      .addCase(fetchIndividualChatDetail.rejected, (state, action) => {
        state.chatDetailLoading = false;
        state.chatDetailError = action.payload;
      })

      /* ===== ACCEPT CHAT REQUEST ===== */
      .addCase(acceptChatRequest.pending, (state) => {
        state.chatsLoading = true;
      })
      .addCase(acceptChatRequest.fulfilled, (state, action) => {
        state.chatsLoading = false;
        // Remove from requests list (inactive chats)
        state.chats = state.chats.filter(
          (chat) => chat._id !== action.payload.chatId,
        );
      })
      .addCase(acceptChatRequest.rejected, (state, action) => {
        state.chatsLoading = false;
        state.error = action.payload;
      })

      /* ===== REJECT CHAT REQUEST ===== */
      .addCase(rejectChatRequest.pending, (state) => {
        state.chatsLoading = true;
      })
      .addCase(rejectChatRequest.fulfilled, (state, action) => {
        state.chatsLoading = false;
        // Remove from requests list
        state.chats = state.chats.filter(
          (chat) => chat._id !== action.payload.chatId,
        );
      })
      .addCase(rejectChatRequest.rejected, (state, action) => {
        state.chatsLoading = false;
        state.error = action.payload;
      })

      /* ===== SEARCH USERS ===== */
      .addCase(searchUsers.pending, (state) => {
        state.searchUsersLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchUsersLoading = false;
        state.searchUsers = action.payload.data;
        state.searchUsersPagination = action.payload.pagination;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchUsersLoading = false;
        state.error = action.payload;
      })

      /* ===== CREATE GROUP ===== */
      .addCase(createGroup.pending, (state) => {
        state.createGroupLoading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.createGroupLoading = false;
        state.groupInfo = action.payload;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.createGroupLoading = false;
        state.error = action.payload;
      })

      /* ===== GET GROUP INFO ===== */
      .addCase(getGroupInfo.pending, (state) => {
        state.groupInfoLoading = true;
      })
      .addCase(getGroupInfo.fulfilled, (state, action) => {
        state.groupInfoLoading = false;
        state.groupInfo = action.payload;
      })
      .addCase(getGroupInfo.rejected, (state, action) => {
        state.groupInfoLoading = false;
        state.error = action.payload;
      })

      /* ===== ADD GROUP MEMBERS ===== */
      .addCase(addGroupMembers.pending, (state) => {
        state.addMemberLoading = true;
      })
      .addCase(addGroupMembers.fulfilled, (state, action) => {
        state.addMemberLoading = false;
        // Update group info if available
        if (state.groupInfo && state.groupInfo._id === action.payload.groupId) {
          // Group info will be updated when fetched again
        }
      })
      .addCase(addGroupMembers.rejected, (state, action) => {
        state.addMemberLoading = false;
        state.error = action.payload;
      })

      /* ===== REMOVE GROUP MEMBER ===== */
      .addCase(removeGroupMember.pending, (state) => {
        state.addMemberLoading = true;
      })
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        state.addMemberLoading = false;
        // Update group info if available
        if (state.groupInfo && state.groupInfo._id === action.payload.groupId) {
          // Group info will be updated when fetched again
        }
      })
      .addCase(removeGroupMember.rejected, (state, action) => {
        state.addMemberLoading = false;
        state.error = action.payload;
      })

      /* ===== FETCH GROUP CHATS ===== */
      .addCase(fetchGroupChats.pending, (state) => {
        state.groupChatsLoading = true;
      })
      .addCase(fetchGroupChats.fulfilled, (state, action) => {
        state.groupChatsLoading = false;
        state.groupChats = action.payload.data;
        state.groupChatsPagination = action.payload.pagination;
      })
      .addCase(fetchGroupChats.rejected, (state, action) => {
        state.groupChatsLoading = false;
        state.error = action.payload;
      })

      /* ===== FETCH GROUP CHAT HISTORY ===== */
      .addCase(fetchGroupChatHistory.pending, (state) => {
        state.chatDetailLoading = true;
      })
      .addCase(fetchGroupChatHistory.fulfilled, (state, action) => {
        state.chatDetailLoading = false;
        state.chatDetailMessages = action.payload.messages || [];
        state.chatDetailPagination = action.payload.pagination;
        state.currentChatId = action.meta.arg.groupId;
      })
      .addCase(fetchGroupChatHistory.rejected, (state, action) => {
        state.chatDetailLoading = false;
        state.chatDetailError = action.payload;
      })
      .addCase(fetchLiveChatHistory.pending, (state) => {
        state.chatDetailLoading = true;
      })
      .addCase(fetchLiveChatHistory.fulfilled, (state, action) => {
        state.chatDetailLoading = false;
        state.chatDetailMessages = action.payload.messages || [];
        state.chatDetailPagination = action.payload.pagination;
        state.currentChatId = action.meta.arg.chatId;
      })
      .addCase(fetchLiveChatHistory.rejected, (state, action) => {
        state.chatDetailLoading = false;
        state.chatDetailError = action.payload;
      });
  },
});

export const {
  resetChatState,
  resetChatDetail,
  setCurrentChatId,
  addMessage,
  markChatAsRead,
  increaseUnread,
  removeChat,
  blockChat,
} = chatSlice.actions;

export default chatSlice.reducer;
