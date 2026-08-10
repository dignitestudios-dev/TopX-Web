import React from "react";
import { X, Image as ImageIcon, Smile } from "lucide-react";

export default function ProfilePictureModal({
  isOpen,
  onClose,
  onSelectUploadImage,
  onSelectUploadEmoji,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl relative border border-gray-100 transform transition-all animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <h3 className="text-[18px] font-bold text-gray-900">
              Update Profile Picture
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {/* Upload Image Option */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectUploadImage();
              }}
              className="flex items-center gap-4 p-4 rounded-[16px] border border-gray-200 hover:border-[#f85e00] bg-gray-50/50 hover:bg-[#FFF5F2] transition-all group cursor-pointer text-left"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 group-hover:bg-[#f85e00] flex items-center justify-center text-[#f85e00] group-hover:text-white transition-colors flex-shrink-0">
                <ImageIcon size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#f85e00] transition-colors">
                  Upload Image
                </span>
                <span className="text-[12px] text-gray-500">
                  Choose a photo from your file explorer
                </span>
              </div>
            </button>

            {/* Upload Emoji Option */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectUploadEmoji();
              }}
              className="flex items-center gap-4 p-4 rounded-[16px] border border-gray-200 hover:border-[#f85e00] bg-gray-50/50 hover:bg-[#FFF5F2] transition-all group cursor-pointer text-left"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 group-hover:bg-[#f85e00] flex items-center justify-center text-[#f85e00] group-hover:text-white transition-colors flex-shrink-0">
                <Smile size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#f85e00] transition-colors">
                  Upload Emoji
                </span>
                <span className="text-[12px] text-gray-500">
                  Select a custom emoji from available collection
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
