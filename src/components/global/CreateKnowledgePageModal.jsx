import React, { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { gettopics } from "../../redux/slices/topics.slice";
import {
  createKnowledgePage,
  fetchMyKnowledgePages,
  resetKnowledge,
} from "../../redux/slices/knowledgepost.slice";

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

  // IMAGE UPLOAD
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // TAGS
  const [subCategories, setSubCategories] = useState([]);
  const [subInput, setSubInput] = useState("");

  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  const dispatch = useDispatch();
  const { alltopics, isLoading } = useSelector((state) => state.topics);
  const { loading: loadingCreate, success } = useSelector(
    (state) => state.knowledgepost
  );

  useEffect(() => {
    dispatch(gettopics());
  }, [dispatch]);

  // Auto close on success
useEffect(() => {
  if (success === true) {
    dispatch(fetchMyKnowledgePages({ page: 1, limit: 10 }));
    onClose();
  }
}, [success]);


  // INPUT HANDLER
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // IMAGE UPLOAD
  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // SUB CATEGORY TAG INPUT
  const handleSubCategoryKeyDown = (e) => {
    if (e.key === "Enter" && subInput.trim() !== "") {
      if (subCategories.length >= 5) return;
      setSubCategories([...subCategories, subInput.trim()]);
      setSubInput("");
      e.preventDefault();
    }
  };

  const removeSubCategory = (index) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  // KEYWORDS TAG INPUT
  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" && keywordInput.trim() !== "") {
      if (keywords.length >= 5) return;
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
      e.preventDefault();
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // VALIDATION
  const validateFields = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.about.trim()) newErrors.about = "About is required";
    if (!formData.topic.trim()) newErrors.topic = "Topic is required";

    if (subCategories.length === 0)
      newErrors.subCategories = "At least 1 sub category required";

    if (keywords.length === 0)
      newErrors.keywords = "At least 1 keyword required";

    if (!imageFile) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleCreatePage = () => {
    if (!validateFields()) return;

    const fd = new FormData();

    fd.append("name", formData.name);
    fd.append("about", formData.about);
    fd.append("topic", formData.topic);
    fd.append("pageType", formData.pageType);
    fd.append("contentType", "knowledge");
    fd.append("image", imageFile);

    keywords.forEach((kw, i) => fd.append(`keywords[${i}]`, `#${kw}`));
    subCategories.forEach((sub, i) => fd.append(`subTopic[${i}]`, sub));

    dispatch(createKnowledgePage(fd));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-3">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 relative shadow-lg overflow-y-auto max-h-[90vh]">

        {/* Close */}
        <button
          disabled={loadingCreate}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-[20px] font-[700] text-black text-center mb-6">
          Create New Knowledge Page
        </h2>

        {/* IMAGE UPLOAD */}
        <div className="flex justify-center mb-6">
          <label className="relative cursor-pointer">
            <div
              className={`w-24 h-24 border-2 rounded-full flex items-center justify-center bg-orange-50 ${
                errors.image ? "border-red-500" : "border-orange-400 border-dashed"
              }`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Upload className="text-orange-500" size={28} />
              )}
            </div>
            <input
              type="file"
              disabled={loadingCreate}
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {errors.image && (
          <p className="text-red-500 text-sm text-center -mt-4">
            {errors.image}
          </p>
        )}

        {/* NAME */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-black">Name</label>
            <input
              disabled={loadingCreate}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Text goes here"
              className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* ABOUT */}
          <div>
            <label className="text-sm font-semibold text-black">About</label>
            <textarea
              disabled={loadingCreate}
              value={formData.about}
              onChange={(e) => handleInputChange("about", e.target.value)}
              placeholder="Text goes here"
              className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm h-24 ${
                errors.about ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.about && <p className="text-red-500 text-sm">{errors.about}</p>}
          </div>

          {/* TOPIC */}
          <div>
            <label className="text-sm font-semibold text-black">
              Topic / Category
            </label>

            <select
              disabled={loadingCreate || isLoading}
              value={formData.topic}
              onChange={(e) => handleInputChange("topic", e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 text-sm ${
                errors.topic ? "border-red-500" : "border-gray-300"
              }`}
            >
              {isLoading ? (
                <option>Loading topics…</option>
              ) : (
                <>
                  <option value="">Select Topic</option>
                  {alltopics?.map((item) => (
                    <option key={item._id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            {errors.topic && <p className="text-red-500 text-sm">{errors.topic}</p>}
          </div>

          {/* SUB CATEGORY */}
          <div>
            <label className="text-sm font-semibold text-black">
              Sub Categories
            </label>

            <div
              className={`w-full min-h-[48px] border rounded-xl px-4 py-2 flex flex-wrap gap-2 ${
                errors.subCategories ? "border-red-500" : "border-gray-300"
              }`}
            >
              {subCategories.map((tag, i) => (
                <div
                  key={i}
                  className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  {tag}
                  <button
                    disabled={loadingCreate}
                    onClick={() => removeSubCategory(i)}
                    className="font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              <input
                disabled={loadingCreate}
                type="text"
                placeholder="Type & press Enter"
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={handleSubCategoryKeyDown}
                className="flex-1 outline-none text-sm py-1"
              />
            </div>

            {errors.subCategories && (
              <p className="text-red-500 text-sm">{errors.subCategories}</p>
            )}
          </div>

          {/* KEYWORDS */}
          <div>
            <label className="text-sm font-semibold text-black">Keywords</label>

            <div
              className={`w-full min-h-[48px] border rounded-xl px-4 py-2 flex flex-wrap gap-2 ${
                errors.keywords ? "border-red-500" : "border-gray-300"
              }`}
            >
              {keywords.map((tag, i) => (
                <div
                  key={i}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  #{tag}
                  <button
                    disabled={loadingCreate}
                    onClick={() => removeKeyword(i)}
                    className="font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              <input
                disabled={loadingCreate}
                type="text"
                placeholder="Type & press Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                className="flex-1 outline-none text-sm py-1"
              />
            </div>

            {errors.keywords && (
              <p className="text-red-500 text-sm">{errors.keywords}</p>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          disabled={loadingCreate}
          className={`w-full bg-orange-600 text-white font-semibold rounded-xl py-3 mt-6 transition ${
            loadingCreate ? "opacity-60 cursor-not-allowed" : "hover:bg-orange-700"
          }`}
          onClick={handleCreatePage}
        >
          {loadingCreate ? "Creating..." : "Create Page"}
        </button>
      </div>
    </div>
  );
}
