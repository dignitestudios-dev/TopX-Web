import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteKnowledgePageModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  pageName = "this knowledge page",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center">
        {/* Alert Icon */}
        <div className="flex justify-center mb-3">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="text-red-500 w-6 h-6" />
          </div>
        </div>

        {/* Title & Text */}
        <h2 className="text-lg font-semibold text-gray-900">
          Delete Knowledge Page
        </h2>
        <p className="text-sm text-gray-600 mt-1 mb-5">
          Are you sure you want to delete <span className="font-semibold text-gray-800">{pageName}</span>? This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Don't Delete
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Deleting...</span>
              </>
            ) : (
              "Delete Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
