import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateCollection } from "../../redux/slices/collection.slice";
import { getMySubsctiptions } from "../../redux/slices/Subscription.slice";
import { FaPlusCircle } from "react-icons/fa";
import ProfilePictureModal from "../app/profile/ProfilePictureModal";
import EmojiPickerModal from "../app/profile/EmojiPickerModal";
import { emojiUrlToFile, isEmoji } from "../../lib/helpers";
import { ErrorToast } from "./Toaster";

const UpdateSubscriptionModal = ({ isOpen, onClose, collection }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.collections);
  const { mySubscriptions } = useSelector((state) => state.subscriptions);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Prefill data
  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setNameError("");
      setImagePreview(collection.image);
    }
  }, [collection]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        ErrorToast("Image size must not exceed 5MB.");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSelectEmoji = async (emojiUrl) => {
    setImagePreview(emojiUrl);
    try {
      const file = await emojiUrlToFile(emojiUrl, "collection_emoji.png");
      if (file) {
        setImageFile(file);
      } else {
        setImageFile(null);
      }
    } catch (err) {
      console.error("Error setting emoji file:", err);
      setImageFile(null);
    }
  };

  const handleUpdate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Subscription name is required.");
      return;
    }

    const existingCollections = Array.isArray(mySubscriptions)
      ? mySubscriptions
      : [];
    const isDuplicate = existingCollections.some(
      (col) =>
        col._id !== collection?._id &&
        (col?.name || "").trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      setNameError(
        "A subscription/collection with this name already exists. Please choose a different name.",
      );
      return;
    }

    let binaryFile = imageFile;
    if (
      !(binaryFile instanceof File) &&
      imagePreview &&
      imagePreview !== collection?.image
    ) {
      binaryFile = await emojiUrlToFile(imagePreview, "collection_emoji.png");
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    if (binaryFile instanceof File) {
      formData.append("image", binaryFile, binaryFile.name || "collection.png");
    }

    const result = await dispatch(
      updateCollection({
        collectionId: collection._id,
        formData,
      }),
    );

    if (updateCollection.fulfilled.match(result)) {
      dispatch(getMySubsctiptions({ page: 1, limit: 10 }));
      onClose();
    } else {
      const errorMsg = result.payload || result.error?.message || "";
      const lowerMsg = String(errorMsg).toLowerCase();
      if (
        lowerMsg.includes("already exist") ||
        lowerMsg.includes("duplicate") ||
        lowerMsg.includes("already taken") ||
        lowerMsg.includes("collection with this name") ||
        lowerMsg.includes("unique")
      ) {
        setNameError(
          "A subscription/collection with this name already exists. Please choose a different name.",
        );
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-[380px] rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b">
            <h2 className="text-lg font-semibold">Edit Collection</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 relative space-y-4">
            {/* Image */}
            <div
              onClick={() => setIsOptionsModalOpen(true)}
              className="relative flex items-center justify-center cursor-pointer select-none"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-400 bg-gray-100 flex items-center justify-center">
                {imagePreview ? (
                  isEmoji(imagePreview) ? (
                    <span className="text-4xl select-none flex items-center justify-center">
                      {imagePreview}
                    </span>
                  ) : (
                    <img
                      src={imagePreview}
                      className="w-full h-full rounded-full object-cover"
                      alt="Collection"
                    />
                  )
                ) : (
                  <span className="text-gray-400 text-sm">Upload</span>
                )}
                <FaPlusCircle className="absolute right-1 bottom-1 text-orange-500 bg-white rounded-full text-lg z-30" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleImageUpload}
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="" className="text-gray-400 font-light text-[14px]">
                Update Collection Name
              </label>
              <p className="text-[15px] mt-2 text-gray-700 font-medium">Collection Name</p>
              <input
                className="w-full border rounded-xl mt-1 p-3 bg-gray-100 focus:outline-none focus:border-orange-500"
                placeholder="Subscription Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1">{nameError}</p>
              )}
            </div>

            {/* Save */}
            <button
              onClick={handleUpdate}
              disabled={!name || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Picture Options Modal */}
      <ProfilePictureModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onSelectUploadImage={() => fileInputRef.current?.click()}
        onSelectUploadEmoji={() => setIsEmojiModalOpen(true)}
      />

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        isOpen={isEmojiModalOpen}
        onClose={() => setIsEmojiModalOpen(false)}
        onSelectEmoji={handleSelectEmoji}
      />
    </>
  );
};

export default UpdateSubscriptionModal;
