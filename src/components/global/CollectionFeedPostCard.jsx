import React, { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../redux/slices/postfeed.slice";
import { timeAgo } from "../../lib/helpers";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import ReportModal from "./ReportModal";
export default function CollectionFeedPostCard({
  post,
  author,
  likedCount,
  commentCount,
  shareCount,
  toggleLike,
  isPostId,
  fullPost,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const dispatch = useDispatch();

  const isLiked = likedCount[post.id];

  console.log(fullPost, "allnewpost");

  const postislike = post.postlike;

  const firstImage = post[0]?.fileUrl;

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

  const [selectedOption, setSelectedOption] = useState("");
  const [reportmodal, setReportmodal] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports
  );
  const [sharepost, setSharepost] = useState(false);
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];
  const dropdownRef = useRef(null);

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
  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={author.profilePicture}
            alt={author.user}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              {author.name}
            </h3>
            <p className="text-xs text-gray-500">
              {author.username} · {timeAgo(author.createdAt)}
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

      {/* Tag */}
      {/* {post.tag && (
                <div className="px-4 pt-3 pb-2">
                    <span className="inline-block text-orange-600 text-xs font-medium">
                        {post.tag}
                    </span>
                </div>
            )} */}

      {/* Post Images - Thumbnail */}
      {firstImage && (
        <div
          className="w-full bg-white overflow-hidden p-4 cursor-pointer hover:opacity-90 transition relative"
          onClick={() => {
            setImageViewerOpen(true);
          }}
        >
          <img
            src={firstImage}
            alt="post"
            className="w-full h-auto rounded-2xl object-cover max-h-96"
          />

          {/* Image count badge */}
          {/* {post.postimage.length > 1 && (
            <div className="absolute top-[30px] right-[30px] bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
              +{post.postimage.length}
            </div>
          )} */}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
      </div>

      {/* Stats - Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          onClick={() =>
            handleLikeClick(fullPost._id, fullPost.isLiked, fullPost.likesCount)
          }
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${
              fullPost?.isLiked
                ? "fill-orange-500 text-orange-500"
                : "text-gray-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              fullPost?.isLiked ? "text-orange-500" : "text-gray-600"
            }`}
          >
            {fullPost?.likesCount}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{fullPost?.commentsCount}</span>
        </button>

        <button
          onClick={() => setSharepost(true)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{shareCount}</span>
        </button>
      </div>

      {/* Image Viewer Modal */}
      <PostImageViewerModal
        post={post}
        author={author}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />
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
        <ShareRepostModal postId={fullPost._id} onClose={setSelectedOption} />
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
              targetId: fullPost._id,
              isReported: true,
            })
          );
        }}
      />
      {/* Comments Section */}
      {commentsOpen && <CommentsSection postId={isPostId} />}
    </div>
  );
}
