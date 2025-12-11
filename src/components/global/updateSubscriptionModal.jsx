import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateCollection} from "../../redux/slices/collection.slice";
import { getMySubsctiptions } from "../../redux/slices/Subscription.slice";

const UpdateSubscriptionModal = ({ isOpen, onClose, collection }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.collections);

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ✅ Prefill data
  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setImagePreview(collection.image);
    }
  }, [collection]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    const result = await dispatch(
      updateCollection({
        collectionId: collection._id,
        formData,
      })
    );

    if (updateCollection.fulfilled.match(result)) {
      dispatch(getMySubsctiptions({ page: 1, limit: 10 }));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="text-lg font-semibold">Edit Subscription</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Image */}
          <label className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center overflow-hidden cursor-pointer">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">Upload</span>
            )}
            <input type="file" hidden onChange={handleImageUpload} />
          </label>

          {/* Name */}
          <input
            className="w-full border rounded-xl p-3 bg-gray-100"
            placeholder="Subscription Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Save */}
          <button
            onClick={handleUpdate}
            disabled={!name}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSubscriptionModal;
