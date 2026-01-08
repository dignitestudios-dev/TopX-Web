import React, { useState, useRef, useEffect } from "react";
import { Send, LogOut, XCircle, Loader2, User, Image as ImageIcon, Smile, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import useSocket from "../../socket/useSocket";
import { SOCKET_EVENTS } from "../../constants/socketEvents";
import { useDispatch, useSelector } from "react-redux";
import { fetchLiveChatHistory } from "../../redux/slices/chat.slice";
import axios from "../../axios";

const GIPHY_API_KEY = "NGuGyGgjXdVH04wSX5pxvSlwvB7cXbeI"; // Replace with your actual key

export default function LiveChat() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pageId, pageName } = state || {};
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const chatIdRef = useRef(null); 
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // GIF State
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifQuery, setGifQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  const { chatDetailMessages, chatDetailLoading } = useSelector((state) => state.chat);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { on, emit, socket } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Giphy API Fetch
  const fetchGifs = async (query = "") => {
    try {
      const url = `https://api.giphy.com/v1/gifs/${query ? "search" : "trending"}?api_key=${GIPHY_API_KEY}&q=${query}&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
    }
  };

  useEffect(() => {
    if (showGifPicker) fetchGifs(gifQuery);
  }, [showGifPicker, gifQuery]);

  // Sync History
  useEffect(() => {
    if (chatDetailMessages?.length > 0) {
      const formattedHistory = chatDetailMessages.map((msg) => ({
        id: msg._id,
        senderName: msg.sender?.username || "Other",
        senderPic: msg.sender?.profilePicture,
        text: msg.content,
        media: msg.mediaUrls,
        time: new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        isMe: msg.sender?._id === currentUser?._id
      }));
      setMessages([...formattedHistory].reverse());
    }
  }, [chatDetailMessages, currentUser?._id]);

  // Socket Setup
  useEffect(() => {
    if (!socket || !pageId) return;

    const handleJoin = () => {
      socket.emit(SOCKET_EVENTS.LIVE.JOIN, { pageId }, (response) => {
        const receivedId = response?.data;
        if (receivedId && response.success) {
          setChatId(receivedId);
          chatIdRef.current = receivedId;
          dispatch(fetchLiveChatHistory({ chatId: receivedId, page: 1, limit: 50 }));
        }
      });
    };

    if (socket.connected) handleJoin();
    else socket.on("connect", handleJoin);

    const unsubscribe = on(SOCKET_EVENTS.LIVE.MESSAGE_RECEIVED, (data) => {
      const msgData = data.message || data;
      const sId = msgData.sender?._id || data.senderId;
      if (sId === currentUser?._id) return;

      setMessages((prev) => [...prev, {
        id: msgData._id || Date.now(),
        senderName: msgData.sender?.username || "Other",
        senderPic: msgData.sender?.profilePicture,
        text: msgData.content,
        media: msgData.mediaUrls || [],
        time: new Date(msgData.createdAt || Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        isMe: false
      }]);
    });

    return () => {
      if (chatIdRef.current) emit(SOCKET_EVENTS.LIVE.LEAVE, { chatId: chatIdRef.current });
      unsubscribe();
      socket.off("connect", handleJoin);
    };
  }, [pageId, socket, on, emit, dispatch, currentUser?._id]);

  const sendMediaMessage = async (urls, content = "") => {
    const activeChatId = chatId || chatIdRef.current;
    if (!activeChatId) return;

    const payload = { chatId: activeChatId, content, mediaUrls: urls };
    emit(SOCKET_EVENTS.LIVE.MESSAGE_SEND, payload);

    setMessages((prev) => [...prev, {
      id: Date.now(),
      senderName: "You",
      senderPic: currentUser?.profilePicture,
      text: content,
      media: urls,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      isMe: true
    }]);
  };

  const handleSendText = () => {
    if (!message.trim()) return;
    sendMediaMessage([], message);
    setMessage("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("documents", file); // Adjust key name based on your backend (documents/file/image)

    try {
      const res = await axios.post("/common/upload-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const url = res.data?.data?.[0] || res.data?.url;
      if (url) sendMediaMessage([url]);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const selectGif = (gifUrl) => {
    sendMediaMessage([gifUrl]);
    setShowGifPicker(false);
  };

  const handleEndChat = () => {
    if (pageId) {
      emit(SOCKET_EVENTS.LIVE.END, { pageId });
      navigate(-1);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      {/* Sidebar - Same as before */}
      <div className="w-80 bg-gray-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Support Live</h2>
        </div>
        <div className="flex-1 p-4">
           <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <p className="font-bold text-gray-100">{pageName || "Live Room"}</p>
              <p className="text-[10px] text-green-400 uppercase font-bold">Connected</p>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 relative">
        {/* Header */}
        <div className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-lg">{pageName} Chat</span>
          <button onClick={handleEndChat} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">End Session</button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, index) => (
            <div key={msg.id || index} className={`flex items-start gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
              <img src={msg.senderPic || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
              <div className={`max-w-[70%] flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase">{msg.senderName}</span>
                <div className={`px-4 py-2 rounded-2xl ${msg.isMe ? "bg-orange-500 text-white" : "bg-white border"}`}>
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  {msg.media && msg.media.map((url, i) => (
                    <img key={i} src={url} className="mt-2 rounded-lg max-w-full h-auto max-h-60 cursor-pointer hover:opacity-90" alt="media" onClick={() => window.open(url)} />
                  ))}
                  <p className="text-[8px] mt-1 text-right opacity-70">{msg.time}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* GIF Picker Modal */}
        {showGifPicker && (
          <div className="absolute bottom-24 left-8 right-8 bg-white border rounded-2xl shadow-2xl z-20 p-4 max-h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <input type="text" placeholder="Search GIFs..." className="bg-gray-100 border-none rounded-lg px-4 py-2 flex-1 text-sm" value={gifQuery} onChange={(e) => setGifQuery(e.target.value)} />
              <button onClick={() => setShowGifPicker(false)} className="ml-2 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto">
              {gifs.map(gif => (
                <img key={gif.id} src={gif.images.fixed_height_small.url} className="cursor-pointer hover:scale-105 transition rounded" onClick={() => selectGif(gif.images.original.url)} alt="gif" />
              ))}
            </div>
          </div>
        )}

        {/* Input Footer */}
        <div className="bg-white border-t p-6">
          {uploading && <p className="text-xs text-orange-500 mb-2 animate-pulse">Uploading media...</p>}
          <div className="flex gap-3 items-center max-w-5xl mx-auto">
            <button onClick={() => setShowGifPicker(!showGifPicker)} className="text-gray-400 hover:text-orange-500"><Smile size={24}/></button>
            <button onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-orange-500"><ImageIcon size={24}/></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            <input
              type="text"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendText()}
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm focus:bg-white transition-all border-none"
            />
            <button onClick={handleSendText} disabled={!message.trim() || uploading} className="bg-orange-500 text-white p-3 rounded-xl disabled:bg-gray-200">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}