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

const presetBackgrounds = [
  { id: 1, name: "bg_blue", imagePath: "/bg_blue.jpg" },
  { id: 2, name: "bg_orange_gradient", imagePath: "/bg_orange_gradient.jpg" },
  { id: 3, name: "bg_red_gradient", imagePath: "/bg_red_gradient.png" },
  { id: 4, name: "bg_green", imagePath: "/bg_green.png" },
  { id: 5, name: "bg_multicolor", imagePath: "/bg_multicolor.png" },
];

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
const Avatar = ({ page }) => {
  const [imgError, setImgError] = React.useState(false);

  const firstLetter = page?.name?.charAt(0)?.toUpperCase();

  if (!page?.image || imgError) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
        {firstLetter || "?"}
      </div>
    );
  }

  return (
    <img
      src={page.image}
      alt={page.name}
      className="w-10 h-10 rounded-full object-cover bg-gray-200"
      onError={() => setImgError(true)}
    />
  );
};

const RecentActivityPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const { recentActivity, isLoading, settings, updateLoader } = useSelector(
    (state) => state?.profileSetting,
  );

  // ✅ Local optimistic state
  const [localStatus, setLocalStatus] = useState(null);

  useEffect(() => {
    dispatch(getSettings({}));
    dispatch(getRecentActivity({}));
  }, [dispatch]);

  // ✅ Sync local state with redux
  useEffect(() => {
    if (settings?.activityStatus) {
      setLocalStatus(settings.activityStatus);
    }
  }, [settings?.activityStatus]);

  const isOn =
    localStatus !== null
      ? localStatus === "on"
      : settings?.activityStatus === "on";

  const handleToggle = () => {
    const newStatus = isOn ? "off" : "on";

    // Optimistic UI update
    setLocalStatus(newStatus);

    dispatch(updateActivityStatus({ activityStatus: newStatus }));
  };
  console.log(recentActivity, "isOn");

  return (
    <div className="absolute right-[10em] top-[6em] w-[22rem] bg-white shadow-xl rounded-xl border scrollbar-hide border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold">Recent Post Engagments</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-[500]">
            Turn ON Recent Post Engagments
          </p>

          {updateLoader ? (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Button isToggle isOn={isOn} onClick={handleToggle} />
          )}
        </div>
      </div>

      {/* Activity Content */}
      <div className="max-h-[75vh] overflow-y-auto scrollbar-hide p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <ActivitySkeleton key={i} />)
        ) : recentActivity?.length > 0 && isOn ? (
          recentActivity.map((item, i) => {
            const actor = item?.actor || {};
            const post = item?.post;
            const kp = item?.knowledgePost;
            const comment = item?.comment;
            const media =
              post?.media && post.media.length > 0 ? post.media[0] : null;

            const targetType = post
              ? "post"
              : kp
                ? "knowledge post"
                : "activity";

            const actionText =
              item?.action === "like"
                ? `liked a ${targetType}`
                : item?.action === "comment"
                  ? `commented on a ${targetType}`
                  : `performed ${item?.action} on a ${targetType}`;

            const page = post?.page || kp?.page || null;
            const bodyText = post?.bodyText || "";

            const kpPresetBg = kp?.backgroundCode
              ? presetBackgrounds.find((bg) => bg.name === kp.backgroundCode)
              : null;

            const kpBackgroundImage = kp?.background
              ? `url(${kp.background})`
              : kpPresetBg
                ? `url(${kpPresetBg.imagePath})`
                : null;
            console.log(post, "knowledgePost");
            return (
              <div key={item?._id || i} className="space-y-2">
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>
                    You {actionText}
                    {page?.name ? ` in "${page.name}"` : ""}.
                  </span>
                  <span className="text-nowrap">
                    {timeAgo(item?.createdAt)}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {/* Post Author Info */}
                  {post?.author && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                      <Avatar page={page} />

                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">
                          {page?.name}
                        </p>
                        {page && (
                          <div className="flex items-center gap-1 mt-0.5 -ml-[20px]">
                            {post?.author?.profilePicture ? (
                              <img
                                src={post.author.profilePicture}
                                alt={post.author.name}
                                className="w-4 h-4 rounded-full object-cover bg-gray-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-semibold text-gray-700">
                                {post?.author?.name?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </div>
                            )}

                            <p className="text-xs text-gray-500">
                              {post?.author?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Knowledge Post */}
                  {kp && (
                    <div className="mb-2">
                      {kpBackgroundImage && (
                        <div
                          className="rounded-lg overflow-hidden min-h-[120px] flex items-center justify-center p-4 relative mb-2"
                          style={{
                            backgroundImage: kpBackgroundImage,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-black/5 rounded-lg"></div>
                          {kp.textOnImage && (
                            <p className="text-center relative z-10 text-white font-medium leading-relaxed drop-shadow-lg">
                              {kp.textOnImage}
                            </p>
                          )}
                        </div>
                      )}
                      {kp.text && !kp.textOnImage && (
                        <p className="text-sm text-gray-700 mb-2">{kp.text}</p>
                      )}
                    </div>
                  )}

                  {/* Post Body Text */}
                  {bodyText && (
                    <p className="text-sm text-gray-700 mb-2">{bodyText}</p>
                  )}

                  {/* Post Media */}
                  {post?.media && post.media.length > 0 && (
                    <div className="mb-2">
                      {post.media[0].type === "image" ? (
                        <img
                          src={post.media[0].fileUrl}
                          alt="Post media"
                          className="w-full rounded-lg object-cover max-h-48"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : post.media[0].type === "video" ? (
                        <video
                          src={post.media[0].fileUrl}
                          controls
                          className="w-full rounded-lg max-h-48"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={post.media[0].fileUrl || post.media[0]}
                          alt="Post media"
                          className="w-full rounded-lg object-cover max-h-48"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Comment Text */}
                  {comment?.text && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Comment:</p>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                        {comment.text}
                      </p>
                    </div>
                  )}

                  {item?.action == "share" ? (
                    <div className="text-sm flex gap-4 ml-3 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 mb-2 w-[14em]">
                      {actor?.profilePicture ? (
                        <img
                          src={actor?.profilePicture}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 object-cover text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
                          {actor?.name.split(" ")[0][0]}
                        </div>
                      )}
                      {/* <img
            src={post.sharedBy.profilePicture}
            className="w-7 h-7 rounded-full object-cover"
          /> */}
                      {actor?.name} Reposted
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-sm text-gray-400 py-10">
            No Recent Post Engagments
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityPopup;
