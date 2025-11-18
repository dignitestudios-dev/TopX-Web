import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import SkeletonCard from "../global/SkeletonCard";
import { getMyCollections, createCollection, addPageToCollections } from "../../redux/slices/collection.slice";
import { useDispatch, useSelector } from "react-redux";

export default function CollectionModal({
    isOpen,
    onClose,
    onSave,
    page,
}) {
    const [creating, setCreating] = useState(false);
    const [collectionName, setCollectionName] = useState("");
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [errors, setErrors] = useState({ name: "", image: "" });


    const dispatch = useDispatch();

    const {
        allcollections,
        isLoading,
        error,
    } = useSelector((state) => state.collections);


    // FINAL SAVE
    const handleFinalSave = () => {
        dispatch(addPageToCollections({
            collections: selectedCollections,
            page: page?._id,
        })).then(() => {
            onClose();
        });
    };


    console.log(allcollections, "allcollections")

    // Load collections when opened
    useEffect(() => {
        if (isOpen) {
            dispatch(getMyCollections({ page: 1, limit: 10 }));
        }
    }, [isOpen, dispatch]);

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
    const handleCreateCollection = async () => {
        if (!validateCreate()) return;

        const formData = new FormData();
        formData.append("name", collectionName);
        formData.append("image", imageFile);

        const result = await dispatch(createCollection(formData));

        if (createCollection.fulfilled.match(result)) {
            // Reset fields
            setCreating(false);
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

    return (
        <div className="fixed inset-0 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-md rounded-2xl p-6 animate-zoomIn relative shadow-xl">

                <button className="absolute top-3 right-3 text-gray-500" onClick={onClose}>
                    <IoClose className="text-2xl" />
                </button>

                <h2 className="text-center text-xl font-bold mb-4">
                    {creating ? "Create New Collection" : "Organize Your Interest!"}
                </h2>

                {/* ================= CREATE MODE ================= */}
                {creating ? (
                    <div className="space-y-5">

                        {/* Upload Image */}
                        <div className="flex flex-col items-center gap-2">
                            <label className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                ) : (
                                    <FaPlus className="text-orange-500 text-3xl" />
                                )}
                                <input type="file" className="hidden" onChange={handleImageUpload} />
                            </label>

                            {errors.image && (
                                <p className="text-red-500 text-sm">{errors.image}</p>
                            )}
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="text-sm font-semibold">Collection Name</label>
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
                            onClick={handleCreateCollection}
                            className="w-full bg-orange-600 text-white py-3 rounded-xl"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ================= EXISTING COLLECTIONS ================= */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto mt-4 pr-2">

                            {/* Create New Button */}
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => setCreating(true)}
                            >
                                <div className="w-10 h-10 border-2 border-orange-500 rounded-full flex items-center justify-center">
                                    <FaPlus className="text-orange-500" />
                                </div>
                                <span className="font-medium">Create New Collection</span>
                            </div>

                            {/* Loading Skeleton */}
                            {isLoading &&
                                [...Array(5)].map((_, i) => <SkeletonCard key={i} />)}

                            {/* Error */}
                            {!isLoading && error && (
                                <p className="text-center text-red-500">{error}</p>
                            )}

                            {/* Data */}
                            {!isLoading && (
                                <>
                                    {allcollections && allcollections.length > 0 ? (
                                        allcollections.map((col) => (
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
                                                    className={`w-5 h-5 rounded border ${selectedCollections.includes(col._id) ? "bg-orange-500" : ""
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

                        {/* FINAL SAVE BUTTON */}
                        <button
                            onClick={() => onSave({ selectedCollections })}
                            disabled={selectedCollections.length === 0}
                            className={`w-full mt-5 py-3 rounded-xl text-white 
                             ${selectedCollections.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-orange-600 cursor-pointer"
                                }`}
                        >
                            Save
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
