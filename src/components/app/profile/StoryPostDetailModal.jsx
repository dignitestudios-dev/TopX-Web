import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { timeAgo } from "../../../lib/helpers";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../../redux/slices/posts.slice";
import CommentsSection from "../../global/CommentsSection";

export default function StoryPostDetailModal({ post, isOpen, onClose }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dispatch = useDispatch();
  const { likeLoading } = useSelector((state) => state.posts);
  const dropdownRef = useRef(null);

  // =========================
  // MEDIA FALLBACK LOGIC
  // =========================
  const allMedia = useMemo(() => {
    const mediaSource =
      post?.media && Array.isArray(post.media) && post.media.length > 0
        ? post.media
        : post?.originalPost?.media;

    if (!mediaSource || !Array.isArray(mediaSource)) return [];

    return mediaSource.map((m) => ({
      url: m.fileUrl,
      type:
        m.type ||
        (m.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
    }));
  }, [post?.media, post?.originalPost?.media]);

  const hasMedia = allMedia.length > 0;
  const currentMedia = hasMedia ? allMedia[currentMediaIndex] : null;
  const hasMultipleMedia = allMedia.length > 1;

  // =========================
  // TEXT FALLBACK LOGIC
  // =========================
  const postText = post?.bodyText || post?.originalPost?.bodyText;

  // Reset modal state
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // =========================
  // LIKE SYSTEM
  // =========================
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

    try {
      const result = await dispatch(
        likePost({
          id: postId,
          likeToggle: newIsLiked,
          isPost: true,
        })
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
        <div className="sticky top-0 bg-white z-10 p-4 flex items-center justify-between border-b">
          <div>
            <h3 className="font-semibold text-sm">
              {post.page?.name || post.author?.name || "User"}
            </h3>
            <p className="text-xs text-gray-500">
              @{post.author?.username} · {timeAgo(post.createdAt)}
            </p>
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* MEDIA */}
        {hasMedia && (
          <div className="relative bg-black flex items-center justify-center min-h-[400px]">
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.url}
                className="w-full max-h-[400px] object-contain"
                controls
              />
            ) : (
              <img
                src={currentMedia.url}
                alt="post media"
                className="w-full max-h-[400px] object-contain"
              />
            )}

            {/* Arrows */}
            {hasMultipleMedia && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex((prev) =>
                      prev === 0 ? allMedia.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 bg-black/60 text-white p-2 rounded-full"
                >
                  <ChevronLeft />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex((prev) =>
                      prev === allMedia.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 bg-black/60 text-white p-2 rounded-full"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        )}

        {/* TEXT */}
        {postText && (
          <div className="px-4 py-3 border-b">
            <p className="text-sm whitespace-pre-line">{postText}</p>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="px-4 py-3 flex items-center gap-6">
          <button
            onClick={handleLikeClick}
            disabled={likeLoading}
            className="flex items-center gap-1"
          >
            <Heart
              className={`w-5 h-5 ${
                localLikeState.isLiked ? "fill-orange-500 text-orange-500" : ""
              }`}
            />
            {localLikeState.likesCount}
          </button>

          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-5 h-5" />
            {post.stats?.comments || post.commentsCount || 0}
          </button>

          <button className="flex items-center gap-1">
            <Share2 className="w-5 h-5" />
            {post.stats?.shares || post.sharesCount || 0}
          </button>
        </div>

        {/* COMMENTS */}
        {commentsOpen && (
          <div className="border-t">
            <CommentsSection postId={post._id || post.id} />
          </div>
        )}
      </div>
    </div>
  );
}