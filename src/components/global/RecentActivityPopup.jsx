import React from "react";
import { X } from "lucide-react";

const RecentActivityPopup = ({ onClose }) => {
  return (
    <div className="absolute right-[10em] top-[6em] w-[22rem] bg-white shadow-xl rounded-xl border scrollbar-hide border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold">Recent Activity</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Activity Content */}
      <div className="max-h-[75vh] overflow-y-auto scrollbar-hide p-4 space-y-4">
        <div className="text-sm text-gray-600 underline cursor-pointer">
          You have commented on this post.
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="user"
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">Peter’s Basketball</p>
              <p className="text-xs text-gray-500">@peterparker5 · 5 mins ago</p>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d"
            alt="post"
            className="w-full h-40 object-cover rounded-lg mb-2"
          />

          <p className="text-sm text-gray-700 leading-snug">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="text-sm text-gray-600 underline cursor-pointer">
          You have liked this post.
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="https://randomuser.me/api/portraits/men/33.jpg"
              alt="user"
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">Peter’s Basketball</p>
              <p className="text-xs text-gray-500">@peterparker5 · 5 mins ago</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-snug mb-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="flex items-center gap-2">
            <img
              src="https://randomuser.me/api/portraits/men/12.jpg"
              alt="commenter"
              className="w-7 h-7 rounded-full"
            />
            <div className="bg-white px-3 py-2 rounded-lg border text-sm">
              <strong>Mike Smith</strong> Amazing. Keep it up!
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-1">1 hr ago</p>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityPopup;
