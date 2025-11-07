import React from "react";
import { AlertTriangle } from "lucide-react";

const DeletePostModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-xl p-6 text-center">
        {/* Alert Icon */}
        <div className="flex justify-center mb-3">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="text-red-500 w-6 h-6" />
          </div>
        </div>

        {/* Title & Text */}
        <h2 className="text-lg font-semibold text-gray-900">Delete Post</h2>
        <p className="text-sm text-gray-600 mt-1 mb-5">
          Are you sure you want to delete this post?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition-colors"
          >
            Don’t Delete
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Delete Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePostModal;
