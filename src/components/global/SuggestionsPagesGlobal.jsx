import { TrendingUp } from "lucide-react";
import React, { useEffect } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { fetchRecommendedPages } from "../../redux/slices/trending.slice";
import { TbFileText } from "react-icons/tb";

const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
          <div className="flex items-center gap-3 mb-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SuggestionsPagesGlobal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));
  }, [dispatch]);

  const { recommendedPages, recommendedLoading, error } = useSelector(
    (state) => state.trending
  );

  // Sort trending pages by creation date
  const latestTrendingPages = [...recommendedPages] // Create a shallow copy to avoid mutation
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date (latest first)
    .slice(0, 2); // Get only the 2 most recent pages

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
      {/* Header */}
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <span className="text-gray-900">Suggestions based on your Interests/Activity</span>
      </h3>

      {/* Trending List */}
      {recommendedLoading ? (
        <SkeletonLoader /> // Show skeleton loader when data is loading
      ) : (
        <div className="space-y-6">
          {latestTrendingPages.length > 0 ? (
            latestTrendingPages.map((item, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={item.image || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} // Use image from API
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold text-[14px] cursor-pointer text-gray-900 truncate" onClick={() => {
                        navigate(`/trending-page-detail/${item._id}`)
                      }}>
                        {item.name}
                      </p>
                      <TbFileText className="w-[16px] h-[16px]" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-2 leading-snug">{item.about}</p>

                {/* Hashtags */}
                <p className="text-xs text-gray-700 mb-3">
                  {item.keywords.map((tag, i) => (
                    <span key={i} className="mr-1 text-gray-500">
                      {tag}
                    </span>
                  ))}
                </p>

                <div className="flex gap-1 items-center">
                  {/* Followers Images */}
                  {item.followersCount > 0 && (
                    <div className="flex items-center">
                      {item.followers.slice(0, 3).map((follower, index) => (
                        <img
                          key={index}
                          src={follower || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} // Use follower image or default image if null
                          alt={`Follower ${index + 1}`}
                          className="w-[24px] h-[24px] rounded-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* Followers Count */}
                  <div className="flex items-center gap-1 pl-1">
                    <p className="text-[14px] font-[600] text-[#000000]">
                      {item.followersCount}+
                    </p>
                    <p className="text-[14px] font-[500] text-[#ADADAD]">Follows</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No trending pages available.</p> // If no pages are available
          )}
        </div>
      )}

      {/* Footer */}
      <Link to="/trending">
        <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
          <span>View All</span>
          <FaChevronRight color="orange" />
        </div>
      </Link>
    </div>
  );
};

export default SuggestionsPagesGlobal;
