import React, { useState } from "react";
import { X, Search } from "lucide-react";

const ShareToChatsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("Individuals Chats");
  const [selectedChats, setSelectedChats] = useState([]);
  // const [showSuccessModal, setShowSuccessModal] = useState(false); // State for showing success modal

  const chats = [
    {
      name: "Mike’s Basketball",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    {
      name: "Mike’s Fitness",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Mike’s Opinion",
      image: "https://randomuser.me/api/portraits/men/20.jpg",
    },
    {
      name: "Mike’s Cooking",
      image: "https://randomuser.me/api/portraits/men/21.jpg",
    },
    {
      name: "Mike’s Politics",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
    },
    {
      name: "Mike’s Cooking",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
    },
  ];

  const toggleSelect = (chatName) => {
    if (selectedChats.includes(chatName)) {
      setSelectedChats(selectedChats.filter((name) => name !== chatName));
    } else {
      setSelectedChats([...selectedChats, chatName]);
    }
  };

  const handleSharePost = () => {
    setShowSuccessModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Share Post With</h2>
          <button
            onClick={() => onClose("")}
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
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-3">
          {chats.map((chat, index) => (
            <div
              key={index}
              onClick={() => toggleSelect(chat.name)}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={chat.image}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-[15px] font-medium text-gray-800">
                  {chat.name}
                </span>
              </div>
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-md border-2 ${
                  selectedChats.includes(chat.name)
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {selectedChats.includes(chat.name) && (
                  <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleSharePost}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Share
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
