import { useDispatch, useSelector } from "react-redux";
import { fetchProfileNotifications, updateProfileNotifications } from "../../../redux/slices/profileSetting.slice";
import Button from "../../common/Button";
import { useEffect } from "react";

// Skeleton Loader component
const SkeletonLoader = () => (
  <div className="space-y-5 w-[500px]">
    {[...Array(10)].map((_, index) => (
      <div key={index} className="flex items-center justify-between animate-pulse">
        <div className="bg-gray-300 w-2/4 h-6 rounded-md" />
        <div className="bg-gray-300 w-12 h-6 rounded-md" />
      </div>
    ))}
  </div>
);

export default function Notifications() {
  const dispatch = useDispatch();

  // Fetch notification settings from Redux store
  const { notificationSettings, isLoading, error } = useSelector(
    (state) => state.profileSetting
  );

  useEffect(() => {
    dispatch(fetchProfileNotifications());
  }, [dispatch]);

  // Handle loading or error states
  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>{error}</div>;
  if (!notificationSettings) return <div>No notification settings found</div>;

  // Map API response fields to readable labels
  const notificationLabels = {
    accountAndSystemNotification: "Account & System Notifications",
    activityStatus: "Activity Status",
    contentAndTopicNotification: "Content & Topic Notifications",
    engagementNotification: "Engagement Notifications",
    groupNotification: "Group Notifications",
    isGroupInviteOpen: "Group Invites",
    isMessagingOpen: "Messaging Notifications",
    liveAndInteractiveNotification: "Live & Interactive Notifications",
    messageNotification: "Message Notifications",
    postNotification: "Post Notifications",
  };


const handleToggle = (key) => {
  // Remove non-allowed fields like '_id', 'createdAt', 'updatedAt', and '__v'
  const { _id, createdAt, updatedAt, __v, user, ...settingsWithoutInvalidFields } = notificationSettings;

  // Only update the specific field that is toggled
  const updatedSettings = {
    ...settingsWithoutInvalidFields,
    [key]: false, // Set the toggled notification to false
  };

  // Dispatch action to update notification setting
  dispatch(updateProfileNotifications(updatedSettings));
};



  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">Notifications</h1>
      <div className="space-y-5 w-[500px]">
        {Object.entries(notificationLabels).map(([key, label]) => {
          const value = notificationSettings[key];
          
          // Skip fields that aren't boolean
          if (typeof value !== "boolean") return null;

          return (
            <div key={key} className="flex items-center justify-between">
              <p className="text-[16px] font-[500]">{label}</p>
              <Button
                isToggle={true}
                isOn={value}
                onClick={() => handleToggle(key)} // Call handleToggle on button click
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
