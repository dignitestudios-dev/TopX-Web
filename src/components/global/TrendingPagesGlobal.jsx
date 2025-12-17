// TrendingPagesGlobal.js
import { TrendingUp } from "lucide-react";
import React, { useEffect } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchTrendingPages } from "../../redux/slices/trending.slice";

const TrendingPagesGlobal = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
  }, [dispatch]);

  const { trendingPages, trendingLoading, error } = useSelector(
    (state) => state.trending
  );

  const latestTrendingPages = [...trendingPages] // Create a shallow copy to avoid mutation
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date (latest first)
    .slice(0, 2); // Get only the 2 most recent pages

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
      {/* Header */}
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <span className="text-gray-900">Trending Pages</span>
      </h3>

      {/* Trending List */}
      <div className="space-y-6">
        {latestTrendingPages.length > 0 ? (
          latestTrendingPages.map((item, idx) => (
            <div
              key={idx}
              className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={item.image || "default-img.jpg"} // Use image from API
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex gap-2">
                    <p className="font-[400] text-[14px]">{item.name}</p>
                    <img src="notes-icon.png" alt="" />
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

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    {item.followersCount} Follows
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Loading trending pages...</p> // If no pages are loaded yet
        )}
      </div>

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

export default TrendingPagesGlobal;
