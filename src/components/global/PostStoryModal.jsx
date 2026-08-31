import React, { useEffect, useMemo, useState } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { createStory } from "../../redux/slices/posts.slice";
import { SuccessToast, ErrorToast } from "./Toaster";
import { getLinkPreview } from "../../lib/helpers";
import LinkPreviewCard from "./LinkPreviewCard";

const PostStoryModal = ({ onClose, post }) => {
  const [selectedPage, setSelectedPage] = useState(null); // Single page selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [step, setStep] = useState(1); // 1 = select page, 2 = preview + share
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const dispatch = useDispatch();
  const { myPages } = useSelector((state) => state?.pages);

  useEffect(() => {
    dispatch(fetchMyPages({}));
  }, []);

  // Normalize media (images + videos) from post.media, post.postimage, or post.image/imageUrl
  const allMedia = useMemo(() => {
    if (!post) return [];

    // Case 1: post.media (new structure)
    if (Array.isArray(post.media) && post.media.length > 0) {
      return post.media
        .filter((m) => m?.fileUrl || m?.url || (typeof m === "string" && m))
        .map((m) => {
          if (typeof m === "string") {
            return {
              url: m,
              type: m.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
            };
          }
          const url = m.fileUrl || m.url;
          return {
            url,
            type:
              m.type ||
              (typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i)
                ? "video"
                : "image"),
          };
        });
    }

    // Case 2: post.postimage (old structure)
    if (Array.isArray(post.postimage) && post.postimage.length > 0) {
      return post.postimage
        .filter(Boolean)
        .map((item) => {
          if (typeof item === "string") {
            return {
              url: item,
              type: item.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
            };
          }

          if (typeof item === "object") {
            const url = item.fileUrl || item.url;
            return {
              url,
              type:
                item.type ||
                (typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
            };
          }

          return null;
        })
        .filter(Boolean);
    }

    // Case 3: post.mediaUrls
    if (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0) {
      return post.mediaUrls
        .filter(Boolean)
        .map((url) => ({
          url,
          type: typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
        }));
    }

    // Case 4: single image or video string field
    const singleMediaUrl = post.fileUrl || post.image || post.imageUrl || post.video || post.videoUrl;
    if (typeof singleMediaUrl === "string" && singleMediaUrl.trim()) {
      return [{
        url: singleMediaUrl,
        type: singleMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
      }];
    }

    return [];
  }, [post]);

  const hasMedia = allMedia.length > 0;
  const hasMultipleMedia = allMedia.length > 1;
  const currentMedia = hasMedia ? allMedia[currentMediaIndex] : null;

  // Extract link preview if post contains a link
  const linkData = useMemo(() => {
    if (!post) return null;
    const text =
      post.bodyText ||
      post.text ||
      post.link ||
      post.linkUrl ||
      post.originalPost?.bodyText ||
      post.originalPost?.text ||
      post.originalPost?.link ||
      post.originalPost?.linkUrl ||
      "";
    return getLinkPreview(text);
  }, [post]);

  // Filter pages based on search
  const filteredPages =
    myPages?.filter((page) =>
      page.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handlePostStory = async () => {
    if (!selectedPage) {
      ErrorToast("Please select a topic page");
      return;
    }

    if (!post) {
      ErrorToast("Post data not found");
      return;
    }

    try {
      setIsPosting(true);

      // Build structured payload for createStory API
      const formData = new FormData();

      // Selected page
      formData.append("pages[0]", selectedPage);

      // Basic post info
      const postId = post._id || post.id;
      if (postId) formData.append("postId", postId);

      const text = post.bodyText || post.text || "";
      formData.append("text", text);

      // Author info (optional but useful)
      // if (post.author?._id) formData.append("authorId", post.author._id);
      // if (post.author?.name) formData.append("authorName", post.author.name);
      // if (post.author?.username) {
      //   formData.append("authorUsername", post.author.username);
      // }
      // if (post.author?.profilePicture) {
      //   formData.append("authorAvatar", post.author.profilePicture);
      // }

      // Media URLs (images/videos) - send all
      allMedia.forEach((m, index) => {
        if (m.url) {
          formData.append(`mediaUrls[${index}]`, m.url);
          formData.append(`mediaTypes[${index}]`, m.type);

        }
      });

      await dispatch(createStory(formData)).unwrap();

      SuccessToast("Story posted successfully!");
      onClose("");
    } catch (err) {
      console.error("Story creation failed", err);
      const message =
        (typeof err === "string" && err) ||
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to post story";
      ErrorToast(message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[480px] h-[640px] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-gray-900 truncate pr-2">
            {step === 1
              ? "Select Page to Share on Story"
              : "Share to your Story"}
          </h2>
          <button
            onClick={() => onClose("")}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Compact Post Preview */}
            {post && (
              <div className="px-4 py-2.5 border-b bg-gray-50 flex-shrink-0">
                <div className="bg-white rounded-xl p-2.5 border border-gray-200 shadow-xs flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    {post.author?.profilePicture ? (
                      <img
                        src={post.author.profilePicture}
                        alt={post.author?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-[10px]">
                        {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {post.author?.name}
                        <span className="text-[11px] font-normal text-gray-500 ml-1.5">
                          @{post.author?.username}
                        </span>
                      </p>
                    </div>
                  </div>

                  {(post.bodyText || post.text) && (
                    <p className="text-xs text-gray-700 line-clamp-1">
                      {post.bodyText || post.text}
                    </p>
                  )}

                  {/* Compact Media / Link representation in Step 1 */}
                  {hasMedia ? (
                    <div className="rounded-lg overflow-hidden bg-black/5 h-16 w-full flex items-center justify-center">
                      {currentMedia?.type === "video" ? (
                        <video
                          src={currentMedia.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={currentMedia.url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ) : linkData ? (
                    <div className="flex items-center gap-2.5 p-1.5 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      {(linkData.thumbnail || `https://icon.horse/icon/${linkData.domain}`) && (
                        <img
                          src={linkData.thumbnail || `https://icon.horse/icon/${linkData.domain}`}
                          alt="Link thumbnail"
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0 bg-gray-200"
                          onError={(e) => {
                            e.target.src = `https://icon.horse/icon/${linkData.domain}`;
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {linkData.domain}
                        </p>
                        <p className="text-[11px] text-orange-600 truncate">
                          {linkData.url}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search your pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Pages List with Selection Radio */}
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2 min-h-0">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Your Pages ({filteredPages.length})
              </p>
              {filteredPages.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No pages found
                </div>
              ) : (
                filteredPages.map((page) => (
                  <div
                    key={page._id}
                    onClick={() => setSelectedPage(page._id)}
                    className={`flex items-center justify-between p-2.5 cursor-pointer rounded-xl border transition-all ${
                      selectedPage === page._id
                        ? "border-orange-500 bg-orange-50/60 shadow-xs"
                        : "border-gray-100 hover:bg-gray-50 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {page?.image ? (
                        <img
                          src={page.image}
                          alt={page.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-gray-100"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: page?.image ? "none" : "flex" }}
                        className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 items-center justify-center text-white font-bold text-xs flex-shrink-0 select-none"
                      >
                        {page?.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {page.name}
                        </span>
                        {(page.ownerName || page.topic) && (
                          <span className="text-xs text-gray-500 truncate">
                            {page.ownerName ? `by ${page.ownerName}` : page.topic}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 transition-all ${
                        selectedPage === page._id
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPage === page._id && (
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer - Next */}
            <div className="p-4 border-t bg-white flex-shrink-0">
              <button
                onClick={() => {
                  if (!selectedPage) {
                    ErrorToast("Please select a topic page");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                disabled={!selectedPage}
              >
                Continue to Preview
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Full Post Preview */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/60 min-h-0">
              {post && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {post.author?.profilePicture ? (
                      <img
                        src={post.author.profilePicture}
                        alt={post.author?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                        {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold">
                        {post.author?.name}
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        @{post.author?.username}
                      </p>
                    </div>
                  </div>

                  {(post.bodyText || post.text) && (
                    <p className="text-sm text-gray-800 mb-4 whitespace-pre-line">
                      {post.bodyText || post.text}
                    </p>
                  )}

                  {/* Media carousel */}
                  {hasMedia ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black/5">
                      {currentMedia?.type === "video" ? (
                        <video
                          src={currentMedia.url}
                          className="w-full max-h-80 object-cover bg-black"
                          controls
                        />
                      ) : (
                        <img
                          src={currentMedia.url}
                          alt={`Post media ${currentMediaIndex + 1}`}
                          className="w-full max-h-80 object-cover"
                        />
                      )}

                      {/* Arrows */}
                      {hasMultipleMedia && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentMediaIndex((prev) =>
                                prev === 0 ? allMedia.length - 1 : prev - 1,
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentMediaIndex((prev) =>
                                prev === allMedia.length - 1 ? 0 : prev + 1,
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* Dots */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {allMedia.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentMediaIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${
                                  idx === currentMediaIndex
                                    ? "w-5 bg-white"
                                    : "w-1.5 bg-white/60"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : linkData ? (
                    <div className="mt-2">
                      <LinkPreviewCard linkData={linkData} />
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer - Back / Share */}
            <div className="p-4 border-t bg-white flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                disabled={isPosting}
              >
                Back
              </button>
              <button
                onClick={handlePostStory}
                disabled={isPosting}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                {isPosting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sharing...</span>
                  </>
                ) : (
                  "Share"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostStoryModal;
