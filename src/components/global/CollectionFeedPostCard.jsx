import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../redux/slices/posts.slice";
import { timeAgo } from "../../lib/helpers";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import ReportModal from "./ReportModal";
import { sendReport } from "../../redux/slices/reports.slice";
import { useNavigate } from "react-router";

export default function CollectionFeedPostCard({
  post,
  author,
  likedCount,
  commentCount,
  shareCount,
  toggleLike,
  isPostId,
  fullPost,
  text,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, allUserData } = useSelector((state) => state.auth);
  const currentUserId = user?._id || allUserData?._id;

  console.log(post,"post")

  const handleAuthorClick = () => {
    if (!author) return;
    navigate("/other-profile", {
      state: { id: author },
    });
  };

  // Get initial like state from fullPost or props
  const getInitialLikeState = () => {
    const postId = fullPost?._id || isPostId;
    
    // Check localStorage first (for optimistic updates)
    const localLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    const cachedLike = localLikes[postId];
    
    if (cachedLike) {
      return {
        isLiked: cachedLike.isLiked || false,
        likesCount: cachedLike.likesCount || 0,
      };
    }
    
    if (fullPost) {
      // Check if current user is in userLikes array
      const baseIsLiked = currentUserId
        ? fullPost.userLikes?.includes(currentUserId) || false
        : fullPost.isLiked || false;
      
      return {
        isLiked: baseIsLiked,
        likesCount: fullPost.likesCount || likedCount || 0,
      };
    }
    return {
      isLiked: false,
      likesCount: likedCount || 0,
    };
  };

  const [localLikeState, setLocalLikeState] = useState(getInitialLikeState());

  // Update local state when fullPost changes
  useEffect(() => {
    const newState = getInitialLikeState();
    setLocalLikeState(newState);
  }, [fullPost?._id, fullPost?.userLikes, fullPost?.likesCount, likedCount, currentUserId]);

  const handleLikeClick = async () => {
    const postId = fullPost?._id || isPostId;
    if (!postId) {
      console.error("Post ID not found", { fullPost, isPostId });
      return;
    }

    const currentIsLiked = localLikeState.isLiked;
    const currentLikesCount = localLikeState.likesCount || 0;
    const newIsLiked = !currentIsLiked;
    const newLikesCount = newIsLiked
      ? currentLikesCount + 1
      : Math.max(currentLikesCount - 1, 0);

    console.log("🔵 Like clicked - Post ID:", postId, "New Like Status:", newIsLiked);

    // Optimistic update - update UI immediately
    setLocalLikeState({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    });

    // Call parent toggleLike callback if provided
    if (toggleLike && typeof toggleLike === "function") {
      toggleLike(postId);
    }

    // Save to localStorage for persistence
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = {
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Call API - Same as PostCard/Mypost.jsx
    try {
      console.log("🔵 Dispatching likePost API:", { id: postId, likeToggle: newIsLiked, isPost: true });
      const result = await dispatch(
        likePost({
          id: postId,
          likeToggle: newIsLiked,
          isPost: true,
        }),
      ).unwrap();

      console.log("✅ Like API success:", result);

      // Update with API response - check result.data structure
      if (result?.data) {
        const apiData = result.data;
        setLocalLikeState({
          isLiked: apiData.likeToggle ?? newIsLiked,
          likesCount: apiData.likesCount ?? newLikesCount,
        });
      } else {
        // If response structure is different, keep optimistic update
        setLocalLikeState({
          isLiked: newIsLiked,
          likesCount: newLikesCount,
        });
      }
    } catch (error) {
      // If API call failed, revert optimistic update
      console.error("❌ Like API failed:", error);
      setLocalLikeState({
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      });
    }
  };

  const [selectedOption, setSelectedOption] = useState("");
  const [reportmodal, setReportmodal] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );
  const [sharepost, setSharepost] = useState(false);
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];

  // Close dropdown on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render image or video
  const renderMedia = (mediaItem) => {
    if (mediaItem.type === "image") {
      return (
        <img
          src={mediaItem.fileUrl}
          alt="post"
          className="w-full h-auto rounded-2xl object-cover max-h-96"
        />
      );
    } else if (mediaItem.type === "video") {
      return (
        <video
          controls
          className="w-full h-auto rounded-2xl object-cover max-h-96"
          src={mediaItem.fileUrl}
        />
      );
    }
    return null; // Return null if neither image nor video
  };

  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Page Image with Author Image Overlay */}
          <div className="relative">
            {fullPost?.page?.image ? (
              <img
                src={fullPost.page.image}
                alt={fullPost.page.name || "Page"}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
            ) : (
              <div className="w-10 h-10 bg-amber-800 text-white flex justify-center items-center rounded-full capitalize">
                {fullPost?.page?.name
                  ? fullPost.page.name.split(" ").length > 1
                    ? fullPost.page.name.split(" ")[0][0] + fullPost.page.name.split(" ")[1][0]
                    : fullPost.page.name.charAt(0)
                  : "P"}
              </div>
            )}
            {author?.profilePicture && (
              <img
                src={author.profilePicture}
                alt={author.name || author.username}
                onClick={handleAuthorClick}
                className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover border-2 border-white cursor-pointer hover:opacity-80 transition"
              />
            )}
          </div>
          
          <div>
            <h3 
              onClick={handleAuthorClick}
              className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
            >
              {author.name}
            </h3>
            <p 
              onClick={handleAuthorClick}
              className="text-xs text-gray-500 cursor-pointer hover:text-orange-600 transition-colors"
            >
              @{author.username} · {fullPost?.createdAt ? timeAgo(fullPost.createdAt) : ""}
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

      {/* Post Media - Render Image or Video */}
      {/* Post Media - Render Image or Video */}
      {post && post.length > 0 && (
        <div
          className="w-full bg-white overflow-hidden p-4 cursor-pointer hover:opacity-90 transition relative"
          onClick={() => {
            setImageViewerOpen(true);
          }}
        >
          {renderMedia(post[0])}
        </div>
      )}

      {/* Content */}
      {(text || fullPost?.bodyText) && (
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {text || fullPost?.bodyText}
          </p>
        </div>
      )}

      {/* Stats - Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🔴 Like button clicked!");
            handleLikeClick();
          }}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition cursor-pointer"
        >
          <Heart
            className={`w-5 h-5 transition ${localLikeState.isLiked
              ? "fill-orange-500 text-orange-500"
              : "text-gray-600"
              }`}
          />
          <span
            className={`text-sm font-medium ${localLikeState.isLiked ? "text-orange-500" : "text-gray-600"
              }`}
          >
            {localLikeState.likesCount}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentCount}</span>
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
        loading={reportLoading}
        onSubmit={(reason) => {
          dispatch(
            sendReport({
              reason,
              targetModel: "Post",
              targetId: fullPost._id,
              isReported: true,
            }),
          );
        }}
      />
      {/* Comments Section */}
      {commentsOpen && <CommentsSection postId={isPostId} />}
    </div>
  );
}
