import React, { useState, useRef } from "react";
import { X, Check } from "lucide-react";

const EditPostModal = ({ post, onClose, onSave, isLoading }) => {
  const [text, setText] = useState(post.bodyText || "");
 console.log(post,"post media")
  const [existingMedia, setExistingMedia] = useState(post.postImages || []);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // ===============================
  // HANDLE FILE UPLOAD
  // ===============================
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  // ===============================
  // REMOVE MEDIA
  // ===============================
  const removeExistingMediaItem = (id) => {
    setExistingMedia((prev) => prev.filter((m) => m._id !== id));
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClickAddMedia = () => {
    fileInputRef.current?.click();
  };

  // ===============================
  // SAVE POST
  // ===============================
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("bodyText", text || "");

    // New uploaded files
    newFiles.forEach((file) => formData.append("media", file));

    // Existing media IDs
    existingMedia.forEach((m, index) =>
      formData.append(`existingMedia[${index}]`, m._id),
    );

    // Keywords if any
    (post.keywords || []).forEach((kw, index) =>
      formData.append(`keywords[${index}]`, kw),
    );

    await onSave(formData);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <>
      {/* MODAL */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Edit Post</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Text */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Update your post..."
            className="w-full border rounded-lg p-2 mb-4 resize-none h-24"
          />

          {/* Existing Media */}
          {existingMedia.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Current Media
              </p>
              <div className="grid grid-cols-2 gap-3">
                {existingMedia.map((m) => (
                  <div
                    key={m._id}
                    className="relative w-full overflow-hidden rounded-lg border"
                  >
                    {m.type === "image" ? (
                      <img
                        src={m.fileUrl}
                        alt=""
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video
                        src={m.fileUrl}
                        controls
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeExistingMediaItem(m._id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Media Previews */}
          {newPreviews.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                New Media (Selected)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {newPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-full overflow-hidden rounded-lg border bg-gray-50"
                  >
                    {preview.type === "image" ? (
                      <img
                        src={preview.preview}
                        alt=""
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video
                        src={preview.preview}
                        controls
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeNewFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Add Media Button */}
          <button
            onClick={handleClickAddMedia}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:border-orange-500 hover:bg-orange-50 transition-colors mb-4"
          >
            {newPreviews.length > 0
              ? "+ Add More Media"
              : "+ Add Media (Optional)"}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Success Overlay */}
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
