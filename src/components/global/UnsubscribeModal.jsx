import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import SkeletonCard from "../global/SkeletonCard";
import { getCollectionNames, removePageFromCollections } from "../../redux/slices/collection.slice";
import { useDispatch, useSelector } from "react-redux";
import Button from "../common/Button";

export default function UnsubscribeModal({
    isOpen,
    onClose,
    onUnsubscribe,
    page,
}) {
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const dispatch = useDispatch();

    const {
        collectionNames,
        collectionNamesLoading,
        removePageLoading,
        error,
    } = useSelector((state) => state.collections);

    // Load collections when opened and pre-select collections that contain this page
    useEffect(() => {
        if (isOpen && page?._id) {
            dispatch(getCollectionNames({ limit: 10 }));
            setSearchTerm("");
        }
    }, [isOpen, dispatch, page?._id]);

    // Pre-select collections that contain this page
    useEffect(() => {
        if (collectionNames.length > 0 && page?._id) {
            const collectionsWithPage = collectionNames
                .filter((col) => col.pages && col.pages.includes(page._id))
                .map((col) => col._id);
            setSelectedCollections(collectionsWithPage);
        }
    }, [collectionNames, page?._id]);

    if (!isOpen) return null;

    // MULTI SELECT HANDLER
    const toggleSelect = (id) => {
        if (selectedCollections.includes(id)) {
            setSelectedCollections(selectedCollections.filter((x) => x !== id));
        } else {
            setSelectedCollections([...selectedCollections, id]);
        }
    };

    // Handle unsubscribe
    const handleUnsubscribe = async () => {
        if (selectedCollections.length === 0) return;

        try {
            await dispatch(
                removePageFromCollections({
                    collections: selectedCollections,
                    page: page?._id,
                })
            ).unwrap();
            
            onClose();
            // Call callback to refresh data after successful unsubscribe
            if (onUnsubscribe) {
                onUnsubscribe();
            }
        } catch (error) {
            console.error("Unsubscribe error:", error);
        }
    };

    // Filter collections to show only those that contain this page, then filter by search term
    const collectionsWithPage = collectionNames.filter(
        (col) => col.pages && col.pages.includes(page?._id)
    );
    
    const filteredCollections = collectionsWithPage.filter((col) =>
        col.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-md rounded-2xl p-6 animate-zoomIn relative shadow-xl">
                <button className="absolute top-3 right-3 text-gray-500" onClick={onClose}>
                    <IoClose className="text-2xl" />
                </button>

                <h2 className="text-center text-xl font-bold mb-4">
                   Manage Subscriptions
                </h2>
                <p className="text-sm text-slate-600 pb-4">Unsubscribe this page from collections. Uncheck collections to unsubscribe.</p>
                {page?.name && (
                    <p className="text-slate-500 text-sm text-center mb-2">
                        Select collections to remove {page.name} from.
                    </p>
                )}

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        className="w-full p-2 rounded-lg border border-gray-300"
                        placeholder="Search collections"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Collections List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto mt-4 pr-2">
                    {/* Loading Skeleton */}
                    {collectionNamesLoading &&
                        [...Array(5)].map((_, i) => <SkeletonCard key={i} />)}

                    {/* Error */}
                    {!collectionNamesLoading && error && (
                        <p className="text-center text-red-500">{error}</p>
                    )}

                    {/* Data */}
                    {!collectionNamesLoading && (
                        <>
                            {filteredCollections && filteredCollections.length > 0 ? (
                                filteredCollections.map((col) => (
                                    <div
                                        key={col._id}
                                        className="flex justify-between items-center cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition"
                                        onClick={() => toggleSelect(col._id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    col.image ||
                                                    "https://cdn-icons-png.flaticon.com/512/12478/12478035.png"
                                                }
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt={col.name}
                                            />
                                            <p className="font-medium">{col.name}</p>
                                        </div>

                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                                selectedCollections.includes(col._id)
                                                    ? "bg-orange-500 border-orange-500"
                                                    : "border-gray-300 bg-white"
                                            }`}
                                        >
                                            {selectedCollections.includes(col._id) && (
                                                <FaCheck className="text-white text-xs" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    No collections found
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Unsubscribe Button */}
                <Button
                    onClick={handleUnsubscribe}
                    disabled={selectedCollections.length === 0}
                    loading={removePageLoading}
                    variant="orange"
                    size="full"
                    className={`w-full mt-5 py-3 rounded-xl text-white ${
                        selectedCollections.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 cursor-pointer"
                    }`}
                >
                    Unsubscribe
                </Button>
            </div>
        </div>
    );
}

