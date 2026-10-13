import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  Layers,
  Repeat2,
  Pencil,
  GraduationCap,
  Plus,
} from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Avatar from "../../common/Avatar";
import {
  getKnowledgePostDetail,
  deleteKnowledgePost,
  resetKnowledge,
  likePost,
  deleteKnowledgePage,
  fetchMyKnowledgePages,
  updateKnowledgePage,
  toggleKnowledgePageSubscription,
} from "../../../redux/slices/knowledgepost.slice";
import { SuccessToast, ErrorToast } from "../../global/Toaster";
import ReportModal from "../../global/ReportModal";
import ShareRepostModal from "../../global/ShareRepostModal";
import PostStoryModal from "./PostStoryModal";
import SharePostModal from "../../global/SharePostModal";
import CommentsSection from "../../global/CommentsSection";
import KnowledgeCommentsSection from "../../global/KnowledgeCommentsSection";
import ShareToChatsModal from "../../global/ShareToChatsModal";
import DeleteKnowledgePageModal from "../../global/DeleteKnowledgePageModal";
import ManageKnowledgePostsModal from "../../global/ManageKnowledgePostsModal";
import EditKnowledgePostModal from "../../global/EditKnowledgePostModal";
import EditKnowledgePageModal from "../../global/EditKnowledgePageModal";
import ExpertStatusModal from "../../global/ExpertStatusModal";
import CreateKnowledgePostModal from "../../global/CreateKnowledgePostModal";
import { expert } from "../../../assets/export";
import { sendReport } from "../../../redux/slices/reports.slice";

export default function KnowledgePostPageDetail({
  pageId,
  setIsKnowledgePageOpen,
}) {
  const dispatch = useDispatch();
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likesCounts, setLikesCounts] = useState({}); // Track optimistic likes counts
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [expertModal, setExpertModal] = useState(false);
  const [openCreatePostModal, setOpenCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [likingPostId, setLikingPostId] = useState(null);
  const [activeSubTopic, setActiveSubTopic] = useState("All");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [sharepost, setSharepost] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [selectedOption, setSelectedOption] = useState("");
  const [reportmodal, setReportmodal] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [showPageOptionsDropdown, setShowPageOptionsDropdown] = useState(false);
  const [showManagePostsModal, setShowManagePostsModal] = useState(false);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const pageOptionsRef = useRef(null);
  const presetBackgrounds = [
    { id: 1, name: "bg_blue", imagePath: "/bg_blue.jpg" },
    { id: 2, name: "bg_orange_gradient", imagePath: "/bg_orange_gradient.jpg" },
    { id: 3, name: "bg_red_gradient", imagePath: "/bg_red_gradient.png" },
    { id: 4, name: "bg_green", imagePath: "/bg_green.png" },
    { id: 5, name: "bg_multicolor", imagePath: "/bg_multicolor.png" },
  ];
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);

  const deleteMenuRefs = useRef({});

  const {
    knowledgePageDetail,
    knowledgePagePosts,
    knowledgePageLoading,
    deleteLoading,
    deleteSuccess,
  } = useSelector((state) => state.knowledgepost);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );

  const isPageOwner = Boolean(
    user?._id &&
    knowledgePageDetail &&
    (user._id === knowledgePageDetail?.user?._id ||
      user._id === knowledgePageDetail?.user ||
      user._id === knowledgePageDetail?.creator?._id ||
      user._id === knowledgePageDetail?.creator ||
      user._id === knowledgePageDetail?.author?._id ||
      user._id === knowledgePageDetail?.author ||
      knowledgePageDetail?.isOwner)
  );

  useEffect(() => {
    if (knowledgePageDetail) {
      setIsSubscribed(Boolean(knowledgePageDetail.isSubscribed));
    }
  }, [knowledgePageDetail]);

  const handleSubscribeClick = async () => {
    if (!knowledgePageDetail?._id || isSubscribed || subscribing) return;
    try {
      setSubscribing(true);
      setIsSubscribed(true);
      const res = await dispatch(
        toggleKnowledgePageSubscription({ pageId: knowledgePageDetail._id }),
      ).unwrap();
      SuccessToast(res?.message || "Subscribed to knowledge page successfully");
    } catch (error) {
      console.error("Knowledge page subscription failed:", error);
      setIsSubscribed(false);
      ErrorToast(error?.message || "Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribeClick = async () => {
    if (!knowledgePageDetail?._id || !isSubscribed || subscribing) return;
    try {
      setSubscribing(true);
      setIsSubscribed(false);
      setShowPageOptionsDropdown(false);
      setShowDeleteMenu(null);
      const res = await dispatch(
        toggleKnowledgePageSubscription({ pageId: knowledgePageDetail._id }),
      ).unwrap();
      SuccessToast(res?.message || "Unsubscribed from knowledge page successfully");
    } catch (error) {
      console.error("Knowledge page unsubscribe failed:", error);
      setIsSubscribed(true);
      ErrorToast(error?.message || "Failed to unsubscribe");
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      dispatch(getKnowledgePostDetail({ pageId, page: 1, limit: 10 }));
    }
  }, [pageId]);

  // Initialize liked posts from localStorage and API data
  useEffect(() => {
    if (knowledgePagePosts && user?._id) {
      const localLikes = JSON.parse(
        localStorage.getItem("knowledgePostLikes") || "{}",
      );
      const initialLiked = new Set();
      const initialCounts = {};

      knowledgePagePosts.forEach((post) => {
        // Check localStorage first, then API data
        const isLocallyLiked = localLikes[post._id] === true;
        const isApiLiked = post.userLikes?.includes(user._id) || post.isLiked;

        if (isLocallyLiked || isApiLiked) {
          initialLiked.add(post._id);
        }

        // Store initial counts from API
        initialCounts[post._id] = post.likesCount || 0;
      });

      setLikedPosts(initialLiked);
      setLikesCounts(initialCounts);
    }
  }, [knowledgePagePosts, user?._id]);

  // Close the delete menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any open menu
      if (showDeleteMenu) {
        const menuRef = deleteMenuRefs.current[showDeleteMenu];
        if (menuRef && !menuRef.contains(event.target)) {
          setShowDeleteMenu(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteMenu]);

  // Initialize liked posts from localStorage and API data
  useEffect(() => {
    if (knowledgePagePosts && user?._id) {
      const localLikes = JSON.parse(
        localStorage.getItem("knowledgePostLikes") || "{}",
      );
      const initialLiked = new Set();
      const initialCounts = {};

      knowledgePagePosts.forEach((post) => {
        // Check localStorage first, then API data
        const isLocallyLiked = localLikes[post._id] === true;
        const isApiLiked = post.userLikes?.includes(user._id) || post.isLiked;

        if (isLocallyLiked || isApiLiked) {
          initialLiked.add(post._id);
        }

        // Store initial counts from API
        initialCounts[post._id] = post.likesCount || 0;
      });

      setLikedPosts(initialLiked);
      setLikesCounts(initialCounts);
    }
  }, [knowledgePagePosts, user?._id]);

  // Close the delete menu or page options menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any open post delete menu
      if (showDeleteMenu) {
        const menuRef = deleteMenuRefs.current[showDeleteMenu];
        if (menuRef && !menuRef.contains(event.target)) {
          setShowDeleteMenu(null);
        }
      }
      if (
        pageOptionsRef.current &&
        !pageOptionsRef.current.contains(event.target)
      ) {
        setShowPageOptionsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteMenu]);

  if (deleteSuccess) {
    SuccessToast("Post deleted successfully");

    setTimeout(() => {
      dispatch(resetKnowledge());
    }, 1500);
  }

  const handleLikeClick = async (postId, isKnowlegdeLike) => {
    dispatch(
      likePost({
        postId: postId,
        likeToggle: !isKnowlegdeLike,
      }),
    );
  };

  const handleDeleteKnowledgePage = async () => {
    if (!pageId || isDeletingPage) return;
    try {
      setIsDeletingPage(true);
      await dispatch(deleteKnowledgePage(pageId)).unwrap();
      SuccessToast("Knowledge page deleted successfully");
      setShowDeletePageModal(false);
      dispatch(fetchMyKnowledgePages({ page: 1, limit: 100 }));
      setIsKnowledgePageOpen(false);
    } catch (err) {
      console.error("Delete knowledge page error:", err);
      ErrorToast(
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete knowledge page",
      );
    } finally {
      setIsDeletingPage(false);
    }
  };

  const handleDeleteSubCategory = async (subNameToDelete) => {
    if (!pageId || !isPageOwner) return;
    try {
      const existingSubs = Array.isArray(knowledgePageDetail?.subTopic)
        ? knowledgePageDetail.subTopic
        : [];
      const updatedSubs = existingSubs.filter(
        (s) =>
          (typeof s === "string" ? s : s?.name || "").toLowerCase() !==
          subNameToDelete.toLowerCase(),
      );

      const fd = new FormData();
      fd.append("name", (knowledgePageDetail?.name || "").trim());
      fd.append("about", (knowledgePageDetail?.about || "").trim());
      fd.append("topic", (knowledgePageDetail?.topic || "").trim());
      fd.append("pageType", knowledgePageDetail?.pageType || "public");
      fd.append("contentType", "knowledge");

      const formattedKeywords = (knowledgePageDetail?.keywords || []).map((kw) =>
        kw.startsWith("#") ? kw : `#${kw}`
      );
      fd.append("keywords", JSON.stringify(formattedKeywords));
      formattedKeywords.forEach((kw, i) => fd.append(`keywords[${i}]`, kw));

      const cleanSubs = updatedSubs.map((sub) =>
        typeof sub === "string" ? sub : sub?.name || ""
      );
      fd.append("subTopic", JSON.stringify(cleanSubs));
      cleanSubs.forEach((sub, i) => fd.append(`subTopic[${i}]`, sub));

      // Explicitly send deletedSubTopics to trigger automatic backend migration
      fd.append("deletedSubTopics", JSON.stringify([subNameToDelete]));
      fd.append("deletedSubTopics[0]", subNameToDelete);

      await dispatch(
        updateKnowledgePage({ pageId, formData: fd }),
      ).unwrap();
      SuccessToast(
        `Subcategory "${subNameToDelete}" deleted. Posts are now under "All".`,
      );
      if (activeSubTopic.toLowerCase() === subNameToDelete.toLowerCase()) {
        setActiveSubTopic("All");
      }
      dispatch(
        getKnowledgePostDetail({
          pageId,
          page: 1,
          limit: 10,

        }),
      );
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
      ErrorToast(
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete subcategory",
      );
    }
  };

  const handleDelete = (postId) => {
    dispatch(deleteKnowledgePost(postId));
    setShowDeleteMenu(null);
  };

  const getFontClass = (fontFamily) => {
    const fontMap = {
      Classic: "font-sans",
      Signature: "font-serif",
      Editor: "font-mono",
      Poster: "font-black",
      Bubble: "font-serif",
    };
    return fontMap[fontFamily] || "font-sans";
  };

  if (knowledgePageLoading || !knowledgePageDetail) {
    return (
      <div className="p-6 text-center text-gray-500 font-semibold">
        Loading page...
      </div>
    );
  }

  // Build unique subTopic tabs from page subTopic and posts
  const subTopicSet = new Set();
  if (Array.isArray(knowledgePageDetail?.subTopic)) {
    knowledgePageDetail.subTopic
      .map((s) => s && (typeof s === "string" ? s.trim() : s?.name?.trim()))
      .filter(Boolean)
      .forEach((topic) => subTopicSet.add(topic));
  }
  (knowledgePagePosts || []).forEach((post) => {
    if (post?.subTopic) {
      post.subTopic
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((topic) => subTopicSet.add(topic));
    }
  });
  const subTopicTabs = Array.from(subTopicSet);

  const timeAgo = (dateString) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (diffInSeconds < minute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < hour) {
      return `${Math.floor(diffInSeconds / minute)} minutes ago`;
    } else if (diffInSeconds < day) {
      return `${Math.floor(diffInSeconds / hour)} hours ago`;
    } else if (diffInSeconds < week) {
      return `${Math.floor(diffInSeconds / day)} days ago`;
    } else if (diffInSeconds < month) {
      return `${Math.floor(diffInSeconds / week)} weeks ago`;
    } else if (diffInSeconds < year) {
      return `${Math.floor(diffInSeconds / month)} months ago`;
    } else {
      return `${Math.floor(diffInSeconds / year)} years ago`;
    }
  };

  // Filter posts by active subTopic
  const filteredPosts =
    activeSubTopic === "All"
      ? knowledgePagePosts
      : knowledgePagePosts?.filter((post) => {
        if (!post?.subTopic) return false;
        return post.subTopic
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .some((topic) => topic.toLowerCase() === activeSubTopic.toLowerCase());
      });

  return (
    <div className="bg-transparent min-h-screen w-full min-w-0 max-w-none">
      {/* TOPIC PAGE HEADER (EXACT REPLICA FROM SCREENSHOT 1) */}
      <div className="bg-white rounded-[15px] overflow-hidden shadow-sm mb-4">
        {/* Orange Banner */}
        <div className="h-28 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] p-3 relative">
          <div
            onClick={() => setIsKnowledgePageOpen(false)}
            className="flex items-center justify-center bg-white w-[30px] h-[30px] rounded-full cursor-pointer hover:bg-gray-100 transition shadow-sm"
          >
            <IoChevronBackOutline className="w-4 h-4 text-[#DE4B12]" />
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-4 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between -mt-12 gap-4">
            {/* Left: Avatar + Details */}
            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0 flex flex-col items-center">
                <div className="w-[110px] sm:w-[135px] h-[110px] sm:h-[135px] rounded-full overflow-hidden bg-white border-4 border-white shadow-md relative">
                  {knowledgePageDetail?.image ? (
                    <Avatar
                      src={knowledgePageDetail.image}
                      alt={knowledgePageDetail?.name || "Page"}
                      size="xl"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-4xl sm:text-6xl font-semibold text-white">
                        {(() => {
                          if (!knowledgePageDetail?.name) return "K";
                          const words = knowledgePageDetail.name.trim().split(/\s+/);
                          const targetWord = words[1] || words[0];
                          return targetWord.charAt(0).toUpperCase();
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Owner Plus badge on avatar bottom-right */}
                {isPageOwner && (
                  <button
                    type="button"
                    onClick={() => setOpenCreatePostModal(true)}
                    className="absolute bottom-6 right-0 w-8 h-8 sm:w-9 sm:h-9 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md border-2 border-white cursor-pointer"
                    title="Create Post"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                )}

                {/* Followers count below avatar (e.g. "1+ Follows") */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-white flex items-center justify-center text-[8px] text-white font-bold">
                    {knowledgePageDetail?.name?.charAt(0).toUpperCase() || "T"}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {knowledgePageDetail?.followersCount || knowledgePageDetail?.subscribersCount || 0}+ Follows
                  </span>
                </div>
              </div>

              {/* Page Title + About + Badges */}
              <div className="mt-8 sm:mt-12 min-w-0 flex-1">
                <div className="flex gap-2 items-center flex-wrap min-w-0">
                  <h1
                    className="text-[18px] sm:text-[20px] font-[600] text-[#000000] break-words line-clamp-2 max-w-full"
                    title={knowledgePageDetail?.name}
                  >
                    {knowledgePageDetail?.name}
                  </h1>
                  {(knowledgePageDetail?.expertLevelStatus === "accepted" ||
                    knowledgePageDetail?.expertLevelStatus === "approved") && (
                      <img
                        src={expert}
                        className="w-[80px] h-[25px] flex-shrink-0"
                        alt="Expert"
                      />
                    )}
                </div>

                <p className="text-gray-500 text-[13px] leading-relaxed mt-[6px] break-words max-w-xl">
                  {knowledgePageDetail?.about || "Knowledge Page"}
                </p>

                {/* Badges: Topic, Posts, Followers */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {knowledgePageDetail?.topic && (
                    <span className="bg-orange-50 text-[#DE4B12] border border-orange-200 text-xs font-semibold px-3 py-0.5 rounded-full shadow-xs inline-flex items-center gap-1">
                      <span className="text-gray-400 font-normal">Topic:</span>
                      <span>{knowledgePageDetail.topic}</span>
                    </span>
                  )}
                  <span className="bg-orange-50 text-orange-600 border border-orange-200 text-xs font-semibold px-3 py-0.5 rounded-full shadow-xs">
                    {knowledgePagePosts?.length ?? 0} Posts
                  </span>
                  {(knowledgePageDetail?.followersCount || knowledgePageDetail?.subscribersCount) ? (
                    <span className="text-gray-500 font-medium text-xs">
                      {knowledgePageDetail?.followersCount || knowledgePageDetail?.subscribersCount || 0}+ Followers
                    </span>
                  ) : null}
                </div>

                {/* Keywords Chips */}
                {Array.isArray(knowledgePageDetail?.keywords) &&
                  knowledgePageDetail.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {knowledgePageDetail.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          {kw.startsWith("#") ? kw : `#${kw}`}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 mt-4 sm:mt-14 flex-shrink-0 flex-wrap">
              {/* Non-owner Subscribe / Subscribed */}
              {!isPageOwner && (
                <>
                  {!isSubscribed ? (
                    <button
                      type="button"
                      onClick={handleSubscribeClick}
                      disabled={subscribing}
                      className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 border-2 border-orange-500 cursor-pointer disabled:opacity-60"
                    >
                      {subscribing ? "Subscribing..." : "Subscribe"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-gray-200 text-gray-700 cursor-not-allowed border-2 border-gray-300"
                    >
                      Subscribed
                    </button>
                  )}
                </>
              )}

              {/* Owner Controls: Manage Posts, Plus Button, 3-dots */}
              {isPageOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowManagePostsModal(true)}
                    className="border-[1px] border-orange-200 p-2 text-nowrap px-4 flex items-center gap-2 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 shadow-sm text-xs"
                  >
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>Manage Posts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenCreatePostModal(true)}
                    className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                    title="Create Post"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* 3-dots dropdown */}
              <div className="relative" ref={pageOptionsRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPageOptionsDropdown((prev) => !prev);
                  }}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors relative cursor-pointer"
                  title="Page Options"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showPageOptionsDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-[13em] bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 overflow-hidden">
                    {isPageOwner ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPageOptionsDropdown(false);
                            setShowEditPageModal(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-2.5 font-medium cursor-pointer"
                        >
                          <Pencil size={15} className="text-orange-500" />
                          <span>Edit Page</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowPageOptionsDropdown(false);
                            setExpertModal(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-2.5 font-medium cursor-pointer border-t border-gray-50"
                        >
                          <GraduationCap size={15} className="text-orange-500" />
                          <span>
                            {knowledgePageDetail?.expertLevelStatus === "accepted"
                              ? "Expert Status (Approved)"
                              : knowledgePageDetail?.expertLevelStatus === "pending"
                                ? "Expert Status (Pending)"
                                : "Apply for Expert Status"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowPageOptionsDropdown(false);
                            setShowDeletePageModal(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2.5 font-medium cursor-pointer border-t border-gray-50"
                        >
                          <Trash2 size={15} className="text-red-500" />
                          <span>Delete Page</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {isSubscribed && (
                          <button
                            type="button"
                            onClick={handleUnsubscribeClick}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                          >
                            Unsubscribe
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowPageOptionsDropdown(false);
                            setReportmodal(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                          Report
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SubTopic Tabs */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 bg-white/40 rounded-2xl p-2 backdrop-blur-sm items-center">
          <button
            onClick={() => setActiveSubTopic("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${activeSubTopic === "All"
              ? "bg-orange-500 text-white border-orange-500 shadow-sm"
              : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200"
              }`}
          >
            All
          </button>
          {subTopicTabs.map((topic) => (
            <div key={topic} className="flex items-center">
              <button
                onClick={() => setActiveSubTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${activeSubTopic === topic
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                  }`}
              >
                <span>{topic}</span>
                {/* {isPageOwner && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubCategory(topic);
                      }}
                      title={`Delete ${topic} subcategory`}
                      className={`hover:bg-black/10 rounded-full w-4 h-4 flex items-center justify-center text-xs ml-0.5 cursor-pointer font-bold ${activeSubTopic === topic
                          ? "text-white hover:bg-white/20"
                          : "text-gray-400 hover:text-red-500"
                        }`}
                    >

                    </span>
                  )} */}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts &&
          filteredPosts.map((post) => (
            <div
              key={post._id}
              className="rounded-3xl overflow-hidden bg-white"
            >
              {/* Post Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-white relative">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base">
                      {post.author.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      @{post.author.username} • {timeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* More Options Button */}
                <div
                  className="relative"
                  ref={(el) => {
                    if (el) {
                      deleteMenuRefs.current[post._id] = el;
                    } else {
                      delete deleteMenuRefs.current[post._id];
                    }
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteMenu(
                        showDeleteMenu === post._id ? null : post._id,
                      );
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreHorizontal size={20} className="text-gray-600" />
                  </button>

                  {/* Options Menu (Edit / Delete / Report) */}
                  {showDeleteMenu === post._id &&
                    (user?._id == post?.author?._id ? (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 z-10 w-36 overflow-hidden py-1">
                        <button
                          onClick={() => {
                            setShowDeleteMenu(null);
                            setEditingPost(post);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 font-medium text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(post?._id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 z-10 w-36 overflow-hidden py-1">
                        {isSubscribed && (
                          <button
                            onClick={() => {
                              setShowDeleteMenu(null);
                              handleUnsubscribeClick();
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors cursor-pointer"
                          >
                            Unsubscribe
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPostForShare(post);
                            setReportmodal(!reportmodal);
                            setShowDeleteMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                          Report
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Repost Tag Pill (Figma style) */}
              {post.sharedBy && (
                <div className="px-6 pt-2 pb-1">
                  <div className="inline-flex items-center gap-2 bg-[#EBEBEB] text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium">
                    {post.sharedBy?.profilePicture ? (
                      <img
                        src={post.sharedBy.profilePicture}
                        alt="Shared by"
                        className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {(post.sharedBy?.username || post.sharedBy?.name || "U")[0]?.toUpperCase()}
                      </div>
                    )}
                    <span>
                      {post.sharedBy.username || post.sharedBy.name || "User"} Reposted
                    </span>
                  </div>
                </div>
              )}

              {/* Post Card with Background */}
              <div className="px-6 py-4">
                <div
                  className="rounded-3xl overflow-hidden flex items-center justify-center p-12 min-h-[320px] relative shadow-xl"
                  style={
                    // Check if the post has a background image URL
                    post.background
                      ? {
                        backgroundImage: `url(${post.background})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                      : // If there's a backgroundCode, match it with presetBackgrounds
                      post.backgroundCode
                        ? {
                          backgroundImage: `url(${presetBackgrounds.find(
                            (bg) => bg.name === post.backgroundCode,
                          )?.imagePath
                            })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                        : // Default gradient background if no background or code is found
                        {
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }
                  }
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/5 rounded-3xl"></div>

                  {/* Category Badge - Top Left */}
                  {post.subTopic && (
                    <div className="absolute top-4 left-4 z-20 inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30">
                      {post.subTopic.split(",")[0].trim()}
                    </div>
                  )}

                  <div className="text-center w-full space-y-3 relative z-10">
                    {/* Post Text */}
                    <p
                      className={`leading-relaxed drop-shadow-2xl mx-auto max-w-2xl ${getFontClass(post.fontFamily)}`}
                      style={{
                        fontSize: `${post.fontSize}px`,
                        color: post.color,
                        fontWeight: post.isBold ? "700" : "500",
                        fontStyle: post.isItalic ? "italic" : "normal",
                        textDecoration: post.isUnderline ? "underline" : "none",
                        textAlign: post.textAlignment,
                      }}
                    >
                      {post.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Footer - Interaction Buttons */}
              <div className="px-6 py-5 bg-white flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => handleLikeClick(post._id, post.isLiked)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                >
                  <Heart
                    className={`w-5 h-5 transition ${post?.isLiked
                      ? "fill-orange-500 text-orange-500"
                      : "text-gray-600"
                      }`}
                  />
                  <span
                    className={`text-sm font-medium ${post?.isLiked ? "text-orange-500" : "text-gray-600"
                      }`}
                  >
                    {post?.likesCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setOpenCommentsPostId(post._id);
                    setCommentsOpen(!commentsOpen);
                  }}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {post?.commentsCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPostForShare({
                      ...post,
                      contentType: "knowledge",
                      page: knowledgePageDetail,
                      pageName: knowledgePageDetail?.name,
                      pageImage: knowledgePageDetail?.image,
                    });
                    setShareModalOpen(true);
                  }}
                  className="flex items-center gap-2 group transition-colors"
                >
                  <Share2
                    size={22}
                    className="text-gray-500 group-hover:text-orange-500 transition-colors"
                  />
                  <span className="text-sm font-semibold text-gray-600">
                    {post.sharesCount}
                  </span>
                </button>
              </div>
              {openCommentsPostId === post._id && (
                <KnowledgeCommentsSection
                  postId={post._id}
                  onClose={() => setCommentsOpen(false)}
                />
              )}
            </div>
          ))}

        {/* Empty State */}
        {knowledgePagePosts && knowledgePagePosts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-500 font-semibold">No posts yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Be the first to create a post!



            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareToChatsModal
          onClose={() => {
            setShareModalOpen(false);
            setSelectedPostForShare(null);
          }}
          post={selectedPostForShare}
        />
      )}

      <ReportModal
        isOpen={reportmodal}
        onClose={() => setReportmodal(false)}
        loading={reportLoading}
        onSubmit={(reason) => {
          dispatch(
            sendReport({
              reason,
              targetModel: "Post",
              targetId: selectedPostForShare._id,
              isReported: true,
            }),
          );
          // setReportmodal(false);
        }}
      />

      {/* Delete Knowledge Page Modal */}
      <DeleteKnowledgePageModal
        isOpen={showDeletePageModal}
        onClose={() => setShowDeletePageModal(false)}
        onConfirm={handleDeleteKnowledgePage}
        isLoading={isDeletingPage}
        pageName={knowledgePageDetail?.name || "this knowledge page"}
      />

      {/* Manage / Group Knowledge Posts Modal */}
      <ManageKnowledgePostsModal
        isOpen={showManagePostsModal}
        onClose={() => setShowManagePostsModal(false)}
        pageId={pageId}
        posts={knowledgePagePosts || []}
        existingSubTopics={subTopicTabs}
        pageName={knowledgePageDetail?.name}
      />

      {/* Edit Knowledge Post Modal */}
      {editingPost && (
        <EditKnowledgePostModal
          post={editingPost}
          selectedPageId={pageId}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            if (pageId) {
              dispatch(
                getKnowledgePostDetail({ pageId, page: 1, limit: 10 })
              );
            }
          }}
        />
      )}

      {/* Edit Knowledge Page Modal */}
      {showEditPageModal && (
        <EditKnowledgePageModal
          isOpen={showEditPageModal}
          onClose={() => setShowEditPageModal(false)}
          pageData={knowledgePageDetail}
          onUpdated={() => {
            if (pageId) {
              dispatch(
                getKnowledgePostDetail({ pageId, page: 1, limit: 10 })
              );
              dispatch(fetchMyKnowledgePages({ page: 1, limit: 100 }));
            }
          }}
        />
      )}

      {/* Apply for Expert Status Modal */}
      <ExpertStatusModal
        isOpen={expertModal}
        onClose={() => setExpertModal(false)}
        pageId={pageId}
        defaultTopic={knowledgePageDetail?.topic || knowledgePageDetail?.name}
        onSuccess={() => {
          if (pageId) {
            dispatch(getKnowledgePostDetail({ pageId, page: 1, limit: 10 }));
            dispatch(fetchMyKnowledgePages({ page: 1, limit: 100 }));
          }
        }}
      />

      {/* Create Knowledge Post Modal */}
      {openCreatePostModal && (
        <CreateKnowledgePostModal
          onClose={() => setOpenCreatePostModal(false)}
          selectedPageId={pageId || knowledgePageDetail?._id}
          selectedSubTopics={activeSubTopic !== "All" ? [activeSubTopic] : []}
        />
      )}
    </div>
  );
}
