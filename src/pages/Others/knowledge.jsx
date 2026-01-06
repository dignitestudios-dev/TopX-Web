import React, { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  nofound,
  notes,
  postone,
  profile,
  profilehigh,
  topics,
} from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import CreateKnowledgePostModal from "../../components/global/CreateKnowledgePostModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKnowledgeFeed,
  likePost,
} from "../../redux/slices/knowledgepost.slice";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import KnowledgePostComments from "../../components/global/KnowledgePostComments";
import SharePostModal from "../../components/global/SharePostModal";
import ShareToChatsModal from "../../components/global/ShareToChatsModal";
import PostStoryModal from "../../components/global/PostStoryModal";
import ShareRepostModal from "../../components/global/ShareRepostModal";
import ReportModal from "../../components/global/ReportModal";
import { resetReportState, sendReport } from "../../redux/slices/reports.slice";
import { SuccessToast } from "../../components/global/Toaster";

export default function Knowledge() {
  const [liked, setLiked] = useState({});
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const observerTarget = useRef(null);
  const [page, setPage] = useState(1);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentedId, setCommentedId] = useState(null);
  // Repost
  const [moreOpenId, setMoreOpenId] = useState(null);

  const [reportmodal, setReportmodal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [sharepost, setSharepost] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports
  );
  const dropdownRef = useRef(null);
  useEffect(() => {
    dispatch(fetchKnowledgeFeed({ page: page, limit: 10 }));
  }, [dispatch, page]);

  const {
    knowledgeFeed,
    knowledgeFeedPagination,
    knowledgeFeedLoading,
    error,
  } = useSelector((state) => state.knowledgepost);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !knowledgeFeedLoading &&
          knowledgeFeedPagination?.hasNextPage
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [knowledgeFeedLoading, knowledgeFeedPagination]);

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

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

  const timeAgo = (createdAt) => {
    const now = new Date();
    const then = new Date(createdAt);
    const seconds = Math.floor((now - then) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };
  const handleLikeClick = (postId, currentLikeStatus, currentLikesCount) => {
    const newLikeStatus = !currentLikeStatus;

    // Calculate increment based on toggle
    const newLikesCount = newLikeStatus
      ? (currentLikesCount ?? 0) + 1
      : Math.max((currentLikesCount ?? 0) - 1, 0);

    // Optimistic update in localStorage
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = { isLiked: newLikeStatus, likesCount: newLikesCount };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Update UI immediately
    toggleLike(postId, newLikeStatus, newLikesCount);

    // Call API
    dispatch(likePost({ postId, likeToggle: newLikeStatus }));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setMoreOpenId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");

      // reset success so it does not fire again
      dispatch(resetReportState());

      // optional: close modal
      setReportmodal(false);
    }
  }, [reportSuccess, dispatch]);
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];

  return (
    <div className="flex  min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3">
        {/* Profile Card */}
        <Profilecard smallcard={true} />

        {/* My Subscription */}
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Middle Feed */}
      <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto h-[40em] scrollbar-hide">
        <div className="max-w-2xl mx-auto p-4 space-y-5 overflow-y-auto h-[70em] scrollbar-hide">
          {knowledgeFeed &&
            knowledgeFeed.length > 0 &&
            knowledgeFeed.map((post, index) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                {/* Header */}
                <div className="p-4 flex items-start justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={post.author.profilePicture}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{post.author.username} • {timeAgo(post.createdAt)}
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
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => {
                            setMoreOpenId(null);
                            setReportmodal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div
                  className={`bg-gradient-to-br ${getGradient(
                    index
                  )} rounded-2xl m-3 p-[10em] min-h-[200px] flex items-center justify-center relative`}
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
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full absolute top-6 left-6">
                    {post.page.topic}
                  </span>
                  <p className="text-white text-lg font-semibold text-center leading-snug">
                    {post.text}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10 text-sm text-orange-500 p-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      handleLikeClick(post._id, post.isLiked, post.likesCount)
                    }
                    className="flex items-center gap-2 hover:text-orange-600"
                  >
                    <Heart
                      className={`w-5 h-5 transition ${
                        post.isLiked
                          ? "fill-orange-500 text-orange-500"
                          : "text-gray-600"
                      }`}
                    />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCommentsOpen(!commentsOpen);
                      setCommentedId(post?._id);
                    }}
                    className="flex items-center gap-2 hover:text-orange-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentsCount}</span>
                  </button>

                  <button
                    onClick={() => setSharepost(true)}
                    className="flex items-center gap-2 hover:text-orange-600"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{post.sharesCount}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {commentsOpen && commentedId == post?._id && (
                  <KnowledgePostComments postId={post._id} />
                )}
                {/* Share Post Modal */}
                {sharepost && (
                  <SharePostModal
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    setSharepost={setSharepost}
                    options={options}
                  />
                )}

                {(selectedOption === "Share in Individuals Chats" ||
                  selectedOption === "Share in Group Chats") && (
                  <ShareToChatsModal onClose={setSelectedOption} />
                )}

                {selectedOption === "Share to your Story" && (
                  <PostStoryModal onClose={setSelectedOption} />
                )}
                {selectedOption === "Share with Topic Page" && (
                  <ShareRepostModal
                    postId={post?._id}
                    onClose={setSelectedOption}
                  />
                )}

                <ReportModal
                  isOpen={reportmodal}
                  onClose={() => setReportmodal(false)}
                  loading={reportLoading} // 👈 ADD THIS
                  onSubmit={(reason) => {
                    dispatch(
                      sendReport({
                        reason,
                        targetModel: "Post",
                        targetId: post?._id,
                        isReported: true,
                      })
                    );
                  }}
                />
              </div>
            ))}

          {/* Loading Indicator */}
          {knowledgeFeedLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="flex gap-2">
                <div
                  className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-0 -mt-[1.4em]" />

          {!knowledgeFeedLoading && knowledgeFeed?.length === 0 && (
            <p className="text-gray-500 text-sm pl-1 border-2 flex justify-center rounded-3xl">
              <img src={nofound} alt="" />
            </p>
          )}
        </div>
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto  border-gray-200">
        <div className="p-0">
          {/* Trending Pages Section */}
          <TrendingPagesGlobal />

          {/* Suggestions Section */}
          <SuggestionsPagesGlobal />

          {open && <ChatWidget />}
          <FloatingChatButton onClick={() => setOpen(!open)} />
        </div>
      </div>
    </div>
  );
}
