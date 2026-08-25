import React, { useEffect, useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { gettopics } from "../../redux/slices/topics.slice";
import {
  updateKnowledgePage,
  getKnowledgePostDetail,
} from "../../redux/slices/knowledgepost.slice";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import CustomSelect from "./CustomeSelect";
import ProfilePictureModal from "../app/profile/ProfilePictureModal";
import EmojiPickerModal from "../app/profile/EmojiPickerModal";
import { emojiUrlToFile, isEmoji } from "../../lib/helpers";
import { SuccessToast, ErrorToast } from "./Toaster";

export default function EditKnowledgePageModal({
  isOpen,
  onClose,
  pageData,
  onUpdated,
}) {
  if (!isOpen || !pageData) return null;

  // FORM DATA
  const [formData, setFormData] = useState({
    name: pageData?.name || "",
    about: pageData?.about || "",
    topic: pageData?.topic || "",
    pageType: pageData?.pageType || "public",
    contentType: "knowledge",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // IMAGE UPLOAD
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(pageData?.image || null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // TAGS
  const [selectedSuggestedSubCategory, setSelectedSuggestedSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [subInput, setSubInput] = useState("");

  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  const dispatch = useDispatch();
  const { alltopics, isLoading } = useSelector((state) => state.topics || {});
  const { loadingCreate, knowledgePages } = useSelector(
    (state) => state.knowledgepost || {},
  );
  const { myPages } = useSelector((state) => state.pages || {});

  const isBusy = loadingCreate || isSubmitting;

  useEffect(() => {
    dispatch(gettopics());
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);

  // INITIALIZE DATA FROM pageData and alltopics
  useEffect(() => {
    if (pageData) {
      const topicName = pageData.topic || "";
      setFormData({
        name: pageData.name || "",
        about: pageData.about || "",
        topic: topicName,
        pageType: pageData.pageType || "public",
        contentType: "knowledge",
      });
      setPreviewImage(pageData.image || null);
      setImageFile(null);

      // Keywords
      const rawKeywords = Array.isArray(pageData.keywords)
        ? pageData.keywords
            .map((k) => String(k).replace(/^#+/, "").trim())
            .filter(Boolean)
        : [];
      setKeywords(rawKeywords);

      // SubCategories
      const rawSubs = Array.isArray(pageData.subTopic)
        ? pageData.subTopic
            .map((s) => (typeof s === "string" ? s.trim() : s?.name?.trim() || ""))
            .filter(Boolean)
        : [];

      // Find available suggested subcategories for this topic
      const selectedCategory = (alltopics || []).find(
        (item) => item.name === topicName || item._id === topicName,
      );
      const availableSubCategories = (
        selectedCategory?.subCategories ||
        selectedCategory?.subTopics ||
        []
      )
        .map((s) => (typeof s === "string" ? s.trim() : s?.name?.trim() || ""))
        .filter(Boolean);

      // Check if any subcategory in rawSubs matches one of the suggested subcategories
      let matchedSuggested = "";
      const customSubs = [];

      rawSubs.forEach((sub) => {
        const isSuggested = availableSubCategories.some(
          (avail) => avail.toLowerCase() === sub.toLowerCase(),
        );
        if (isSuggested && !matchedSuggested) {
          const exactMatch = availableSubCategories.find(
            (avail) => avail.toLowerCase() === sub.toLowerCase(),
          );
          matchedSuggested = exactMatch || sub;
        } else {
          customSubs.push(sub);
        }
      });

      setSelectedSuggestedSubCategory(matchedSuggested);
      setSubCategories(customSubs);
    }
  }, [pageData, alltopics]);

  // INPUT HANDLER
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "topic") {
      setSelectedSuggestedSubCategory("");
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

  // SUGGESTED SUBCATEGORY HANDLER (Single Selection)
  const handleSelectSuggestedSubCategory = (subName) => {
    const name = (
      typeof subName === "string" ? subName : subName?.name || ""
    ).trim();
    if (!name) return;

    if (
      selectedSuggestedSubCategory.toLowerCase() === name.toLowerCase()
    ) {
      setSelectedSuggestedSubCategory("");
    } else {
      setSelectedSuggestedSubCategory(name);
    }

    if (errors.subCategories) {
      setErrors((prev) => ({ ...prev, subCategories: "" }));
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
          updated.length < 15 &&
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
          updated.length < 15 &&
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
        if (page._id === pageData._id) return false;
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

    if (!suggestedSub && currentSubCategories.length === 0) {
      newErrors.subCategories = "At least 1 sub category required";
    }

    if (currentKeywords.length === 0) {
      newErrors.keywords = "At least 1 keyword required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleUpdatePage = async () => {
    if (isBusy || !pageData?._id) return;

    // Auto-commit any typed text in keywords before validation
    let finalKeywords = [...keywords];
    if (keywordInput.trim()) {
      const items = keywordInput
        .split(/[,\n;]/)
        .map((k) => k.trim().replace(/^#+/, ""))
        .filter((k) => k.length > 0);

      items.forEach((item) => {
        if (
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
      if (!(binaryFile instanceof File) && previewImage && previewImage !== pageData.image) {
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
      // fd.append("contentType", "knowledge");

      // Handle Image
      if (binaryFile instanceof File) {
        fd.append("image", binaryFile, binaryFile.name || "knowledge_page.png");
      } else if (!previewImage && pageData.image) {
        fd.append("removeImage", "true");
      }

      // Keywords (JSON string as per documentation)
      const formattedKeywords = finalKeywords.map((kw) =>
        kw.startsWith("#") ? kw : `#${kw}`
      );
      if (formattedKeywords.length > 0) {
        fd.append("keywords", JSON.stringify(formattedKeywords));
      }

      // Subcategories & Deleted Subcategories calculation
      const allFinalSubs = [];
      if (selectedSuggestedSubCategory) {
        allFinalSubs.push(selectedSuggestedSubCategory);
      }
      finalSubCategories.forEach((sub) => {
        if (!allFinalSubs.some((s) => s.toLowerCase() === sub.toLowerCase())) {
          allFinalSubs.push(sub);
        }
      });

      // Calculate deleted subcategories to trigger post migration in backend
      const originalSubs = (Array.isArray(pageData?.subTopic) ? pageData.subTopic : [])
        .map((s) => (typeof s === "string" ? s.trim() : s?.name?.trim() || ""))
        .filter(Boolean);
      const deletedSubTopics = originalSubs.filter(
        (orig) => !allFinalSubs.some((s) => s.toLowerCase() === orig.toLowerCase())
      );

      // Send subTopic as JSON string
      fd.append("subTopic", JSON.stringify(allFinalSubs));

      if (deletedSubTopics.length > 0) {
        fd.append("deletedSubTopics", JSON.stringify(deletedSubTopics));
      }

      await dispatch(updateKnowledgePage({ pageId: pageData._id, formData: fd })).unwrap();
      SuccessToast("Knowledge page updated successfully!");
      dispatch(getKnowledgePostDetail({ pageId: pageData._id, page: 1, limit: 10 }));
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Update Knowledge Page error:", err);
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
        ErrorToast(errMsg || "Failed to update knowledge page");
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
          Edit Knowledge Page
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

          {/* TOPIC / CATEGORY */}
          <CustomSelect
            options={(alltopics || []).map((item) => ({
              value: item.name,
              label: item.name,
            }))}
            value={formData.topic}
            onChange={(val) => handleInputChange("topic", val)}
            disabled={isBusy || isLoading}
            error={errors.topic}
          />

          {/* Subcategories Display for selected Category */}
          {(() => {
            const selectedCategory = (alltopics || []).find(
              (item) =>
                item.name === formData.topic || item._id === formData.topic,
            );
            const availableSubCategories =
              selectedCategory?.subCategories ||
              selectedCategory?.subTopics ||
              [];
            if (!formData.topic || availableSubCategories.length === 0)
              return null;

            return (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Suggested Subcategories (click to select):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableSubCategories.map((sub, idx) => {
                    const subName =
                      typeof sub === "string" ? sub : sub?.name || "";
                    if (!subName) return null;
                    const isSelected =
                      selectedSuggestedSubCategory.toLowerCase() ===
                      subName.toLowerCase();
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleSelectSuggestedSubCategory(subName)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer font-medium ${isSelected
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                          }`}
                      >
                        {isSelected ? `✓ ${subName}` : `+ ${subName}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

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
                  keywords.length >= 15
                    ? "Max keywords added"
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-black">
                Sub Categories
              </label>
            
            </div>
            <div
              className={`w-full min-h-[48px] border rounded-xl px-4 py-2 flex flex-wrap gap-2 mt-1 ${errors.subCategories ? "border-red-500" : "border-gray-300"
                } ${isBusy ? "bg-gray-50" : ""}`}
            >
              {subCategories.map((tag, i) => (
                <div
                  key={i}
                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => removeSubCategory(i)}
                    className="font-bold hover:text-orange-900 cursor-pointer"
                    title={`Delete subcategory "${tag}"`}
                  >
                    ×
                  </button>
                </div>
              ))}

              <input
                disabled={isBusy}
                type="text"
                placeholder={
                  subCategories.length >= 15
                    ? "Max subcategories added"
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
          onClick={handleUpdatePage}
        >
          {isBusy ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Updating Knowledge Page...</span>
            </>
          ) : (
            "Save Changes"
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
