import React, { useState, useMemo, useRef, useEffect } from "react";
import { X, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { timeAgo } from "../../../lib/helpers";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../../redux/slices/posts.slice";
import CommentsSection from "../../global/CommentsSection";

export default function StoryPostDetailModal({ post, isOpen, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { likeLoading } = useSelector((state) => state.posts);
  const dropdownRef = useRef(null);

  // Normalize media array
  const allMedia = useMemo(() => {
    if (!post?.media || !Array.isArray(post.media)) return [];
    return post.media.map((m) => ({
      url: m.fileUrl,
      type: m.type || (m.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
    }));
  }, [post?.media]);

  const hasMedia = allMedia.length > 0;
  const currentMedia = hasMedia ? allMedia[currentMediaIndex] : null;
  const hasMultipleMedia = allMedia.length > 1;

  // Reset media index when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentMediaIndex(0);
      setCommentsOpen(false);
      setMoreOpen(false);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Get initial like state
  const getInitialLikeState = () => {
    const postId = post?._id || post?.id;
    if (!postId) return { isLiked: false, likesCount: 0 };

    const localLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    const cachedLike = localLikes[postId];

    if (cachedLike) {
      return {
        isLiked: cachedLike.isLiked || false,
        likesCount: cachedLike.likesCount || 0,
      };
    }

    return {
      isLiked: post?.isLiked || false,
      likesCount: post?.likesCount || post?.stats?.likes || 0,
    };
  };

  const [localLikeState, setLocalLikeState] = useState(getInitialLikeState());

  useEffect(() => {
    const newState = getInitialLikeState();
    setLocalLikeState(newState);
  }, [post?._id, post?.isLiked, post?.likesCount]);

  const handleLikeClick = async () => {
    const postId = post?._id || post?.id;
    if (!postId) return;

    const currentIsLiked = localLikeState.isLiked;
    const currentLikesCount = localLikeState.likesCount || 0;
    const newIsLiked = !currentIsLiked;
    const newLikesCount = newIsLiked
      ? currentLikesCount + 1
      : Math.max(currentLikesCount - 1, 0);

    // Optimistic update
    setLocalLikeState({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    });

    // Save to localStorage
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = {
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // API call
    try {
      const result = await dispatch(
        likePost({
          id: postId,
          likeToggle: newIsLiked,
          isPost: true,
        }),
      ).unwrap();

      if (result?.data) {
        const apiData = result.data;
        setLocalLikeState({
          isLiked: apiData.likeToggle ?? newIsLiked,
          likesCount: apiData.likesCount ?? newLikesCount,
        });
      }
    } catch (error) {
      console.error("Like API failed:", error);
      setLocalLikeState({
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      });

      const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
      likes[postId] = {
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      };
      localStorage.setItem("postLikes", JSON.stringify(likes));
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-amber-800 text-white flex justify-center items-center rounded-full capitalize">
                {post.author?.name
                  ? post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                  : "U"}
              </div>
              {post.author?.profilePicture && (
                <img
                  src={post.author.profilePicture}
                  alt={post.author.name}
                  className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">
                {post.page?.name || post.author?.name || "User"}
              </h3>
              <p className="text-xs text-gray-500">
                @{post.author?.username} · {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                      // Add report functionality if needed
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Report
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Media Carousel */}
        {hasMedia && (
          <div className="relative bg-black flex items-center justify-center min-h-[400px] max-h-[600px]">
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.url}
                className="w-full max-h-[600px] object-contain bg-black"
                controls
                playsInline
              />
            ) : (
              <img
                src={currentMedia.url}
                alt="post media"
                className="w-full max-h-[600px] object-contain bg-black"
              />
            )}

            {/* Navigation Arrows */}
            {hasMultipleMedia && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex((prev) =>
                      prev === 0 ? allMedia.length - 1 : prev - 1,
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex((prev) =>
                      prev === allMedia.length - 1 ? 0 : prev + 1,
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allMedia.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMediaIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentMediaIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {currentMediaIndex + 1} / {allMedia.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Post Text */}
        {post.bodyText && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {post.bodyText}
            </p>
          </div>
        )}

        {/* Shared By Info */}
        {post.sharedBy && (
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {post.sharedBy?.profilePicture ? (
                <img
                  src={post.sharedBy.profilePicture}
                  className="w-6 h-6 rounded-full object-cover"
                  alt={post.sharedBy.name}
                />
              ) : (
                <div className="w-6 h-6 bg-purple-800 text-white text-[10px] flex justify-center items-center rounded-full capitalize">
                  {post.sharedBy?.name?.[0] || "U"}
                </div>
              )}
              <span>{post.sharedBy.name} Reposted</span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={likeLoading}
            className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 transition ${
                localLikeState.isLiked
                  ? "fill-orange-500 text-orange-500"
                  : "text-gray-600"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                localLikeState.isLiked ? "text-orange-500" : "text-gray-600"
              }`}
            >
              {Number(localLikeState.likesCount ?? 0)}
            </span>
          </button>

          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {post.stats?.comments || post.commentsCount || 0}
            </span>
          </button>

          <button className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              {post.stats?.shares || post.sharesCount || 0}
            </span>
          </button>
        </div>

        {/* Comments Section */}
        {commentsOpen && (
          <div className="border-t border-gray-100">
            <CommentsSection postId={post._id || post.id} />
          </div>
        )}
      </div>
    </div>
  );
}

