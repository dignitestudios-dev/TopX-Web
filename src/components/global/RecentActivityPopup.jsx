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
        <h3 className="text-[16px] font-semibold">Recent Post Engagments</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-[500]">Turn ON Recent Post Engagments</p>

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
          recentActivity.map((item, i) => {
            const actor = item?.actor || {};
            const post = item?.post;
            const kp = item?.knowledgePost;
            const comment = item?.comment;
            const media = post?.media && post.media.length > 0 ? post.media[0] : null;

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

            // Knowledge post background mapping
            const kpPresetBg = kp?.backgroundCode
              ? presetBackgrounds.find(
                  (bg) => bg.name === kp.backgroundCode
                )
              : null;

            const kpBackgroundImage = kp?.background
              ? `url(${kp.background})`
              : kpPresetBg
              ? `url(${kpPresetBg.imagePath})`
              : null;

            return (
              <div key={item?._id || i} className="space-y-2">
                {/* Top line */}
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>
                    You {actionText}
                    {page?.name ? ` in "${page.name}"` : ""}.
                  </span>
                  <span className="ml-2 whitespace-nowrap">
                    {timeAgo(item?.createdAt)}
                  </span>
                </div>

                {/* Card */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {/* Actor row */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={actor?.profilePicture}
                      alt={actor?.name}
                      className="w-9 h-9 rounded-full object-cover bg-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/40?text=User";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {actor?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{actor?.username}
                      </p>
                    </div>
                  </div>

                  {/* Page badge */}
                  {page && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={page?.image}
                        alt={page?.name}
                        className="w-7 h-7 rounded-full object-cover bg-gray-200"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/32?text=P";
                        }}
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        {page?.name}
                      </span>
                    </div>
                  )}

                  {/* Knowledge Post Preview */}
                  {kp ? (
                    <div className="mb-2 rounded-2xl overflow-hidden border border-gray-200">
                      <div
                        className="w-full min-h-[120px] flex items-center justify-center px-4 py-6 text-center bg-gray-900/80 bg-cover bg-center"
                        style={{
                          backgroundImage: kpBackgroundImage || undefined,
                          backgroundColor: kpBackgroundImage
                            ? undefined
                            : "#111827",
                        }}
                      >
                        <p
                          className="text-sm font-medium max-w-full break-words"
                          style={{
                            color: kp.color || "#ffffff",
                            fontWeight: kp.isBold ? 700 : 500,
                            fontStyle: kp.isItalic ? "italic" : "normal",
                            textDecoration: kp.isUnderline
                              ? "underline"
                              : "none",
                            textAlign: kp.textAlignment || "center",
                          }}
                        >
                          {kp.text}
                        </p>
                      </div>
                     
                    </div>
                  ) : (
                    <>
                      {/* Media preview (for normal post) */}
                      {media && media.fileUrl && (() => {
                        // Check if it's a video by type or file extension
                        const isVideo = 
                          media.type === "video" || 
                          /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i.test(media.fileUrl);
                        
                        return (
                          <div className="mb-2">
                            {isVideo ? (
                              <video
                                src={media.fileUrl}
                                controls
                                className="w-full h-40 object-cover rounded-lg bg-black"
                                preload="metadata"
                                playsInline
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img
                                src={media.fileUrl}
                                alt={media.title || "media"}
                                className="w-full h-40 object-cover rounded-lg bg-gray-100"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x160?text=Media";
                                }}
                              />
                            )}
                          </div>
                        );
                      })()}

                      {/* Body / text (for normal post) */}
                      {bodyText && (
                        <p className="text-sm text-gray-800 mb-2 line-clamp-3">
                          {bodyText}
                        </p>
                      )}
                    </>
                  )}

                  {/* Comment text (if any) */}
                  {comment?.text && (
                    <div className="mt-1 px-3 py-2 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-0.5">Your comment</p>
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {comment.text}
                      </p>
                    </div>
                  )}
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
