import React, { useState, useEffect, useContext } from "react";
import { X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIndividualChats, fetchGroupChats } from "../../redux/slices/chat.slice";
import SocketContext from "../../context/SocketContext";
import { SuccessToast } from "./Toaster";
import { getFollowersFollowing } from "../../redux/slices/auth.slice";

const ShareToChatsModal = ({ onClose, story, post }) => {
  const [activeTab, setActiveTab] = useState("Individuals Chats");
  const [selectedChats, setSelectedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const { chats, groupChats, chatsLoading, groupChatsLoading } = useSelector((state) => state.chat);
  const { followersFollowing } = useSelector((state) => state.auth);

  // Fetch chats on mount
  useEffect(() => {
    dispatch(fetchIndividualChats({ page: 1, limit: 100, type: "active" }));
    dispatch(fetchGroupChats({ page: 1, limit: 100 }));
    // Fetch only followers (network of current user)
    dispatch(
      getFollowersFollowing({
        type: "followers",
        page: 1,
        limit: 200,
      })
    );
  }, [dispatch]);

  // Build follower id set (only these users should be visible in Individual Chats)
  const followerIdSet = new Set(
    (followersFollowing || []).map((u) => u._id)
  );

  // Base list: only chats where receiver is in followers list
  const followerChats = chats.filter((chat) => {
    const receiverId = chat.receiverInfo?._id || chat.receiverId;
    if (!receiverId) return false;
    // If we have followers data, restrict to followers
    if (followerIdSet.size > 0) {
      return followerIdSet.has(receiverId);
    }
    return false;
  });

  // Filter chats based on search (on top of follower filter)
  const filteredIndividualChats = followerChats.filter((chat) =>
    chat.receiverInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.receiverInfo?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupChats = groupChats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (chatId) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter((id) => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const handleShare = () => {
    if (selectedChats.length === 0) {
      return;
    }

    const isGroupChat = (chatId) => {
      const groupChat = groupChats.find((chat) => chat._id === chatId);
      return !!groupChat;
    };

    // If sharing a story, use dedicated share payload for individual chats
    if (story) {
      // Collect all individual receiverIds from selected chats
      const sendTo = selectedChats
        .filter((chatId) => !isGroupChat(chatId))
        .map((chatId) => {
          const individualChat = chats.find((chat) => chat._id === chatId);
          return (
            individualChat?.receiverInfo?._id ||
            individualChat?.receiverId ||
            null
          );
        })
        .filter(Boolean);

      if (sendTo.length === 0) {
        return;
      }

      const payload = {
        sendTo,
        sharedType: "story",
        page: story?.page?._id,
        pageImage: story?.page?.image,
        media: story?.story?.media?.fileUrl,
        name: story?.page?.name,
        targetId: story?._id,
        textOnImage:
          story?.story?.textOnImage ||
          story?.story?.backgroundCode ||
          null,
        imageStyle: story?.story?.imageStyle || null,
        imageLocalPath: story?.story?.imageLocalPath || null,
      };

      socket.shareContent(payload, (response) => {
        if (response?.success) {
          SuccessToast("Story shared successfully");
        }
      });
    } else if (post) {
      // Share post to individual chats
      const individualChatIds = selectedChats.filter((chatId) => !isGroupChat(chatId));
      const groupChatIds = selectedChats.filter((chatId) => isGroupChat(chatId));

      // Determine sharedType based on post contentType
      const sharedType = post?.contentType === "knowledge" ? "knowledge" : "post";

      // Get page info
      const pageId = post?.page?._id || post?.page;
      const pageImage = post?.page?.image || post?.pageImage;
      const pageName = post?.page?.name || post?.pageName;

      // Get media (first media item)
      const media = post?.media?.[0]?.fileUrl || post?.media?.[0] || null;

      // Get optional fields
      const textOnImage = post?.textOnImage || post?.backgroundCode || null;
      const imageStyle = post?.imageStyle || null;
      const imageLocalPath = post?.imageLocalPath || null;

      // Share to Individual Chats
      if (individualChatIds.length > 0) {
        const sendTo = individualChatIds
          .map((chatId) => {
            const individualChat = chats.find((chat) => chat._id === chatId);
            return (
              individualChat?.receiverInfo?._id ||
              individualChat?.receiverId ||
              null
            );
          })
          .filter(Boolean);

        if (sendTo.length > 0) {
          const payload = {
            sendTo,
            sharedType,
            page: pageId,
            pageImage: pageImage,
            media: media,
            name: pageName,
            targetId: post._id,
            textOnImage: textOnImage,
            imageStyle: imageStyle,
            imageLocalPath: imageLocalPath,
          };

          socket.shareContent(payload, (response) => {
            if (response?.success) {
              SuccessToast("Post shared successfully");
            }
          });
        }
      }

      // Share to Group Chats
      if (groupChatIds.length > 0) {
        const payload = {
          groupIds: groupChatIds,
          sharedType,
          page: pageId,
          pageImage: pageImage,
          media: media,
          name: pageName,
          targetId: post._id,
          textOnImage: textOnImage,
          imageLocalPath: imageLocalPath,
        };

        socket.shareGroupContent(payload, (response) => {
          if (response?.success) {
            SuccessToast("Post shared successfully");
          }
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Share {story ? "Story" : "Post"} With</h2>
          <button
            onClick={() => onClose()}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {["Individuals Chats", "Group Chats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-3">
          {activeTab === "Individuals Chats" ? (
            chatsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading chats...</div>
            ) : filteredIndividualChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No chats found</div>
            ) : (
              filteredIndividualChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => toggleSelect(chat._id)}
                  className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={chat.receiverInfo?.profilePicture || chat.receiverInfo?.image || "https://via.placeholder.com/40"}
                      alt={chat.receiverInfo?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-[15px] font-medium text-gray-800">
                      {chat.receiverInfo?.name || chat.receiverInfo?.username || "Unknown"}
                    </span>
                  </div>
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-md border-2 ${
                      selectedChats.includes(chat._id)
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedChats.includes(chat._id) && (
                      <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                    )}
                  </span>
                </div>
              ))
            )
          ) : (
            groupChatsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading groups...</div>
            ) : filteredGroupChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No groups found</div>
            ) : (
              filteredGroupChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => toggleSelect(chat._id)}
                  className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={chat.image || chat.profilePicture || "https://via.placeholder.com/40"}
                      alt={chat.name || "Group"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-[15px] font-medium text-gray-800">
                      {chat.name || "Unknown Group"}
                    </span>
                  </div>
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-md border-2 ${
                      selectedChats.includes(chat._id)
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedChats.includes(chat._id) && (
                      <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                    )}
                  </span>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleShare}
            disabled={selectedChats.length === 0}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Share {selectedChats.length > 0 && `(${selectedChats.length})`}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {/* {showSuccessModal && (
        <Donemodal onClose={() => setShowSuccessModal(false)} />
      )} */}
    </div>
  );
};

export default ShareToChatsModal;
