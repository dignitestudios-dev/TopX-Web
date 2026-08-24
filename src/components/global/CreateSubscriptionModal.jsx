import React, { useEffect, useState, useRef } from "react";
import { X, Check, Search, Lock, Globe } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa6";
import SkeletonCard from "./SkeletonCard";
import { createCollection } from "../../redux/slices/collection.slice";
import {
  createPageToCollections,
  getMySubsctiptions,
} from "../../redux/slices/Subscription.slice";
import Button from "../common/Button";
import Avatar from "../common/Avatar";
import { fetchOtherPages } from "../../redux/slices/pages.slice";
import ProfilePictureModal from "../app/profile/ProfilePictureModal";
import EmojiPickerModal from "../app/profile/EmojiPickerModal";
import { emojiUrlToFile, isEmoji } from "../../lib/helpers";
import { ErrorToast } from "./Toaster";

const CreateSubscriptionModal = ({ isOpen, onClose, onSave, page }) => {
  const [subscriptionName, setSubscriptionName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [selectedCollections, setSelectedCollections] = useState([]);
  console.log(selectedCollections, "selectedSelections");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({ name: "", image: "" });
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isFinalSaving, setIsFinalSaving] = useState(false);
  const dispatch = useDispatch();

  const resetModalState = () => {
    setCreating(false);
    setCollectionName("");
    setImageFile(null);
    setImagePreview(null);
    setSelectedCollections([]);
    setSelectedCollectionId(null);
    setSearch("");
    setErrors({ name: "", image: "" });
    setShowSuccess(false);
    setIsCreatingCollection(false);
    setIsFinalSaving(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetModalState();
      dispatch(fetchOtherPages({ page: 1, limit: 100 }));
      dispatch(getMySubsctiptions({ page: 1, limit: 100 }));
    }
  }, [dispatch, isOpen]);

  const { isLoading, error, allcollections } = useSelector(
    (state) => state.collections,
  );
  const { mySubscriptions, isLoading: addPageToCollectionLoading } = useSelector(
    (state) => state.subscriptions,
  );
  const { recommendationPages, pagesLoading } = useSelector(
    (state) => state.pages,
  );

  const handleCloseModal = () => {
    resetModalState();
    if (typeof onClose === "function") {
      onClose();
    }
  };

  // FINAL SAVE
  const handleFinalSave = async () => {
    if (isFinalSaving || addPageToCollectionLoading) return;
    try {
      setIsFinalSaving(true);
      await dispatch(
        createPageToCollections({
          pages: selectedCollections, // page IDs array
          collectionId: selectedCollectionId, // ✅ COLLECTION ID
        }),
      ).unwrap();
      setShowSuccess(true);
      dispatch(getMySubsctiptions({ page: 1, limit: 10 }));
      setTimeout(() => {
        resetModalState();
        if (typeof onClose === "function") {
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error("Add page error:", err);
    } finally {
      setIsFinalSaving(false);
    }
  };

  if (!isOpen) return null;

  // Image upload preview
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
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSelectEmoji = async (emojiUrl) => {
    setImagePreview(emojiUrl);
    setErrors((prev) => ({ ...prev, image: "" }));
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

  // Validation before create
  const validateCreate = () => {
    let valid = true;
    let err = { name: "", image: "" };
    const trimmedName = collectionName.trim();

    if (!trimmedName) {
      err.name = "Collection name is required.";
      valid = false;
    } else {
      const existingCollections = [
        ...(Array.isArray(mySubscriptions) ? mySubscriptions : []),
        ...(Array.isArray(allcollections) ? allcollections : []),
      ];

      const isDuplicate = existingCollections.some(
        (col) =>
          (col?.name || "").trim().toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        err.name =
          "A subscription/collection with this name already exists. Please choose a different name.";
        valid = false;
      }
    }

    if (!imageFile && !imagePreview) {
      err.image = "Please upload an image or choose an emoji.";
      valid = false;
    }

    setErrors(err);
    return valid;
  };

  // CREATE COLLECTION
  const handleCreateSubscription = async () => {
    if (isCreatingCollection || isLoading) return;
    if (!validateCreate()) return;

    try {
      setIsCreatingCollection(true);

      let binaryFile = imageFile;
      if (!(binaryFile instanceof File) && imagePreview) {
        binaryFile = await emojiUrlToFile(imagePreview, "collection_emoji.png");
      }

      const formData = new FormData();
      formData.append("name", collectionName.trim());
      
      if (binaryFile instanceof File) {
        formData.append("image", binaryFile, binaryFile.name || "collection.png");
      }

      const result = await dispatch(createCollection(formData));

      if (createCollection.fulfilled.match(result)) {
        setSelectedCollectionId(result.payload.newCollection._id);
        // Reset input fields but move to step 2 (selecting pages)
        setCreating(true);
        setCollectionName("");
        setImageFile(null);
        setImagePreview(null);
        setErrors({ name: "", image: "" });
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
          setErrors((prev) => ({
            ...prev,
            name:
              "A subscription/collection with this name already exists. Please choose a different name.",
          }));
        }
      }
    } catch (err) {
      console.error("Create subscription error:", err);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  // MULTI SELECT HANDLER
  const toggleSelect = (id) => {
    if (selectedCollections.includes(id)) {
      setSelectedCollections(selectedCollections.filter((x) => x !== id));
    } else {
      setSelectedCollections([...selectedCollections, id]);
    }
  };

  // Filter pages based on search
  const filteredPages =
    recommendationPages?.filter((col) =>
      col.name?.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  return (
    <>
      {/* Main Create Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-[400px] py-4 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-[17px] font-semibold">Create New Collection</h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* ================= CREATE MODE ================= */}
          <div className="p-3">
            {!creating ? (
              <div className="space-y-5">
                {/* Upload Image */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onClick={() => setIsOptionsModalOpen(true)}
                    className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all relative group select-none"
                  >
                    {imagePreview ? (
                      isEmoji(imagePreview) ? (
                        <span className="text-5xl select-none flex items-center justify-center">
                          {imagePreview}
                        </span>
                      ) : (
                        <img
                          src={imagePreview}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      )
                    ) : (
                      <FaPlus className="text-orange-500 text-3xl" />
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {errors.image && (
                    <p className="text-red-500 text-sm">{errors.image}</p>
                  )}
                </div>

                {/* Name Input */}
                <div>
                  <label className="text-sm font-semibold">
                    Collection Name
                  </label>
                  <input
                    className="w-full mt-1 border rounded-xl p-3 bg-gray-100 text-gray-800 focus:outline-none focus:border-orange-500"
                    placeholder="Enter name here"
                    value={collectionName}
                    onChange={(e) => {
                      setCollectionName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Save */}
                <button
                  type="button"
                  onClick={handleCreateSubscription}
                  disabled={isCreatingCollection || isLoading}
                  className="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-medium"
                >
                  {isCreatingCollection || isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
                {/* ================= EXISTING COLLECTIONS / PAGES ================= */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto mt-4 pr-2">
                  {pagesLoading &&
                    [...Array(5)].map((_, i) => <SkeletonCard key={i} />)}

                  {/* Error */}
                  {!pagesLoading && error && (
                    <p className="text-center text-red-500">{error}</p>
                  )}

                  {/* Data */}
                  {!pagesLoading && (
                    <>
                      {recommendationPages && recommendationPages.length > 0 ? (
                        filteredPages.length > 0 ? (
                          filteredPages.map((col) => {
                            const isPrivate =
                              col.pageType === "private" || col.isPrivate;
                            return (
                              <div
                                key={col._id}
                                className="flex justify-between items-center cursor-pointer p-2.5 border rounded-xl hover:bg-gray-50 transition gap-2"
                                onClick={() => toggleSelect(col._id)}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <Avatar
                                    src={
                                      col.image ||
                                      col.user?.profilePicture ||
                                      col.author?.profilePicture ||
                                      col.userData?.profilePicture
                                    }
                                    alt={col.name}
                                    size="md"
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium text-gray-800 text-sm truncate max-w-[150px]">
                                        {col.name}
                                      </p>
                                      <span
                                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                          isPrivate
                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        }`}
                                      >
                                        {isPrivate ? (
                                          <>
                                            <Lock size={10} />
                                            <span>Private</span>
                                          </>
                                        ) : (
                                          <>
                                            <Globe size={10} />
                                            <span>Public</span>
                                          </>
                                        )}
                                      </span>
                                    </div>
                                    {col.topic && (
                                      <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {col.topic}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                                    selectedCollections.includes(col._id)
                                      ? "bg-orange-500 border-orange-500 text-white"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {selectedCollections.includes(col._id) && (
                                    <Check size={14} />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-center text-gray-500 py-8">
                            No items found
                          </p>
                        )
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          No pages available
                        </p>
                      )}
                    </>
                  )}
                </div>
                <Button
                  variant="orange"
                  size="full"
                  onClick={handleFinalSave}
                  disabled={
                    selectedCollections.length === 0 ||
                    isFinalSaving ||
                    addPageToCollectionLoading
                  }
                  loading={isFinalSaving || addPageToCollectionLoading}
                  className={`w-full mt-5 py-3 rounded-xl text-white 
                                    ${
                                      selectedCollections.length === 0 ||
                                      isFinalSaving ||
                                      addPageToCollectionLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-orange-600 cursor-pointer hover:bg-orange-700"
                                    }`}
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60]">
          <div className="bg-white w-[340px] rounded-2xl shadow-xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-500 p-3 rounded-full">
                <Check className="text-white w-6 h-6" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Created!
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              New Subscription has been successfully created.
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
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

export default CreateSubscriptionModal;