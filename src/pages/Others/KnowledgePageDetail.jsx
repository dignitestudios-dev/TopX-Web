import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Trash2,
  Layers,
  Repeat2,
  Pencil,
} from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { nofound, notes, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { useDispatch, useSelector } from "react-redux";
import {
  getKnowledgePostDetail,
  likePost as likeKnowledgePost,
  toggleKnowledgePageSubscription,
  deleteKnowledgePage,
  deleteKnowledgePost,
  updateKnowledgePage,
} from "../../redux/slices/knowledgepost.slice";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import KnowledgePostComments from "../../components/global/KnowledgePostComments";
import ShareToChatsModal from "../../components/global/ShareToChatsModal";
import ReportModal from "../../components/global/ReportModal";
import DeleteKnowledgePageModal from "../../components/global/DeleteKnowledgePageModal";
import ManageKnowledgePostsModal from "../../components/global/ManageKnowledgePostsModal";
import EditKnowledgePostModal from "../../components/global/EditKnowledgePostModal";
import EditKnowledgePageModal from "../../components/global/EditKnowledgePageModal";
import { resetReportState, sendReport } from "../../redux/slices/reports.slice";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import { timeAgo } from "../../lib/helpers";

export default function KnowledgePageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [kpCommentsOpenId, setKpCommentsOpenId] = useState(null);
  const [kpSharePost, setKpSharePost] = useState(null);
  const [kpLocalReactions, setKpLocalReactions] = useState({});
  const [moreOpenId, setMoreOpenId] = useState(null);
  const [reportmodal, setReportmodal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeSubTopic, setActiveSubTopic] = useState("");
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [showEditPageModal, setShowEditPageModal] = useState(false);
  const [showPageOptionsDropdown, setShowPageOptionsDropdown] = useState(false);
  const [showManagePostsModal, setShowManagePostsModal] = useState(false);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  const dropdownRef = useRef(null);
  const pageOptionsRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?._id;

  const {
    knowledgePageDetail,
    knowledgePagePosts,
    knowledgePageLoading,
  } = useSelector((state) => state.knowledgepost);

  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );

  // Fetch page detail and posts
  useEffect(() => {
    if (id) {
      dispatch(getKnowledgePostDetail({ pageId: id, page: 1, limit: 10 }));
    }
  }, [dispatch, id]);

  // Sync local subscription state from API detail
  useEffect(() => {
    if (knowledgePageDetail) {
      setIsSubscribed(!!knowledgePageDetail.isSubscribed);
    }
  }, [knowledgePageDetail]);

  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportmodal(false);
    }
  }, [reportSuccess, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      setMoreOpenId(null);
      if (pageOptionsRef.current && !pageOptionsRef.current.contains(e.target)) {
        setShowPageOptionsDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getGradient = (index) => {
    const gradients = [
      "from-pink-500 via-orange-500 to-yellow-500",
      "from-blue-600 to-blue-400",
      "from-purple-500 to-pink-400",
      "from-green-400 to-blue-500",
      "from-orange-400 to-red-500",
    ];
    return gradients[index % gradients.length];
  };

  const getKnowledgeReaction = (post) => {
    const baseIsLiked = currentUserId
      ? post.userLikes?.includes(currentUserId)
      : false;
    const local = kpLocalReactions[post._id];

    return {
      isLiked: local?.isLiked ?? baseIsLiked,
      likesCount: local?.likesCount ?? post.likesCount ?? 0,
    };
  };

  // Subscribe to knowledge page (simple one-click subscribe)
  const handleSubscribeClick = async () => {
    if (!knowledgePageDetail?._id) return;
    if (isSubscribed) return; // already subscribed

    try {
      // Optimistic update
      setIsSubscribed(true);

      const res = await dispatch(
        toggleKnowledgePageSubscription({ pageId: knowledgePageDetail._id }),
      ).unwrap();

      SuccessToast(
        res?.message || "Subscribed to knowledge page successfully",
      );
    } catch (error) {
      console.error("Knowledge page subscription failed:", error);
      // Revert on failure
      setIsSubscribed(false);
    }
  };

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

  const handleDeleteKnowledgePage = async () => {
    if (!knowledgePageDetail?._id || isDeletingPage) return;
    try {
      setIsDeletingPage(true);
      await dispatch(deleteKnowledgePage(knowledgePageDetail._id)).unwrap();
      SuccessToast("Knowledge page deleted successfully");
      setShowDeletePageModal(false);
      navigate("/knowledge");
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
    if (!knowledgePageDetail?._id || !isPageOwner) return;
    try {
      const existingSubs = Array.isArray(knowledgePageDetail.subTopic)
        ? knowledgePageDetail.subTopic
        : [];
      const updatedSubs = existingSubs.filter(
        (s) =>
          (typeof s === "string" ? s : s?.name || "").toLowerCase() !==
          subNameToDelete.toLowerCase(),
      );

      const fd = new FormData();
      fd.append("name", (knowledgePageDetail.name || "").trim());
      fd.append("about", (knowledgePageDetail.about || "").trim());
      fd.append("topic", (knowledgePageDetail.topic || "").trim());
      fd.append("pageType", knowledgePageDetail.pageType || "public");
      fd.append("contentType", "knowledge");

      const formattedKeywords = (knowledgePageDetail?.keywords || []).map((kw) =>
        kw.startsWith("#") ? kw : `#${kw}`
      );
      if (formattedKeywords.length > 0) {
        fd.append("keywords", JSON.stringify(formattedKeywords));
      }

      const cleanSubs = updatedSubs.map((sub) =>
        typeof sub === "string" ? sub : sub?.name || ""
      );
      fd.append("subTopic", JSON.stringify(cleanSubs));

      // Explicitly send deletedSubTopics to trigger automatic backend migration
      fd.append("deletedSubTopics", JSON.stringify([subNameToDelete]));

      await dispatch(
        updateKnowledgePage({ pageId: knowledgePageDetail._id, formData: fd }),
      ).unwrap();
      SuccessToast(
        `Subcategory "${subNameToDelete}" deleted. Posts are now under "All".`,
      );
      if (activeSubTopic.toLowerCase() === subNameToDelete.toLowerCase()) {
        setActiveSubTopic("");
      }
      dispatch(
        getKnowledgePostDetail({
          pageId: knowledgePageDetail._id,
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

  const handleKnowledgeLikeClick = (post) => {
    const postId = post._id;
    const baseIsLiked = currentUserId
      ? post.userLikes?.includes(currentUserId)
      : false;

    setKpLocalReactions((prev) => {
      const current = prev[postId] || {
        isLiked: baseIsLiked,
        likesCount: post.likesCount ?? 0,
      };

      const nextIsLiked = !current.isLiked;
      const nextLikesCount = Math.max(
        (current.likesCount ?? 0) + (nextIsLiked ? 1 : -1),
        0,
      );

      return {
        ...prev,
        [postId]: {
          isLiked: nextIsLiked,
          likesCount: nextLikesCount,
        },
      };
    });

    // Fire API
    dispatch(
      likeKnowledgePost({
        postId,
        likeToggle: !baseIsLiked,
      }),
    );
  };

  if (knowledgePageLoading) {
    return (
      <div className="flex min-h-screen max-w-7xl mx-auto">
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3">
          <Profilecard smallcard={true} />
          <div className="pt-4">
            <MySubscription />
          </div>
        </div>
        <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto flex items-center justify-center">
          <div className="text-gray-500 font-semibold">Loading...</div>
        </div>
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>
    );
  }

  if (!knowledgePageDetail) {
    return (
      <div className="flex min-h-screen max-w-7xl mx-auto">
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3">
          <Profilecard smallcard={true} />
          <div className="pt-4">
            <MySubscription />
          </div>
        </div>
        <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <img src={nofound} height={300} width={300} alt="" />
            <p className="font-bold pt-4 text-black">Page not found</p>
          </div>
        </div>
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>
    );
  }

  // Build subTopic tabs from page.subTopic and posts
  const subTopicSet = new Set();

  if (Array.isArray(knowledgePageDetail.subTopic)) {
    knowledgePageDetail.subTopic
      .map((s) => s && s.trim())
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

  // Filter posts by active subTopic (or show all if no active)
  const filteredPosts =
    subTopicTabs.length === 0 || !activeSubTopic
      ? knowledgePagePosts
      : (knowledgePagePosts || []).filter((post) => {
          if (!post?.subTopic) return false;
          const topics = post.subTopic
            .split(",")
            .map((p) => p.trim().toLowerCase())
            .filter(Boolean);
          return topics.includes(activeSubTopic.toLowerCase());
        });

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide">
        <Profilecard smallcard={true} />
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Middle Feed */}
      <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          {/* Top Bar with Back and Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            {isPageOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManagePostsModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-semibold transition border border-orange-200 cursor-pointer"
                >
                  <Layers size={14} />
                  Manage Posts
                </button>

                {/* 3 Dots Menu: Edit Page, Delete Page */}
                <div className="relative" ref={pageOptionsRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPageOptionsDropdown((prev) => !prev);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition cursor-pointer flex items-center justify-center shadow-xs"
                    title="Page Options"
                  >
                    <BsThreeDotsVertical size={18} />
                  </button>

                  {showPageOptionsDropdown && (
                    <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden py-1">
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
                          setShowDeletePageModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2.5 font-medium cursor-pointer border-t border-gray-50"
                      >
                        <Trash2 size={15} className="text-red-500" />
                        <span>Delete Page</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Knowledge Page Header Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              {knowledgePageDetail.image ? (
                <img
                  src={knowledgePageDetail.image}
                  alt={knowledgePageDetail.name}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(knowledgePageDetail.name || "K").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {knowledgePageDetail.name}
                  </h1>

                  {!isPageOwner && (
                    <button
                      type="button"
                      onClick={handleSubscribeClick}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                        isSubscribed
                          ? "bg-gray-100 text-gray-600 cursor-default"
                          : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm cursor-pointer"
                      }`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  )}
                </div>

                {knowledgePageDetail.topic && (
                  <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-medium">
                    {knowledgePageDetail.topic}
                  </span>
                )}

                {knowledgePageDetail.about && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {knowledgePageDetail.about}
                  </p>
                )}

                {Array.isArray(knowledgePageDetail.keywords) &&
                  knowledgePageDetail.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
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
          </div>

          {/* SubTopic Tabs */}
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <button
              type="button"
              onClick={() => setActiveSubTopic("")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                activeSubTopic === ""
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </button>

            {subTopicTabs.map((topic) => (
              <div key={topic} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveSubTopic(topic)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                    activeSubTopic === topic
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span>{topic}</span>
                  {isPageOwner && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubCategory(topic);
                      }}
                      title={`Delete ${topic} subcategory`}
                      className={`hover:bg-black/10 rounded-full w-4 h-4 flex items-center justify-center text-xs ml-0.5 cursor-pointer font-bold ${
                        activeSubTopic === topic
                          ? "text-white hover:bg-white/20"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      ×
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>


          {/* Posts */}
          {filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Header */}
                <div className="p-4 flex items-start justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={
                        post.author?.profilePicture ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz68b1g8MSxSUqvFtuo44MvagkdFGoG7Z7DQ&s"
                      }
                      alt={post.author?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {post.author?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{post.author?.username} • {timeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                    ref={dropdownRef}
                  >
                    <button
                      onClick={() =>
                        setMoreOpenId(moreOpenId === post._id ? null : post._id)
                      }
                      className="p-2 hover:bg-gray-50 rounded-full transition"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>

                    {moreOpenId === post._id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-lg z-50 overflow-hidden py-1">
                        {user?._id == post?.author?._id ? (
                          <>
                            <button
                              onClick={() => {
                                setMoreOpenId(null);
                                setEditingPost(post);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 font-medium text-gray-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setMoreOpenId(null);
                                dispatch(deleteKnowledgePost(post._id));
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setMoreOpenId(null);
                              setSelectedPostId(post._id);
                              setReportmodal(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 font-medium text-gray-700 transition-colors"
                          >
                            Report
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Repost Tag Pill (Figma style) */}
                {(post.sharedBy || post.originalPost || post.isRepost) && (
                  <div className="px-4 pt-3 pb-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const origPageId =
                          post?.originalPost?.page?._id ||
                          post?.originalPost?.page ||
                          post?.page?._id ||
                          id;
                        const origPostId =
                          post?.originalPost?._id ||
                          post?.originalPost?.id ||
                          post?.originalPost ||
                          post?._id;
                        if (origPageId) {
                          navigate(`/knowledge-page-detail/${origPageId}`, {
                            state: { postId: origPostId },
                          });
                        } else if (origPostId) {
                          navigate(`/knowledge`, { state: { postId: origPostId } });
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-[#EBEBEB] text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 transition"
                    >
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
                        {post.sharedBy?.name || post.sharedBy?.username || "User"} Reposted
                      </span>
                    </div>
                  </div>
                )}

                {/* Post Content */}
                <div
                  className={`bg-gradient-to-br ${getGradient(
                    index,
                  )} rounded-2xl m-3 px-6 py-12 min-h-[200px] flex items-center justify-center relative`}
                  style={
                    post.background
                      ? {
                          backgroundImage: `url(${post.background})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  {post.page?.topic && (
                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full absolute top-4 left-4">
                      {post.page.topic}
                    </span>
                  )}
                  <p className="text-white text-lg font-semibold text-center leading-snug">
                    {post.text}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10 text-sm text-orange-500 p-4 border-t border-gray-100">
                  {/* Like */}
                  <button
                    type="button"
                    onClick={() => handleKnowledgeLikeClick(post)}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                  >
                    {(() => {
                      const { isLiked, likesCount } = getKnowledgeReaction(post);
                      return (
                        <>
                          <Heart
                            className={`w-5 h-5 transition ${
                              isLiked
                                ? "fill-orange-500 text-orange-500"
                                : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isLiked ? "text-orange-500" : "text-gray-600"
                            }`}
                          >
                            {likesCount}
                          </span>
                        </>
                      );
                    })()}
                  </button>

                  {/* Comments */}
                  <button
                    type="button"
                    onClick={() =>
                      setKpCommentsOpenId((prev) =>
                        prev === post._id ? null : post._id,
                      )
                    }
                    className="flex items-center gap-2 hover:text-orange-600 text-gray-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentsCount}</span>
                  </button>

                  {/* Share */}
                  <button
                    type="button"
                    onClick={() => setKpSharePost(post)}
                    className="flex items-center gap-2 hover:text-orange-600 text-gray-600"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{post.sharesCount}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {kpCommentsOpenId === post._id && (
                  <div className="px-4 pb-4">
                    <KnowledgePostComments postId={post._id} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center items-center justify-center shadow-sm">
              <div className="flex justify-center">
              <img src={nofound} height={200} width={200} alt="" />
              </div>
              <p className="text-gray-500 font-semibold mt-4">
                {subTopicTabs.length === 0 || !activeSubTopic
                  ? "No posts yet"
                  : `No posts found for \"${activeSubTopic}\"`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto overflow-x-hidden border-gray-200 scrollbar-hide">
        <div className="p-0">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>

      {/* Share Knowledge Post Modal */}
      {kpSharePost && (
        <ShareToChatsModal
          onClose={() => setKpSharePost(null)}
          post={{
            _id: kpSharePost._id,
            contentType: "knowledge",
            type: "knowledge",
            text: kpSharePost.text,
            bodyText: kpSharePost.text,
            content: kpSharePost.text,
            backgroundCode: kpSharePost.background,
            page: kpSharePost.page,
            pageImage: kpSharePost.page?.image,
            pageName: kpSharePost.page?.name,
            author: kpSharePost.author,
          }}
        />
      )}

      {/* Report Modal */}
      {selectedPostId && (
        <ReportModal
          isOpen={reportmodal}
          onClose={() => {
            setReportmodal(false);
            setSelectedPostId(null);
          }}
          loading={reportLoading}
          onSubmit={(reason) => {
            dispatch(
              sendReport({
                reason,
                targetModel: "Post",
                targetId: selectedPostId,
                isReported: true,
              }),
            );
          }}
        />
      )}

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
        pageId={id}
        posts={knowledgePagePosts || []}
        existingSubTopics={subTopicTabs}
        pageName={knowledgePageDetail?.name}
      />

      {/* Edit Knowledge Post Modal */}
      {editingPost && (
        <EditKnowledgePostModal
          post={editingPost}
          selectedPageId={id}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            if (id) {
              dispatch(getKnowledgePostDetail({ pageId: id, page: 1, limit: 10 }));
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
            if (id) {
              dispatch(getKnowledgePostDetail({ pageId: id, page: 1, limit: 10 }));
            }
          }}
        />
      )}
    </div>
  );
}

