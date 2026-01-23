import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../common/Button";
import {
  fetchProfileNotifications,
  updateProfileNotifications,
} from "../../../redux/slices/profileSetting.slice";

// Optional: simple skeleton loader (similar style to Notifications)
const SkeletonLoader = () => (
  <div className="space-y-5 w-[500px]">
    {[...Array(2)].map((_, index) => (
      <div
        key={index}
        className="flex items-center justify-between animate-pulse"
      >
        <div className="bg-gray-300 w-2/4 h-6 rounded-md" />
        <div className="bg-gray-300 w-12 h-6 rounded-md" />
      </div>
    ))}
  </div>
);

export default function PrivacySettings() {
  const dispatch = useDispatch();

  const { notificationSettings, isLoading, error } = useSelector(
    (state) => state.profileSetting
  );

  useEffect(() => {
    dispatch(fetchProfileNotifications());
  }, [dispatch]);

  const handleToggle = (key) => {
    if (!notificationSettings) return;

    const {
      _id,
      createdAt,
      updatedAt,
      __v,
      user,
      ...settingsWithoutInvalidFields
    } = notificationSettings;

    const updatedSettings = {
      ...settingsWithoutInvalidFields,
      [key]: !notificationSettings[key],
    };

    dispatch(updateProfileNotifications(updatedSettings));
  };

  // Loading / error states
  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>{error}</div>;
  if (!notificationSettings)
    return <div>No privacy settings found</div>;

  const { isMessagingOpen, isGroupInviteOpen } = notificationSettings;

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Privacy Settings
      </h1>
      <div className="space-y-2">
        <p className="text-[16px] font-[500]  text-[#000000]">
          Control Who Can Connect with You
        </p>
        <p className="text-[14px] font-[400]  text-[#181818]">
          Manage your messaging preferences and decide who can reach out to
          you. <br /> You can update these settings anytime to customize your
          privacy.
        </p>
      </div>
      <div className="space-y-5 w-[500px]">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-[500]">
            Allow anyone to message me
          </p>
          <Button
            isToggle={true}
            isOn={!!isMessagingOpen}
            onClick={() => handleToggle("isMessagingOpen")}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[16px] font-[500]">
            Allow anyone to add me to group chats
          </p>
          <Button
            isToggle={true}
            isOn={!!isGroupInviteOpen}
            onClick={() => handleToggle("isGroupInviteOpen")}
          />
        </div>
      </div>
    </div>
  );
}