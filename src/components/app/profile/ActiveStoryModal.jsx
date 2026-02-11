import { useEffect, useState, useContext, useMemo } from "react";
import { Heart, Share2, X, Send, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { timeAgo } from "../../../lib/helpers";
import { LikeOtherStories } from "../../../redux/slices/Subscription.slice";
import { useDispatch, useSelector } from "react-redux";
import SocketContext from "../../../context/SocketContext";
import ShareToChatsModal from "../../global/ShareToChatsModal";
import { deleteStory } from "../../../redux/slices/posts.slice";
import { SuccessToast, ErrorToast } from "../../global/Toaster";
import StoryViewersModal from "./StoryViewersModal";
import StoryPostDetailModal from "./StoryPostDetailModal";

export default function ActiveStoryModal({
  activeStory, // ARRAY of stories
  setActiveStory,
  handleViewStory,
  onStoryDeleted, // Optional callback to refresh stories list
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stories, setStories] = useState(activeStory);
  const [commentText, setCommentText] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewersModalOpen, setViewersModalOpen] = useState(false);
  const [postMediaIndex, setPostMediaIndex] = useState(0);
  const [postDetailModalOpen, setPostDetailModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { comment } = useContext(SocketContext);
  const { user } = useSelector((state) => state.auth);
  const currentStory = stories?.[currentIndex];
  
  // Check if current user is the story owner
  const isStoryOwner = user?._id === currentStory?.page?.user?._id || user?._id === currentStory?.page?.user;

  // Extract post data from current story
  const post = currentStory?.post;
  const postMedia = useMemo(() => {
    if (!post?.media || !Array.isArray(post.media)) return [];
    return post.media.map((m) => ({
      url: m.fileUrl,
      type: m.type || (m.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
    }));
  }, [post?.media]);

  const hasPostMedia = postMedia.length > 0;
  const currentPostMedia = hasPostMedia ? postMedia[postMediaIndex] : null;
  const hasMultiplePostMedia = postMedia.length > 1;

  // Reset post media index when story changes
  useEffect(() => {
    setPostMediaIndex(0);
  }, [currentIndex]);

  // Load liked stories from localStorage and merge with activeStory
  useEffect(() => {
    if (activeStory) {
      const likedStories = JSON.parse(localStorage.getItem("likedStories") || "{}");
      const updatedStories = activeStory.map(story => ({
        ...story,
        hasLiked: likedStories[story._id] !== undefined ? likedStories[story._id] : story.hasLiked
      }));
      setStories(updatedStories);
    } else {
      setStories(null);
    }
  }, [activeStory]);

  const handleStoryLike = async () => {
    const newLikedState = !currentStory.hasLiked;

    // Optimistic update
    setStories(prevStories =>
      prevStories.map((story, idx) =>
        idx === currentIndex
          ? { ...story, hasLiked: newLikedState }
          : story
      )
    );

    // Save to localStorage
    const likedStories = JSON.parse(localStorage.getItem("likedStories") || "{}");
    likedStories[currentStory._id] = newLikedState;
    localStorage.setItem("likedStories", JSON.stringify(likedStories));

    // API call
    await dispatch(LikeOtherStories({ storyId: currentStory._id }));
  };

  const handleSendComment = (e) => {
    e?.preventDefault();

    if (!commentText.trim() || !comment) return;

    const payload = {
      receiverId: currentStory?.page?.user?._id,
      targetId: currentStory?._id,
      content: commentText,
      media: currentStory?.story?.media?.fileUrl
    };

    comment(payload, (response) => {
      if (response?.success) {
        setCommentText("");
      }
    });
  };

  const handleDeleteStory = async () => {
    if (!currentStory?._id) return;
    
    if (!window.confirm("Are you sure you want to delete this story?")) {
      return;
    }

    setDeleteLoading(true);
    try {
      await dispatch(deleteStory(currentStory._id)).unwrap();
      SuccessToast("Story deleted successfully");
      
      // Remove deleted story from local state
      const updatedStories = stories.filter((story) => story._id !== currentStory._id);
      setStories(updatedStories);
      
      // If no stories left, close modal
      if (updatedStories.length === 0) {
        closeStory();
      } else {
        // Navigate to previous story or next story
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else if (currentIndex < updatedStories.length) {
          setCurrentIndex(0);
        }
        setProgress(0);
      }
      
      // Call refresh callback if provided
      if (onStoryDeleted) {
        onStoryDeleted();
      }
    } catch (error) {
      ErrorToast(error || "Failed to delete story");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------- AUTO PROGRESS ---------------- */
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  /* ---------------- NAVIGATION ---------------- */
  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  useEffect(() => {
    if (currentStory?._id) {
      handleViewStory(currentStory._id);
    }
  }, [currentIndex]);

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  /* ---------------- PAUSE HANDLERS ---------------- */
  const handleHoldStart = (e) => {
    e.stopPropagation();
    setIsPaused(true);
  };

  const handleHoldEnd = (e) => {
    e.stopPropagation();
    setIsPaused(false);
  };

  const closeStory = () => {
    setActiveStory(null);
    setCurrentIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
    >
      {/* Close Button */}
      <button
        onClick={closeStory}
        className="absolute top-6 right-6 text-white z-50 p-2"
      >
        <X size={32} />
      </button>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 pt-6 px-4 pb-6 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={currentStory?.page.image}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {currentStory?.page.name}
            </p>
            <p className="text-gray-300 text-xs truncate">
              {currentStory?.page.user.username} •{" "}
              {timeAgo(currentStory?.createdAt)}
            </p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="flex gap-1">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all"
                style={{
                  width:
                    idx < currentIndex
                      ? "100%"
                      : idx === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Story / Post content */}
      <div className="w-full h-full flex items-center justify-center px-4">
        <div 
          className={`w-full max-w-[620px] bg-black/60 rounded-3xl overflow-hidden border border-white/10 shadow-2xl ${post ? 'cursor-pointer hover:bg-black/70 transition-colors z-35' : ''}`}
          onClick={(e) => {
            if (post) {
              e.stopPropagation();
              setPostDetailModalOpen(true);
            }
          }}
          onMouseDown={(e) => {
            if (post) {
              e.stopPropagation();
            }
          }}
          onTouchStart={(e) => {
            if (post) {
              e.stopPropagation();
            }
          }}
        >
          {/* Post author / meta (from post) */}
          {post && (
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <img
                src={post.author?.profilePicture}
                alt={post.author?.name}
                className="w-9 h-9 rounded-full object-cover border border-white/40"
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {post.author?.name}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  @{post.author?.username} •{" "}
                  {timeAgo(post.createdAt || currentStory?.createdAt)}
                </p>
              </div>
            </div>
          )}

          {/* Media area – prefer post.media, fallback to story.media */}
          <div className="relative bg-black flex items-center justify-center max-h-[620px]">
            {hasPostMedia ? (
              <>
                {currentPostMedia?.type === "video" ? (
                  <video
                    src={currentPostMedia.url}
                    className="w-full max-h-[620px] object-contain bg-black"
                    autoPlay
                    muted
                    controls
                  />
                ) : (
                  <img
                    src={currentPostMedia.url}
                    alt="story post"
                    className="w-full max-h-[500px] object-contain bg-black"
                  />
                )}

                {hasMultiplePostMedia && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPostMediaIndex((prev) =>
                          prev === 0 ? postMedia.length - 1 : prev - 1,
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPostMediaIndex((prev) =>
                          prev === postMedia.length - 1 ? 0 : prev + 1,
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {postMedia.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostMediaIndex(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === postMediaIndex
                              ? "w-5 bg-white"
                              : "w-1.5 bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : currentStory?.story?.media?.type === "image" ? (
              <img
                src={currentStory?.story?.media?.fileUrl}
                alt="story"
                className="w-full max-h-[620px] object-contain bg-black"
              />
            ) : currentStory?.story?.media?.type === "video" ? (
              <video
                className="w-full max-h-[620px] object-contain bg-black"
                src={currentStory?.story?.media?.fileUrl}
                autoPlay
                muted
                controls
              />
            ) : null}
          </div>

          {/* Post text/body */}
          {post?.bodyText && (
            <div className="px-4 pt-3 pb-4">
              <p className="text-sm text-gray-100 whitespace-pre-line">
                {post.bodyText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tap Areas - Disabled when post exists */}
      {!post && (
        <div className="absolute inset-0 flex z-30">
          <div className="w-1/2" onClick={prevStory} />
          <div className="w-1/2" onClick={nextStory} />
        </div>
      )}

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-6 px-4">
        {isStoryOwner ? (
          // If story owner: Show Viewers, Share and Delete buttons
          <div className="flex gap-3 items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewersModalOpen(true);
              }}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition-colors"
              title="View Story Insights"
            >
              <Eye size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShareModalOpen(true);
              }}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteStory();
              }}
              disabled={deleteLoading}
              className="bg-red-500/80 hover:bg-red-600/90 p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ) : (
          // If not story owner: Show Like and Comment
          <form onSubmit={handleSendComment} className="flex gap-3 items-center">
            <input
              placeholder="Send a message..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-1 bg-white/15 border border-white/30 text-white text-sm px-4 py-3 rounded-full placeholder:text-gray-400"
            />
            {commentText.trim() && (
              <button
                type="submit"
                className="bg-orange-500 p-3 rounded-full text-white hover:bg-orange-600 transition-colors"
              >
                <Send size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStoryLike();
              }}
              className={`p-3 rounded-full ${currentStory.hasLiked
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white"
                }`}
            >
              <Heart
                size={20}
                fill={currentStory.hasLiked ? "currentColor" : "none"}
              />
            </button>
          </form>
        )}
      </div>

      {/* Share to Chats Modal */}
      {shareModalOpen && (
        <ShareToChatsModal
          onClose={() => setShareModalOpen(false)}
          story={currentStory}
        />
      )}

      {/* Story Viewers Modal */}
      {viewersModalOpen && currentStory?._id && (
        <StoryViewersModal
          storyId={currentStory._id}
          isOpen={viewersModalOpen}
          onClose={() => setViewersModalOpen(false)}
        />
      )}

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-lg">
          ⏸ Paused
        </div>
      )}

      {/* Post Detail Modal - Opens when clicking on post in story */}
      {post && (
        <StoryPostDetailModal
          post={post}
          isOpen={postDetailModalOpen}
          onClose={() => {
            setPostDetailModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
