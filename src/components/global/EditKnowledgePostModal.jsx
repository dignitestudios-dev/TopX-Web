import React, { useState, useEffect } from "react";
import { X, ArrowLeft, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateKnowledgePost,
  fetchKnowledgeFeed,
  getKnowledgePostDetail,
} from "../../redux/slices/knowledgepost.slice";
import { ErrorToast, SuccessToast } from "./Toaster";

const EditKnowledgePostModal = ({
  post,
  onClose,
  onSuccess,
  selectedPageId,
}) => {
  const dispatch = useDispatch();
  const { loadingCreate } = useSelector((state) => state.knowledgepost);

  const presetBackgrounds = [
    { id: 1, name: "bg_blue", imagePath: "/bg_blue.jpg" },
    { id: 2, name: "bg_orange_gradient", imagePath: "/bg_orange_gradient.jpg" },
    { id: 3, name: "bg_red_gradient", imagePath: "/bg_red_gradient.png" },
    { id: 4, name: "bg_green", imagePath: "/bg_green.png" },
    { id: 5, name: "bg_multicolor", imagePath: "/bg_multicolor.png" },
  ];

  const fontFamilies = [
    { name: "Classic", family: "font-sans" },
    { name: "Signature", family: "font-serif" },
    { name: "Editor", family: "font-mono" },
    { name: "Poster", family: "font-bold" },
    { name: "Bubble", family: "font-serif" },
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];
  const alignmentOptions = [
    { value: "left", label: "⬅" },
    { value: "center", label: "⬇" },
    { value: "right", label: "➡" },
  ];

  // Initial State derived from post
  const [text, setText] = useState(post?.text || "");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Font styling states
  const [fontFamily, setFontFamily] = useState(post?.fontFamily || "Classic");
  const [fontSize, setFontSize] = useState(
    post?.fontSize ? String(post.fontSize).replace("px", "") : "18",
  );
  const [isBold, setIsBold] = useState(
    post?.isBold === true || post?.isBold === "true",
  );
  const [isItalic, setIsItalic] = useState(
    post?.isItalic === true || post?.isItalic === "true",
  );
  const [isUnderline, setIsUnderline] = useState(
    post?.isUnderline === true || post?.isUnderline === "true",
  );
  const [textColor, setTextColor] = useState(post?.color || "#ffffff");
  const [textAlignment, setTextAlignment] = useState(
    post?.textAlignment || "center",
  );

  // Background states
  const matchedPreset = post?.backgroundCode
    ? presetBackgrounds.find((bg) => bg.name === post.backgroundCode)
    : null;

  const [selectedBg, setSelectedBg] = useState(matchedPreset || null);
  const [backgroundType, setBackgroundType] = useState(
    post?.backgroundCode
      ? "preset"
      : post?.background || post?.image
        ? "upload"
        : "preset",
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    !post?.backgroundCode ? post?.background || post?.image || null : null,
  );

  const isBusy = loadingCreate || isSubmitting;

  const getFontClass = () => {
    const fontMap = {
      Classic: "font-sans",
      Signature: "font-serif",
      Editor: "font-mono",
      Poster: "font-black",
      Bubble: "font-serif",
    };
    return fontMap[fontFamily] || "font-sans";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      ErrorToast("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (file.size > MAX_SIZE) {
      ErrorToast(
        "Image size exceeds the 5MB limit. Please upload an image smaller than 5MB.",
      );
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setBackgroundType("upload");
    setSelectedBg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (isBusy) return;

    if (!text?.trim() || (!selectedBg && !imageFile && !imagePreview)) {
      ErrorToast("Please fill all required fields");
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      ErrorToast(
        "Image size exceeds the 5MB limit. Please upload an image smaller than 5MB.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const pageIdToUse =
        selectedPageId ||
        post?.page?._id ||
        post?.pageId ||
        post?.page ||
        "";

      const formData = new FormData();
      formData.append("text", text.trim());
      formData.append("pageId", pageIdToUse);
      formData.append("backgroundType", backgroundType);
      formData.append("fontFamily", fontFamily);
      formData.append("fontSize", `${fontSize}px`);
      formData.append("color", textColor);
      formData.append("isBold", String(isBold));
      formData.append("isItalic", String(isItalic));
      formData.append("isUnderline", String(isUnderline));
      formData.append("textAlignment", textAlignment);

      if (imageFile instanceof File) {
        formData.append("image", imageFile);
      } else if (selectedBg) {
        formData.append("backgroundCode", selectedBg.name);
      }

      if (post?.subTopic) {
        formData.append("subTopic", post.subTopic);
      }

      const res = await dispatch(
        updateKnowledgePost({ postId: post._id, formData }),
      ).unwrap();

      SuccessToast("Post updated successfully");
      dispatch(fetchKnowledgeFeed({ page: 1, limit: 10 }));

      if (pageIdToUse) {
        dispatch(
          getKnowledgePostDetail({ pageId: pageIdToUse, page: 1, limit: 10 }),
        );
      }

      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(res);
      }

      setShowPreview(false);
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      ErrorToast(
        typeof error === "string"
          ? error
          : error?.message || "Failed to update post. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Edit Post Modal Form */}
      {!showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Edit Knowledge Post
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
              {/* Body Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Body Text
                </label>
                <textarea
                  placeholder="Text goes here"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none h-28 font-medium"
                />
              </div>

              {/* Background Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Backgrounds
                </label>
                <div className="space-y-3">
                  {/* Preset Backgrounds */}
                  <div className="grid grid-cols-5 gap-2">
                    {presetBackgrounds.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setSelectedBg(bg);
                          setBackgroundType("preset");
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className={`w-full aspect-square rounded-2xl transition-all duration-300 hover:scale-105 ${
                          selectedBg?.name === bg.name &&
                          backgroundType === "preset"
                            ? "ring-4 ring-orange-500 ring-offset-2 scale-95"
                            : "hover:shadow-lg"
                        }`}
                        style={{
                          backgroundImage: `url(${bg.imagePath})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                        title={bg.name}
                      />
                    ))}
                  </div>

                  {/* Custom Image Upload */}
                  <label className="flex items-center justify-center border-2 border-dashed border-orange-300 rounded-2xl p-4 cursor-pointer hover:bg-orange-50/50 transition-all duration-300 group">
                    <div className="text-center">
                      <Upload
                        className="text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform"
                        size={24}
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200 bg-orange-50 p-2">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setSelectedBg(presetBackgrounds[0]);
                          setBackgroundType("preset");
                        }}
                        className="absolute top-3 right-3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Button */}
              <button
                onClick={() => setShowPreview(true)}
                disabled={!text || (!selectedBg && !imageFile && !imagePreview)}
                className={`w-full py-3 rounded-2xl font-bold transition-all duration-300 text-white ${
                  !text || (!selectedBg && !imageFile && !imagePreview)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg active:scale-95"
                }`}
              >
                Preview Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-orange-50 to-orange-50 border-b border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-200 p-2 rounded-lg"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-lg font-bold text-gray-900">
                Preview & Customize
              </h2>
            </div>

            {/* Preview Content */}
            <div className="p-6 space-y-4">
              {/* Preview Card */}
              <div
                className="rounded-3xl overflow-hidden flex items-center justify-center p-8 min-h-[320px] relative shadow-xl bg-cover bg-center"
                style={{
                  backgroundImage: imagePreview
                    ? `url(${imagePreview})`
                    : selectedBg
                      ? `url(${selectedBg.imagePath})`
                      : "",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor:
                    !imagePreview && !selectedBg ? "#f1f1f1" : "transparent",
                }}
              >
                <div className="text-center w-full space-y-4">
                  <p
                    className={`leading-relaxed drop-shadow-2xl mx-auto max-w-sm ${getFontClass()}`}
                    style={{
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      fontWeight: isBold ? "700" : "500",
                      fontStyle: isItalic ? "italic" : "normal",
                      textDecoration: isUnderline ? "underline" : "none",
                      textAlign: textAlignment,
                    }}
                  >
                    {text}
                  </p>
                </div>
              </div>

              {/* Style Controls */}
              <div className="space-y-4 bg-gray-50 rounded-2xl p-4">
                {/* Font Family Tabs */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Font Style
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setFontFamily(font.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                          fontFamily === font.name
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
                  {/* Font Size */}
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  >
                    {fontSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>

                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-700"></div>

                  {/* Color Picker */}
                  <label className="cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-gray-600 shadow-md"
                      style={{ backgroundColor: textColor }}
                    />
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-gray-400 text-xs font-semibold">
                      Color
                    </span>
                  </label>

                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-700"></div>

                  {/* Bold Button */}
                  <button
                    onClick={() => setIsBold(!isBold)}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-bold text-sm ${
                      isBold
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    B
                  </button>

                  {/* Italic Button */}
                  <button
                    onClick={() => setIsItalic(!isItalic)}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-bold italic text-sm ${
                      isItalic
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    I
                  </button>

                  {/* Underline Button */}
                  <button
                    onClick={() => setIsUnderline(!isUnderline)}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-bold underline text-sm ${
                      isUnderline
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    U
                  </button>

                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-700"></div>

                  {/* Alignment Buttons */}
                  <div className="flex gap-2">
                    {alignmentOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTextAlignment(option.value)}
                        className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold ${
                          textAlignment === option.value
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save / Update Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className={`w-full font-bold py-3 rounded-2xl transition-all duration-300 text-white ${
                  isBusy
                    ? "bg-gray-400 cursor-not-allowed pointer-events-none opacity-60"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg active:scale-95"
                }`}
              >
                {isBusy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Changes...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditKnowledgePostModal;
