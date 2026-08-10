import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Plus,
  Image as ImageIcon,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { gettopics } from "../../../redux/slices/topics.slice";
import { createPage, fetchMyPages } from "../../../redux/slices/pages.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";

export default function PageCreateModal({
  setIsOpen,
  isOpen,
  setSelectedType,
}) {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    topic: "",
    keywords: [],
    pageType: "public",
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [keywordInput, setKeywordInput] = useState("");

  // Category Dropdown & Accordion State
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { alltopics, isLoading } = useSelector((state) => state.topics || {});
  const { myPages, recommendationPages, pagesLoading } = useSelector(
    (state) => state.pages || {}
  );
  const { mySubscriptions } = useSelector(
    (state) => state.subscriptions || {}
  );
  const { savedCollections } = useSelector(
    (state) => state.collections || {}
  );

  useEffect(() => {
    if (isOpen) {
      dispatch(gettopics());
      dispatch(fetchMyPages({ page: 1, limit: 100 }));
    }
  }, [dispatch, isOpen]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" && keywordInput.trim() !== "") {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (index) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const getPageName = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    const name =
      item.name ||
      item.title ||
      item.pageName ||
      item.collectionName ||
      item.page?.name ||
      item.pageId?.name ||
      "";
    return typeof name === "string" ? name : String(name || "");
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = (formData.name || "").trim();

    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else {
      const existingPages = [
        ...(Array.isArray(myPages) ? myPages : []),
        ...(Array.isArray(recommendationPages) ? recommendationPages : []),
        ...(Array.isArray(mySubscriptions) ? mySubscriptions : []),
        ...(Array.isArray(savedCollections) ? savedCollections : []),
      ];

      const isDuplicate = existingPages.some((item) => {
        const nameStr = getPageName(item).trim();
        return (
          nameStr.length > 0 &&
          nameStr.toLowerCase() === trimmedName.toLowerCase()
        );
      });

      if (isDuplicate) {
        newErrors.name =
          "A page with this name already exists. Please choose a different page name.";
      }
    }

    if (!(formData.about || "").trim()) {
      newErrors.about = "About is required";
    } else if ((formData.about || "").trim().length < 5) {
      newErrors.about = "About must be at least 5 characters";
    }

    if (!formData.topic) {
      newErrors.topic = "Topic is required";
    }

    if (!formData.pageType) {
      newErrors.pageType = "Page type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePage = () => {
    try {
      if (!validateForm()) {
        return;
      }

      const fd = new FormData();

      if (uploadedImage) {
        fd.append("image", uploadedImage);
      }

      fd.append("name", (formData.name || "").trim());

      let topicValue = (formData.topic || "").trim();
      if (topicValue.includes(">")) {
        topicValue = topicValue.split(">").pop().trim();
      }
      fd.append("topic", topicValue);

      fd.append("about", (formData.about || "").trim());
      fd.append("pageType", formData.pageType);

      if (Array.isArray(formData.keywords)) {
        formData.keywords.forEach((item) => {
          if (item) {
            fd.append("keywords[]", `#${item.replace(/^#/, "")}`);
          }
        });
      }

      dispatch(createPage(fd))
        .unwrap()
        .then(() => {
          SuccessToast("Page created successfully!");
          dispatch(fetchMyPages({ page: 1, limit: 100 }));
          if (typeof setSelectedType === "function") {
            setSelectedType("Page done");
          }
          setIsOpen(false);
          setFormData({
            name: "",
            about: "",
            topic: "",
            keywords: [],
            pageType: "public",
          });
          setUploadedImage(null);
          setPreviewImage(null);
          setErrors({});
        })
        .catch((err) => {
          const errorMessage =
            typeof err === "string"
              ? err
              : err?.message || err?.data?.message || "Something went wrong";

          const lowerMsg = String(errorMessage).toLowerCase();

          if (
            lowerMsg.includes("already exist") ||
            lowerMsg.includes("duplicate") ||
            lowerMsg.includes("already taken") ||
            lowerMsg.includes("page with this name") ||
            lowerMsg.includes("name must be unique")
          ) {
            setErrors((prev) => ({
              ...prev,
              name:
                "A page with this name already exists. Please choose a different page name.",
            }));
          } else {
            ErrorToast("Error creating page: " + errorMessage);
          }
          console.log("Create page error:", err);
        });
    } catch (err) {
      console.error("Error in handleCreatePage:", err);
      ErrorToast("An unexpected error occurred while creating the page.");
    }
  };

  // Filter categories & subcategories based on search query
  const filteredTopics = (alltopics || []).filter((item) => {
    const searchLower = categorySearch.toLowerCase().trim();
    if (!searchLower) return true;
    const nameMatch = item.name?.toLowerCase().includes(searchLower);
    const subMatch = (item.subCategories || []).some((sub) =>
      sub.toLowerCase().includes(searchLower)
    );
    return nameMatch || subMatch;
  });

  return (
    <div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-slideUp overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create Page
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={pagesLoading}
                    className="text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form Content - 2 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* LEFT COLUMN */}
                  <div className="space-y-5">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Topic Page Type
                      </label>
                      <label className="relative inline-block cursor-pointer group">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-orange-400 flex items-center justify-center relative bg-orange-50/20 group-hover:bg-orange-50/50 transition-colors">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <ImageIcon className="w-9 h-9 text-orange-400" />
                          )}
                          <div className="absolute bottom-0 right-0 z-40 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-md">
                            <Plus className="w-4 h-4 "  />
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={pagesLoading}
                        />
                      </label>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Text goes here"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                          errors.name
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        }`}
                        disabled={pagesLoading}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* About */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        About
                      </label>
                      <input
                        type="text"
                        placeholder="Text goes here"
                        value={formData.about}
                        onChange={(e) =>
                          handleInputChange("about", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                          errors.about
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        }`}
                        disabled={pagesLoading}
                      />
                      {errors.about && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.about}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-5">
                    {/* Topic / Category Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Topic/ Category
                      </label>

                      {/* Header Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        disabled={isLoading || pagesLoading}
                        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm bg-white text-left transition-all ${
                          errors.topic ? "border-red-500" : "border-gray-200"
                        } ${
                          formData.topic
                            ? "text-gray-900 font-medium"
                            : "text-gray-400"
                        } hover:border-gray-300 focus:outline-none`}
                      >
                        <span>{formData.topic || "Text goes here"}</span>
                        {isCategoryOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-700" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-700" />
                        )}
                      </button>

                      {errors.topic && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.topic}
                        </p>
                      )}

                      {/* Dropdown Options Panel */}
                      {isCategoryOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-3 animate-fadeIn">
                          {/* Search Bar */}
                          <div className="relative mb-3">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search here"
                              value={categorySearch}
                              onChange={(e) =>
                                setCategorySearch(e.target.value)
                              }
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                            />
                          </div>

                          {/* Options List */}
                          <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-orange-scrollbar">
                            {isLoading ? (
                              <div className="p-3 text-xs text-gray-500 text-center">
                                Loading categories...
                              </div>
                            ) : filteredTopics.length === 0 ? (
                              <div className="p-3 text-xs text-gray-500 text-center">
                                No category found
                              </div>
                            ) : (
                              filteredTopics.map((item) => {
                                const hasSubs =
                                  Array.isArray(item.subCategories) &&
                                  item.subCategories.length > 0;
                                const isExpanded =
                                  expandedCategory === item._id ||
                                  (categorySearch.trim().length > 0 && hasSubs);

                                return (
                                  <div
                                    key={item._id}
                                    className="rounded-xl border border-transparent transition-all"
                                  >
                                    {/* Category Header Row */}
                                    <div
                                      onClick={() => {
                                        handleInputChange("topic", item.name);
                                        if (hasSubs) {
                                          setExpandedCategory(
                                            isExpanded ? null : item._id
                                          );
                                        } else {
                                          setIsCategoryOpen(false);
                                        }
                                      }}
                                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors ${
                                        formData.topic === item.name || isExpanded
                                          ? "text-orange-600 bg-orange-50/80"
                                          : "text-gray-800 hover:text-orange-600 hover:bg-gray-50"
                                      }`}
                                    >
                                      <span className="flex-1">
                                        {item.name}
                                      </span>

                                      {hasSubs && (
                                        <div className="p-1 hover:bg-orange-100 rounded-md transition-colors">
                                          {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-orange-600" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Subcategories Accordion Panel */}
                                    {hasSubs && isExpanded && (
                                      <div className="pl-5 pr-2 py-1.5 space-y-1 bg-gray-50/50 rounded-b-xl border-t border-gray-100/80 animate-fadeIn">
                                        {item.subCategories.map((sub, idx) => (
                                          <div
                                            key={idx}
                                            onClick={() => {
                                              handleInputChange(
                                                "topic",
                                                `${item.name} > ${sub}`
                                              );
                                              setIsCategoryOpen(false);
                                            }}
                                            className={`py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-colors ${
                                              formData.topic ===
                                              `${item.name} > ${sub}`
                                                ? "text-orange-600 font-semibold bg-orange-100/60"
                                                : "text-gray-600 hover:text-orange-600 hover:bg-white"
                                            }`}
                                          >
                                            {sub}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">
                        Keywords
                      </label>
                      <div className="w-full border border-gray-200 rounded-xl p-2.5 flex flex-wrap gap-2 min-h-[46px] bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        {formData.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            #{keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(index)}
                              className="ml-1.5 text-orange-600 hover:text-orange-800 font-bold"
                              disabled={pagesLoading}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          className="flex-1 outline-none px-1 text-sm text-gray-800 bg-transparent placeholder-gray-400"
                          placeholder={
                            formData.keywords.length === 0
                              ? "Text goes here"
                              : "Add hashtag..."
                          }
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={handleKeywordKeyDown}
                          disabled={pagesLoading}
                        />
                      </div>
                    </div>

                    {/* Topic Page Type Radio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Topic Page Type
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start cursor-pointer group">
                          <input
                            type="radio"
                            name="pageType"
                            value="public"
                            checked={formData.pageType === "public"}
                            onChange={(e) =>
                              handleInputChange("pageType", e.target.value)
                            }
                            className="mt-1 w-4 h-4 text-orange-500 focus:ring-orange-500 accent-orange-500"
                            disabled={pagesLoading}
                          />
                          <div className="ml-2.5">
                            <div className="font-semibold text-xs text-gray-900">
                              Public
                            </div>
                            <div className="text-[11px] text-gray-500 leading-tight">
                              Anyone can view, post and comment to this page.
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start cursor-pointer group">
                          <input
                            type="radio"
                            name="pageType"
                            value="private"
                            checked={formData.pageType === "private"}
                            onChange={(e) =>
                              handleInputChange("pageType", e.target.value)
                            }
                            className="mt-1 w-4 h-4 text-orange-500 focus:ring-orange-500 accent-orange-500"
                            disabled={pagesLoading}
                          />
                          <div className="ml-2.5">
                            <div className="font-semibold text-xs text-gray-900">
                              Private
                            </div>
                            <div className="text-[11px] text-gray-500 leading-tight">
                              Only approved users can view and submit to this page.
                            </div>
                          </div>
                        </label>
                      </div>
                      {errors.pageType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.pageType}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Submit Button */}
                <button
                  type="button"
                  onClick={handleCreatePage}
                  disabled={pagesLoading}
                  className="w-full bg-[#DE4B12] hover:bg-orange-600 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {pagesLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Page...</span>
                    </>
                  ) : (
                    "Create Page"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}