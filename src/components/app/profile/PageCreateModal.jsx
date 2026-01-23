import React, { useEffect, useState } from 'react';
import { X, Plus, Image } from 'lucide-react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { useDispatch, useSelector } from 'react-redux';
import { gettopics } from '../../../redux/slices/topics.slice';
import { createPage, fetchMyPages } from '../../../redux/slices/pages.slice';
import { ErrorToast, SuccessToast } from '../../global/Toaster';

export default function PageCreateModal({ setIsOpen, isOpen, setSelectedType }) {

  const [formData, setFormData] = useState({
    name: '',
    about: '',
    topic: '',
    keywords: [],
    pageType: 'public'
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [keywordInput, setKeywordInput] = useState("");

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
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'About is required';
    } else if (formData.about.trim().length < 5) {
      newErrors.about = 'About must be at least 5 characters';
    }

    if (!formData.topic) {
      newErrors.topic = 'Topic is required';
    }

    if (!formData.pageType) {
      newErrors.pageType = 'Page type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePage = () => {
    if (!validateForm()) {
      return;
    }

    const fd = new FormData();
    fd.append("image", uploadedImage);
    fd.append("name", formData.name);
    fd.append("topic", formData.topic);
    fd.append("about", formData.about);
    fd.append("pageType", formData.pageType);

    formData.keywords.forEach((item) => {
      fd.append("keywords[]", `#${item}`); 
    });


    dispatch(createPage(fd))
      .unwrap()
      .then(() => {
        SuccessToast('Page created successfully!');
        // Refresh pages list in real-time
        dispatch(fetchMyPages({ page: 1, limit: 100 }));
        setSelectedType("Page done");
        setIsOpen(false);
        setFormData({
          name: '',
          about: '',
          topic: '',
          keywords: [],
          pageType: 'public'
        });
        setUploadedImage(null);
        setPreviewImage(null);
      })
      .catch((err) => {
        ErrorToast('Error creating page: ' + (err?.message || 'Something went wrong'));
        console.log(err);
      });
  };

  const dispatch = useDispatch();
  const { alltopics, isLoading } = useSelector((state) => state.topics);
  const { success, pagesLoading, error } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(gettopics());
  }, [dispatch]);

  // useEffect(() => {
  //   if (success) {
  //     SuccessToast('Page created successfully!');
  //     setSelectedType("Page done");
  //     setIsOpen(false);
  //     setFormData({
  //       name: '',
  //       about: '',
  //       topic: '',
  //       keywords: [],
  //       pageType: 'public'
  //     });
  //     setUploadedImage(null);
  //     setPreviewImage(null);
  //   }
  //   if (error) {
  //     ErrorToast('Error: ' + error);
  //   }
  // }, [success, error]);

  return (
    <div>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-slideUp overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Create New Page</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={pagesLoading}
                    className="text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <Input
                      label="Name"
                      size="md"
                      type="text"
                      placeholder="Enter your Topic page name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Input
                      label="About"
                      size="md"
                      type="text"
                      placeholder="Text goes here"
                      value={formData.about}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                    />
                    {errors.about && <p className="text-red-500 text-sm mt-1">{errors.about}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Topic / Category
                    </label>
                    <select
                      disabled={isLoading || pagesLoading}
                      className={`w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring-2 
      focus:ring-orange-500 focus:outline-none ${errors.topic ? 'border-red-500' : 'border-gray-300'}
      ${isLoading || pagesLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      value={formData.topic}
                      onChange={(e) => handleInputChange("topic", e.target.value)}
                    >
                      {isLoading ? (
                        <option>Loading topics...</option>
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
                    {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Keywords
                    </label>
                    <div className="w-full border rounded-lg p-2 flex flex-wrap gap-2 min-h-[48px]">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{keyword}
                          <button
                            onClick={() => removeKeyword(index)}
                            className="ml-2 text-orange-600 hover:text-orange-800"
                            disabled={pagesLoading}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 outline-none px-2 py-1 text-gray-700"
                        placeholder="Text goes here (hashtags)"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        disabled={pagesLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Upload Image
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      fileClassName="w-[100px] h-[100px]"
                      preview={previewImage}
                      disabled={pagesLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Topic Page Type
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-start cursor-pointer group">
                        <input
                          type="radio"
                          name="pageType"
                          value="public"
                          checked={formData.pageType === 'public'}
                          onChange={(e) => handleInputChange('pageType', e.target.value)}
                          className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500"
                          disabled={pagesLoading}
                        />
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">Public</div>
                          <div className="text-sm text-gray-500">
                            Anyone can view, post and comment to this page.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start cursor-pointer group">
                        <input
                          type="radio"
                          name="pageType"
                          value="private"
                          checked={formData.pageType === 'private'}
                          onChange={(e) => handleInputChange('pageType', e.target.value)}
                          className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500"
                          disabled={pagesLoading}
                        />
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">Private</div>
                          <div className="text-sm text-gray-500">
                            Only approved users can view and submit to this page.
                          </div>
                        </div>
                      </label>
                    </div>
                    {errors.pageType && <p className="text-red-500 text-sm mt-2">{errors.pageType}</p>}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCreatePage}
                  disabled={pagesLoading}
                  className="w-full flex justify-center"
                  size="lg"
                  variant="orange"
                >
                  {pagesLoading ? 'Creating Page...' : 'Create Page'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}