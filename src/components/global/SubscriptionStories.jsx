import React, { useState, useEffect } from "react";
import { Heart, Share2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCollectionStories,
  LikeOtherStories,
  viewOtherStories,
} from "../../redux/slices/Subscription.slice";
import { timeAgo } from "../../lib/helpers";
import ActiveStoryModal from "../app/profile/ActiveStoryModal";

const SubscriptionStories = ({ pageId }) => {
  const dispatch = useDispatch();
  const { PageStories, isLoading } = useSelector(
    (state) => state.subscriptions
  );
  useEffect(() => {
    if (pageId) {
      dispatch(getCollectionStories({ id: pageId }));
    }
  }, [pageId, dispatch]);

  const [activeStory, setActiveStory] = useState(null);
  const handleViewStory = async (storyId) => {
    await dispatch(viewOtherStories({ storyId }));
  };
  console.log(PageStories, "pages-storiess->");
  return (
    <div className="w-full p-4 md:p-0">
      <h2 className="text-base font-bold text-gray-900 mb-3 py-0 px-4">
        My Basketball
      </h2>
      <div className="bg-white py-4 px-4 rounded-2xl shadow-sm">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-0">
          {PageStories?.slice(0, 1)?.map((story) => (
            <div
              key={story._id}
              onClick={() => {
                setActiveStory(PageStories);
                handleViewStory(story._id);
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
      <ActiveStoryModal
        activeStory={activeStory}
        setActiveStory={setActiveStory}
      />
    </div>
  );
};

export default SubscriptionStories;
