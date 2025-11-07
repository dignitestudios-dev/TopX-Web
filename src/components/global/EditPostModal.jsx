import React, { useState } from "react";
import { X, Check } from "lucide-react";

const EditPostModal = ({ post, onClose, onSave }) => {
  const [text, setText] = useState(post.text || "");
    const [media, setMedia] = useState(
    Array.isArray(post.media)
      ? post.media
      : post.postimage
      ? [post.postimage]
      : []
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRemove = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Simulate save
    setShowSuccess(true);
    onSave({ ...post, text, media });

    // Auto-close success modal after 2 sec
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  console.log(post,"editpost")

  return (
    <>
      {/* Main Edit Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-[400px] rounded-2xl shadow-xl p-6 relative">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Edit Post</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Body Text */}
          <label className="block text-sm text-gray-700 mb-1">Body Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text goes here"
            className="w-full border rounded-lg p-2 text-sm mb-4 resize-none h-24 outline-none focus:ring-1 focus:ring-orange-500"
          />

          {/* Upload Preview */}
          <label className="block text-sm text-gray-700 mb-2">
            Upload Photos or Videos
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {media.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-all"
          >
            Save
          </button>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[350px] rounded-2xl shadow-xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-500 p-3 rounded-full">
                <Check className="text-white w-6 h-6" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Post Updated!
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Your post has been updated successfully.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPostModal;
