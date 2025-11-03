import React from "react";
import { X } from "lucide-react";

const NotificationPopup = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      type: "follow",
      name: "Olivia J.",
      message: "started following your page.",
      time: "2hrs ago",
      avatar: "https://randomuser.me/api/portraits/women/79.jpg",
    },
    {
      id: 2,
      type: "request",
      name: "Rose M.",
      message: "requested to follow your page.",
      time: "2hrs ago",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      actions: ["Accept", "Decline"],
    },
    {
      id: 3,
      type: "post",
      name: "Alex J.",
      message: 'has posted on your page “Mike’s Basketball”.',
      time: "2hrs ago",
      avatar: "https://randomuser.me/api/portraits/men/66.jpg",
      actions: ["Approve", "Decline"],
    },
    {
      id: 4,
      type: "chat",
      title: "Live Chat Started",
      detail: "Peter’s Basketball topic page started live chat.",
      time: "2hrs ago",
    },
    {
      id: 5,
      type: "default",
      title: "Notification title",
      detail: "Notification detail goes here",
      time: "2hrs ago",
    },
    {
      id: 6,
      type: "default",
      title: "Notification title",
      detail: "Notification detail goes here",
      time: "1day ago",
    },
    {
      id: 7,
      type: "likes",
      name: "David Smith",
      message: "and 5 other people like your post",
      time: "1day ago",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    },
  ];

  return (
    <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-orange-500 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition"
          >
            {/* Avatar */}
            {n.avatar && (
              <img
                src={n.avatar}
                alt={n.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            )}

            {/* Content */}
            <div className="flex-1">
              {/* Follows / Likes / Posts */}
              {n.name ? (
                <>
                  <p className="text-sm text-gray-800 leading-snug">
                    <span className="font-semibold">{n.name}</span> {n.message}
                  </p>

                  {/* Action Buttons */}
                  {n.actions && (
                    <div className="flex gap-2 mt-2">
                      {n.actions.map((btn, i) => (
                        <button
                          key={i}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-md ${
                            btn === "Accept" || btn === "Approve"
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Default Notification Type
                <>
                  <p className="text-sm font-semibold text-gray-800">
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{n.detail}</p>
                </>
              )}

              {/* Time */}
              <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPopup;
