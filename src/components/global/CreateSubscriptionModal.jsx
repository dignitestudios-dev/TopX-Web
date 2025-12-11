import React, { useEffect, useState } from "react";
import { X, Check, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa6";
import SkeletonCard from "./SkeletonCard";
import { createCollection } from "../../redux/slices/collection.slice";
import {
  createPageToCollections,
  getMySubsctiptions,
} from "../../redux/slices/Subscription.slice";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import Button from "../common/Button";

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
  const [errors, setErrors] = useState({ name: "", image: "" });
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMyPages({ page: 1, limit: 20 }));
    }
  }, [dispatch]);
  const { isLoading, error } = useSelector((state) => state.collections);
  const { isLoading: addPageToCollectionLoading } = useSelector(
    (state) => state.subscriptions
  );
  const { myPages, pagesLoading } = useSelector((state) => state.pages);

  // FINAL SAVE
  const handleFinalSave = async () => {
    try {
      await dispatch(
        createPageToCollections({
          pages: selectedCollections, // page IDs array
          collectionId: selectedCollectionId, // ✅ COLLECTION ID
        })
      ).unwrap();
      setShowSuccess(true);
      dispatch(getMySubsctiptions({ page: 1, limit: 10 }));
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Add page error:", err);
    }
  };

  if (!isOpen) return null;

  // Image upload preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setErrors((prev) => ({ ...prev, image: "" }));
  };

  // Validation before create
  const validateCreate = () => {
    let valid = true;
    let err = { name: "", image: "" };

    if (!collectionName.trim()) {
      err.name = "Collection name is required.";
      valid = false;
    }

    if (!imageFile) {
      err.image = "Please upload an image.";
      valid = false;
    }

    setErrors(err);
    return valid;
  };

  // CREATE COLLECTION
  const handleCreateSubscription = async () => {
    if (!validateCreate()) return;
    const formData = new FormData();
    formData.append("name", collectionName);
    formData.append("image", imageFile);

    const result = await dispatch(createCollection(formData));

    if (createCollection.fulfilled.match(result)) {
      setSelectedCollectionId(result.payload.newCollection._id);
      // Reset fields

      setCreating(true);
      setCollectionName("");
      setImageFile(null);
      setImagePreview(null);
      setErrors({ name: "", image: "" });
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

  const handleAdd = () => {
    if (!subscriptionName || selected.length === 0) return;
    onAdd({ subscriptionName, selectedPages: selected });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <>
      {/* Main Create Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-[400px] py-4 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-[17px] font-semibold">
              Create New Subscription
            </h2>
            <button
              onClick={onClose}
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
                  <label className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaPlus className="text-orange-500 text-3xl" />
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>

                  {errors.image && (
                    <p className="text-red-500 text-sm">{errors.image}</p>
                  )}
                </div>

                {/* Name Input */}
                <div>
                  <label className="text-sm font-semibold">
                    Subscription Name
                  </label>
                  <input
                    className="w-full mt-1 border rounded-xl p-3 bg-gray-100"
                    placeholder="Enter name"
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
                  onClick={handleCreateSubscription}
                  className="w-full bg-orange-600 text-white py-3 rounded-xl"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <>
                <div>
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
                {/* ================= EXISTING COLLECTIONS ================= */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto mt-4 pr-2">
                  {/* Loading Skeleton */}
                  {pagesLoading &&
                    [...Array(5)].map((_, i) => <SkeletonCard key={i} />)}

                  {/* Error */}
                  {!pagesLoading && error && (
                    <p className="text-center text-red-500">{error}</p>
                  )}

                  {/* Data */}
                  {!pagesLoading && (
                    <>
                      {myPages && myPages.length > 0 ? (
                        myPages.map((col) => (
                          <div
                            key={col._id}
                            className="flex justify-between items-center cursor-pointer p-2 border rounded-lg"
                            onClick={() => toggleSelect(col._id)}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  col.image ||
                                  "https://cdn-icons-png.flaticon.com/512/12478/12478035.png"
                                }
                                className="w-10 h-10 rounded-full"
                              />
                              <p>{col.name}</p>
                            </div>

                            <div
                              className={`w-5 h-5 rounded border ${
                                selectedCollections.includes(col._id)
                                  ? "bg-orange-500"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          No collections here
                        </p>
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="orange"
                  size="full"
                  onClick={() => handleFinalSave({ selectedCollections })}
                  disabled={selectedCollections.length === 0}
                  loading={addPageToCollectionLoading}
                  className={`w-full mt-5 py-3 rounded-xl text-white 
                                    ${
                                      selectedCollections.length === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-orange-600 cursor-pointer"
                                    }`}
                >
                  Save
                </Button>
              </>
            )}
          </div>
          {/* Footer */}
          {/* <div className="border-t p-4">
            <button
              onClick={handleAdd}
              disabled={!subscriptionName || selected.length === 0}
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                !subscriptionName || selected.length === 0
                  ? "bg-orange-300 text-white cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              Add
            </button>
          </div> */}
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

export default CreateSubscriptionModal;
