import React, { useEffect, useState } from "react";
import { ChevronRight, Layers, Plus } from "lucide-react";
import { ballone, ballthree, balltwo, nofound } from "../../assets/export";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getMySubsctiptions } from "../../redux/slices/Subscription.slice";
import CreateSubscriptionModal from "../global/CreateSubscriptionModal";
import Avatar from "../common/Avatar";

const MySubscription = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Loading state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  // Fetch subscriptions
  useEffect(() => {
    dispatch(getMySubsctiptions({ page: 1, limit: 10 }));
  }, [dispatch]);

  const { mySubscriptions, subscriptionLoading } = useSelector(
    (state) => state.subscriptions
  );

  useEffect(() => {
    if (!subscriptionLoading) {
      setLoading(false);
    }
  }, [subscriptionLoading]);

  return (
    <div className="max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-[500] text-gray-900">My Subscriptions</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 text-white p-1.5 rounded-md hover:bg-orange-600 transition-colors"
        >
          <Plus size={18} className="cursor-pointer" />
        </button>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton Loading
          <>
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="skeleton-box w-3/4 h-5 bg-gray-300 rounded-md" />
                </div>
              </div>
            ))}
          </>
        ) : Array.isArray(mySubscriptions) && mySubscriptions.length > 0 ? (
          mySubscriptions.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  {/* Subscription Name */}
                  <p
                    onClick={() =>
                      navigate(`/subscriptions-category`, {
                        state: { id: item._id },
                      })
                    }
                    className="cursor-pointer font-medium text-gray-900 flex items-center gap-1.5 min-w-0"
                  >
                    <Avatar
                      src={item?.image}
                      alt={item?.name}
                      size="sm"
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate" title={item.name}>
                      {item.name}
                    </span>

                    <Layers className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </p>

                  {/* Page avatars + number */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-2">
                      {/* Show first 3 non-null page images */}
                      {item.pages
                        .filter((p) => p) // remove nulls
                        .slice(0, 3)
                        .map((p, index) => (
                          <Avatar
                            key={index}
                            src={p}
                            alt=""
                            size="xs"
                            className="w-5 h-5 rounded-full border border-white object-cover"
                          />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      <span className="text-black font-[600]">
                        {item.pages.filter((p) => p).length}{" "}
                        {/* number of pages */}
                      </span>{" "}
                      Page{item.pages.filter((p) => p).length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            <div className="flex justify-center">
               <div className="text-gray-500 col-span-3 text-center py-10">
                            <div className=" flex justify-center">
                            <img src={nofound} height={300} width={300} alt="" />
                            </div>
                            <p className="font-bold pt-4 text-black capitalize">You have no collections</p>
                          </div>
                               </div>
          </div>
        )}
      </div>

      {/* View All Button */}
      {Array.isArray(mySubscriptions) && mySubscriptions.length > 0 && (
        <div className="flex items-center justify-between mt-5 text-black cursor-pointer font-semibold text-sm">
          <Link to="/subscriptions">
            <span>View All</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}

      {/* Create Subscription Modal */}
      <CreateSubscriptionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default MySubscription;
