import React, { useState } from "react";
import { X, Search, Plus } from "lucide-react";

const PostStoryModal = ({ onClose }) => {
  const [selectedPage, setSelectedPage] = useState("Mike’s Basketball");

  const pages = [
    { name: "Mike’s Basketball", image: "https://randomuser.me/api/portraits/men/11.jpg" },
    { name: "Mike’s Fitness", image: "https://randomuser.me/api/portraits/men/22.jpg" },
    { name: "Mike’s Opinions", image: "https://randomuser.me/api/portraits/men/44.jpg" },
    { name: "Mike’s Cooking", image: "https://randomuser.me/api/portraits/men/21.jpg" },
    { name: "Mike’s Cars", image: "https://randomuser.me/api/portraits/men/25.jpg" },
    { name: "Mike’s Fashion", image: "https://randomuser.me/api/portraits/men/30.jpg" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Post Story</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
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

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
          {/* Create New Page */}
          <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-orange-500">
                <Plus size={18} className="text-orange-500" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">
                Create New PageS
              </span>
            </div>
          </div>

          {/* Existing Pages */}
          {pages.map((page, index) => (
            <div
              key={index}
              onClick={() => setSelectedPage(page.name)}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={page.image}
                  alt={page.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-[15px] font-medium text-gray-800">
                  {page.name}
                </span>
              </div>
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-md border-2 ${
                  selectedPage === page.name
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {selectedPage === page.name && (
                  <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={() => alert(`Story posted on ${selectedPage}!`)}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium hover:bg-orange-700 transition-colors"
          >
            Post Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostStoryModal;
