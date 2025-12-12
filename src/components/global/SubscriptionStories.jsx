import React, { useState, useEffect } from "react";
import { Heart, Share2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPageStories,
  LikeOtherStories,
} from "../../redux/slices/Subscription.slice";
import { timeAgo } from "../../lib/helpers";

const SubscriptionStories = ({ pageId }) => {
  const dispatch = useDispatch();
  const { PageStories, isLoading } = useSelector(
    (state) => state.subscriptions
  );
  useEffect(() => {
    if (pageId) {
      dispatch(getPageStories({ id: pageId }));
    }
  }, [pageId, dispatch]);

  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Progress animation with pause functionality
  useEffect(() => {
    if (activeStory && !isPaused) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveStory(null);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeStory, isPaused]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsPaused(true);
  };
  const handleMouseUp = (e) => {
    e.stopPropagation();
    setIsPaused(false);
  };
  const handleTouchStart = (e) => {
    e.stopPropagation();
    setIsPaused(true);
  };
  const handleTouchEnd = (e) => {
    e.stopPropagation();
    setIsPaused(false);
  };

  const closeStory = (e) => {
    e.stopPropagation();
    setActiveStory(null);
    setProgress(0);
    setLiked(false);
  };

  const handleLikeStory = async () => {
    await dispatch(LikeOtherStories({ storyId: activeStory._id })).unwrap();
    await dispatch(getPageStories({ id: pageId })).unwrap();
  };

  return (
    <div className="w-full p-4 md:p-0">
      <h2 className="text-base font-bold text-gray-900 mb-3 py-0 px-4">
        My Basketball
      </h2>
      <div className="bg-white py-4 px-4 rounded-2xl shadow-sm">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-0">
          {PageStories?.map((story) => (
            <div
              key={story._id}
              onClick={() => {
                setActiveStory(story);
                setProgress(0);
              }}
              className="flex flex-col items-center cursor-pointer flex-shrink-0"
            >
              <div
                className={`w-24 h-32 rounded-2xl overflow-hidden relative flex items-end justify-center transition-all duration-300 ${
                  activeStory?._id === story._id
                    ? "ring-3 ring-orange-500 shadow-lg"
                    : "hover:ring-2 hover:ring-orange-300 shadow"
                }`}
              >
                <img
                  src={story?.story?.media?.fileUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute top-2 left-2">
                  <img
                    src={story?.page?.image}
                    alt={story?.page?.image}
                    className="w-7 h-7 rounded-full border-2 border-white"
                  />
                </div>
                <div className="absolute bottom-2 text-white text-xs font-semibold px-2 text-left line-clamp-1 w-full">
                  {activeStory?.page?.user?.username.split("'s")[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Modal - Full Screen Mobile Optimized */}
      {activeStory && (
        <div
          className="fixed inset-0 bg-black w-screen h-screen flex items-center justify-center z-50 overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button - Fixed Position */}
          <button
            onClick={closeStory}
            className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 z-50 flex items-center justify-center"
          >
            <X size={32} strokeWidth={2.5} />
          </button>

          {/* Story Header */}
          <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent pt-6 px-4 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={activeStory?.page?.image}
                className="w-10 h-10 rounded-full border-2 border-white flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">
                  {activeStory?.page?.name}
                </p>
                <p className="text-gray-300 text-xs truncate">
                  {activeStory?.page?.user?.username} •{" "}
                  {timeAgo(activeStory.createdAt)}
                </p>
              </div>
            </div>

            {/* Progress Bar - Single Bar */}
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Story Image - Centered */}
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={activeStory?.story.media?.fileUrl}
              alt={activeStory.title}
              className="w-full h-full object-contain"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-8 px-4">
            <div className="max-w-full mx-auto flex justify-between items-end gap-3">
              <input
                type="text"
                placeholder="Send a message..."
                className="flex-1 bg-white/15 border border-white/30 text-white text-sm px-4 py-3 rounded-full placeholder-gray-400 focus:outline-none focus:border-white/50 backdrop-blur-sm transition-all"
              />
              <div className="flex gap-2">
                <button
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm flex-shrink-0"
                  onClick={() => {}}
                >
                  <Share2 size={20} />
                </button>
                <button
                  className={`rounded-full p-3 transition-all duration-200 backdrop-blur-sm flex-shrink-0 ${
                    activeStory?.hasLiked
                      ? "bg-red-500/80 hover:bg-red-600 text-white"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                  onClick={() => handleLikeStory()}
                >
                  <Heart
                    size={20}
                    fill={activeStory?.hasLiked ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Pause Indicator */}
          {isPaused && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 text-lg font-medium z-30 pointer-events-none">
              ⏸ Paused
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionStories;
