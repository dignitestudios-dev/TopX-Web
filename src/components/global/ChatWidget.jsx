import React, { useState } from "react";
import {
  MessageCircle,
  MessageSquarePlus,
  ChevronUp,
  Plus,
} from "lucide-react";

const FloatingChatSystem = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Chat");

  const data = {
    Chat: [
      {
        name: "Peter Parker",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
        unread: true,
      },
      {
        name: "Olivia James",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      {
        name: "Ava Hart",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      },
      {
        name: "Adam Liz",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/9.jpg",
      },
      {
        name: "Jason",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      },
      {
        name: "Michael",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      },
    ],
    "Group Chat": [
      {
        name: "My Group",
        msg: "Olivia: Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg",
        unread: true,
      },
      {
        name: "Group 2",
        msg: "Mike: Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        name: "Group 3",
        msg: "Jason: Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/women/9.jpg",
      },
    ],
    Request: [],
  };

  return (
    <>
      {/* Floating Button (Visible Always) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 flex items-center justify-between w-72 bg-white rounded-[10px] shadow-lg px-4 py-3 hover:shadow-xl transition-all cursor-pointer z-50"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-500" />
          <span className="text-orange-500 font-semibold text-sm">2 New</span>
          <span className="text-gray-800 font-medium text-sm">Message</span>
        </div>

        <div className="flex items-center gap-3">
          <MessageSquarePlus className="w-5 h-5 text-gray-700" />
          <ChevronUp
            className={`w-5 h-5 text-orange-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Chat Popup */}
      <div
        className={`fixed bottom-20 right-6 w-80 bg-white rounded-[12px] shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-5 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Message</h3>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquarePlus className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Tabs */}
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

        {/* Chat List */}
        <div className="max-h-96 overflow-y-auto scrollbar-hide">
          {data[activeTab].length > 0 ? (
            data[activeTab].map((chat, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500">{chat.msg}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-400">{chat.date}</p>
                  {chat.unread && (
                    <div className="w-4 h-4 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full mt-1">
                      1
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

        {/* Floating + Button (only in Group Chat) */}
        {activeTab === "Group Chat" && (
          <button className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 rounded-full text-white flex items-center justify-center shadow-md hover:bg-orange-600">
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  );
};

export default FloatingChatSystem;
