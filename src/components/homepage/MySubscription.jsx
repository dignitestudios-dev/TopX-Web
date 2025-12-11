import React, { useEffect, useState } from "react";
import { MoreHorizontal, ChevronRight, Layers } from "lucide-react";
import { ballone, ballthree, balltwo } from "../../assets/export";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getMySubsctiptions } from "../../redux/slices/Subscription.slice";

const MySubscription = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Loading state

  // Effect to fetch subscriptions
  useEffect(() => {
    dispatch(getMySubsctiptions({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Get subscriptions from Redux store
  const { mySubscriptions, subscriptionLoading, mySubscriptionsPagination } = useSelector(
    (state) => state.subscriptions
  );

  // Set loading to false once the data is fetched
  useEffect(() => {
    if (!subscriptionLoading) {
      setLoading(false); // Stop loading when data is fetched
    }
  }, [subscriptionLoading]);

  return (
    <div className="max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-[500] text-gray-900">My Subscription</h3>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        {loading ? (
          // Manual Skeleton Loading
          <>
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {/* Skeleton */}
                  <div className="skeleton-box w-3/4 h-5 bg-gray-300 rounded-md" />
                </div>
              </div>
            ))}
          </>
        ) : (
          // Ensure `mySubscriptions` is an array before calling `.slice`
          Array.isArray(mySubscriptions) && mySubscriptions.length > 0 ? (
            mySubscriptions.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <Link to={item.url}>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        {item.name}
                        <Layers className="w-4 h-4 text-gray-500" />
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex -space-x-2">
                        <img
                          src={ballone}
                          alt=""
                          className="w-5 h-5 rounded-full border border-white"
                        />
                        <img
                          src={balltwo}
                          alt=""
                          className="w-5 h-5 rounded-full border border-white"
                        />
                        <img
                          src={ballone}
                          alt=""
                          className="w-5 h-5 rounded-full border border-white"
                        />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        <span className="text-black font-[600]">50+</span> Pages
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              <div className="flex justify-center">
                <img src="https://www.profitim.com/build/images/background/no-results-bg.2d2c6ee3.png" alt="" />
              </div>
              <p>No Subscription Found</p>
            </div>
          )
        )}
      </div>

      {Array.isArray(mySubscriptions) && mySubscriptions.length > 0 && (
        <div className="flex items-center justify-between mt-5 text-black cursor-pointer font-semibold text-sm">
          <Link to="/subscriptions">
            <span>View All</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default MySubscription;
