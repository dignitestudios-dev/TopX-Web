import { useEffect, useState } from "react";
import { Heart, Share2, X } from "lucide-react";
import { timeAgo } from "../../../lib/helpers";
import { LikeOtherStories } from "../../../redux/slices/Subscription.slice";
import { useDispatch } from "react-redux";

export default function ActiveStoryModal({
  activeStory, // ARRAY of stories
  setActiveStory,
  handleViewStory,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dispatch = useDispatch();
  const currentStory = activeStory?.[currentIndex];
  const handleStoryLike = async () => {
    // Implement like functionality here
    await dispatch(LikeOtherStories({ storyId: currentStory._id }));
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
    if (currentIndex < activeStory.length - 1) {
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
            src={currentStory.page.image}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {currentStory.page.name}
            </p>
            <p className="text-gray-300 text-xs truncate">
              {currentStory.page.user.username} •{" "}
              {timeAgo(currentStory.createdAt)}
            </p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="flex gap-1">
          {activeStory.map((_, idx) => (
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

      {/* Story Image */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={currentStory.story.media.fileUrl}
          alt="story"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Tap Areas */}
      <div className="absolute inset-0 flex z-30">
        <div className="w-1/2" onClick={prevStory} />
        <div className="w-1/2" onClick={nextStory} />
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-6 px-4">
        <div className="flex gap-3 items-center">
          <input
            placeholder="Send a message..."
            className="flex-1 bg-white/15 border border-white/30 text-white text-sm px-4 py-3 rounded-full"
          />
          <button className="bg-white/20 p-3 rounded-full text-white">
            <Share2 size={20} />
          </button>
          <button
            onClick={handleStoryLike}
            className={`p-3 rounded-full ${
              currentStory.hasLiked
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white"
            }`}
          >
            <Heart
              size={20}
              fill={currentStory.hasLiked ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-lg">
          ⏸ Paused
        </div>
      )}
    </div>
  );
}
