import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { gettopics } from "../../redux/slices/topics.slice";
import {
  createKnowledgePage,
  fetchMyKnowledgePages,
  resetKnowledge,
} from "../../redux/slices/knowledgepost.slice";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import ProfilePictureModal from "../app/profile/ProfilePictureModal";
import EmojiPickerModal from "../app/profile/EmojiPickerModal";
import { emojiUrlToFile, isEmoji } from "../../lib/helpers";
import { SuccessToast, ErrorToast } from "./Toaster";

export default function CreateKnowledgePageModal({ onClose }) {
  // FORM DATA
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    topic: "",
    pageType: "public",
    contentType: "knowledge",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // IMAGE UPLOAD
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // TAGS
  const [selectedSuggestedSubCategory, setSelectedSuggestedSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [subInput, setSubInput] = useState("");

  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  // Category Dropdown & Accordion State
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { alltopics, isLoading } = useSelector((state) => state.topics);
  const { loadingCreate, knowledgePages } = useSelector(
    (state) => state.knowledgepost,
  );
  const { myPages } = useSelector((state) => state.pages);

  const isBusy = loadingCreate || isSubmitting;

  useEffect(() => {
    dispatch(resetKnowledge());
    dispatch(gettopics());
    dispatch(fetchMyKnowledgePages({ page: 1, limit: 100 }));
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);

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

  // Helper to extract safe string name from subcategory
  const getSubName = (sub) => {
    if (typeof sub === "string") return sub.trim();
    return (sub?.name || sub?.title || "").trim();
  };

  // Filter categories & subcategories based on search query
  const filteredTopics = (alltopics || [])
    .map((item) => {
      const searchLower = categorySearch.toLowerCase().trim();
      const catName = typeof item === "string" ? item.trim() : (item?.name || "").trim();
      const rawSubs = Array.isArray(item?.subCategories)
        ? item.subCategories
        : Array.isArray(item?.subTopics)
        ? item.subTopics
        : [];

      const cleanSubs = rawSubs.map(getSubName).filter(Boolean);

      if (!searchLower) {
        return {
          ...item,
          name: catName,
          displaySubs: cleanSubs,
        };
      }

      const catMatches = catName.toLowerCase().includes(searchLower);
      const matchingSubs = cleanSubs.filter((subName) =>
        subName.toLowerCase().includes(searchLower)
      );

      if (catMatches) {
        return {
          ...item,
          name: catName,
          displaySubs: cleanSubs,
        };
      } else if (matchingSubs.length > 0) {
        return {
          ...item,
          name: catName,
          displaySubs: matchingSubs,
        };
      }

      return null;
    })
    .filter(Boolean);

  // INPUT HANDLER
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "topic") {
      if (value && value.includes(">")) {
        const sub = value.split(">").pop().trim();
        setSelectedSuggestedSubCategory(sub);
      } else {
        setSelectedSuggestedSubCategory("");
      }
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // IMAGE UPLOAD
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        ErrorToast("Image size must not exceed 5MB.");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSelectEmoji = async (emojiUrl) => {
    setPreviewImage(emojiUrl);
    setErrors((prev) => ({ ...prev, image: "" }));
    try {
      const file = await emojiUrlToFile(emojiUrl, "knowledge_page_emoji.png");
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



  // SUB CATEGORY HELPERS (Manual Custom Subcategories)
  const addSubCategory = (rawText) => {
    const text = (rawText || "").trim();
    if (!text) return;

    const items = text
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length === 0) return;

    setSubCategories((prev) => {
      const updated = [...prev];
      items.forEach((item) => {
        if (
          updated.length < 5 &&
          !updated.some((s) => s.toLowerCase() === item.toLowerCase())
        ) {
          updated.push(item);
        }
      });
      return updated;
    });

    setSubInput("");
    if (errors.subCategories) {
      setErrors((prev) => ({ ...prev, subCategories: "" }));
    }
  };

  const handleSubCategoryKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSubCategory(subInput);
    }
  };

  const removeSubCategory = (index) => {
    setSubCategories((prev) => prev.filter((_, i) => i !== index));
  };

  // KEYWORDS HELPERS
  const addKeyword = (rawText) => {
    const text = (rawText || "").trim();
    if (!text) return;

    const items = text
      .split(/[,\n;]/)
      .map((k) => k.trim().replace(/^#+/, ""))
      .filter((k) => k.length > 0);

    if (items.length === 0) return;

    setKeywords((prev) => {
      const updated = [...prev];
      items.forEach((item) => {
        if (
          updated.length < 5 &&
          !updated.some((k) => k.toLowerCase() === item.toLowerCase())
        ) {
          updated.push(item);
        }
      });
      return updated;
    });

    setKeywordInput("");
    if (errors.keywords) {
      setErrors((prev) => ({ ...prev, keywords: "" }));
    }
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  const removeKeyword = (index) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  // HELPER TO EXTRACT PAGE NAME STRING
  const getPageNameStr = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item.trim();
    const name =
      item.name ||
      item.title ||
      item.pageName ||
      item.page?.name ||
      item.pageId?.name ||
      "";
    return String(name).trim();
  };

  // VALIDATION
  const validateFields = (
    currentKeywords = keywords,
    currentSubCategories = subCategories,
    suggestedSub = selectedSuggestedSubCategory,
  ) => {
    const newErrors = {};
    const trimmedName = (formData.name || "").trim();

    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else {
      const allExistingPages = [
        ...(Array.isArray(knowledgePages) ? knowledgePages : []),
        ...(Array.isArray(myPages) ? myPages : []),
      ];

      const isDuplicate = allExistingPages.some((page) => {
        const nameStr = getPageNameStr(page);
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
    }

    if (!(formData.topic || "").trim()) {
      newErrors.topic = "Topic is required";
    }

    if (currentKeywords.length === 0) {
      newErrors.keywords = "At least 1 keyword required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleCreatePage = async () => {
    if (isBusy) return;

    // Auto-commit any typed text in keywords before validation
    let finalKeywords = [...keywords];
    if (keywordInput.trim()) {
      const items = keywordInput
        .split(/[,\n;]/)
        .map((k) => k.trim().replace(/^#+/, ""))
        .filter((k) => k.length > 0);

      items.forEach((item) => {
        if (
          finalKeywords.length < 5 &&
          !finalKeywords.some((k) => k.toLowerCase() === item.toLowerCase())
        ) {
          finalKeywords.push(item);
        }
      });
      setKeywords(finalKeywords);
      setKeywordInput("");
    }

    // Auto-commit any typed text in subcategories before validation
    let finalSubCategories = [...subCategories];
    if (subInput.trim()) {
      const items = subInput
        .split(/[,\n;]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      items.forEach((item) => {
        if (
          finalSubCategories.length < 5 &&
          !finalSubCategories.some((s) => s.toLowerCase() === item.toLowerCase())
        ) {
          finalSubCategories.push(item);
        }
      });
      setSubCategories(finalSubCategories);
      setSubInput("");
    }

    if (!validateFields(finalKeywords, finalSubCategories, selectedSuggestedSubCategory)) return;

    setIsSubmitting(true);

    try {
      let binaryFile = imageFile;
      if (!(binaryFile instanceof File) && previewImage) {
        binaryFile = await emojiUrlToFile(
          previewImage,
          "knowledge_page_emoji.png",
        );
      }

      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("about", formData.about.trim());

      let topicValue = (formData.topic || "").trim();
      if (topicValue.includes(">")) {
        topicValue = topicValue.split(">").pop().trim();
      }
      fd.append("topic", topicValue);

      fd.append("pageType", formData.pageType || "public");
      fd.append("contentType", "knowledge");
      if (binaryFile instanceof File) {
        fd.append("image", binaryFile, binaryFile.name || "knowledge_page.png");
      }

      finalKeywords.forEach((kw, i) =>
        fd.append(`keywords[${i}]`, kw.startsWith("#") ? kw : `#${kw}`),
      );

      const allFinalSubs = [];
      if (selectedSuggestedSubCategory) {
        allFinalSubs.push(selectedSuggestedSubCategory);
      }
      finalSubCategories.forEach((sub) => {
        if (!allFinalSubs.some((s) => s.toLowerCase() === sub.toLowerCase())) {
          allFinalSubs.push(sub);
        }
      });
      allFinalSubs.forEach((sub, i) => fd.append(`subTopic[${i}]`, sub));

      await dispatch(createKnowledgePage(fd)).unwrap();
      SuccessToast("Knowledge page created successfully!");
      dispatch(fetchMyKnowledgePages({ page: 1, limit: 10 }));
      dispatch(fetchMyPages({ page: 1, limit: 100 }));
      onClose();
    } catch (err) {
      console.error("Create Knowledge Page error:", err);
      const errMsg =
        typeof err === "string" ? err : err?.message || err?.data?.message || "";
      const lower = errMsg.toLowerCase();

      if (
        lower.includes("already exist") ||
        lower.includes("duplicate") ||
        lower.includes("already taken") ||
        lower.includes("page with this name") ||
        lower.includes("name must be unique") ||
        lower.includes("name is already")
      ) {
        setErrors((prev) => ({
          ...prev,
          name:
            "A page with this name already exists. Please choose a different page name.",
        }));
      } else {
        ErrorToast(errMsg || "Failed to create knowledge page");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-3">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 relative shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Close */}
        <button
          disabled={isBusy}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-[20px] font-[700] text-black text-center mb-6">
          Create Knowledge Page
        </h2>

        {/* IMAGE UPLOAD */}
        <div className="flex justify-center mb-6">
          <div
            onClick={() => !isBusy && setIsOptionsModalOpen(true)}
            className={`relative select-none ${isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div
              className={`w-24 h-24 border-2 rounded-full flex items-center justify-center bg-orange-50 overflow-hidden ${errors.image
                  ? "border-red-500"
                  : "border-orange-400 border-dashed"
                }`}
            >
              {previewImage ? (
                isEmoji(previewImage) ? (
                  <span className="text-4xl select-none flex items-center justify-center">
                    {previewImage}
                  </span>
                ) : (
                  <img
                    src={previewImage}
                    className="w-full h-full rounded-full object-cover"
                    alt="Knowledge Page Profile"
                  />
                )
              ) : (
                <Upload className="text-orange-500" size={28} />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              disabled={isBusy}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {errors.image && (
          <p className="text-red-500 text-sm text-center -mt-4">
            {errors.image}
          </p>
        )}

        {/* FORM FIELDS */}
        <div className="space-y-4">
          {/* NAME */}
          <div>
            <label className="text-sm font-semibold text-black">Name</label>
            <input
              disabled={isBusy}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your Knowledge page name"
              className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm ${errors.name ? "border-red-500" : "border-gray-300"
                } ${isBusy ? "bg-gray-50 cursor-not-allowed" : ""}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* ABOUT */}
          <div>
            <label className="text-sm font-semibold text-black">
              About Knowledge Page
            </label>
            <textarea
              disabled={isBusy}
              value={formData.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              placeholder="Text goes here"
              className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm h-[3.4em] ${errors.about ? "border-red-500" : "border-gray-300"
                } ${isBusy ? "bg-gray-50 cursor-not-allowed" : ""}`}
            />
            {errors.about && (
              <p className="text-red-500 text-sm mt-1">{errors.about}</p>
            )}
          </div>

          {/* TOPIC / CATEGORY DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-semibold text-black mb-1.5 block">
              Topic / Category
            </label>

            {/* Header Trigger */}
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              disabled={isLoading || isBusy}
              className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm bg-white text-left transition-all ${
                errors.topic ? "border-red-500" : "border-gray-300"
              } ${
                formData.topic
                  ? "text-gray-900 font-medium"
                  : "text-gray-400"
              } hover:border-gray-400 focus:outline-none ${
                isBusy ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
            >
              <span>{formData.topic || "Text goes here"}</span>
              {isCategoryOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-700" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {errors.topic && (
              <p className="text-red-500 text-xs mt-1">{errors.topic}</p>
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
                    onChange={(e) => setCategorySearch(e.target.value)}
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
                        Array.isArray(item.displaySubs) &&
                        item.displaySubs.length > 0;
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
                                  isExpanded ? null : item._id,
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
                            <span className="flex-1">{item.name}</span>

                            {hasSubs && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCategory(
                                    isExpanded ? null : item._id,
                                  );
                                }}
                                className="p-1 hover:bg-orange-100 rounded-md transition-colors"
                              >
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
                              {item.displaySubs.map((subName, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    handleInputChange(
                                      "topic",
                                      `${item.name} > ${subName}`,
                                    );
                                    setSelectedSuggestedSubCategory(subName);
                                    setIsCategoryOpen(false);
                                  }}
                                  className={`py-1.5 px-2.5 text-xs rounded-lg cursor-pointer transition-colors ${
                                    formData.topic ===
                                    `${item.name} > ${subName}`
                                      ? "text-orange-600 font-semibold bg-orange-100/60"
                                      : "text-gray-600 hover:text-orange-600 hover:bg-white"
                                  }`}
                                >
                                  {subName}
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

          {/* KEYWORDS */}
          <div>
            <label className="text-sm font-semibold text-black">Keywords</label>
            <div
              className={`w-full min-h-[48px] border rounded-xl px-4 py-2 flex flex-wrap gap-2 ${errors.keywords ? "border-red-500" : "border-gray-300"
                } ${isBusy ? "bg-gray-50" : ""}`}
            >
              {keywords.map((tag, i) => (
                <div
                  key={i}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  #{tag}
                  <button
                    disabled={isBusy}
                    onClick={() => removeKeyword(i)}
                    className="font-bold hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
              ))}

              <input
                disabled={isBusy}
                type="text"
                placeholder={
                  keywords.length >= 5
                    ? "Max 5 keywords added"
                    : "Type keyword and press Enter or comma"
                }
                value={keywordInput}
                onChange={(e) => {
                  setKeywordInput(e.target.value);
                  if (errors.keywords) {
                    setErrors((prev) => ({ ...prev, keywords: "" }));
                  }
                }}
                onKeyDown={handleKeywordKeyDown}
                onBlur={() => addKeyword(keywordInput)}
                className="flex-1 outline-none text-sm py-1 min-w-[120px]"
              />
            </div>

            {errors.keywords && (
              <p className="text-red-500 text-sm mt-1">{errors.keywords}</p>
            )}
          </div>

          {/* SUB CATEGORIES */}
          <div>
            <label className="text-sm font-semibold text-black">
              Sub Categories
            </label>
            <div
              className={`w-full min-h-[48px] border rounded-xl px-4 py-2 flex flex-wrap gap-2 ${errors.subCategories ? "border-red-500" : "border-gray-300"
                } ${isBusy ? "bg-gray-50" : ""}`}
            >
              {subCategories.map((tag, i) => (
                <div
                  key={i}
                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  {tag}
                  <button
                    disabled={isBusy}
                    onClick={() => removeSubCategory(i)}
                    className="font-bold hover:text-orange-900"
                  >
                    ×
                  </button>
                </div>
              ))}

              <input
                disabled={isBusy}
                type="text"
                placeholder={
                  subCategories.length >= 5
                    ? "Max 5 subcategories added"
                    : "Type subcategory and press Enter or comma"
                }
                value={subInput}
                onChange={(e) => {
                  setSubInput(e.target.value);
                  if (errors.subCategories) {
                    setErrors((prev) => ({ ...prev, subCategories: "" }));
                  }
                }}
                onKeyDown={handleSubCategoryKeyDown}
                onBlur={() => addSubCategory(subInput)}
                className="flex-1 outline-none text-sm py-1 min-w-[120px]"
              />
            </div>

            {errors.subCategories && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subCategories}
              </p>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          disabled={isBusy}
          className={`w-full bg-orange-600 text-white font-semibold rounded-xl py-3 mt-6 transition flex items-center justify-center gap-2 ${isBusy
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:bg-orange-700"
            }`}
          onClick={handleCreatePage}
        >
          {isBusy ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Creating Knowledge Page...</span>
            </>
          ) : (
            "Create Knowledge Page"
          )}
        </button>
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
    </div>
  );
}
