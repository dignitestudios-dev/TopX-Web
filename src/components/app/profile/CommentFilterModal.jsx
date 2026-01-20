import React, { useState } from "react";
import { X } from "lucide-react";

const CommentFilterModal = ({ isOpen, onClose, onApply, selectedFilter }) => {
  const [localSelectedFilter, setLocalSelectedFilter] = useState(selectedFilter || "all");

  if (!isOpen) return null;

  const filterOptions = [
    { value: "all", label: "All Comments" },
    { value: "no", label: "No Comments" },
    { value: "elevated", label: "Elevated and Liked Comments" },
    { value: "userLiked", label: "User Liked Comments" },
  ];

  const handleApply = () => {
    onApply(localSelectedFilter);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Which Comment Filter you Want
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {filterOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="commentFilter"
                value={option.value}
                checked={localSelectedFilter === option.value}
                onChange={() => setLocalSelectedFilter(option.value)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <span className="text-gray-700 font-medium">{option.label}</span>
            </label>
          ))}
        </div>

        {/* Apply Button */}
        <div className="border-t px-5 py-4">
          <button
            onClick={handleApply}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentFilterModal;

