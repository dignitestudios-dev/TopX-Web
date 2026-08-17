import React, { useState } from "react";
import { X, Plus, CheckSquare, Square, Layers, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  assignKnowledgePostsToCategory,
  getKnowledgePostDetail,
} from "../../redux/slices/knowledgepost.slice";
import { updatePage } from "../../redux/slices/pages.slice";
import { SuccessToast, ErrorToast } from "./Toaster";

export default function ManageKnowledgePostsModal({
  isOpen,
  onClose,
  pageId,
  posts = [],
  existingSubTopics = [],
  pageName = "Knowledge Page",
}) {
  const dispatch = useDispatch();
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [newSubCategoryInput, setNewSubCategoryInput] = useState("");
  const [customSubCategories, setCustomSubCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Combine page subtopics with any created in this session
  const allSubCategories = Array.from(
    new Set([
      ...(Array.isArray(existingSubTopics) ? existingSubTopics : []),
      ...customSubCategories,
    ].filter(Boolean))
  );

  // Toggle selection for a single post
  const togglePostSelect = (postId) => {
    setSelectedPostIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedPostIds.length === posts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(posts.map((p) => p._id));
    }
  };

  // Add new subcategory on the fly
  const handleAddNewSubCategory = () => {
    const trimmed = (newSubCategoryInput || "").trim();
    if (!trimmed) return;

    if (!customSubCategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSubCategories((prev) => [...prev, trimmed]);
    }
    setSelectedSubCategory(trimmed);
    setNewSubCategoryInput("");
    SuccessToast(`Subcategory "${trimmed}" created and selected`);
  };

  // Assign selected posts to subcategory
  const handleAssign = async () => {
    if (selectedPostIds.length === 0) {
      ErrorToast("Please select at least 1 post to assign!");
      return;
    }

    const targetSub = (selectedSubCategory || "").trim();
    if (!targetSub) {
      ErrorToast("Please select or create a subcategory!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Assign posts to subcategory
      await dispatch(
        assignKnowledgePostsToCategory({
          postIds: selectedPostIds,
          pageId,
          subCategory: targetSub,
        })
      ).unwrap();

      // 2. Persist new subcategory to the page if it's new
      if (
        !existingSubTopics.some(
          (s) => String(s).toLowerCase() === targetSub.toLowerCase()
        )
      ) {
        try {
          const fd = new FormData();
          const updatedSubs = [...existingSubTopics, targetSub];
          updatedSubs.forEach((sub, i) => fd.append(`subTopic[${i}]`, sub));
          await dispatch(updatePage({ pageId, formData: fd })).unwrap();
        } catch (pageErr) {
          console.warn("Could not update page subtopics metadata:", pageErr);
        }
      }

      SuccessToast(
        `${selectedPostIds.length} post${selectedPostIds.length > 1 ? "s" : ""} grouped into "${targetSub}" successfully!`
      );

      // Refresh detail
      dispatch(getKnowledgePostDetail({ pageId, page: 1, limit: 20 }));
      onClose();
    } catch (err) {
      console.error("Assign posts error:", err);
      ErrorToast(
        typeof err === "string"
          ? err
          : err?.message || "Failed to assign posts to subcategory"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-orange-50/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Group Posts into Subcategory
              </h2>
              <p className="text-xs text-gray-500">
                {pageName} • {posts.length} Posts Available
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Choose or Create Subcategory */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Choose or Create Subcategory
            </label>

            {allSubCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                {allSubCategories.map((sub, idx) => {
                  const isSelected = selectedSubCategory === sub;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${
                        isSelected
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      {isSelected ? `✓ ${sub}` : sub}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Create New Subcategory Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="+ Create new subcategory name"
                value={newSubCategoryInput}
                onChange={(e) => setNewSubCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewSubCategory();
                  }
                }}
                className="text-xs px-3.5 py-2 border border-gray-300 rounded-xl outline-none focus:border-orange-500 flex-1 bg-white"
              />
              <button
                type="button"
                disabled={isSubmitting || !newSubCategoryInput.trim()}
                onClick={handleAddNewSubCategory}
                className="text-xs bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-1"
              >
                <Plus size={14} /> Create
              </button>
            </div>
          </div>

          {/* Step 2: Select Existing Posts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Select Posts ({selectedPostIds.length}/{posts.length} Selected)
              </label>

              {posts.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
                >
                  {selectedPostIds.length === posts.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm">
                No posts found on this page.
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {posts.map((post) => {
                  const isSelected = selectedPostIds.includes(post._id);
                  return (
                    <div
                      key={post._id}
                      onClick={() => !isSubmitting && togglePostSelect(post._id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/30"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-orange-500 flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-orange-500" />
                        ) : (
                          <Square size={18} className="text-gray-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-relaxed">
                          {post.text || post.content || "Knowledge Post"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {post.subTopic ? (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                              Current: {post.subTopic}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                              No Subcategory
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 font-medium text-xs text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              isSubmitting ||
              selectedPostIds.length === 0 ||
              !selectedSubCategory
            }
            onClick={handleAssign}
            className="flex-1 max-w-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Grouping Posts...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>
                  Group {selectedPostIds.length || 0} Post
                  {selectedPostIds.length === 1 ? "" : "s"} to "
                  {selectedSubCategory || "Subcategory"}"
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
