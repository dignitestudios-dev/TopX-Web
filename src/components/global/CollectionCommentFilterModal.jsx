import React, { useEffect, useState } from "react";
import { X, SlidersHorizontal, CheckCircle2, MessageSquare, Flame, Heart, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCollectionCommentFilter,
  setCollectionCommentFilter,
} from "../../redux/slices/collection.slice";
import { SuccessToast, ErrorToast } from "./Toaster";

const FILTER_OPTIONS = [
  {
    id: "all-comments",
    title: "All Comments",
    description: "Show all comments on posts in this collection.",
    icon: MessageSquare,
  },
  {
    id: "elevated-comments",
    title: "Elevated Comments",
    description: "Show only elevated and top featured comments.",
    icon: Flame,
  },
  {
    id: "liked-comments",
    title: "Liked Comments",
    description: "Show comments that are liked by the author.",
    icon: Heart,
  },
  {
    id: "none-comments",
    title: "No Comments",
    description: "Hide comments from all posts in this collection.",
    icon: EyeOff,
  },
];

export default function CollectionCommentFilterModal({
  isOpen,
  onClose,
  collectionId,
  onFilterApplied,
}) {
  const dispatch = useDispatch();
  const [selectedFilter, setSelectedFilter] = useState("all-comments");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentCollectionFilter, collectionFilterLoading } = useSelector(
    (state) => state.collections || {}
  );

  // Fetch current filter when modal opens
  useEffect(() => {
    if (isOpen && collectionId) {
      dispatch(getCollectionCommentFilter(collectionId));
    }
  }, [isOpen, collectionId, dispatch]);

  // Sync state when currentCollectionFilter updates
  useEffect(() => {
    if (currentCollectionFilter?.filterType) {
      setSelectedFilter(currentCollectionFilter.filterType);
    }
  }, [currentCollectionFilter]);

  if (!isOpen) return null;

  const handleSaveFilter = async () => {
    if (!collectionId) {
      ErrorToast("Invalid collection ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dispatch(
        setCollectionCommentFilter({
          collectionId,
          filterType: selectedFilter,
        })
      ).unwrap();

      SuccessToast(res?.message || "Collection filter updated successfully!");
      if (typeof onFilterApplied === "function") {
        onFilterApplied(selectedFilter);
      }
      onClose();
    } catch (err) {
      ErrorToast(typeof err === "string" ? err : "Failed to update collection filter");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Collection Comment Filter</h3>
              <p className="text-xs text-gray-500">Filter comments for this collection feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-orange-scrollbar">
          {collectionFilterLoading && !currentCollectionFilter ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading filter options...</div>
          ) : (
            FILTER_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedFilter === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => setSelectedFilter(option.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3.5 select-none ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/60 shadow-sm"
                      : "border-gray-200/80 bg-white hover:border-orange-200 hover:bg-gray-50/80"
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-xs ${isSelected ? "text-orange-900" : "text-gray-900"}`}>
                        {option.title}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveFilter}
            disabled={isSubmitting || collectionFilterLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#DE4B12] hover:bg-orange-600 text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              "Apply Filter"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
