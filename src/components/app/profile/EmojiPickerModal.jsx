import React, { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import axios from "../../../axios";
import { ErrorToast } from "../../global/Toaster";

export default function EmojiPickerModal({ isOpen, onClose, onSelectEmoji }) {
  const [emojis, setEmojis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchEmojis();
    }
  }, [isOpen]);

  const fetchEmojis = async () => {
    setLoading(true);
    try {
      // Fetch up to 100 emojis for display
      const response = await axios.get("/emojis?page=1&limit=100");
      const emojiList = response?.data?.data || response?.data || [];
      if (Array.isArray(emojiList)) {
        setEmojis(emojiList);
      } else {
        setEmojis([]);
      }
    } catch (error) {
      console.error("Failed to fetch emojis:", error);
      ErrorToast("Failed to load emojis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter emojis if user types in search filter
  const filteredEmojis = emojis.filter((emoji) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const idMatches = emoji._id?.toLowerCase().includes(query);
    const urlMatches = emoji.url?.toLowerCase().includes(query);
    const nameMatches = emoji.name?.toLowerCase().includes(query);
    return idMatches || urlMatches || nameMatches;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl relative border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">
                Choose an Emoji
              </h3>
              <p className="text-[12px] text-gray-500">
                Select an emoji to set as your profile picture
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search / Filter Input */}
          <div className="my-4 relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Filter emojis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[42px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[14px] text-[14px] outline-none focus:border-[#f85e00] focus:bg-white transition-all"
            />
          </div>

          {/* Emoji Grid Container */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[220px]">
            {loading ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="animate-spin text-[#f85e00]" size={28} />
                <span className="text-sm font-medium">Loading emojis...</span>
              </div>
            ) : filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-1">
                {filteredEmojis.map((emoji, index) => (
                  <button
                    key={emoji._id || index}
                    type="button"
                    onClick={() => {
                      onSelectEmoji(emoji.url);
                      onClose();
                    }}
                    className="group relative flex items-center justify-center p-3 rounded-[16px] border border-gray-100 hover:border-[#f85e00] bg-gray-50/60 hover:bg-[#FFF5F2] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <img
                      src={emoji.url}
                      alt="Emoji"
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm font-medium">
                No emojis found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
