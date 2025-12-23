import React, { useState } from "react";
import { X, Plus, Search } from "lucide-react";

// Global Modal Component
function GlobalShareModal({ isOpen, onClose, modalType, onShare }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(
    modalType === "group" ? "group" : "individual"
  );

  // Mock data for different chat types
  const chatData = {
    individual: [
      { id: 1, name: "Mike's Basketball", avatar: "🏀", type: "individual" },
      { id: 2, name: "Mike's Fitness", avatar: "💪", type: "individual" },
      { id: 3, name: "Mike's Opinions", avatar: "💭", type: "individual" },
      { id: 4, name: "Mike's Cooking", avatar: "👨‍🍳", type: "individual" },
      { id: 5, name: "Mike's Politics", avatar: "🗳️", type: "individual" },
      { id: 6, name: "Mike's Cars", avatar: "🚗", type: "individual" },
      { id: 7, name: "Mike's Fashion", avatar: "👔", type: "individual" },
    ],
    group: [
      { id: 1, name: "Group", avatar: "👥", type: "group" },
      { id: 2, name: "Group", avatar: "👥", type: "group" },
      { id: 3, name: "Group", avatar: "👥", type: "group" },
      { id: 4, name: "Group", avatar: "👥", type: "group" },
      { id: 5, name: "Group", avatar: "👥", type: "group" },
    ],
    story: [
      { id: 1, name: "Mike's Basketball", avatar: "🏀" },
      { id: 2, name: "Mike's Fitness", avatar: "💪" },
      { id: 3, name: "Mike's Opinions", avatar: "💭" },
      { id: 4, name: "Mike's Cooking", avatar: "👨‍🍳" },
      { id: 5, name: "Mike's Cars", avatar: "🚗" },
      { id: 6, name: "Mike's Fashion", avatar: "👔" },
    ],
    repost: [
      { id: 1, name: "Mike's Basketball", avatar: "🏀" },
      { id: 2, name: "Mike's Fitness", avatar: "💪" },
      { id: 3, name: "Mike's Opinions", avatar: "💭" },
      { id: 4, name: "Mike's Cooking", avatar: "👨‍🍳" },
      { id: 5, name: "Mike's Cars", avatar: "🚗" },
      { id: 6, name: "Mike's Fashion", avatar: "👔" },
    ],
  };

  // Modal configurations
  const modalConfig = {
    story: {
      title: "Post Story",
      showTabs: false,
      showCreateNew: true,
      buttonText: "Post Now",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
    repost: {
      title: "Repost",
      showTabs: false,
      showCreateNew: true,
      buttonText: "Repost Now",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
    individual: {
      title: "Share Post With",
      showTabs: true,
      showCreateNew: false,
      buttonText: "Share",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
    group: {
      title: "Share Post With",
      showTabs: true,
      showCreateNew: false,
      buttonText: "Share",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
  };

  if (!isOpen) return null;

  const config = modalConfig[modalType] || modalConfig.individual;
  const items = chatData[modalType] || [];

  const currentItems =
    config.showTabs && (modalType === "individual" || modalType === "group")
      ? chatData[activeTab]
      : items;

  const filteredItems = currentItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    onShare && onShare(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {config.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs (for individual/group chats) */}
        {config.showTabs && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("individual")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "individual"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Individuals Chats
            </button>
            <button
              onClick={() => setActiveTab("group")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "group"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Group Chats
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Create New Option (for story/repost) */}
        {config.showCreateNew && (
          <div className="px-4 pt-4">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Plus size={20} className="text-orange-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Create New Page
              </span>
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="max-h-[400px] overflow-y-auto px-4 py-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              onClick={() => toggleSelection(item.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                  {item.avatar}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedItems.includes(item.id)
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {selectedItems.includes(item.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleShare}
            disabled={selectedItems.length === 0}
            className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
              config.buttonColor
            } ${
              selectedItems.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg"
            }`}
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
