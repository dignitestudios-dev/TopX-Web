import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronBackOutline } from "react-icons/io5";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import { applyExpertStatus, resetExpertStatusSuccess } from "../../redux/slices/pages.slice";
import { SuccessToast, ErrorToast } from "./Toaster";

export default function ExpertStatusModal({
  isOpen,
  onClose,
  pageId,
  defaultTopic = "",
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { expertStatusLoading, expertStatusSuccess, error } = useSelector(
    (state) => state.pages
  );

  const [expertForm, setExpertForm] = useState({
    topic: defaultTopic || "",
    summary: "",
    identityFront: null,
    identityBack: null,
    expertiseDoc: null,
  });

  const [identityFrontPreview, setIdentityFrontPreview] = useState(null);
  const [identityBackPreview, setIdentityBackPreview] = useState(null);
  const [expertDocPreview, setExpertDocPreview] = useState(null);

  // Sync default topic when opened
  useEffect(() => {
    if (isOpen) {
      if (defaultTopic && !expertForm.topic) {
        setExpertForm((prev) => ({ ...prev, topic: defaultTopic }));
      }
    }
  }, [isOpen, defaultTopic]);

  // Handle successful submission
  useEffect(() => {
    if (expertStatusSuccess && isOpen) {
      SuccessToast("Expert status application submitted successfully");
      dispatch(resetExpertStatusSuccess());
      // Reset form
      setExpertForm({
        topic: "",
        summary: "",
        identityFront: null,
        identityBack: null,
        expertiseDoc: null,
      });
      setIdentityFrontPreview(null);
      setIdentityBackPreview(null);
      setExpertDocPreview(null);
      if (onSuccess) onSuccess();
      onClose();
    }
  }, [expertStatusSuccess, isOpen, dispatch, onClose, onSuccess]);

  // Handle errors
  useEffect(() => {
    if (error && isOpen && !expertStatusLoading) {
      ErrorToast(typeof error === "string" ? error : "Failed to apply for expert status");
    }
  }, [error, isOpen, expertStatusLoading]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setExpertForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleIdentityFrontUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      ErrorToast("Only image files (JPG, PNG, WEBP) are allowed for identity document!");
      e.target.value = "";
      return;
    }

    const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_DOC_SIZE) {
      ErrorToast("File size exceeds the 10MB limit! Please upload a file smaller than 10MB.");
      e.target.value = "";
      return;
    }

    setExpertForm((prev) => ({ ...prev, identityFront: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdentityFrontPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleIdentityBackUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      ErrorToast("Only image files (JPG, PNG, WEBP) are allowed for identity document!");
      e.target.value = "";
      return;
    }

    const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_DOC_SIZE) {
      ErrorToast("File size exceeds the 10MB limit! Please upload a file smaller than 10MB.");
      e.target.value = "";
      return;
    }

    setExpertForm((prev) => ({ ...prev, identityBack: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdentityBackPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExpertiseDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      ErrorToast("Only PDF, JPG, PNG, and WEBP files are allowed for expertise documents!");
      e.target.value = "";
      return;
    }

    const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_DOC_SIZE) {
      ErrorToast("File size exceeds the 10MB limit! Please upload a file smaller than 10MB.");
      e.target.value = "";
      return;
    }

    setExpertForm((prev) => ({ ...prev, expertiseDoc: file }));
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExpertDocPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setExpertDocPreview(file.name);
    }
  };

  const handleSubmit = () => {
    if (!expertForm.topic.trim()) {
      ErrorToast("Topic of expertise is required");
      return;
    }
    if (!expertForm.summary.trim()) {
      ErrorToast("Brief summary is required");
      return;
    }
    if (!expertForm.identityFront) {
      ErrorToast("Driver License Front is required");
      return;
    }
    if (!expertForm.identityBack) {
      ErrorToast("Driver License Back is required");
      return;
    }

    const formData = new FormData();
    formData.append("experitiseTopic", expertForm.topic.trim());
    formData.append("briefSummaryOfExpertise", expertForm.summary.trim());
    formData.append("identity", expertForm.identityFront);
    if (expertForm.identityBack) {
      formData.append("identity", expertForm.identityBack);
    }
    if (expertForm.expertiseDoc) {
      formData.append("experties", expertForm.expertiseDoc);
    }
    if (pageId) {
      formData.append("page", pageId);
    }

    dispatch(applyExpertStatus(formData));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl z-10 sticky top-0">
          <button
            onClick={onClose}
            disabled={expertStatusLoading}
            className="text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <IoChevronBackOutline className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 flex-1 text-center">
            Expertise Details
          </h2>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Content - Landscape Layout */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Topic Of Expertise */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Topic Of Expertise{" "}
                  <span className="text-gray-500 font-normal">
                    (Required)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Text goes here"
                  value={expertForm.topic}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                  disabled={expertStatusLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Brief Summary Of Expertise */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Brief Summary Of Expertise{" "}
                  <span className="text-gray-500 font-normal">
                    (Required)
                  </span>
                </label>
                <textarea
                  placeholder="Explain your knowledge and experience"
                  value={expertForm.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={6}
                  disabled={expertStatusLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Identification Docs */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Identification Docs{" "}
                  <span className="text-gray-500 font-normal">
                    (Required)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Drivers License (Front/Back)
                </p>

                {/* Front */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    Front
                  </label>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleIdentityFrontUpload}
                      disabled={expertStatusLoading}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-orange-500 rounded-lg p-5 text-center cursor-pointer hover:bg-orange-50 transition-colors disabled:opacity-50">
                      {identityFrontPreview ? (
                        <div className="space-y-2">
                          <img
                            src={identityFrontPreview}
                            alt="Front Preview"
                            className="max-h-24 mx-auto rounded object-contain"
                          />
                          <p className="text-xs text-gray-700">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-900">
                            Upload Driver License Front
                          </p>
                          <p className="text-xs text-gray-500">
                            Max 10MB (JPG, PNG, WEBP)
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Back */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Back
                  </label>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleIdentityBackUpload}
                      disabled={expertStatusLoading}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-orange-500 rounded-lg p-5 text-center cursor-pointer hover:bg-orange-50 transition-colors disabled:opacity-50">
                      {identityBackPreview ? (
                        <div className="space-y-2">
                          <img
                            src={identityBackPreview}
                            alt="Back Preview"
                            className="max-h-24 mx-auto rounded object-contain"
                          />
                          <p className="text-xs text-gray-700">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-900">
                            Upload Driver License Back
                          </p>
                          <p className="text-xs text-gray-500">
                            Max 10MB (JPG, PNG, WEBP)
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Expertise Docs */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Expertise Docs{" "}
                  <span className="text-gray-500 font-normal">
                    (Optional)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  i.e. Certifications / Degrees, Portfolio / Published Work,
                  Awards / Recognitions, Videos / Articles / Other Proof
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                    onChange={handleExpertiseDocUpload}
                    disabled={expertStatusLoading}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-orange-500 rounded-lg p-5 text-center cursor-pointer hover:bg-orange-50 transition-colors disabled:opacity-50">
                    {expertDocPreview ? (
                      <div className="space-y-2">
                        {expertForm.expertiseDoc?.type === "application/pdf" ||
                        expertForm.expertiseDoc?.name?.toLowerCase().endsWith(".pdf") ? (
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-700 font-medium py-3">
                            <BsFileEarmarkTextFill className="w-8 h-8 text-orange-500 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {expertForm.expertiseDoc?.name}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={expertDocPreview}
                            alt="Preview"
                            className="max-h-24 mx-auto rounded object-contain"
                          />
                        )}
                        <p className="text-xs text-gray-700">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-900">
                          Upload Supporting Document
                        </p>
                        <p className="text-xs text-gray-500">
                          Max 10MB (PDF, JPG, PNG, WEBP)
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleSubmit}
              disabled={expertStatusLoading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {expertStatusLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
