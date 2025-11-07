import React, { useState } from "react";
import { MessageCircle, ChevronUp, Plus, X, Send, ArrowLeft, Check } from "lucide-react";

const ChatApp = () => {
  const [screen, setScreen] = useState("list");
  const [activeTab, setActiveTab] = useState("Chat");
  const [open, setOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageText, setMessageText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const allUsers = [
    { id: 1, name: "Peter Parker", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
    { id: 2, name: "Rose Merry", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
    { id: 3, name: "Mike Ford", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    { id: 4, name: "David Laid", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
    { id: 5, name: "Azadeh James", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
    { id: 6, name: "Olivia James", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
    { id: 7, name: "Ava Hart", avatar: "https://randomuser.me/api/portraits/women/6.jpg" },
    { id: 8, name: "Adam Liz", avatar: "https://randomuser.me/api/portraits/men/8.jpg" },
  ];

  const chatsData = {
    Chat: [
      {
        id: "p1",
        name: "Peter Parker",
        msg: "Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
        unread: 1,
      },
      {
        id: "o1",
        name: "Olivia James",
        msg: "See you later!",
        date: "10 Jan",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
        unread: 0,
      },
      {
        id: "a1",
        name: "Ava Hart",
        msg: "Thanks for helping me",
        date: "9 Jan",
        avatar: "https://randomuser.me/api/portraits/women/6.jpg",
        unread: 0,
      },
    ],
    "Group Chat": [
      {
        id: "g1",
        name: "My Group",
        msg: "Olivia: Hi, how are you?",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg",
        unread: 2,
        members: 50,
      },
      {
        id: "g2",
        name: "Work Team",
        msg: "Mike: Project done!",
        date: "11 Jan",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        unread: 0,
        members: 12,
      },
    ],
    Request: [
      {
        id: "r1",
        name: "John Doe",
        msg: "Wants to chat",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        id: "r2",
        name: "Sarah Smith",
        msg: "Wants to chat",
        avatar: "https://randomuser.me/api/portraits/women/7.jpg",
      },
    ],
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
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      setScreen("list");
      setSelectedUsers([]);
      setGroupName("");
    }
  };

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span className="text-orange-500 font-semibold text-sm">2 New</span>
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
            {chatsData[activeTab].length > 0 ? (
              chatsData[activeTab].map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setScreen("chat");
                  }}
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
                        <button className="w-5 h-5 bg-orange-500 text-white rounded flex items-center justify-center hover:bg-orange-600">
                          <Check className="w-3 h-3" />
                        </button>
                        <button className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300">
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
            <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-sm text-gray-900">{selectedChat.name}</p>
              <p className="text-xs text-gray-500">{selectedChat.members ? `${selectedChat.members} members` : "Online"}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
          {messages[selectedChat.id] ? (
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
                  <div key={user.id} className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
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
          {filteredUsers.map((user) => (
            <div key={user.id} onClick={() => handleSelectUser(user)} className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded mb-1">
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm text-gray-900">{user.name}</span>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedUsers.find((u) => u.id === user.id) ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                {selectedUsers.find((u) => u.id === user.id) && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          ))}
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
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center border-2 border-dashed border-orange-500">
                <span className="text-2xl">📷</span>
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
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
            <textarea placeholder="Group description..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none" rows="3" />
          </div>
        </div>

        <button onClick={handleCreateGroup} className="w-full bg-orange-500 text-white py-2 font-semibold hover:bg-orange-600">
          Create Group
        </button>
      </div>
    );
  }
};

export default ChatApp;