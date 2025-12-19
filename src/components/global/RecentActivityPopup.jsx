import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getRecentActivity,
  getSettings,
  updateActivityStatus,
} from "../../redux/slices/profileSetting.slice";
import { timeAgo } from "../../lib/helpers";
import Button from "../common/Button";
const ActivitySkeleton = () => (
  <div className="space-y-3">
    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />

    <div className="bg-gray-100 p-3 rounded-xl border">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="h-32 w-full bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse mt-2" />
    </div>
  </div>
);

const RecentActivityPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const { recentActivity, isLoading, settings, updateLoader } = useSelector(
    (state) => state?.profileSetting
  );

  useEffect(() => {
    dispatch(getSettings({}));
    dispatch(getRecentActivity({}));
  }, [dispatch]);

  const isOn = settings?.activityStatus === "on";
  const handleToggle = () => {
    const newStatus = isOn ? "off" : "on";
    dispatch(updateActivityStatus({ activityStatus: newStatus }));
    dispatch(getSettings({}));
  };

  return (
    <div className="absolute right-[10em] top-[6em] w-[22rem] bg-white shadow-xl rounded-xl border scrollbar-hide border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold">Recent Activity</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-[500]">Activity Status</p>

          <div className="flex items-center gap-2">
            {updateLoader ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Button isToggle isOn={isOn} onClick={handleToggle} />
            )}
          </div>
        </div>
      </div>
      {/* Activity Content */}
      <div className="max-h-[75vh] overflow-y-auto scrollbar-hide p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
        ) : recentActivity?.length > 0 ? (
          recentActivity.map((item, i) => (
            <div key={item?._id || i} className="space-y-2">
              <div className="text-sm text-gray-600 underline cursor-pointer">
                You have {item?.action} on this post.
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                {/* your existing content */}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-400 py-10">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityPopup;
