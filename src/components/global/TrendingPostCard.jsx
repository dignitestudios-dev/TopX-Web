import React, { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Repeat,
} from "lucide-react";
import { useNavigate } from "react-router";
import { likePost } from "../../redux/slices/posts.slice";
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
import PostImageViewerModal from "./PostDetailModal";
import { getLinkPreview } from "../../lib/helpers";
import LinkPreviewCard from "./LinkPreviewCard";

export default function TrendingPostCard({
  post,
  liked,
  toggleLike,
  activeCommentPostId,
  setActiveCommentPostId,
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isCommentsOpen = typeof setActiveCommentPostId === "function"
    ? activeCommentPostId === (post?.id || post?._id)
    : commentsOpen;

  const handleToggleComments = () => {
    const pId = post?.id || post?._id;
    if (typeof setActiveCommentPostId === "function") {
      setActiveCommentPostId(isCommentsOpen ? null : pId);
    } else {
      setCommentsOpen(!commentsOpen);
    }
  };
  // Repost
  const [moreOpen, setMoreOpen] = useState(false);
  const [reportmodal, setReportmodal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isPrivatePost, setIsPrivatePost] = useState(false);
  const [sharepost, setSharepost] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  const linkData = getLinkPreview(post?.bodyText || post?.text);

  const getInitials = (value) => {
    const str = typeof value === "string" ? value.trim() : "";
    if (!str) return "?";
    return str
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Helper to check if media is video
  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg)$/i.test(url) || url.includes("video");
  };

  console.log(post, "Trendingpost")

  // Combine all media (images + videos) from media or postimage array
  const allMedia = React.useMemo(() => {
    // Check both post.media (API response) and post.postimage (legacy)
    const mediaArray = post?.media || post?.postimage || [];
    if (!Array.isArray(mediaArray) || mediaArray.length === 0) return [];

    return mediaArray.map((media) => {
      const fileUrl = media?.fileUrl || media?.url || media;
      return {
        url: fileUrl,
        type: media?.type || (isVideo(fileUrl) ? "video" : "image"),
      };
    });
  }, [post?.media, post?.postimage]);

  const hasMedia = allMedia.length > 0;
  const currentMedia = hasMedia ? allMedia[currentMediaIndex] : null;
  const hasMultipleMedia = allMedia.length > 1;

  const timeAgo = (createdAt) => {
    if (!createdAt) return "";
    const now = new Date();
    const then = new Date(createdAt);
    const diffMs = now - then;
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return then.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    }
    if (days === 1) return "Yesterday";
    if (days > 1) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  const { likeLoading } = useSelector((state) => state.posts);

  // Get initial like state from post or localStorage (for optimistic updates)
  const getInitialLikeState = () => {
    const postId = post._id || post.id;
    if (!postId) return { isLiked: false, likesCount: 0 };

    // Check localStorage first (for optimistic updates)
    const localLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    const cachedLike = localLikes[postId];

    if (cachedLike) {
      return {
        isLiked: cachedLike.isLiked || false,
        likesCount: cachedLike.likesCount || 0,
      };
    }

    // Use post data
    return {
      isLiked: post.isLiked || false,
      likesCount: post.likesCount || 0,
    };
  };

  const [localLikeState, setLocalLikeState] = useState(getInitialLikeState());

  // Update local state when post changes
  useEffect(() => {
    const newState = getInitialLikeState();
    setLocalLikeState(newState);
  }, [post._id, post.id, post.isLiked, post.likesCount]);

  // ✅ Proper like toggle handler with optimistic updates (same as HomePostFeed.jsx)
  const handleLikeToggle = async () => {
    if (likeLoading) return; // Prevent multiple clicks while loading

    const postId = post._id || post.id;
    if (!postId) {
      console.error("Post ID not found", { post });
      return;
    }

    const currentIsLiked = localLikeState.isLiked;
    const currentLikesCount = localLikeState.likesCount || 0;
    const newIsLiked = !currentIsLiked;
    const newLikesCount = newIsLiked
      ? currentLikesCount + 1
      : Math.max(currentLikesCount - 1, 0);

    // ✅ Optimistic update - update UI immediately
    setLocalLikeState({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    });

    // Call parent toggleLike callback if provided
    if (toggleLike && typeof toggleLike === "function") {
      toggleLike(postId, newIsLiked, newLikesCount);
    }

    // Save to localStorage for persistence
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = {
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Call API
    try {
      await dispatch(
        likePost({
          id: postId,
          likeToggle: newIsLiked,
          isPost: true,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to like post:", error);
      // Revert optimistic update on error
      setLocalLikeState({
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      });
    }
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
  const navigate = useNavigate();

  return (
    <div className="bg-white relative h-auto  pb-10 rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      {/* Repost Navigation Banner */}
      {(post?.originalPost || post?.sharedBy || post?.isRepost) && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            const origPageId = post?.originalPost?.page?._id || post?.originalPost?.page || post?.page?._id;
            if (origPageId) {
              navigate(`/trending-page-detail/${origPageId}`, {
                state: { postId: post?.originalPost?._id || post?.originalPost || post?._id }
              });
            }
          }}
          className="px-4 py-2 bg-orange-50/90 border-b border-orange-100/80 flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-700">
            <Repeat className="w-3.5 h-3.5 text-orange-600" />
            <span>
              Reposted from {post?.originalPost?.author?.name || post?.originalPost?.page?.name || post?.sharedBy?.username || "Original Post"}
            </span>
          </div>
          <span className="text-[11px] text-orange-600 font-bold underline flex items-center gap-1">
            Go to original post →
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            {post?.page?.image ? (
              <img
                src={post.page.image}
                alt={post?.page?.name || post?.author?.name || "Page"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs font-semibold">
                {getInitials(
                  post?.page?.name || post?.page?.user?.name || post?.page?.topic,
                )}
              </div>
            )}

            {post?.author?.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={post?.author?.name || post?.author?.username || "Author"}
                className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-5 h-5 absolute -right-1 -bottom-0 text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
                {getInitials(
                  post?.author?.name || post?.author?.username || post?.author,
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-800">
              {post.author?.name ? `${post.author.name}'s` : ""} {post.page?.name}
            </p>
            <p className="text-xs text-gray-500">
              @{post.author?.username} •{" "}
              {timeAgo(post.createdAt || post.updatedAt || post.author?.createdAt)}
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
        {/* Media Carousel */}
        {hasMedia && (
          <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-200">
            {/* Current Media */}
            <div
              className="relative cursor-pointer"
              onClick={() => setImageViewerOpen(true)}
            >
              {currentMedia?.type === "video" || isVideo(currentMedia?.url) ? (
                <video
                  src={currentMedia.url}
                  className="w-full h-72 object-cover"
                  controls
                  onClick={(e) => e.stopPropagation()}
                  playsInline
                />
              ) : (
                <img
                  src={currentMedia.url}
                  alt="post media"
                  className="w-full h-72 object-cover"
                />
              )}

              {/* Navigation Arrows */}
              {hasMultipleMedia && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex((prev) =>
                        prev === 0 ? allMedia.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex((prev) =>
                        prev === allMedia.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Media Counter */}
              {hasMultipleMedia && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
                  {currentMediaIndex + 1} / {allMedia.length}
                </div>
              )}
            </div>

            {/* Dots Indicator */}
            {hasMultipleMedia && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allMedia.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(idx);
                    }}
                    className={`transition-all ${idx === currentMediaIndex
                        ? "bg-white w-6 h-1.5"
                        : "bg-white bg-opacity-50 w-1.5 h-1.5"
                      } rounded-full`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!hasMedia && linkData && <LinkPreviewCard linkData={linkData} />}

        {(() => {
          const rawText = post?.text || post?.bodyText || "";
          const cleanText = linkData
            ? rawText.replace(linkData.url, "").trim()
            : rawText;
          if (!cleanText) return null;
          return <p className="text-sm text-gray-800 leading-snug mb-3">{cleanText}</p>;
        })()}
        {post?.sharedBy ? (
          <div className="text-sm text-nowrap  flex gap-2 justify-start items-center bg-slate-200 rounded-3xl text-center p-2 w-[16em]">
            {post.sharedBy?.profilePicture ? (
              <img
                src={post.sharedBy.profilePicture}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
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
      {post?.page?.pageType == "privates" && !post?.page?.isSubscribed && (
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
        {/* ✅ LIKE BUTTON - WITH OPTIMISTIC UPDATES (same as HomePostFeed.jsx) */}
        <button
          onClick={handleLikeToggle}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 transition ${likeLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:text-orange-500"
            } ${localLikeState.isLiked ? "text-orange-500" : "text-gray-600"
            }`}
        >
          <Heart
            className={`w-5 h-5 transition ${localLikeState.isLiked
                ? "fill-orange-500 text-orange-500"
                : likeLoading
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
          />
          <span
            className={`text-sm font-medium ${localLikeState.isLiked ? "text-orange-500" : "text-gray-600"
              }`}
          >
            {Number(localLikeState.likesCount ?? 0)}
          </span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            {post.commentsCount ?? post.stats?.comments ?? 0}
          </span>
        </button>

        <button
          onClick={() => setSharepost(true)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">
            {post.sharesCount ?? post.stats?.shares ?? 0}
          </span>
        </button>
      </div>
      {isCommentsOpen && <CommentsSection postId={post.id || post._id} />}

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
        <PostStoryModal post={post} onClose={setSelectedOption} />
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

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <PostImageViewerModal
          post={post}
          author={post.author}
          isOpen={imageViewerOpen}
          onClose={() => {
            setImageViewerOpen(false);
            setCurrentMediaIndex(0);
          }}
        />
      )}
    </div>
  );
}
