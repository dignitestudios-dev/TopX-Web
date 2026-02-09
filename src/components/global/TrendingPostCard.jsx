import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import { likePost } from "../../redux/slices/postfeed.slice";
import CommentsSection from "./CommentsSection";
import { useDispatch, useSelector } from "react-redux";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import ReportModal from "./ReportModal";
import { resetReportState, sendReport } from "../../redux/slices/reports.slice";
import { SuccessToast } from "./Toaster";
import PrivatePostModal from "./PrivatePostModal";

export default function TrendingPostCard({ post, liked, toggleLike }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  // Repost
  const [moreOpen, setMoreOpen] = useState(false);
  const [reportmodal, setReportmodal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isPrivatePost, setIsPrivatePost] = useState(false);
  const [sharepost, setSharepost] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="bg-white relative h-auto  pb-10 rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={
              post.author?.profilePicture ||
              "https://rapidapi.com/hub/_next/image?url=https%3A%2F%2Frapidapi-prod-apis.s3.amazonaws.com%2Fbdcd6ceb-1d10-4c3b-b878-4fc8d2e2059f.png&w=3840&q=75"
            }
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-800">
              {post.author?.name}
            </p>
            <p className="text-xs text-gray-500">
              @{post.author?.username} • {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="p-2 hover:bg-gray-50 rounded-full transition"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  setReportmodal(!reportmodal);
                  console.log("Report clicked");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Info */}
      {/* {post.page && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={post.page?.image || post.page?.user?.profilePicture}
              alt={post.page?.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-800">
                {post.page?.name}
              </p>
              <p className="text-xs text-gray-500">{post.page?.topic}</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Post Content */}
      <div className="p-4">
        {/* Media Gallery */}
        {post?.postimage && post?.postimage.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${
              post.postimage.length === 1
                ? "grid-cols-1"
                : post.postimage.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {post?.postimage.slice(0, 4).map((media, idx) => (
              <div
                key={media._id || idx}
                className={`rounded-lg overflow-hidden bg-gray-200 ${
                  post?.postimage.length === 1 ? "h-72" : "h-48"
                }`}
              >
                {media.type === "image" ? (
                  <img
                    src={media.fileUrl}
                    alt="post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                ) : (
                  <video
                    src={media.fileUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
            ))}
            {post.postimage.length > 4 && (
              <div className="rounded-lg bg-gray-300 h-48 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  +{post.postimage.length - 4}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-800 leading-snug mb-3">{post.text}</p>
        {post?.sharedBy ? (
          <div className="text-sm flex gap-4 ml-4 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 w-[14em]">
            {post.sharedBy?.profilePicture ? (
              <img
                src={post.sharedBy.profilePicture}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 object-cover text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
                {post.sharedBy?.name.split(" ")[0][0]}
              </div>
            )}
            {/* <img
            src={post.sharedBy.profilePicture}
            className="w-7 h-7 rounded-full object-cover"
          /> */}
            {post.sharedBy.name} Reposted
          </div>
        ) : null}
        {/* Keywords */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.keywords.slice(0, 3).map((keyword, idx) => (
              <span
                key={idx}
                className="text-xs text-orange-500 font-medium cursor-pointer hover:text-orange-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
      {post?.page?.pageType == "private" && !post?.page?.isSubscribed && (
        <div className="flex items-center h-full top-14 absolute inset-1 justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center px-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <p
              onClick={() => {
                setIsPrivatePost(!isPrivatePost);
              }}
              className="text-base cursor-pointer  font-semibold text-orange-500"
            >
              Private post
            </p>
          </div>
        </div>
      )}
      {/* Stats */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          onClick={() =>
            handleLikeClick(post.id, post.isLiked, post.likesCount)
          }
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${
              post.isLiked ? "fill-orange-500 text-orange-500" : "text-gray-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              post.isLiked ? "text-orange-500" : "text-gray-600"
            }`}
          >
            {Number(post.likesCount ?? 0)}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.stats.comments}</span>
        </button>

        <button
          onClick={() => setSharepost(true)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.stats.shares}</span>
        </button>
      </div>
      {commentsOpen && <CommentsSection postId={post.id} />}

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
        <ShareRepostModal postId={post.id} onClose={setSelectedOption} />
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
              targetId: post.id,
              isReported: true,
            }),
          );
        }}
      />
      {isPrivatePost && (
        <PrivatePostModal
          post={post}
          onClose={() => setIsPrivatePost(!isPrivatePost)}
        />
      )}
    </div>
  );
}
