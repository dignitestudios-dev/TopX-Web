import React from "react";
import { AlertTriangle, X } from "lucide-react";

const AcceptMessageModal = ({
  onPreview,
  onClose,
  onDelete,
  onAccept,
  username = "Peter Parker",
  handle = "@Peterparker5",
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-2xl shadow-xl p-6 text-center">
        {/* Alert Icon */}
        <div className="flex justify-end">
          <button onClick={onClose}>
            {" "}
            <X />
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <AlertTriangle className="text-orange-500 w-6 h-6" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 leading-snug">
          Accept Message Request From {username} ({handle})?
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
          Accept message request so you can start chat with {username}. You can
          still preview the message without notifying them.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onPreview();
              onClose();
            }}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 rounded-xl border border-gray-200 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptMessageModal;
