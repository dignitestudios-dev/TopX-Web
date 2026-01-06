import React, { useState } from "react";
import { X, Check } from "lucide-react";

const EditPostModal = ({ post, onClose, onSave, isLoading }) => {
  const [text, setText] = useState(post.text || "");

  // OLD images (already saved on backend)
  const [oldImages, setOldImages] = useState(
    post.media?.map((m) => m._id) || []
  );

  // NEW images (files)
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);

  /* ===============================
     FILE UPLOAD (ADD, NOT REPLACE)
     =============================== */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  /* ===============================
     REMOVE IMAGES
     =============================== */
  const removeOldImage = (index) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===============================
     SAVE HANDLER
     =============================== */
  const handleSave = async () => {
    const formData = new FormData();

    // text
    formData.append("bodyText", text);

    // ✅ NEW FILES ONLY
    newImages.forEach((file) => {
      formData.append("media", file);
    });

    // ✅ OLD MEDIA IDS ONLY
    oldImages.forEach((id, index) => {
      formData.append(`existingMedia[${index}]`, id);
    });

    await onSave(formData);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      {/* ================= MODAL ================= */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[420px] rounded-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Edit Post</h2>
            <X onClick={onClose} className="cursor-pointer" />
          </div>

          {/* Text */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Update your post..."
            className="w-full border rounded-lg p-2 mb-4 resize-none h-24"
          />

          {/* Hidden Input */}
          <input
            type="file"
            id="mediaUpload"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload Box */}
          <label
            htmlFor="mediaUpload"
            className="mb-4 flex flex-col items-center justify-center gap-2 cursor-pointer
              border-2 border-dashed border-orange-500 rounded-xl
              bg-orange-50 hover:bg-orange-100
              text-orange-600 transition-all py-6"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 12l-4-4-4 4m4-4v9"
              />
            </svg>
            <p className="text-sm font-medium">
              Click to upload <span className="font-normal">(PNG, JPG)</span>
            </p>
            <p className="text-xs text-orange-400">
              New images will be added (not replaced)
            </p>
          </label>

          {/* ================= IMAGES ================= */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* OLD IMAGES */}
            {oldImages.map((img, i) => (
              <div key={`old-${i}`} className="relative">
                <img
                  src={img}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <X
                  onClick={() => removeOldImage(i)}
                  className="absolute top-1 right-1 bg-black text-white rounded-full p-1 cursor-pointer"
                />
              </div>
            ))}

            {/* NEW IMAGES */}
            {newPreviews.map((img, i) => (
              <div key={`new-${i}`} className="relative">
                <img
                  src={img}
                  className="h-24 w-full rounded-lg object-cover border-2 border-orange-500"
                />
                <X
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-1 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium"
          >
            {isLoading ? "Saving..." : " Save Changes"}
          </button>
        </div>
      </div>

      {/* ================= SUCCESS ================= */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <Check className="mx-auto text-orange-500 mb-2" />
            <p className="font-medium">Post Updated Successfully</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPostModal;
