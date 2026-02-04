import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import {
  MessageCircle,
  ChevronUp,
  Plus,
  X,
  Send,
  ArrowLeft,
  Check,
} from "lucide-react";
import { FaCamera } from "react-icons/fa6";
import { MdGif } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndividualChats,
  fetchIndividualChatDetail,
  acceptChatRequest,
  rejectChatRequest,
  searchUsers,
  createGroup,
  addGroupMembers,
  fetchGroupChats,
  fetchGroupChatHistory,
  getGroupInfo,
  updateGroupInfo,
  toggleGroupMute,
  addMessage,
  markChatAsRead,
  increaseUnread,
  removeChat,
  blockChat,
  setCurrentChatId,
  resetChatDetail,
} from "../../redux/slices/chat.slice";
import SocketContext from "../../context/SocketContext";
import { HiDotsVertical } from "react-icons/hi";
import { SOCKET_EVENTS } from "../../constants/socketEvents";
import { ErrorToast, SuccessToast } from "./Toaster";
import { blockUser } from "../../redux/slices/profileSetting.slice";
import ReportModal from "./ReportModal";
import { sendReport } from "../../redux/slices/reports.slice";

const ChatApp = ({ initialUser = null, onClose = null }) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  // Preset backgrounds for knowledge posts
  const presetBackgrounds = [
    { id: 1, name: "bg_blue", imagePath: "/bg_blue.jpg" },
    { id: 2, name: "bg_orange_gradient", imagePath: "/bg_orange_gradient.jpg" },
    { id: 3, name: "bg_red_gradient", imagePath: "/bg_orange_gradient.jpg" },
    { id: 4, name: "bg_green", imagePath: "/bg_green.png" },
    { id: 5, name: "bg_multicolor", imagePath: "/bg_multicolor.png" },
  ];
  const {
    chats,
    groupChats,
    chatsLoading,
    groupChatsLoading,
    chatDetailMessages,
    chatDetailLoading,
    searchUsers: searchUsersList,
    searchUsersLoading,
    createGroupLoading,
    addMemberLoading,
    groupInfo,
    groupInfoLoading,
    updateGroupLoading,
    toggleMuteLoading,
  } = useSelector((state) => state.chat);
  const { user, allUserData } = useSelector((state) => state.auth);
  const { isLoading: blockLoading } = useSelector(
    (state) => state.profileSetting || {},
  );
  const { reportLoading } = useSelector((state) => state.reports || {});

  const [screen, setScreen] = useState("list");
  const [activeTab, setActiveTab] = useState("Chat");
  const [open, setOpen] = useState(!!initialUser); // Open if initialUser is provided
  const [selectedChat, setSelectedChat] = useState(null);

  // Handle close with callback
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Auto-start chat when initialUser is provided
  useEffect(() => {
    if (initialUser && socket && open) {
      handleStartChat(initialUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser, socket, open]);
  const [messageText, setMessageText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupBio, setGroupBio] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [userSearchPage, setUserSearchPage] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  // Group info screen states
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupBio, setEditGroupBio] = useState("");
  const [editGroupImage, setEditGroupImage] = useState(null);
  const [editGroupImagePreview, setEditGroupImagePreview] = useState(null);
  // Media states
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showGifModal, setShowGifModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  // Message image modal states
  const [showMessageImageModal, setShowMessageImageModal] = useState(false);
  const [selectedMessageImages, setSelectedMessageImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedNewChatUser, setSelectedNewChatUser] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const giphyApiKey = "NGuGyGgjXdVH04wSX5pxvSlwvB7cXbeI";

  const fetchGifs = async (query = "") => {
    try {
      const url = `https://api.giphy.com/v1/gifs/${
        query ? "search" : "trending"
      }?api_key=${giphyApiKey}&q=${query}&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
      setGifs([]);
    }
  };

  useEffect(() => {
    setShowChatMenu(false);
    // Fetch group info when group chat is selected
    if (selectedChat?.isGroup) {
      const groupId = selectedChat.groupId || selectedChat._id;
      dispatch(getGroupInfo(groupId));
    }
  }, [selectedChat, dispatch]);
  useEffect(() => {
    // whenever chat popup opens/closes, reset to list screen
    setEditGroupName(groupInfo?.info?.name || "");
    setEditGroupBio(groupInfo?.info?.bio || "");
  }, [groupInfo]);
  console.log(groupInfo, "group Details");
  useEffect(() => {
    // whenever screen changes, close media drawer
    setShowMediaOptions(false);
  }, [screen]);

  // Fetch chats based on active tab
  useEffect(() => {
    if (open) {
      if (activeTab === "Chat") {
        dispatch(fetchIndividualChats({ page, limit, type: "active" }));
      } else if (activeTab === "Request") {
        dispatch(fetchIndividualChats({ page, limit, type: "inactive" }));
      } else if (activeTab === "Group Chat") {
        dispatch(fetchGroupChats({ page, limit }));
      }
    }
  }, [open, activeTab, page, limit, dispatch]);

  const handleLeaveGroup = () => {
    const groupId = selectedChat.groupId || selectedChat._id;

    socket.leaveGroup({ groupId }, () => {
      dispatch(removeChat({ chatId: groupId }));
      dispatch(resetChatDetail());
      setScreen("list");
    });
  };

  const handleStartChat = (user) => {
    socket.requestIndividualChat({ receiverId: user._id }, async (res) => {
      console.log("requestIndividualChat response:", res);

      const chatId =
        res?.data?.chatId || res?.chatId || res?.data?._id || res?._id;

      if (!chatId) {
        console.error("No chatId received");
        return;
      }

      // ✅ SET STATE
      setSelectedChat({
        _id: chatId,
        receiverInfo: user,
        isGroup: false,
      });

      dispatch(setCurrentChatId(chatId));
      setScreen("chat");

      // ✅ FETCH MESSAGES
      await dispatch(fetchIndividualChatDetail({ chatId, page: 1, limit: 50 }));

      // ✅ MARK READ
      socket.readChats({ chatId, unreadCount: 0 }, () => {
        dispatch(markChatAsRead({ chatId }));
      });

      // ✅ REFRESH CHAT LIST
      dispatch(fetchIndividualChats({ page: 1, limit, type: "active" }));
    });
  };

  // Fetch GIFs when modal opens
  useEffect(() => {
    if (showGifModal) {
      fetchGifs();
    }
  }, [showGifModal]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !socket.socket) return;

    const handleMessageReceived = (data) => {
      // ❌ agar group message hai to yahan ignore karo
      if (data.groupId) return;

      dispatch(
        addMessage({
          chatId: data.chatId,
          message: data.message,
          unreadCount: data.unreadCount || 1,
        }),
      );
    };

    const handleChatDeleted = (data) => {
      console.log("Chat deleted:", data);
      dispatch(removeChat({ chatId: data.chatId }));
    };

    const handleChatBlocked = (data) => {
      console.log("Chat blocked:", data);
      dispatch(blockChat({ chatId: data.chatId }));
    };

    const handleGroupMessageReceived = (data) => {
      console.log("Group message received:", data);
      dispatch(
        addMessage({
          chatId: data.groupId,
          message: data.message,
          unreadCount: data.unreadCount || 1,
        }),
      );
    };

    const handleGroupDeleted = (data) => {
      console.log("Group deleted:", data);
      dispatch(removeChat({ chatId: data.groupId }));
    };

    const handleUserStatus = (data) => {
      console.log("User status:", data);
      setOnlineUsers((prev) => ({
        ...prev,
        [data.userId]: data.online,
      }));
    };

    socket.socket.on(
      SOCKET_EVENTS.INDIVIDUAL.MESSAGE_RECEIVED,
      handleMessageReceived,
    );
    socket.socket.on(SOCKET_EVENTS.INDIVIDUAL.CHAT_DELETED, handleChatDeleted);
    socket.socket.on(SOCKET_EVENTS.INDIVIDUAL.CHAT_BLOCKED, handleChatBlocked);
    socket.socket.on(
      SOCKET_EVENTS.GROUP.MESSAGE_RECEIVED,
      handleGroupMessageReceived,
    );
    socket.socket.on(SOCKET_EVENTS.GROUP.GROUP_DELETED, handleGroupDeleted);
    socket.socket.on(SOCKET_EVENTS.COMMON.USER_STATUS, handleUserStatus);

    return () => {
      socket.socket.off(
        SOCKET_EVENTS.INDIVIDUAL.MESSAGE_RECEIVED,
        handleMessageReceived,
      );
      socket.socket.off(
        SOCKET_EVENTS.INDIVIDUAL.CHAT_DELETED,
        handleChatDeleted,
      );
      socket.socket.off(
        SOCKET_EVENTS.INDIVIDUAL.CHAT_BLOCKED,
        handleChatBlocked,
      );
      socket.socket.off(
        SOCKET_EVENTS.GROUP.MESSAGE_RECEIVED,
        handleGroupMessageReceived,
      );
      socket.socket.off(SOCKET_EVENTS.GROUP.GROUP_DELETED, handleGroupDeleted);
      socket.socket.off(SOCKET_EVENTS.COMMON.USER_STATUS, handleUserStatus);
    };
  }, [socket, dispatch]);

  // Scroll to bottom when messages change
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatDetailMessages]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // Handle accept request
  const handleAcceptRequest = async (e, chatId) => {
    e.stopPropagation();
    await dispatch(acceptChatRequest(chatId));
    // Refresh both lists
    dispatch(fetchIndividualChats({ page, limit, type: "inactive" }));
    dispatch(fetchIndividualChats({ page, limit, type: "active" }));
  };

  // Handle reject request
  const handleRejectRequest = async (e, chatId) => {
    e.stopPropagation();
    await dispatch(rejectChatRequest(chatId));
    // Refresh the requests list
    dispatch(fetchIndividualChats({ page, limit, type: "inactive" }));
  };

  const chatPopupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatPopupRef.current &&
        !chatPopupRef.current.contains(event.target)
      ) {
        // 🔥 Close everything
        setScreen("list");
        handleClose();
        setShowChatMenu(false);
        setShowMediaOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle chat click
  const handleChatClick = async (chat) => {
    setShowMediaOptions(false);
    setSelectedChat(chat);
    setScreen("chat");
    // Fetch chat detail based on chat type
    // Check if it's a group chat - use groupId if available, otherwise use _id
    const groupId =
      chat.groupId || chat.group || (chat.isGroup ? chat._id : null);

    if (chat.isGroup || groupId) {
      await dispatch(
        fetchGroupChatHistory({
          groupId: groupId || chat._id,
          page: 1,
          limit: 5,
        }),
      );
      dispatch(
        setCurrentChatId(
          chat.isGroup || groupId ? groupId || chat._id : chat._id,
        ),
      );

      // socket.joinGroup({ groupId: groupId || chat._id }, (response) => {
      //   console.log("Joined group:", response);
      // });
      socket.joinGroup(
        {
          groupId: groupId || chat._id,
          unreadCount: chat.unreadCount || 0,
        },
        () => {
          dispatch(markChatAsRead({ chatId: groupId || chat._id }));
        },
      );
    } else {
      await dispatch(
        fetchIndividualChatDetail({ chatId: chat._id, page: 1, limit: 50 }),
      );
      dispatch(setCurrentChatId(chat._id));
      // Request to join the chat room
      socket.requestIndividualChat(
        { receiverId: chat.receiverInfo._id },
        (response) => {
          console.log("Joined chat:", response);
        },
      );
      // Mark as read
      socket.readChats(
        {
          chatId: chat._id,
          unreadCount: chat.unreadCount || 0,
        },
        () => {
          dispatch(markChatAsRead({ chatId: chat._id }));
        },
      );
    }
  };
  const isBlocked = selectedChat?.isBlocked;
  const receiverId = selectedChat?.receiverInfo?._id;
  const myUserId = user?._id; // apna logged-in user id
  const getMemberCount = () => {
    if (selectedChat?.isGroup) {
      // For group chats, use groupInfo if available
      if (groupInfo?.members) {
        return groupInfo?.info?.numberOfMembers;
      }
      // Fallback to what's stored in selectedChat
      return selectedChat.members || 0;
    }
    return 0;
  };

  // Transform API data to component format
  const transformChatData = (chat) => {
    // Check if it's a group chat - group chats have group field or isGroup flag
    const isGroup =
      chat.isGroup || chat.group || (chat.groupId && !chat.receiverInfo);
    return {
      id: chat._id,
      name: chat.receiverInfo?.name || chat.name || "Unknown",
      msg: chat.lastMessage?.content || "No messages",
      date: formatDate(chat.lastMessage?.createdAt || chat.createdAt),
      avatar:
        chat.receiverInfo?.profilePicture ||
        chat.image ||
        chat.profilePicture ||
        "https://randomuser.me/api/portraits/men/1.jpg",
      unread: chat.unreadCount || 0,
      _id: chat._id,
      isBlocked: chat?.blockedBy,
      receiverInfo: chat.receiverInfo,
      lastMessage: chat.lastMessage,
      isGroup: isGroup,
      groupId: chat.group || chat.groupId || (isGroup ? chat._id : null),
      members: chat.members?.length || chat.memberCount || 0,
    };
  };

  // Transform group chat data
  const transformGroupChatData = (groupChat) => {
    return {
      id: groupChat._id,
      name: groupChat.name || "Unknown Group",
      msg: groupChat.lastMessage?.content || "No messages",
      date: formatDate(groupChat.lastMessage?.createdAt || groupChat.createdAt),
      avatar:
        groupChat.image ||
        groupChat.profilePicture ||
        "https://randomuser.me/api/portraits/men/1.jpg",
      unread: groupChat.unreadCount || 0,
      _id: groupChat._id,
      lastMessage: groupChat.lastMessage,
      isGroup: true,
      members: groupChat.members?.length || groupChat.memberCount || 0,
    };
  };

  // Get chats data based on active tab
  const getChatsData = () => {
    return chats.map(transformChatData);
  };

  // Get group chats data
  const getGroupChatsData = () => {
    const fromGroupAPI = groupChats.map(transformGroupChatData);
    // Also check if individual chats have any groups (in case groups appear in recent chats)
    const fromIndividualChats = chats
      .filter((chat) => {
        const isGroup =
          chat.isGroup || chat.group || (chat.groupId && !chat.receiverInfo);
        return isGroup;
      })
      .map(transformChatData);

    // Combine and remove duplicates
    const allGroups = [...fromGroupAPI, ...fromIndividualChats];
    const uniqueGroups = allGroups.filter(
      (group, index, self) =>
        index === self.findIndex((g) => g._id === group._id),
    );
    return uniqueGroups;
  };

  const chatsData = {
    Chat:
      activeTab === "Chat"
        ? getChatsData().filter((chat) => !chat.isGroup)
        : [],
    "Group Chat": activeTab === "Group Chat" ? getGroupChatsData() : [],
    Request:
      activeTab === "Request"
        ? getChatsData().filter((chat) => !chat.isGroup)
        : [],
  };

  const handleSendMessage = async () => {
    let mediaUrls = [];
    if (selectedFiles.length > 0) {
      mediaUrls = await Promise.all(
        selectedFiles.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            }),
        ),
      );
    } else if (selectedGif) {
      mediaUrls = [selectedGif];
    }

    if (!messageText.trim() && mediaUrls.length === 0) return;

    const isGroup = selectedChat.isGroup || selectedChat.groupId;
    let type = "text";
    let content = messageText;
    if (selectedGif) {
      type = "gif";
      content = "";
    } else if (selectedFiles.length > 0) {
      type = "media";
      content = "";
    }
    //  const isGroup = selectedChat.isGroup || selectedChat.groupId;

    const payload = isGroup
      ? {
          groupId: selectedChat.groupId || selectedChat._id,
          type,
          content,
          mediaUrls,
        }
      : {
          chatId: selectedChat._id,
          type,
          content,
          mediaUrls,
        };

    if (isGroup) {
      socket.sendGroupMessage(payload, (response) => {
        console.log("Group message sent:", response);
      });
    } else {
      socket.sendMessage(payload, (response) => {
        console.log("Message sent:", response);
      });
    }

    setMessageText("");
    setSelectedFiles([]);
    setSelectedGif(null);
    setMediaPreview([]);
  };

  const handleBlockUser = () => {
    // Show confirmation modal first
    setShowBlockConfirmModal(true);
    setShowChatMenu(false);
  };

  const confirmBlockUser = async () => {
    if (!selectedChat?._id || !selectedChat?.receiverInfo?._id) return;

    try {
      const payload = {
        reason: "User blocked from chat",
        userId: selectedChat.receiverInfo._id, // User who is being blocked
        blockedFrom: "Global", // Block globally from profile and all pages
        targetId: selectedChat.receiverInfo._id, // For global block, targetId is the user being blocked
        isBlocked: true,
      };

      await dispatch(blockUser(payload)).unwrap();

      // Also emit socket event for real-time update
      socket.socket.emit("individual:block:user", {
        chatId: selectedChat._id,
        blockTo: selectedChat.receiverInfo._id,
      });

      SuccessToast("User blocked successfully");

      // ✅ UI cleanup
      dispatch(resetChatDetail());
      setShowBlockConfirmModal(false);
      setScreen("list");
    } catch (error) {
      console.error("Failed to block user:", error);
      ErrorToast(error?.message || "Failed to block user");
    }
  };

  const handleClearMessages = () => {
    if (!selectedChat?._id) return;

    socket.socket.emit("individual:chat:delete", {
      chatId: selectedChat._id,
    });

    // ✅ ONLY clear messages from UI
    dispatch(resetChatDetail());

    setShowChatMenu(false);
  };

  useEffect(() => {
    if (!socket?.socket) return;

    const handleIndividualChatDelete = (data) => {
      console.log("Individual chat deleted:", data);

      dispatch(removeChat({ chatId: data.groupId }));
      dispatch(resetChatDetail());

      if (selectedChat?._id === data.groupId) {
        setScreen("list");
      }
    };

    socket.socket.on("individual:chat:delete", handleIndividualChatDelete);

    return () => {
      socket.socket.off("individual:chat:delete", handleIndividualChatDelete);
    };
  }, [socket, selectedChat, dispatch]);

  const handleSelectUser = (user) => {
    // Check if user has group invites disabled
    if (user.isGroupInviteOpen === false) {
      ErrorToast("Cannot add this user");
      return;
    }

    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  useEffect(() => {
    if (
      (screen === "createGroup" || screen === "newChat") &&
      searchTerm.trim()
    ) {
      dispatch(
        searchUsers({
          page: userSearchPage,
          limit: 10,
          search: searchTerm,
        }),
      );
    }
  }, [searchTerm, screen, userSearchPage, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupImage) {
      ErrorToast("Please upload a group image");
      return;
    }

    if (groupName.trim() && selectedUsers.length > 0) {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("bio", groupBio);
      formData.append("image", groupImage); // Image is now required

      try {
        const result = await dispatch(createGroup(formData));
        if (createGroup.fulfilled.match(result)) {
          const groupId = result.payload._id;

          // Add selected members to group
          if (selectedUsers.length > 0) {
            const memberIds = selectedUsers.map((u) => u._id);
            await dispatch(addGroupMembers({ groupId, memberIds }));
          }

          // 🔹 creator ko socket room join karwao
          socket.joinGroup(
            {
              groupId,
              unreadCount: 0,
            },
            (res) => {
              console.log("Creator joined group socket:", res);
            },
          );

          // Reset and go back to list
          setScreen("list");
          setSelectedUsers([]);
          setGroupName("");
          setGroupBio("");
          setGroupImage(null);
          setGroupImagePreview(null);
          setSearchTerm("");

          // Refresh chats
          dispatch(fetchIndividualChats({ page, limit, type: "active" }));
        }
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    }
  };

  // Filter users based on search term (client-side filtering)
  const availableUsers =
    searchUsersList?.filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const MemberRow = ({ user }) => {
    const isSelected = selectedUsers.some((u) => u._id === user._id);

    return (
      <div className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded mb-1">
        <div className="flex items-center gap-2">
          <img
            src={
              user.profilePicture ||
              "https://randomuser.me/api/portraits/men/1.jpg"
            }
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm text-gray-900">{user.name}</span>
        </div>

        {/* <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected ? "bg-orange-500 border-orange-500" : "border-gray-300"
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div> */}
      </div>
    );
  };

  const filteredMembers = groupInfo?.members?.filter((m) =>
    m.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Chat List Screen
  if (screen === "list") {
    console.log(chatsData, "Chats---Complete-Record");
    return (
      <>
        <button
          onClick={() => setOpen(!open)}
          className="fixed bottom-6 right-6 flex items-center justify-between w-72 bg-white rounded-[10px] shadow-lg px-4 py-3 hover:shadow-xl z-40"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-semibold text-sm">New</span>
            <span className="text-gray-800 font-medium text-sm">Message</span>
          </div>
          <ChevronUp
            className={`w-5 h-5 text-orange-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          ref={chatPopupRef}
          className={`fixed bottom-20 right-6 w-80 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 transition-all ${
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-5 pointer-events-none"
          } z-40`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Message</h3>
            </div>
            <Plus
              className="w-5 h-5 text-gray-700 cursor-pointer"
              onClick={() => {
                setScreen("newChat");
                handleClose();
                setSearchTerm("");
                setUserSearchPage(1);
              }}
            />
          </div>

          {/* <div className="px-4 py-2 border-b border-gray-200">
           <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
            />
          </div> */}

          <div className="flex border-b border-gray-200 text-sm font-medium">
            {["Chat", "Group Chat", "Request"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 ${
                  activeTab === tab
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-[50vh] overflow-y-auto">
            {chatsLoading ||
            (activeTab === "Group Chat" && groupChatsLoading) ? (
              <p className="text-sm text-gray-500 text-center py-6 flex justify-center items-center">
                <img
                  src="https://assets-v2.lottiefiles.com/a/90a4c0f2-1152-11ee-bda3-830a7a1975f2/iBALXy6uaH.gif"
                  className="w-[14em] h-[14em]"
                  alt=""
                />
              </p>
            ) : chatsData[activeTab].length > 0 ? (
              chatsData[activeTab].map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center justify-between px-5 py-5 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {chat.name}
                      </p>
                      <p
                        className={`text-xs text-gray-500 truncate ${
                          chat.unread > 0 ? "font-semibold" : ""
                        }`}
                      >
                        {chat.lastMessage?.mediaUrls &&
                        chat.lastMessage.mediaUrls.length > 0 ? (
                          <span className="flex items-center gap-1">
                            <FaCamera className="w-3 h-3" />
                            Media
                          </span>
                        ) : (
                          chat.msg
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-gray-400">{chat.date}</p>
                    {activeTab === "Request" && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleAcceptRequest(e, chat._id)}
                          className="w-5 h-5 bg-orange-500 text-white rounded flex items-center justify-center hover:bg-orange-600"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleRejectRequest(e, chat._id)}
                          className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                No {activeTab.toLowerCase()} available
              </p>
            )}
          </div>

          {activeTab === "Group Chat" && (
            <button
              onClick={() => {
                setScreen("createGroup");
                handleClose();
              }}
              className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 rounded-full text-white flex items-center justify-center shadow-md hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </>
    );
  }

  // Chat Screen
  if (screen === "chat") {
    console.log(selectedChat, "selectedChat");
    return (
      <>
        <div
          ref={chatPopupRef}
          className="fixed bottom-6 right-6 w-[360px] bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-[27em]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center w-full justify-between gap-3">
              {/* Left Section: Back + Avatar + Info */}
              <div className="flex items-center gap-3">
                {/* Back Button */}
                <button
                  onClick={() => {
                    if (selectedChat?.isGroup) {
                      socket.leaveGroupRoom(
                        { groupId: selectedChat.groupId || selectedChat._id },
                        () => {},
                      );
                    } else {
                      socket.leaveChats({ chatId: selectedChat._id }, () => {});
                    }
                    setShowMediaOptions(false);
                    dispatch(resetChatDetail());
                    setScreen("list");
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <img
                  src={
                    selectedChat?.avatar ||
                    selectedChat?.receiverInfo?.profilePicture ||
                    selectedChat?.image
                  }
                  alt={
                    selectedChat?.name ||
                    selectedChat?.receiverInfo?.name ||
                    "Chat"
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />

                {/* Name + Status */}
                <div className="flex flex-col leading-tight">
                  <p
                    className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-500"
                    onClick={() => {
                      if (selectedChat?.isGroup) {
                        const groupId =
                          selectedChat.groupId || selectedChat._id;
                        dispatch(getGroupInfo(groupId));
                        setScreen("groupInfo");
                      }
                    }}
                  >
                    {selectedChat?.name ||
                      selectedChat?.receiverInfo?.name ||
                      "Unknown"}
                  </p>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {selectedChat?.isGroup ? (
                      `${getMemberCount()} members`
                    ) : onlineUsers[selectedChat?.receiverInfo?._id] ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>

              <div className="relative">
                {/* Right Section: Menu */}
                <button
                  onClick={() => setShowChatMenu((prev) => !prev)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <HiDotsVertical className="w-5 h-5" />
                </button>

                {showChatMenu && (
                  <div className="absolute right-0 mt-2 w-[11em] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Group Chat Options */}
                    {selectedChat?.isGroup ? (
                      <>
                        {/* Mute Notifications */}
                        <button
                          onClick={async () => {
                            const groupId =
                              selectedChat.groupId || selectedChat._id;
                            const isMuted =
                              groupInfo?.isNotificationMute || false;
                            try {
                              await dispatch(
                                toggleGroupMute({
                                  groupId,
                                  mute: isMuted ? "disable" : "enable",
                                }),
                              ).unwrap();
                              // Refresh group info to get updated mute status
                              dispatch(getGroupInfo(groupId));
                              setShowChatMenu(false);
                            } catch (error) {
                              console.error("Failed to toggle mute:", error);
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                        >
                          {groupInfo?.isNotificationMute
                            ? "Unmute Notifications"
                            : "Mute Notifications"}
                        </button>

                        {/* Delete Group - Only for admin */}
                        {groupInfo?.admin?._id ===
                          (user?._id || allUserData?._id) && (
                          <button
                            onClick={() => {
                              const groupId =
                                selectedChat.groupId || selectedChat._id;
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this group? This action cannot be undone.",
                                )
                              ) {
                                socket.deleteGroup({ groupId }, (response) => {
                                  console.log("Group deleted:", response);
                                  dispatch(removeChat({ chatId: groupId }));
                                  dispatch(resetChatDetail());
                                  setShowChatMenu(false);
                                  setScreen("list");
                                });
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                          >
                            Delete Group
                          </button>
                        )}

                        {/* Leave Group */}
                        <button
                          onClick={() => {
                            const groupId =
                              selectedChat.groupId || selectedChat._id;
                            if (
                              window.confirm(
                                "Are you sure you want to leave this group?",
                              )
                            ) {
                              socket.leaveGroup({ groupId }, (response) => {
                                console.log("Left group:", response);
                                dispatch(removeChat({ chatId: groupId }));
                                dispatch(resetChatDetail());
                                setShowChatMenu(false);
                                setScreen("list");
                              });
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                        >
                          Leave Group
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Delete Chat */}
                        <button
                          onClick={handleClearMessages}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                        >
                          Delete Chat
                        </button>

                        {/* Create Group Chat with this user */}
                        <button
                          onClick={() => {
                            if (!selectedChat?.receiverInfo?._id) return;

                            // Pre-select this user for group creation
                            setSelectedUsers([
                              {
                                _id: selectedChat.receiverInfo._id,
                                name: selectedChat.receiverInfo.name,
                                profilePicture:
                                  selectedChat.receiverInfo.profilePicture,
                                hasConnection: true,
                              },
                            ]);

                            setGroupName("");
                            setGroupBio("");
                            setGroupImage(null);
                            setGroupImagePreview(null);
                            setSearchTerm("");

                            setShowChatMenu(false);
                            setScreen("createGroup");
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                        >
                          Create Group Chat
                        </button>

                        {/* Block User */}
                        {!isBlocked && (
                          <button
                            onClick={handleBlockUser}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                          >
                            Block Users
                          </button>
                        )}

                        {/* Report */}
                        <button
                          onClick={() => {
                            setShowChatMenu(false);
                            setReportModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-orange-600"
                        >
                          Report
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
            {chatDetailLoading ? (
              <p className="text-center text-gray-400 text-sm mt-10">
                Loading messages...
              </p>
            ) : chatDetailMessages && chatDetailMessages.length > 0 ? (
              chatDetailMessages.map((msg, i) => {
                const currentUserId = user?._id || allUserData?._id;
                const isCurrentUser = msg.sender?._id === currentUserId;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && (
                      <img
                        src={
                          msg.sender?.profilePicture ||
                          "https://randomuser.me/api/portraits/men/1.jpg"
                        }
                        alt={msg.sender?.name || "User"}
                        className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1"
                      />
                    )}
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        isCurrentUser
                          ? "bg-orange-500 text-white rounded-br-none"
                          : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                      }`}
                    >
                      {msg.type === "shared" && msg.shared ? (
                        // Knowledge post - show styled card
                        msg.shared.sharedType === "knowledge" ? (
                          <div className="space-y-2">
                            {/* Page/Topic Info */}
                            {msg.shared.name && (
                              <div className="flex items-center gap-2 mb-2">
                                {msg.shared.pageImage && (
                                  <img
                                    src={msg.shared.pageImage}
                                    alt="Page"
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                )}
                                <p className="text-xs font-semibold opacity-90">
                                  {msg.shared.name}
                                </p>
                              </div>
                            )}

                            {/* Shared Post Type Label */}
                            <p className="text-xs opacity-80 mb-2">
                              Shared a knowledge post
                            </p>

                            {/* Knowledge Post Card */}
                            <div
                              className="rounded-xl overflow-hidden min-h-[120px] flex items-center justify-center p-6 relative"
                              style={
                                // Check if imageStyle is a JSON string or simple string
                                (() => {
                                  let backgroundCode = null;
                                  let styleData = null;

                                  if (msg.shared.imageStyle) {
                                    try {
                                      // Try to parse as JSON
                                      styleData = JSON.parse(
                                        msg.shared.imageStyle,
                                      );
                                      backgroundCode =
                                        styleData.backgroundCode ||
                                        msg.shared.imageLocalPath;
                                    } catch (e) {
                                      // If not JSON, use as string
                                      backgroundCode =
                                        msg.shared.imageStyle ||
                                        msg.shared.imageLocalPath;
                                    }
                                  } else {
                                    backgroundCode = msg.shared.imageLocalPath;
                                  }

                                  // Find background from presetBackgrounds
                                  const bgPreset = presetBackgrounds.find(
                                    (bg) => bg.name === backgroundCode,
                                  );

                                  if (bgPreset) {
                                    return {
                                      backgroundImage: `url(${bgPreset.imagePath})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    };
                                  }

                                  // Default gradient if no background found
                                  return {
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  };
                                })()
                              }
                            >
                              {/* Overlay for better text readability */}
                              <div className="absolute inset-0 bg-black/5 rounded-xl"></div>

                              {/* Text Content */}
                              {msg.shared.textOnImage && (
                                <p
                                  className="text-center relative z-10 text-white font-medium leading-relaxed drop-shadow-lg"
                                  style={(() => {
                                    let styleData = null;
                                    if (msg.shared.imageStyle) {
                                      try {
                                        styleData = JSON.parse(
                                          msg.shared.imageStyle,
                                        );
                                      } catch (e) {
                                        styleData = null;
                                      }
                                    }

                                    return {
                                      fontSize: styleData?.fontSize
                                        ? `${styleData.fontSize}px`
                                        : "18px",
                                      color: styleData?.color || "#ffffff",
                                      fontWeight: styleData?.isBold
                                        ? "700"
                                        : "500",
                                      fontStyle: styleData?.isItalic
                                        ? "italic"
                                        : "normal",
                                      textDecoration: styleData?.isUnderline
                                        ? "underline"
                                        : "none",
                                      textAlign:
                                        styleData?.textAlignment || "center",
                                    };
                                  })()}
                                >
                                  {msg.shared.textOnImage}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : // Regular post with media
                        !msg.shared.media ? (
                          <p className="text-sm">
                            {msg.sender?.name || "Someone"} shared a text post
                          </p>
                        ) : (
                          // If media exists, show full details
                          <div className="space-y-2">
                            {/* Page/Topic Info */}
                            {msg.shared.name && (
                              <div className="flex items-center gap-2 mb-2">
                                {msg.shared.pageImage && (
                                  <img
                                    src={msg.shared.pageImage}
                                    alt="Page"
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                )}
                                <p className="text-xs font-semibold opacity-90">
                                  {msg.shared.name}
                                </p>
                              </div>
                            )}

                            {/* Shared Post Type Label */}
                            <p className="text-xs opacity-80 mb-2">
                              Shared a post
                            </p>

                            {/* Post Media (Video or Image) */}
                            {msg.shared.media && (
                              <div className="rounded-lg overflow-hidden">
                                {msg.shared.media.includes(".mp4") ||
                                msg.shared.media.includes(".mov") ||
                                msg.shared.media.includes("video") ? (
                                  <video
                                    src={msg.shared.media}
                                    controls
                                    className="w-full max-h-64 object-contain rounded-lg"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <img
                                    src={msg.shared.media}
                                    alt="Shared post"
                                    className="w-full max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90"
                                    onClick={() => {
                                      setSelectedMessageImages([
                                        msg.shared.media,
                                      ]);
                                      setCurrentImageIndex(0);
                                      setShowMessageImageModal(true);
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            {/* Text on Image */}
                            {msg.shared.textOnImage && (
                              <p className="text-sm mt-2">
                                {msg.shared.textOnImage}
                              </p>
                            )}

                            {/* Additional Content */}
                            {msg.content &&
                              msg.content !== "Shared a knowledge post" &&
                              msg.content !== "Shared a post" && (
                                <p className="text-sm mt-2">{msg.content}</p>
                              )}
                          </div>
                        )
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      {msg.mediaUrls &&
                        msg.mediaUrls.length > 0 &&
                        (() => {
                          const mediaCount = msg.mediaUrls.length;
                          if (mediaCount === 1) {
                            return (
                              <img
                                src={msg.mediaUrls[0]}
                                alt="Media"
                                className="w-full rounded mt-2 cursor-pointer"
                                onClick={() => {
                                  setSelectedMessageImages(msg.mediaUrls);
                                  setCurrentImageIndex(0);
                                  setShowMessageImageModal(true);
                                }}
                              />
                            );
                          } else if (mediaCount === 2) {
                            return (
                              <div className="mt-2 grid grid-cols-2 gap-1">
                                {msg.mediaUrls.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Media ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded cursor-pointer"
                                    onClick={() => {
                                      setSelectedMessageImages(msg.mediaUrls);
                                      setCurrentImageIndex(idx);
                                      setShowMessageImageModal(true);
                                    }}
                                  />
                                ))}
                              </div>
                            );
                          } else {
                            // 3 or more, 2x2 grid
                            return (
                              <div className="mt-2 grid grid-cols-2 gap-1">
                                {msg.mediaUrls.slice(0, 4).map((url, idx) => {
                                  if (idx === 3 && mediaCount > 4) {
                                    return (
                                      <div
                                        key={idx}
                                        className="relative cursor-pointer"
                                        onClick={() => {
                                          setSelectedMessageImages(
                                            msg.mediaUrls,
                                          );
                                          setCurrentImageIndex(0);
                                          setShowMessageImageModal(true);
                                        }}
                                      >
                                        <img
                                          src={url}
                                          alt={`Media ${idx + 1}`}
                                          className="w-full h-20 object-cover rounded"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                          <span className="text-white font-bold text-sm">
                                            +{mediaCount - 3}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <img
                                        key={idx}
                                        src={url}
                                        alt={`Media ${idx + 1}`}
                                        className="w-full h-20 object-cover rounded cursor-pointer"
                                        onClick={() => {
                                          setSelectedMessageImages(
                                            msg.mediaUrls,
                                          );
                                          setCurrentImageIndex(idx);
                                          setShowMessageImageModal(true);
                                        }}
                                      />
                                    );
                                  }
                                })}
                              </div>
                            );
                          }
                        })()}
                      <p
                        className={`text-[10px] mt-1 ${
                          isCurrentUser ? "text-orange-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {isCurrentUser && (
                      <img
                        src={
                          user?.profilePicture ||
                          allUserData?.profilePicture ||
                          "https://randomuser.me/api/portraits/men/1.jpg"
                        }
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover ml-2 self-end mb-1"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400 text-sm mt-10">
                No messages yet
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 px-4 py-3 bg-white flex flex-col">
            {!selectedChat?.isGroup && isBlocked ? (
              isBlocked === receiverId ? (
                // 🟥 Receiver blocked YOU
                <div className="text-center text-sm text-gray-500 py-3">
                  You can't send messages - this user has blocked you
                </div>
              ) : isBlocked === myUserId ? (
                // 🟥 YOU blocked receiver
                <div className="text-center text-sm text-gray-500 py-3 px-4">
                  You've blocked this user. Unblock them to start chatting again
                </div>
              ) : null
            ) : (
              <>
                {/* ✅ Input & media visible when NOT blocked */}
                {mediaPreview.length > 0 && (
                  <div className="mb-2">
                    <div className="grid grid-cols-4 gap-2">
                      {mediaPreview.slice(0, 4).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                      {mediaPreview.length > 4 && (
                        <div
                          className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300"
                          onClick={() => setShowImageModal(true)}
                        >
                          <span className="text-sm font-semibold">
                            +{mediaPreview.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
                    disabled={mediaPreview.length > 0}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMediaOptions((prev) => !prev);
                    }}
                    className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSendMessage}
                    className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {showMediaOptions && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Share Media
                </span>
                <button
                  onClick={() => setShowMediaOptions(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-around">
                <button
                  onClick={() => {
                    fileInputRef.current.click();
                    setShowMediaOptions(false);
                  }}
                  className="flex flex-col items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                    <FaCamera />
                  </div>
                  <span className="text-sm text-gray-700">Image</span>
                </button>

                <button
                  onClick={() => {
                    setShowGifModal(true);
                    setShowMediaOptions(false);
                  }}
                  className="flex flex-col items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                    <MdGif size={28} />
                  </div>
                  <span className="text-sm text-gray-700">GIF</span>
                </button>
              </div>
            </div>
          )}

          {showGifModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Select GIF</h3>
                  <button
                    onClick={() => setShowGifModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search GIFs"
                  value={gifSearch}
                  onChange={(e) => setGifSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && fetchGifs(gifSearch)}
                  className="w-full border border-gray-200 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:border-orange-500"
                />
                <div className="grid grid-cols-3 gap-2">
                  {gifs.map((gif) => (
                    <img
                      key={gif.id}
                      src={gif.images.fixed_height.url}
                      alt={gif.title}
                      onClick={() => {
                        setSelectedGif(gif.images.original.url);
                        setMediaPreview([gif.images.original.url]);
                        setShowGifModal(false);
                      }}
                      className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {showImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 max-w-md max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">All Images</h3>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {mediaPreview.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Image ${i + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {showMessageImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl max-h-[80vh]">
                <button
                  onClick={() => setShowMessageImageModal(false)}
                  className="absolute top-2 right-2 text-white text-2xl z-10"
                >
                  ×
                </button>
                <img
                  src={selectedMessageImages[currentImageIndex]}
                  alt="Full image"
                  className="max-w-full max-h-full object-contain"
                />
                {selectedMessageImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) =>
                            (prev - 1 + selectedMessageImages.length) %
                            selectedMessageImages.length,
                        )
                      }
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-2xl"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % selectedMessageImages.length,
                        )
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-2xl"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Block User Confirmation Modal */}
          {showBlockConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
              <div className="bg-white w-[360px] rounded-2xl shadow-xl p-6 relative">
                <h2 className="text-lg font-semibold text-center mb-2">
                  Block User
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Are you sure you want to block this user?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBlockConfirmModal(false)}
                    disabled={blockLoading}
                    className="flex-1 bg-gray-100 text-gray-700 border-none rounded-lg py-3 text-sm font-semibold cursor-pointer hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Don't Block
                  </button>
                  <button
                    onClick={confirmBlockUser}
                    disabled={blockLoading}
                    className="flex-1 bg-orange-500 text-white border-none rounded-lg py-3 text-sm font-semibold cursor-pointer hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {blockLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Blocking...</span>
                      </>
                    ) : (
                      "Block"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Report User Modal */}
          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            loading={reportLoading}
            onSubmit={(reason) => {
              if (!selectedChat?.receiverInfo?._id) return;

              dispatch(
                sendReport({
                  reason,
                  targetModel: "User",
                  targetId: selectedChat.receiverInfo._id,
                  isReported: true,
                }),
              );
            }}
          />
        </div>
      </>
    );
  }

  // Create Group Screen
  if (screen === "createGroup") {
    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-96">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => {
              setScreen("list");
              setSelectedUsers([]);
              setSearchTerm("");
            }}
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm text-gray-900">
            Create New Group
          </h3>
        </div>

        <div className="px-4 py-2 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search members"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {selectedUsers.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                Selected ({selectedUsers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full"
                  >
                    <img
                      src={
                        user.profilePicture ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-900">{user.name}</span>
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="text-orange-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-600 mb-2">Add members</p>
          {searchUsersLoading ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Loading users...
            </p>
          ) : availableUsers.length > 0 ? (
            availableUsers.map((user) => {
              const isDisabled = user.isGroupInviteOpen === false;
              const isSelected = selectedUsers.find((u) => u._id === user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center justify-between p-2 rounded mb-1 ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        user.profilePicture ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-sm text-gray-900 block">
                        {user.name}
                      </span>
                      {user.hasConnection && (
                        <span className="text-xs text-gray-400">Connected</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No users found
            </p>
          )}
        </div>

        <button
          onClick={() => {
            if (selectedUsers.length > 0) {
              setScreen("groupDetails");
            }
          }}
          className="w-full bg-orange-500 text-white py-2 font-semibold disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    );
  }
  // View All Group Members Screen
  if (screen === "viewAllMembers") {
    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-96">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => {
              setScreen("groupInfo");
              setSelectedUsers([]);
              setSearchTerm("");
            }}
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm text-gray-900">
            View All Member
          </h3>
        </div>

        <div className="px-4 py-2 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search members"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {selectedUsers.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                Selected ({selectedUsers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full"
                  >
                    <img
                      src={
                        user.profilePicture ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-900">{user.name}</span>
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="text-orange-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-600 font-bold mb-2">Admin</p>
          <MemberRow user={groupInfo?.info?.admin} />

          <p className="text-xs text-gray-600 mb-2 mt-3">Members</p>

          {searchUsersLoading ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Loading users...
            </p>
          ) : filteredMembers?.length > 0 ? (
            filteredMembers.map((m) => (
              <MemberRow key={m._id} user={m.member} />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No users found
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setScreen("addMembers");
          }}
          className="w-full bg-orange-500 text-white py-2 font-semibold disabled:bg-gray-300"
        >
          Add Member
        </button>
      </div>
    );
  }
  if (screen === "addMembers") {
    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-96">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => {
              setScreen("list");
              setSelectedUsers([]);
              setSearchTerm("");
            }}
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm text-gray-900">
            Add Members To Group
          </h3>
        </div>

        <div className="px-4 py-2 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search members"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {selectedUsers.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                Selected ({selectedUsers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full"
                  >
                    <img
                      src={
                        user.profilePicture ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-900">{user.name}</span>
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="text-orange-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-600 mb-2">Add members</p>
          {searchUsersLoading ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Loading users...
            </p>
          ) : availableUsers.length > 0 ? (
            availableUsers.map((user) => {
              const isDisabled = user.isGroupInviteOpen === false;
              const isSelected = selectedUsers.find((u) => u._id === user._id);

              return (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center justify-between p-2 rounded mb-1 ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        user.profilePicture ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-sm text-gray-900 block">
                        {user.name}
                      </span>
                      {user.hasConnection && (
                        <span className="text-xs text-gray-400">Connected</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No users found
            </p>
          )}
        </div>

        <button
          onClick={async () => {
            if (selectedUsers.length > 0) {
              const memberIds = selectedUsers.map((u) => u._id);
              await dispatch(
                addGroupMembers({ groupId: groupInfo?.info?._id, memberIds }),
              );
              setScreen("list");
              setSelectedUsers([]);
              setSearchTerm("");
            }
          }}
          className="w-full bg-orange-500 text-white py-2 font-semibold disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    );
  }
  // Group Info Screen
  if (screen === "groupInfo") {
    const groupInfoData = groupInfo?.info || {};
    const members = groupInfo?.members || [];
    const isAdmin =
      groupInfoData?.admin?._id === (user?._id || allUserData?._id);
    const isMuted = groupInfo?.isNotificationMute || false;

    const handleEditImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setEditGroupImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditGroupImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleUpdateGroup = async () => {
      if (!selectedChat?.groupId && !selectedChat?._id) return;

      const groupId = selectedChat.groupId || selectedChat._id;
      const formData = new FormData();

      if (editGroupName.trim()) formData.append("name", editGroupName);
      if (editGroupBio.trim()) formData.append("bio", editGroupBio);
      if (editGroupImage) formData.append("image", editGroupImage);

      try {
        await dispatch(updateGroupInfo({ groupId, formData }));
        // Refresh group info
        await dispatch(getGroupInfo(groupId));
        setEditGroupName("");
        setEditGroupBio("");
        setEditGroupImage(null);
        setEditGroupImagePreview(null);
      } catch (error) {
        console.error("Failed to update group:", error);
      }
    };

    const handleToggleMute = async () => {
      if (!selectedChat?.groupId && !selectedChat?._id) return;

      const groupId = selectedChat.groupId || selectedChat._id;
      const muteValue = isMuted ? "disable" : "enable";

      await dispatch(toggleGroupMute({ groupId, mute: muteValue }));
      // Refresh group info
      await dispatch(getGroupInfo(groupId));
    };

    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-[500px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => setScreen("chat")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-nowrap text-sm text-gray-900">
            Group Info
          </h3>
          <button
            onClick={handleLeaveGroup}
            className="w-full text-end text-red-500 text-sm mt-3"
          >
            Leave Group
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {groupInfoLoading ? (
            <p className="text-center text-gray-400 text-sm mt-10">
              <img
                src="https://assets-v2.lottiefiles.com/a/90a4c0f2-1152-11ee-bda3-830a7a1975f2/iBALXy6uaH.gif"
                alt=""
              />
            </p>
          ) : (
            <>
              {/* Group Image & Name */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  <img
                    src={
                      editGroupImagePreview ||
                      groupInfoData?.image ||
                      "https://randomuser.me/api/portraits/men/1.jpg"
                    }
                    alt={groupInfoData?.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                  {isAdmin && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600">
                      <Plus className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {groupInfoData?.name}
                </h2>
                {groupInfoData?.bio && (
                  <p className="text-sm text-gray-500 text-center mt-1">
                    {groupInfoData?.bio}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {groupInfoData?.numberOfMembers || 0} members
                </p>
              </div>

              {/* Mute Toggle */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <button
                  onClick={handleToggleMute}
                  disabled={toggleMuteLoading}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-900">
                    {isMuted ? "Unmute Notifications" : "Mute Notifications"}
                  </span>
                  <div
                    className={`w-10 h-6 rounded-full ${
                      isMuted ? "bg-orange-500" : "bg-gray-300"
                    } transition-colors`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        isMuted ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Edit Group (Admin Only) */}
              {isAdmin && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Edit Group
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Group name"
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <textarea
                      placeholder="Group bio"
                      value={editGroupBio}
                      onChange={(e) => setEditGroupBio(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
                      rows="2"
                    />
                    <button
                      onClick={handleUpdateGroup}
                      disabled={
                        updateGroupLoading ||
                        (!editGroupName.trim() &&
                          !editGroupBio.trim() &&
                          !editGroupImage)
                      }
                      className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {updateGroupLoading ? "Updating..." : "Update Group"}
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div>
                <div className="flex justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Members ({members.length})
                  </h4>
                  <button
                    onClick={() => setScreen("viewAllMembers")}
                    className="text-orange-500 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {members.map((memberData) => {
                    const member = memberData.member || memberData;
                    const isMemberAdmin =
                      groupInfoData?.admin?._id === member._id;
                    return (
                      <div
                        key={memberData._id || member._id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <img
                          src={
                            member.profilePicture ||
                            "https://randomuser.me/api/portraits/men/1.jpg"
                          }
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                            {isMemberAdmin && (
                              <span className="text-xs text-orange-500 ml-2">
                                (Admin)
                              </span>
                            )}
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Group Details Screen
  if (screen === "groupDetails") {
    return (
      <div
        ref={chatPopupRef}
        className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl border border-gray-200 z-40 flex flex-col h-96"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => setScreen("createGroup")}
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm text-gray-900">
            Create Group Page
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-2 border-dashed border-orange-500 overflow-hidden">
                {groupImagePreview ? (
                  <img
                    src={groupImagePreview}
                    alt="Group preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600">
                <Plus className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Name
            </label>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Bio
            </label>
            <textarea
              placeholder="Group description..."
              value={groupBio}
              onChange={(e) => setGroupBio(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
              rows="3"
            />
          </div>
        </div>

        <button
          onClick={handleCreateGroup}
          disabled={
            createGroupLoading ||
            addMemberLoading ||
            !groupName.trim() ||
            selectedUsers.length === 0 ||
            !groupImage
          }
          className="w-full bg-orange-500 text-white py-2 font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {createGroupLoading || addMemberLoading
            ? "Creating..."
            : "Create Group"}
        </button>
      </div>
    );
  }

  // NEW CHAT SCREEN
  if (screen === "newChat") {
    const filteredUsers = selectedNewChatUser
      ? availableUsers.filter((u) => u._id !== selectedNewChatUser._id)
      : availableUsers;

    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl border border-gray-200 z-40 flex flex-col h-96">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button
            onClick={() => {
              setSelectedNewChatUser(null);
              setSearchTerm("");
              setScreen("list");
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm">New Message</h3>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b">
          <input
            type="text"
            placeholder="Search user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Selected User Chip */}
        {selectedNewChatUser && (
          <div className="px-4 py-2 border-b bg-gray-50">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full">
              <img
                src={
                  selectedNewChatUser.profilePicture ||
                  "https://randomuser.me/api/portraits/men/1.jpg"
                }
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium text-gray-800">
                {selectedNewChatUser.name}
              </span>
              <button
                onClick={() => setSelectedNewChatUser(null)}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {searchUsersLoading ? (
            <p className="text-center text-sm text-gray-400">Searching...</p>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedNewChatUser(u)}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      u.profilePicture ||
                      "https://randomuser.me/api/portraits/men/1.jpg"
                    }
                    className="w-9 h-9 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
      ${
        selectedNewChatUser?._id === u._id
          ? "bg-orange-500 border-orange-500"
          : "border-gray-300"
      }`}
                >
                  {selectedNewChatUser?._id === u._id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-400 mt-4">
              No users found
            </p>
          )}
        </div>

        {/* Start Chat Button */}
        {selectedNewChatUser && (
          <div className="px-4 py-3 border-t">
            <button
              onClick={() => handleStartChat(selectedNewChatUser)}
              className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600"
            >
              Start Chat
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default return (should not reach here)
  return null;
};

export default ChatApp;
