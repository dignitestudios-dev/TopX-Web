import React from "react";
import { Video, Mic, AlertCircle, X } from "lucide-react";

export default function LivePermissionModal({
  isOpen,
  onClose,
  onRetry,
  errorMessage,
  isChecking = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
              <div className="flex items-center gap-1">
                <Video className="w-6 h-6" />
                <Mic className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Title & Message */}
        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Camera & Microphone Access Required
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {errorMessage ||
              "To start your live stream, you must grant permission for camera and microphone access."}
          </p>
        </div>

        {/* Browser Guidance Box */}
     

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
