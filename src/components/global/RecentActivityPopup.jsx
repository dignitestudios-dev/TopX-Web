import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getRecentActivity } from "../../redux/slices/profileSetting.slice";
import { timeAgo } from "../../lib/helpers";

const RecentActivityPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const { recentActivity } = useSelector((state) => state?.profileSetting);
  const handleGetRecentActivity = async () => {
    await dispatch(getRecentActivity({})).unwrap();
  };
  useEffect(() => {
    handleGetRecentActivity();
  }, []);
  console.log(recentActivity, "recentActivity");
  // onClick={onClose}
  return (
    <div className="absolute right-[10em] top-[6em] w-[22rem] bg-white shadow-xl rounded-xl border scrollbar-hide border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold">Recent Activity</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Activity Content */}
      <div className="max-h-[75vh] overflow-y-auto scrollbar-hide p-4 space-y-4">
        {recentActivity?.map((item, i) => (
          <>
            <div className="text-sm text-gray-600 underline cursor-pointer">
              You have {item?.action} on this post.
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={item?.post?.author?.profilePicture}
                  alt="user"
                  className="w-9 h-9 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">
                    {item?.post?.author?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{item?.post?.author?.username} ·{" "}
                    {timeAgo(item?.post?.createdAt)} 5 mins ago
                  </p>
                </div>
              </div>
              {item?.post?.media.length > 0 && (
                <img
                  src={item?.post?.media[0]}
                  alt="post"
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
              )}

              <p className="text-sm text-gray-700 leading-snug">
                {item?.post?.bodyText}
              </p>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityPopup;
