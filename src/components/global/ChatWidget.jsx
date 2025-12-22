import React, { useState, useEffect } from "react";
import { MessageCircle, ChevronUp, Plus, X, Send, ArrowLeft, Check } from "lucide-react";
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
} from "../../redux/slices/chat.slice";

const ChatApp = () => {
  const dispatch = useDispatch();
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
  
  const [screen, setScreen] = useState("list");
  const [activeTab, setActiveTab] = useState("Chat");
  const [open, setOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
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
  // Group info screen states
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupBio, setEditGroupBio] = useState("");
  const [editGroupImage, setEditGroupImage] = useState(null);
  const [editGroupImagePreview, setEditGroupImagePreview] = useState(null);

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

  // Fetch users when on createGroup screen
  useEffect(() => {
    if (screen === "createGroup") {
      const timeoutId = setTimeout(() => {
        dispatch(searchUsers({ page: userSearchPage, limit, search: searchTerm }));
      }, 500); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [screen, userSearchPage, limit, searchTerm, dispatch]);

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

  // Handle chat click
  const handleChatClick = async (chat) => {
    setSelectedChat(chat);
    setScreen("chat");
    // Fetch chat detail based on chat type
    // Check if it's a group chat - use groupId if available, otherwise use _id
    const groupId = chat.groupId || chat.group || (chat.isGroup ? chat._id : null);
    
    if (chat.isGroup || groupId) {
      await dispatch(fetchGroupChatHistory({ groupId: groupId || chat._id, page: 1, limit: 5 }));
    } else {
      await dispatch(fetchIndividualChatDetail(chat._id));
    }
  };

  // Transform API data to component format
  const transformChatData = (chat) => {
    // Check if it's a group chat - group chats have group field or isGroup flag
    const isGroup = chat.isGroup || chat.group || (chat.groupId && !chat.receiverInfo);
    
    return {
      id: chat._id,
      name: chat.receiverInfo?.name || chat.name || "Unknown",
      msg: chat.lastMessage?.content || "No messages",
      date: formatDate(chat.lastMessage?.createdAt || chat.createdAt),
      avatar: chat.receiverInfo?.profilePicture || chat.image || chat.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg",
      unread: chat.unreadCount || 0,
      _id: chat._id,
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
      avatar: groupChat.image || groupChat.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg",
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
      .filter(chat => {
        const isGroup = chat.isGroup || chat.group || (chat.groupId && !chat.receiverInfo);
        return isGroup;
      })
      .map(transformChatData);
    
    // Combine and remove duplicates
    const allGroups = [...fromGroupAPI, ...fromIndividualChats];
    const uniqueGroups = allGroups.filter((group, index, self) => 
      index === self.findIndex(g => g._id === group._id)
    );
    return uniqueGroups;
  };

  const chatsData = {
    Chat: activeTab === "Chat" ? getChatsData().filter(chat => !chat.isGroup) : [],
    "Group Chat": activeTab === "Group Chat" ? getGroupChatsData() : [],
    Request: activeTab === "Request" ? getChatsData().filter(chat => !chat.isGroup) : [],
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), { text: messageText, sender: "user" }],
      }));
      setMessageText("");
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

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
    if (groupName.trim() && selectedUsers.length > 0) {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("bio", groupBio);
      if (groupImage) {
        formData.append("image", groupImage);
      }

      try {
        const result = await dispatch(createGroup(formData));
        if (createGroup.fulfilled.match(result)) {
          const groupId = result.payload._id;
          
          // Add selected members to group
          if (selectedUsers.length > 0) {
            const memberIds = selectedUsers.map((u) => u._id);
            await dispatch(addGroupMembers({ groupId, memberIds }));
          }

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
  const availableUsers = searchUsersList?.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Chat List Screen
  if (screen === "list") {
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
          <ChevronUp className={`w-5 h-5 text-orange-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <div
          className={`fixed bottom-20 right-6 w-80 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 transition-all ${
            open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-5 pointer-events-none"
          } z-40`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Message</h3>
            </div>
            <Plus className="w-5 h-5 text-gray-700 cursor-pointer" />
          </div>

          <div className="px-4 py-2 border-b border-gray-200">
            <input type="text" placeholder="Search" className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none" />
          </div>

          <div className="flex border-b border-gray-200 text-sm font-medium">
            {["Chat", "Group Chat", "Request"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 ${activeTab === tab ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {(chatsLoading || (activeTab === "Group Chat" && groupChatsLoading)) ? (
              <p className="text-sm text-gray-500 text-center py-6">Loading...</p>
            ) : chatsData[activeTab].length > 0 ? (
              chatsData[activeTab].map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900">{chat.name}</p>
                      <p className="text-xs text-gray-500 truncate">{chat.msg}</p>
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
              <p className="text-sm text-gray-500 text-center py-6">No {activeTab.toLowerCase()} available</p>
            )}
          </div>

          {activeTab === "Group Chat" && (
            <button
              onClick={() => {
                setScreen("createGroup");
                setOpen(false);
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
    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-96">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("list")} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img 
              src={selectedChat?.avatar || selectedChat?.receiverInfo?.profilePicture || selectedChat?.image} 
              alt={selectedChat?.name || selectedChat?.receiverInfo?.name || "Chat"} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="flex-1">
              <p 
                className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-500"
                onClick={() => {
                  if (selectedChat?.isGroup) {
                    const groupId = selectedChat.groupId || selectedChat._id;
                    dispatch(getGroupInfo(groupId));
                    setScreen("groupInfo");
                  }
                }}
              >
                {selectedChat?.name || selectedChat?.receiverInfo?.name || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {selectedChat?.isGroup 
                  ? `${selectedChat.members || 0} members` 
                  : "Online"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
          {chatDetailLoading ? (
            <p className="text-center text-gray-400 text-sm mt-10">Loading messages...</p>
          ) : chatDetailMessages && chatDetailMessages.length > 0 ? (
            chatDetailMessages.map((msg, i) => {
              const currentUserId = user?._id || allUserData?._id;
              const isCurrentUser = msg.sender?._id === currentUserId;
              
              return (
                <div key={msg._id || i} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  {!isCurrentUser && (
                    <img 
                      src={msg.sender?.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg"} 
                      alt={msg.sender?.name || "User"} 
                      className="w-8 h-8 rounded-full object-cover mr-2 self-end mb-1" 
                    />
                  )}
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    isCurrentUser 
                      ? "bg-orange-500 text-white rounded-br-none" 
                      : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                  }`}>
                    {msg.type === "shared" && msg.shared ? (
                      <div className="space-y-2">
                        <p className="text-xs opacity-80 mb-1">Shared a {msg.shared.sharedType === "knowledge" ? "knowledge post" : "post"}</p>
                        {msg.shared.pageImage && (
                          <img 
                            src={msg.shared.pageImage} 
                            alt="Shared post" 
                            className="w-full rounded-lg" 
                          />
                        )}
                        {msg.shared.textOnImage && (
                          <p className="text-sm">{msg.shared.textOnImage}</p>
                        )}
                        {msg.content && msg.content !== "Shared a knowledge post" && (
                          <p className="text-sm mt-1">{msg.content}</p>
                        )}
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.mediaUrls.map((url, idx) => (
                          <img key={idx} src={url} alt={`Media ${idx + 1}`} className="w-full rounded mt-1" />
                        ))}
                      </div>
                    )}
                    <p className={`text-[10px] mt-1 ${isCurrentUser ? "text-orange-100" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                  {isCurrentUser && (
                    <img 
                      src={user?.profilePicture || allUserData?.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg"} 
                      alt="You" 
                      className="w-8 h-8 rounded-full object-cover ml-2 self-end mb-1" 
                    />
                  )}
                </div>
              );
            })
          ) : messages[selectedChat?.id] ? (
            messages[selectedChat.id].map((msg, i) => (
              <div key={i} className="flex justify-end">
                <div className="max-w-xs px-3 py-2 rounded-lg text-sm bg-orange-500 text-white rounded-br-none">
                  {msg.text}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-sm mt-10">No messages yet</p>
          )}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          />
          <button onClick={handleSendMessage} className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Create Group Screen
  if (screen === "createGroup") {
    return (
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-96">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button onClick={() => { setScreen("list"); setSelectedUsers([]); setSearchTerm(""); }} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm text-gray-900">Create Group</h3>
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
              <p className="text-xs text-gray-600 mb-2">Selected ({selectedUsers.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
                    <img 
                      src={user.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg"} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full object-cover" 
                    />
                    <span className="text-xs text-gray-900">{user.name}</span>
                    <button onClick={() => handleSelectUser(user)} className="text-orange-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-600 mb-2">Add members</p>
          {searchUsersLoading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading users...</p>
          ) : availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <div 
                key={user._id} 
                onClick={() => handleSelectUser(user)} 
                className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded mb-1"
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={user.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg"} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <div>
                    <span className="text-sm text-gray-900 block">{user.name}</span>
                    {user.hasConnection && (
                      <span className="text-xs text-gray-400">Connected</span>
                    )}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedUsers.find((u) => u._id === user._id) 
                    ? "bg-orange-500 border-orange-500" 
                    : "border-gray-300"
                }`}>
                  {selectedUsers.find((u) => u._id === user._id) && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No users found</p>
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

  // Group Info Screen
  if (screen === "groupInfo") {
    const groupInfoData = groupInfo?.info || {};
    const members = groupInfo?.members || [];
    const isAdmin = groupInfoData?.admin?._id === (user?._id || allUserData?._id);
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
          <h3 className="font-semibold text-sm text-gray-900">Group Info</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {groupInfoLoading ? (
            <p className="text-center text-gray-400 text-sm mt-10">Loading...</p>
          ) : (
            <>
              {/* Group Image & Name */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  <img 
                    src={editGroupImagePreview || groupInfoData?.image || "https://randomuser.me/api/portraits/men/1.jpg"} 
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
                <h2 className="font-semibold text-lg text-gray-900">{groupInfoData?.name}</h2>
                {groupInfoData?.bio && (
                  <p className="text-sm text-gray-500 text-center mt-1">{groupInfoData?.bio}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{groupInfoData?.numberOfMembers || 0} members</p>
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
                  <div className={`w-10 h-6 rounded-full ${isMuted ? "bg-orange-500" : "bg-gray-300"} transition-colors`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isMuted ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>
              </div>

              {/* Edit Group (Admin Only) */}
              {isAdmin && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Edit Group</h4>
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
                      disabled={updateGroupLoading || (!editGroupName.trim() && !editGroupBio.trim() && !editGroupImage)}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {updateGroupLoading ? "Updating..." : "Update Group"}
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Members ({members.length})
                </h4>
                <div className="space-y-2">
                  {members.map((memberData) => {
                    const member = memberData.member || memberData;
                    const isMemberAdmin = groupInfoData?.admin?._id === member._id;
                    return (
                      <div key={memberData._id || member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <img 
                          src={member.profilePicture || "https://randomuser.me/api/portraits/men/1.jpg"} 
                          alt={member.name} 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                            {isMemberAdmin && (
                              <span className="text-xs text-orange-500 ml-2">(Admin)</span>
                            )}
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500">{member.email}</p>
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
      <div className="fixed bottom-6 right-6 w-96 bg-white rounded-[12px] shadow-2xl overflow-hidden border border-gray-200 z-40 flex flex-col h-96">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <button onClick={() => setScreen("createGroup")} className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-sm text-gray-900">Add Group Details</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-2 border-dashed border-orange-500 overflow-hidden">
                {groupImagePreview ? (
                  <img src={groupImagePreview} alt="Group preview" className="w-full h-full object-cover" />
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
                />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Name</label>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">Bio</label>
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
          disabled={createGroupLoading || addMemberLoading || !groupName.trim() || selectedUsers.length === 0}
          className="w-full bg-orange-500 text-white py-2 font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {createGroupLoading || addMemberLoading ? "Creating..." : "Create Group"}
        </button>
      </div>
    );
  }
};

export default ChatApp;