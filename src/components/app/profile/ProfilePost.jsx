import React, { useEffect, useState, useRef } from "react";
import {
  Plus,
  MoreVertical,
  Lightbulb,
  X,
  Heart,
  Share2,
  Filter,
  LucideSettings2,
  Cross,
} from "lucide-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  getPageDetail,
  deletePage,
  resetDeletePageSuccess,
  updatePage,
  resetUpdatePageSuccess,
  applyExpertStatus,
  resetExpertStatusSuccess,
} from "../../../redux/slices/pages.slice";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import PagePosts from "./PagePosts";
import CommentFilterModal from "./CommentFilterModal";
import UploadPostStory from "./UploadPostStory";

import {
  getPageStories,
  LikeOtherStories,
  viewOtherStories,
} from "../../../redux/slices/Subscription.slice";
import { timeAgo } from "../../../lib/helpers";
import ActiveStoryModal from "./ActiveStoryModal";
import { useNavigate } from "react-router";
import { Lock } from "lucide-react";
import CollectionModal from "../../global/CollectionModal";
import {
  addPageToCollections,
  getMyCollections,
  removePageFromCollections,
} from "../../../redux/slices/collection.slice";
import ReportModal from "../../global/ReportModal";
import {
  sendReport,
  resetReportState,
} from "../../../redux/slices/reports.slice";
import { SuccessToast, ErrorToast } from "../../global/Toaster";
import Input from "../../common/Input";
import { createStory } from "../../../redux/slices/posts.slice";
import axios from "../../../axios";
import { expert, nofound } from "../../../assets/export";
import { startStream } from "../../../redux/slices/livestream.slice";
import { FaPlus } from "react-icons/fa6";

export default function ProfilePost({ setIsProfilePostOpen, pageId }) {
  const [activeTab, setActiveTab] = useState("post");
  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [commentFilter, setCommentFilter] = useState("all");
  const [suggestPostModal, setSuggestPostModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [postPermission, setPostPermission] = useState("anyone");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editPageModal, setEditPageModal] = useState(false);
  const [pageName, setPageName] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [expertModal, setExpertModal] = useState(false);
  const [expertForm, setExpertForm] = useState({
    topic: "",
    summary: "",
    identityFront: null,
    identityBack: null,
    expertiseDoc: null,
  });
  const [expertDocPreview, setExpertDocPreview] = useState(null);
  const [identityFrontPreview, setIdentityFrontPreview] = useState(null);
  const [identityBackPreview, setIdentityBackPreview] = useState(null);
  const [storyModal, setStoryModal] = useState(false);
  const [storyMedia, setStoryMedia] = useState(null);
  const [storyMediaPreview, setStoryMediaPreview] = useState(null);
  const [storyTextOverlay, setStoryTextOverlay] = useState({
    text: "",
    x: 50,
    y: 50,
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Arial",
    isDragging: false,
    isActive: false,
  });
  const storyPreviewRef = useRef(null);
  const storyTextRef = useRef(null);
  const [createPostUploadModal, setCreatePostUploadModal] = useState(false);
  const [postRequests, setPostRequests] = useState([]);
  const [postRequestsLoading, setPostRequestsLoading] = useState(false);
  const [postRequestsError, setPostRequestsError] = useState(null);
  const [requestActionLoadingId, setRequestActionLoadingId] = useState(null);
  const [goLiveLoading, setGoLiveLoading] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { livestreamError } = useSelector((state) => state.livestream);

  console.log(user, "userrrrrrrrrrrrrr");

  const dispatch = useDispatch();
  const {
    pageDetail,
    pageDetailLoading,
    deletePageLoading,
    deletePageSuccess,
    updatePageLoading,
    updatePageSuccess,
    expertStatusLoading,
    expertStatusSuccess,
  } = useSelector((state) => state.pages);
  const { postsLoading } = useSelector((state) => state.posts);
  const { PageStories, isLoading } = useSelector(
    (state) => state.subscriptions,
  );
  const { reportLoading, reportSuccess } = useSelector(
    (state) => state.reports,
  );
  const page = pageDetail;
  const isPrivatePage =
    page?.pageType === "private" || page?.pageType === "pr  ivate";
  const isRequestPending = page?.requestStatus === "pending";
  const isRequestAccepted = page?.requestStatus === "accepted";
  const isPageOwner = user?._id === page?.user?._id || user?._id === page?.user;

  // Show content if: not private, OR subscribed, OR request accepted, OR is page owner
  const shouldShowContent =
    !isPrivatePage || isSubscribed || isRequestAccepted || isPageOwner;

  // Check if should show private page overlay: private page, not subscribed, not page owner
  const shouldShowPrivateOverlay =
    isPrivatePage && !isSubscribed && !isPageOwner;

  console.log(page, "page");

  // Fetch page details and stories on mount
  useEffect(() => {
    if (pageId) {
      dispatch(getPageStories({ id: pageId }));
      dispatch(getPageDetail(pageId));
    }
  }, [pageId, dispatch]);

  console.log(pageDetail, "pageDetail");

  // Set subscription state from pageDetail
  useEffect(() => {
    if (pageDetail) {
      setIsSubscribed(!!pageDetail.isSubscribed);
      setIsPrivate(pageDetail.pageType === "private");
      // Map API postingType -> local postPermission state
      if (pageDetail.postingType === "onlyMe") {
        setPostPermission("onlyMe");
      } else {
        setPostPermission("anyone");
      }
      setPageName(pageDetail.name || "");
      setEditImagePreview(pageDetail.image || null);
    }
  }, [pageDetail]);

  // ---------- Page Settings (privacy & posting type) ----------
  const updatePageSettings = async (nextIsPrivate, nextPostPermission) => {
    if (!pageId || !isPageOwner) return;

    const payload = {
      pageType: nextIsPrivate ? "private" : "public",
      postingType: nextPostPermission === "onlyMe" ? "onlyMe" : "everyone",
    };

    try {
      setSettingsLoading(true);
      await axios.post(`/pages/settings/${pageId}`, payload);

      // Local state update
      setIsPrivate(nextIsPrivate);
      setPostPermission(nextPostPermission);

      // Refresh page detail so rest of UI uses latest values
      dispatch(getPageDetail(pageId));

      SuccessToast("Settings updated successfully");
    } catch (error) {
      console.error("Failed to update page settings", error);
      const errorMessage =
        (typeof error === "string" && error) ||
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to update settings";
      ErrorToast(errorMessage);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePrivacyToggle = () => {
    const nextIsPrivate = !isPrivate;
    updatePageSettings(nextIsPrivate, postPermission);
  };

  const handlePostPermissionChange = (value) => {
    const nextPermission = value === "onlyMe" ? "onlyMe" : "anyone";
    updatePageSettings(isPrivate, nextPermission);
  };

  // Reset edit form when modal opens
  useEffect(() => {
    if (editPageModal && pageDetail) {
      setPageName(pageDetail.name || "");
      setEditImagePreview(pageDetail.image || null);
      setEditImageFile(null);
    }
  }, [editPageModal, pageDetail]);

  // Handle report success
  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportModal(false);
    }
  }, [reportSuccess, dispatch]);

  // Handle delete page success
  useEffect(() => {
    if (deletePageSuccess) {
      SuccessToast("Page deleted successfully");
      setDeleteModal(false);
      setIsProfilePostOpen(false);
      // Reset delete success state
      dispatch(resetDeletePageSuccess());
      // Navigate to home page (not root to avoid logout)
      navigate("/home");
    }
  }, [deletePageSuccess, navigate, setIsProfilePostOpen, dispatch]);

  // Handle update page success
  useEffect(() => {
    if (updatePageSuccess) {
      SuccessToast("Page updated successfully");
      setEditPageModal(false);
      dispatch(resetUpdatePageSuccess());
      // Refresh page detail
      if (pageId) {
        dispatch(getPageDetail(pageId));
      }
    }
  }, [updatePageSuccess, dispatch, pageId]);

  // Handle expert status success
  useEffect(() => {
    if (expertStatusSuccess) {
      SuccessToast("Expert status application submitted successfully");
      setExpertModal(false);
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
    }
  }, [expertStatusSuccess, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch post suggestion requests for this page (Post Request tab)
  const fetchPostRequests = async () => {
    if (!pageId || !isPageOwner) return;

    setPostRequestsLoading(true);
    setPostRequestsError(null);

    try {
      const res = await axios.get("/requests/my", {
        params: {
          page: 1,
          limit: 10,
          status: "pending",
          pageId,
          type: "suggestion",
        },
      });

      setPostRequests(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch post requests", error);
      setPostRequestsError(
        error.response?.data?.message || "Failed to fetch post requests",
      );
    } finally {
      setPostRequestsLoading(false);
    }
  };

  // Load requests when switching to Post Request tab
  useEffect(() => {
    if (activeTab === "postrequest") {
      fetchPostRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pageId, isPageOwner]);

  // Handle accept / reject of a request
  const handleRequestAction = async (requestId, status) => {
    if (!requestId) return;

    setRequestActionLoadingId(requestId);
    try {
      await axios.post(`/requests/${requestId}`, {
        status,
      });

      // Remove handled request from list
      setPostRequests((prev) => prev.filter((r) => r._id !== requestId));

      SuccessToast(
        status === "accepted"
          ? "Request accepted successfully"
          : "Request rejected successfully",
      );
    } catch (error) {
      console.error("Failed to update request status", error);
      ErrorToast(
        error.response?.data?.message || "Failed to update request status",
      );
    } finally {
      setRequestActionLoadingId(null);
    }
  };

  // Subscribe click handler - open modal
  const handleSubscribeClick = () => {
    setSelectedPage({ _id: pageId });
    setOpenModal(true);
  };

  // Save to collection handler
  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(
      addPageToCollections({
        collections: selectedCollections,
        page: pageId,
      }),
    ).then((res) => {
      if (!res.error) {
        setIsSubscribed(true);
        dispatch(getPageDetail(pageId));
        setOpenModal(false);
        dispatch(getMyCollections({ page: 1, limit: 100 }));
      }
    });
  };

  // Handle unsubscribe
  const handleUnsubscribe = () => {
    dispatch(
      removePageFromCollections({
        collections: page?.collections || [],
        page: pageId,
      }),
    ).then((res) => {
      if (!res.error) {
        setIsSubscribed(false);
        dispatch(getPageDetail(pageId));
        dispatch(getMyCollections({ page: 1, limit: 100 }));
        setShowDropdown(false);
      }
    });
  };

  // Handle report submit
  const handleReportSubmit = (reason) => {
    dispatch(
      sendReport({
        reason,
        targetModel: "Page",
        targetId: pageId,
        isReported: true,
      }),
    );
  };

  // Handle delete page
  const handleDeletePage = () => {
    if (pageId) {
      dispatch(deletePage(pageId));
    }
  };

  // Handle image upload for edit
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle update page
  const handleUpdatePage = () => {
    if (!pageName.trim()) {
      ErrorToast("Page name is required");
      return;
    }

    const formData = new FormData();
    formData.append("pageName", pageName.trim());

    // Only append image if a new one is selected
    if (editImageFile) {
      formData.append("image", editImageFile);
    }

    if (pageId) {
      dispatch(updatePage({ pageId, formData }));
    }
  };

  // Handle expert form input change
  const handleExpertInputChange = (field, value) => {
    setExpertForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle identity front upload
  const handleIdentityFrontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpertForm((prev) => ({ ...prev, identityFront: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdentityFrontPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle identity back upload
  const handleIdentityBackUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpertForm((prev) => ({ ...prev, identityBack: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdentityBackPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle expertise doc upload
  const handleExpertiseDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpertForm((prev) => ({ ...prev, expertiseDoc: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setExpertDocPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle expert form submit
  const handleExpertSubmit = () => {
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
    formData.append("identity", expertForm.identityBack);
    if (expertForm.expertiseDoc) {
      formData.append("experties", expertForm.expertiseDoc);
    }
    if (pageId) {
      formData.append("page", pageId);
    }

    dispatch(applyExpertStatus(formData));
  };

  // Handle story media upload
  const handleStoryMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoryMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryMediaPreview(reader.result);
        // Reset text overlay when new media is uploaded
        setStoryTextOverlay({
          text: "",
          x: 50,
          y: 50,
          color: "#FFFFFF",
          fontSize: 24,
          fontFamily: "Arial",
          isDragging: false,
          isActive: false,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle text overlay drag
  const handleTextDragStart = (e) => {
    setStoryTextOverlay((prev) => ({
      ...prev,
      isDragging: true,
      isActive: true,
    }));
  };

  const handleTextDrag = (e) => {
    if (!storyTextOverlay.isDragging || !storyPreviewRef.current) return;

    const rect = storyPreviewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setStoryTextOverlay((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    }));
  };

  const handleTextDragEnd = () => {
    setStoryTextOverlay((prev) => ({ ...prev, isDragging: false }));
  };

  // Handle text input click
  const handleTextClick = () => {
    setStoryTextOverlay((prev) => ({ ...prev, isActive: true }));
  };

  // Combine image/video with text overlay using canvas
  const combineMediaWithText = async () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Set canvas size (story format: 9:16 aspect ratio)
        const maxWidth = 1080;
        const maxHeight = 1920;
        const aspectRatio = img.width / img.height;

        let width, height;
        if (aspectRatio > maxWidth / maxHeight) {
          width = maxWidth;
          height = maxWidth / aspectRatio;
        } else {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Draw text overlay if text exists
        if (storyTextOverlay.text && storyTextOverlay.text.trim()) {
          ctx.font = `${storyTextOverlay.fontSize}px ${storyTextOverlay.fontFamily}`;
          ctx.fillStyle = storyTextOverlay.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Add text shadow for better visibility
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          const textX = (storyTextOverlay.x / 100) * width;
          const textY = (storyTextOverlay.y / 100) * height;

          // Handle multiline text
          const lines = storyTextOverlay.text.split("\n");
          const lineHeight = storyTextOverlay.fontSize * 1.2;
          const startY = textY - ((lines.length - 1) * lineHeight) / 2;

          lines.forEach((line, index) => {
            ctx.fillText(line, textX, startY + index * lineHeight);
          });
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "story-with-text.png", {
                type: "image/png",
              });
              resolve(file);
            } else {
              reject(new Error("Failed to create image"));
            }
          },
          "image/png",
          0.95,
        );
      };

      img.onerror = () => {
        // If it's a video, we'll use the original file
        resolve(storyMedia);
      };

      if (storyMediaPreview) {
        img.src = storyMediaPreview;
      } else {
        resolve(storyMedia);
      }
    });
  };

  // Handle Go Live
  const handleGoLive = async () => {
    if (!pageId) {
      ErrorToast("Page ID is required");
      return;
    }

    setGoLiveLoading(true);
    try {
      const res = await dispatch(startStream(pageId));

      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast("Stream started successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/live-stream/${pageId}`, {
            state: { fromGoLive: true },
          });
          setGoLiveLoading(false);
        }, 500);
      } else {
        ErrorToast(res.payload || livestreamError || "Failed to start stream");
        setGoLiveLoading(false);
      }
    } catch (error) {
      ErrorToast(error.message || "Failed to start stream");
      setGoLiveLoading(false);
    }
  };

  // Handle story creation
  const handleCreateStory = async () => {
    if (!storyMedia) {
      ErrorToast("Please select a media file");
      return;
    }

    if (!pageId) {
      ErrorToast("Page ID is required");
      return;
    }

    try {
      let mediaToUpload = storyMedia;

      // If text overlay exists and media is image, combine them
      if (
        storyTextOverlay.text &&
        storyTextOverlay.text.trim() &&
        storyMedia?.type?.startsWith("image/")
      ) {
        mediaToUpload = await combineMediaWithText();
      }

      const formData = new FormData();
      formData.append("pages[0]", pageId);
      formData.append("media", mediaToUpload);

      await dispatch(createStory(formData)).unwrap();
      SuccessToast("Story created successfully");
      setStoryModal(false);
      setStoryMedia(null);
      setStoryMediaPreview(null);
      setStoryTextOverlay({
        text: "",
        x: 50,
        y: 50,
        color: "#FFFFFF",
        fontSize: 24,
        fontFamily: "Arial",
        isDragging: false,
        isActive: false,
      });
      // Refresh page stories
      if (pageId) {
        dispatch(getPageStories({ id: pageId }));
      }
    } catch (error) {
      const message =
        (typeof error === "string" && error) ||
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to create story";
      ErrorToast(message);
    }
  };

  const handleViewStory = async (storyId) => {
    await dispatch(viewOtherStories({ storyId }));
  };

  // Early return if the page is loading or doesn't exist
  if (pageDetailLoading || !pageDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 font-semibold">
            Loading page details...
          </p>
        </div>
      </div>
    );
  }

  const maxLength = 100;

  console.log(pageDetail, "pageDetail");

  return (
    <div className="relative">
      <div>
        <div className="bg-white rounded-[15px] overflow-hidden">
          {/* HEADER */}
          <div className="h-28 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] p-2">
            <div
              onClick={() => setIsProfilePostOpen(false)}
              className="flex items-center justify-center bg-white w-[30px] h-[30px] rounded-full cursor-pointer"
            >
              <IoChevronBackOutline className="w-4 h-4 text-[#DE4B12]" />
            </div>
          </div>

          {/* PROFILE SECTION */}
          <div className="px-4 pb-6">
            <div className="flex items-start justify-between -mt-12">
              {/* IMAGE + NAME */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {/* Outer glow wrapper when stories exist */}
                  <div
                    className={`rounded-full ${PageStories && PageStories.length > 0
                      ? "p-[4px] bg-gradient-to-r from-[#fd8d1c] to-[#ffd906] shadow-[0_0_16px_rgba(245,158,11,0.8)]"
                      : ""
                      }`}
                  >
                    <div
                      onClick={() => {
                        if (PageStories && PageStories.length > 0) {
                          setActiveStory(PageStories);
                          handleViewStory(PageStories[0]?._id);
                        }
                      }}
                      className={`w-[135px] cursor-pointer h-[135px] rounded-full ${PageStories && PageStories.length > 0
                        ? "bg-white"
                        : "bg-gradient-to-r from-[#fd8d1c] to-[#ffd906]"
                        }`}
                    >
                      {page?.image ? (
                        <img
                          src={page.image}
                          alt="Page"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center">
                          <span className="text-6xl font-semibold text-white">
                            {(() => {
                              if (!page?.name) return "P";
                              const words = page.name.trim().split(/\s+/);
                              const targetWord = words[1] || words[0];
                              return targetWord.charAt(0).toUpperCase();
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isPageOwner && (
                    <button
                      onClick={() => setStoryModal(true)}
                      className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

                {/* PAGE NAME + ABOUT */}
                <div className="mt-12">
                  <div className="flex gap-4 items-center">
                    <h1 className="text-[18px] font-[500] text-[#000000] mb-2">
                      {page?.name}
                    </h1>
                    {page.expertLevelStatus == "accepted" && (
                      <img
                        src={expert}
                        className="w-[80px] h-[25px]"
                      />
                    )}
                  </div>

                  <p className="text-gray-500 text-sm leading-relaxed flex-1 w-[30em]">
                    {page?.about && page?.about.length > maxLength
                      ? page?.about.substring(0, maxLength) + "..."
                      : page?.about}
                  </p>

                  <div className="flex items-center gap-[70px] relative">
                    <span className="text-gray-600 font-medium text-sm">
                      {/* Add followers count if necessary */}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 mt-14">
                {/* Request Pending Button - Show when requestStatus is pending (only for non-owners) */}
                {isPrivatePage && isRequestPending && !isPageOwner && (
                  <button
                    disabled
                    className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-gray-200 text-gray-700 cursor-not-allowed border-2"
                  >
                    Request Pending
                  </button>
                )}

                {/* Subscribe Button - Only show when subscribed (to show UnSubscribe) */}
                {isSubscribed &&
                  (!isPrivatePage || (isPrivatePage && !isRequestPending)) &&
                  !isPageOwner && (
                    <button
                      // onClick={handleUnsubscribe}
                      className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 border-2"
                    >
                      Subscribed
                    </button>
                  )}

                {/* Subscribe Button - Show when not subscribed */}
                {!isSubscribed &&
                  (!isPrivatePage || (isPrivatePage && !isRequestPending)) && (
                    <button
                      onClick={handleSubscribeClick}
                      className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 border-2"
                    >
                      Subscribe
                    </button>
                  )}


                {/* Live Chat Button - Show when subscribed OR user is page owner */}
                {(isSubscribed || isPageOwner) &&
                  (!isPrivatePage || isRequestAccepted || isPageOwner) && (
                    <button
                      onClick={() => {
                        console.log(
                          "Button clicked, navigating with:",
                          {
                            pageId,
                            pageName: pageDetail?.name,
                          },
                          page?.liveChat,
                        );
                        navigate(`/live-chat`, {
                          state: {
                            pageId: pageId,
                            pageName: pageDetail?.name,
                            pageOwner: page?.liveChat,
                          },
                        });
                      }}
                      className="border-[1px] p-2 px-4 flex gap-4 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-5"
                    >
                      {page?.liveChat
                        ? "Join A Live Chat"
                        : "Start A Live Chat"}
                    </button>
                  )}

                {/* Plus Icon Button - Only show for page owner */}
                {isPageOwner && (
                  <button
                    onClick={() => setActionModal(true)}
                    className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}

                {/* Suggest Post Button - Only show when subscribed */}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 -bottom-[6em] mt-1 w-[13em] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* Only show these items if the user is the page owner */}
                      {isPageOwner && (
                        <>
                          <button
                            onClick={() => {
                              setExpertModal(true);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            Apply for Expert Status
                          </button>

                          <button
                            onClick={() => {
                              setDeleteModal(true);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            Delete Page
                          </button>

                          <button
                            onClick={() => {
                              setSettingsModal(true);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            Setting
                          </button>

                          <button
                            onClick={() => {
                              setEditPageModal(true);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            Edit Page
                          </button>
                        </>
                      )}

                      {!isPageOwner && (
                        <>
                          {isSubscribed && !isRequestPending && (
                            <button
                              onClick={() => handleUnsubscribe()}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                              Unsubscribe Page
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setReportModal(true);
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            Report
                          </button>

                          {isSubscribed && (
                            <button
                              onClick={() => setSuggestPostModal(true)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                            >
                              Suggest Post
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KEYWORDS (Hashtags) */}
            <div className="flex flex-wrap gap-2 mb-3 mt-4">
              {page?.keywords?.map((keyword, idx) => (
                <span key={idx} className="text-gray-400 text-sm">
                  {keyword}
                </span>
              ))}
            </div>
            {page.followersCount > 0 && (
              <div className="flex gap-1 items-center">
                {/* Followers Images */}
                <div className="flex items-center">
                  {page.followers.slice(0, 3).map((follower, index) => (
                    <img
                      key={index}
                      src={
                        follower ||
                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                      } // Use follower image or default image if null
                      alt={`Follower ${index + 1}`}
                      className="w-[24px] h-[24px] object-cover rounded-full"
                    />
                  ))}
                </div>

                {/* Followers Count */}
                <div className="flex items-center gap-1 pl-1">
                  <p className="text-[14px] font-[600] text-[#000000]">
                    {page.followersCount}+
                  </p>
                  <p className="text-[14px] font-[500] text-[#ADADAD]">
                    Follows
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div
          className={
            !shouldShowContent
              ? "blur-md pointer-events-none select-none"
              : "flex items-center justify-between border-b border-gray-200"
          }
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("post")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${activeTab === "post"
                ? "text-orange-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <BsFileEarmarkTextFill size={19} />
              <span className="text-[14px] font-[500]">Post</span>
              {activeTab === "post" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
              )}
            </button>

            {/* Post Request Tab - Only show for page owner */}
            {isPageOwner && (
              <button
                onClick={() => setActiveTab("postrequest")}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${activeTab === "postrequest"
                  ? "text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <div
                  className={`p-1.5 rounded ${activeTab === "postrequest"
                    ? "bg-orange-600"
                    : "bg-gray-400"
                    }`}
                >
                  <Lightbulb className="text-white" size={16} />
                </div>
                <span className="text-[13px] font-[500]">Post Request</span>
                {activeTab === "postrequest" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
                )}
              </button>
            )}
          </div>

          {/* Filter Icon - Show only for post tab when content is visible */}
          {!isPageOwner && activeTab === "post" && shouldShowContent && (
            <button
              onClick={() => setFilterModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              title="Filter Comments"
            >
              <LucideSettings2 className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* POSTS LIST / POST REQUEST LIST */}
        {activeTab === "post" ? (
          <div
            className={
              !shouldShowContent
                ? "blur-md hidden pointer-events-none select-none"
                : "mr-[15em] mx-auto p-4 space-y-4"
            }
          >
            <PagePosts
              pageId={pageId}
              commentFilter={commentFilter}
              isPageOwner={isPageOwner}
              elevatedPosts={page?.elevatedPosts}
            />
          </div>
        ) : (
          isPageOwner && (
            <div className="mx-auto p-4 space-y-4">
              {postRequestsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : postRequestsError ? (
                <div className="text-center text-sm text-red-500">
                  {postRequestsError}
                </div>
              ) : postRequests.length === 0 ? (
                <div className="text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-2xl py-6">
                  <div className=" flex justify-center">
                    <img src={nofound} height={300} width={300} alt="" />
                  </div>
                  <p className="font-bold pt-4 text-black">
                    No Post request found
                  </p>
                </div>
              ) : (
                postRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border border-gray-200 rounded-2xl p-4 flex gap-4 bg-white shadow-sm"
                  >
                    {/* Author */}
                    <div className="flex-shrink-0">
                      <img
                        src={req.author?.profilePicture}
                        alt={req.author?.name}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/48?text=User";
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {req.author?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{req.author?.username}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {timeAgo(req.createdAt)}
                        </p>
                      </div>

                      {/* Post body + media preview */}
                      <div className="mt-1 space-y-2">
                        {req.post?.bodyText && (
                          <p className="text-sm text-gray-800 whitespace-pre-line">
                            {req.post.bodyText}
                          </p>
                        )}

                        {Array.isArray(req.post?.media) &&
                          req.post.media.length > 0 && (
                            <div className="mt-1 grid grid-cols-2 gap-2">
                              {req.post.media.slice(0, 2).map((m) => (
                                <img
                                  key={m._id}
                                  src={m.fileUrl}
                                  alt={m.title || "media"}
                                  className="w-full h-80 object-cover rounded-xl bg-gray-100"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/150";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleRequestAction(req._id, "accepted")
                          }
                          disabled={requestActionLoadingId === req._id}
                          className="px-10 py-1.5 rounded-[10px] text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {requestActionLoadingId === req._id
                            ? "Processing..."
                            : "Accept"}
                        </button>
                        <button
                          onClick={() =>
                            handleRequestAction(req._id, "rejected")
                          }
                          disabled={requestActionLoadingId === req._id}
                          className="px-10 py-1.5 rounded-[10px] text-sm font-semibold bg-slate-200 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        )}
      </div>

      {/* Story Modal */}
      <ActiveStoryModal
        PageStories={PageStories}
        activeStory={activeStory}
        setActiveStory={setActiveStory}
        handleViewStory={handleViewStory}
        onStoryDeleted={() => {
          // Refresh page stories after deletion
          if (pageId) {
            dispatch(getPageStories({ id: pageId }));
          }
        }}
      />

      {/* Private Page Modal - Show on top of blurred content */}
      {shouldShowPrivateOverlay && (
        <div className="absolute inset-0 top-[30em] flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100">
              <Lock className="w-7 h-7 text-orange-600" />
            </div>
            {isRequestPending ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Request Pending
                </h2>
                <p className="text-sm text-gray-500 text-center max-w-[220px]">
                  You have subscribe this page and request is pending
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  This Page is Private
                </h2>
                <p className="text-sm text-gray-500 text-center max-w-[220px]">
                  You don't have permission to view this content.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {openModal && (
        <CollectionModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          page={selectedPage}
          onSave={handleSaveToCollection}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        loading={reportLoading}
        onSubmit={handleReportSubmit}
      />

      {/* Comment Filter Modal */}
      <CommentFilterModal
        isOpen={filterModal}
        onClose={() => setFilterModal(false)}
        onApply={(filter) => setCommentFilter(filter)}
        selectedFilter={commentFilter}
      />

      {/* Suggest Post Modal */}
      <UploadPostStory
        isOpen={suggestPostModal}
        setIsOpen={setSuggestPostModal}
        setSelectedType={() => { }}
        title="Suggest Post"
        selectedPages={[pageId]}
      />

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900 flex-1 text-center">
                Settings
              </h2>
              <button
                onClick={() => setSettingsModal(false)}
                className="text-black hover:text-orange-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-6"></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="px-5 py-6 space-y-6">
              {/* Make this page private section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Make this page private
                  </h3>
                  <button
                    onClick={handlePrivacyToggle}
                    disabled={settingsLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? "bg-orange-500" : "bg-gray-300"
                      } ${settingsLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <p className="text-black mb-1 font-bold">Private Page:</p>
                    <p>
                      When enabled, only users you approve (followers) can see
                      your posts, page information, and interactions. Your
                      content will not be visible to anyone who is not a
                      follower.
                    </p>
                  </div>
                  <div>
                    <p className="text-black mb-1 font-bold">Public Page:</p>
                    <p>
                      When disabled, anyone on the platform can view your posts
                      and page information, even if they do not follow you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Select who can post section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select who can post on your page
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="postPermission"
                      value="onlyMe"
                      checked={postPermission === "onlyMe"}
                      onChange={(e) => handlePostPermissionChange(e.target.value)}
                      className="w-4 h-4 accent-orange-500 border-gray-300 focus:ring-orange-500"
                      disabled={settingsLoading}
                    />
                    <span className="text-sm text-gray-700">Only Me</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="postPermission"
                      value="anyone"
                      checked={postPermission === "anyone"}
                      onChange={(e) => handlePostPermissionChange(e.target.value)}
                      className="w-4 h-4 accent-orange-500 border-gray-300 focus:ring-orange-500"
                      disabled={settingsLoading}
                    />
                    <span className="text-sm text-gray-700">
                      Anyone can post on your page with your approval
                    </span>
                  </label>

                  {settingsLoading && (
                    <p className="text-xs text-orange-500 flex items-center gap-2 mt-1">
                      <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Saving settings...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Page Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center outline-none">
            {/* Icon Container */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-600 rounded-xl p-3 inline-flex items-center justify-center">
                <X className="text-white" size={24} strokeWidth={3} />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Delete Page
            </h2>

            {/* Message */}
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete this page?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Cancel Button */}
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deletePageLoading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Don't Delete
              </button>

              {/* Confirm Button */}
              <button
                onClick={handleDeletePage}
                disabled={deletePageLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletePageLoading ? "Deleting..." : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {editPageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Page</h2>
              <button
                onClick={() => setEditPageModal(false)}
                disabled={updatePageLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Page Name Input */}
              <div>
                <Input
                  label="Page Name"
                  size="md"
                  type="text"
                  placeholder="Enter page name"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  disabled={updatePageLoading}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Page Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  fileClassName="w-[100px] h-[100px]"
                  preview={editImagePreview}
                  disabled={updatePageLoading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditPageModal(false)}
                  disabled={updatePageLoading}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePage}
                  disabled={updatePageLoading || !pageName.trim()}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePageLoading ? "Updating..." : "Update Page"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Expert Status Modal - Landscape Layout */}
      {expertModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl z-10">

              <button
                onClick={() => setExpertModal(false)}
                disabled={expertStatusLoading}
                className="text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
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
              <div className="grid grid-cols-2 gap-6">
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
                      onChange={(e) =>
                        handleExpertInputChange("topic", e.target.value)
                      }
                      disabled={expertStatusLoading}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Brief Summary Of Expertise */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Brief Summary Of Expertise
                    </label>
                    <textarea
                      placeholder="Explain your knowledge and experience"
                      value={expertForm.summary}
                      onChange={(e) =>
                        handleExpertInputChange("summary", e.target.value)
                      }
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
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleIdentityFrontUpload}
                          disabled={expertStatusLoading}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-orange-500 rounded-lg p-6 text-center cursor-pointer hover:bg-orange-50 transition-colors disabled:opacity-50">
                          {identityFrontPreview ? (
                            <div className="space-y-2">
                              <img
                                src={identityFrontPreview}
                                alt="Front Preview"
                                className="max-h-24 mx-auto rounded"
                              />
                              <p className="text-xs text-gray-700">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-900">
                                Upload "document name"
                              </p>
                              <p className="text-xs text-gray-500">
                                Upto 20mb JPG, PNG
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
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleIdentityBackUpload}
                          disabled={expertStatusLoading}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-orange-500 rounded-lg p-6 text-center cursor-pointer hover:bg-orange-50 transition-colors disabled:opacity-50">
                          {identityBackPreview ? (
                            <div className="space-y-2">
                              <img
                                src={identityBackPreview}
                                alt="Back Preview"
                                className="max-h-24 mx-auto rounded"
                              />
                              <p className="text-xs text-gray-700">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-900">
                                Upload "document name"
                              </p>
                              <p className="text-xs text-gray-500">
                                Upto 20mb JPG, PNG
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
                        accept="image/jpeg,image/jpg,image/png,.pdf"
                        onChange={handleExpertiseDocUpload}
                        disabled={expertStatusLoading}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-orange-500 rounded-lg p-6 text-center cursor-pointer hover:bg-orange-50 transition-colors disabled:opacity-50">
                        {expertDocPreview ? (
                          <div className="space-y-2">
                            <img
                              src={expertDocPreview}
                              alt="Preview"
                              className="max-h-24 mx-auto rounded"
                            />
                            <p className="text-xs text-gray-700">
                              Click to change
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-900">
                              Upload "document name"
                            </p>
                            <p className="text-xs text-gray-500">
                              Upto 20mb JPG, PNG
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
                  onClick={handleExpertSubmit}
                  disabled={expertStatusLoading}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {expertStatusLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal - Direct for this page (no page select) */}
      <UploadPostStory
        isOpen={createPostUploadModal}
        setIsOpen={setCreatePostUploadModal}
        setSelectedType={() => { }}
        title="Create Post"
        selectedPages={[pageId]}
      />

      {/* Action Modal - Create Post / Go Live */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Select Type
              </h2>
              <button
                onClick={() => setActionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              {/* Create Post Option */}
              <button
                onClick={() => {
                  setActionModal(false);
                  setCreatePostUploadModal(true);
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaPlus className="text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Create Post</p>
                </div>
              </button>

              {/* Go Live Option */}
              <button
                onClick={() => {
                  setActionModal(false);
                  handleGoLive();
                }}
                disabled={goLiveLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  {goLiveLoading ? (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaPlus className="text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {goLiveLoading
                      ? "Starting..."
                      : "Go Live on this Topic page"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {storyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Story
              </h2>
              <button
                onClick={() => {
                  setStoryModal(false);
                  setStoryMedia(null);
                  setStoryMediaPreview(null);
                  setStoryTextOverlay({
                    text: "",
                    x: 50,
                    y: 50,
                    color: "#FFFFFF",
                    fontSize: 24,
                    fontFamily: "Arial",
                    isDragging: false,
                    isActive: false,
                  });
                }}
                disabled={postsLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[80vh] overflow-y-auto">
              {/* Media Upload Area */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Add Photo or Video
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleStoryMediaUpload}
                    disabled={postsLoading}
                    className="hidden"
                  />
                  {storyMediaPreview ? (
                    <div
                      ref={storyPreviewRef}
                      className="relative bg-black rounded-lg overflow-hidden cursor-move"
                      onMouseMove={handleTextDrag}
                      onMouseUp={handleTextDragEnd}
                      onMouseLeave={handleTextDragEnd}
                      onClick={(e) => {
                        if (!storyTextOverlay.isActive) {
                          handleTextClick();
                        }
                      }}
                    >
                      {storyMedia?.type?.startsWith("video/") ? (
                        <video
                          src={storyMediaPreview}
                          controls
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <img
                          src={storyMediaPreview}
                          alt="Story preview"
                          className="w-full h-64 object-cover"
                        />
                      )}

                      {/* Text Overlay */}
                      {storyTextOverlay.text &&
                        storyTextOverlay.text.trim() && (
                          <div
                            ref={storyTextRef}
                            className={`absolute cursor-move select-none ${storyTextOverlay.isActive ? "ring-2 ring-orange-500" : ""}`}
                            style={{
                              left: `${storyTextOverlay.x}%`,
                              top: `${storyTextOverlay.y}%`,
                              transform: "translate(-50%, -50%)",
                              color: storyTextOverlay.color,
                              fontSize: `${storyTextOverlay.fontSize}px`,
                              fontFamily: storyTextOverlay.fontFamily,
                              textShadow:
                                "2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              maxWidth: "90%",
                              textAlign: "center",
                            }}
                            onMouseDown={handleTextDragStart}
                            onClick={(e) => {
                              e.stopPropagation();
                              setStoryTextOverlay((prev) => ({
                                ...prev,
                                isActive: true,
                              }));
                            }}
                          >
                            {storyTextOverlay.text}
                          </div>
                        )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStoryMedia(null);
                          setStoryMediaPreview(null);
                          setStoryTextOverlay({
                            text: "",
                            x: 50,
                            y: 50,
                            color: "#FFFFFF",
                            fontSize: 24,
                            fontFamily: "Arial",
                            isDragging: false,
                            isActive: false,
                          });
                        }}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                          <Plus className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Add Photo or Video
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tap to upload
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Text Overlay Controls */}
              {storyMediaPreview && (
                <div className="mb-5 space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Add Text Overlay
                    </label>
                    <textarea
                      value={storyTextOverlay.text}
                      onChange={(e) =>
                        setStoryTextOverlay((prev) => ({
                          ...prev,
                          text: e.target.value,
                          isActive: true,
                        }))
                      }
                      placeholder="Type your text here..."
                      rows="2"
                      className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      onClick={() =>
                        setStoryTextOverlay((prev) => ({
                          ...prev,
                          isActive: true,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Click and drag text on image to reposition
                    </p>
                  </div>

                  {storyTextOverlay.text && storyTextOverlay.text.trim() && (
                    <>
                      {/* Color Picker */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Text Color
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            "#FFFFFF",
                            "#000000",
                            "#FF0000",
                            "#00FF00",
                            "#0000FF",
                            "#FFFF00",
                            "#FF00FF",
                            "#00FFFF",
                          ].map((color) => (
                            <button
                              key={color}
                              onClick={() =>
                                setStoryTextOverlay((prev) => ({
                                  ...prev,
                                  color,
                                }))
                              }
                              className={`w-10 h-10 rounded-lg border-2 transition-all ${storyTextOverlay.color === color
                                ? "border-orange-500 scale-110"
                                : "border-gray-300"
                                }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <input
                            type="color"
                            value={storyTextOverlay.color}
                            onChange={(e) =>
                              setStoryTextOverlay((prev) => ({
                                ...prev,
                                color: e.target.value,
                              }))
                            }
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Font Size: {storyTextOverlay.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={storyTextOverlay.fontSize}
                          onChange={(e) =>
                            setStoryTextOverlay((prev) => ({
                              ...prev,
                              fontSize: parseInt(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Font Family */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Font Family
                        </label>
                        <select
                          value={storyTextOverlay.fontFamily}
                          onChange={(e) =>
                            setStoryTextOverlay((prev) => ({
                              ...prev,
                              fontFamily: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Impact">Impact</option>
                          <option value="Comic Sans MS">Comic Sans MS</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStoryModal(false);
                    setStoryMedia(null);
                    setStoryMediaPreview(null);
                    setStoryTextOverlay({
                      text: "",
                      x: 50,
                      y: 50,
                      color: "#FFFFFF",
                      fontSize: 24,
                      fontFamily: "Arial",
                      isDragging: false,
                      isActive: false,
                    });
                  }}
                  disabled={postsLoading}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStory}
                  disabled={postsLoading || !storyMedia}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {postsLoading ? "Creating..." : "Share Story"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
