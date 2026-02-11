import React, { useEffect, useMemo, useState } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { createStory } from "../../redux/slices/posts.slice";
import { SuccessToast, ErrorToast } from "./Toaster";

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

  // Normalize media (images + videos) from either post.media or post.postimage
  const allMedia = useMemo(() => {
    if (!post) return [];

    if (Array.isArray(post.media) && post.media.length > 0) {
      return post.media
        .filter((m) => m?.fileUrl)
        .map((m) => ({
          url: m.fileUrl,
          type: m.type || (m.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"),
        }));
    }

    if (Array.isArray(post.postimage) && post.postimage.length > 0) {
      return post.postimage
        .filter(Boolean)
        .map((url) => ({
          url,
          type: url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
        }));
    }

    return [];
  }, [post]);

  const hasMedia = allMedia.length > 0;
  const hasMultipleMedia = allMedia.length > 1;
  const currentMedia = hasMedia ? allMedia[currentMediaIndex] : null;

  // Filter pages based on search
  const filteredPages = myPages?.filter((page) =>
    page.name?.toLowerCase().includes(searchQuery.toLowerCase())
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

      const text =
        post.bodyText ||
        post.text ||
        "";

      formData.append("text", text);

      // Author info (optional but useful)
      if (post.author?._id) formData.append("authorId", post.author._id);
      if (post.author?.name) formData.append("authorName", post.author.name);
      if (post.author?.username) {
        formData.append("authorUsername", post.author.username);
      }
      if (post.author?.profilePicture) {
        formData.append("authorAvatar", post.author.profilePicture);
      }

      // Media URLs (images/videos) - send all
      let mediaIndex = 0;
      allMedia.forEach((m, index) => {
        if (m.url) {
          formData.append(`mediaUrls[${index}]`, m.url);
          formData.append(`mediaTypes[${index}]`, m.type);
          mediaIndex += 1;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[460px] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3 bg-gradient-to-r from-orange-50 to-white">
          <h2 className="text-[17px] font-semibold text-gray-900">
            {step === 1 ? "Select your topic page" : "Share to your Story"}
          </h2>
          <button
            onClick={() => onClose("")}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {step === 1 && (
          <>
            {/* Small Post Preview */}
            {post && (
              <div className="px-4 py-3 border-b bg-gray-50/80">
                <p className="text-xs text-gray-600 mb-2">Post Preview:</p>
                <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={post.author?.profilePicture}
                      alt={post.author?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {post.author?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{post.author?.username}
                      </p>
                    </div>
                  </div>
                  {(post.bodyText || post.text) && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {post.bodyText || post.text}
                    </p>
                  )}
                  {hasMedia && (
                    <div className="rounded-xl overflow-hidden bg-black/5">
                      {currentMedia?.type === "video" ? (
                        <video
                          src={currentMedia.url}
                          className="w-full h-36 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={currentMedia.url}
                          alt="Post"
                          className="w-full h-36 object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search pages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Pages List with Radio Buttons */}
            <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
              {filteredPages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pages found
                </div>
              ) : (
                filteredPages.map((page) => (
                  <div
                    key={page._id}
                    onClick={() => setSelectedPage(page._id)}
                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={page.image || "https://via.placeholder.com/40"}
                        alt={page.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{page.name}</span>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPage === page._id
                          ? "border-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPage === page._id && (
                        <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer - Next */}
            <div className="p-4 border-t bg-white">
              <button
                onClick={() => {
                  if (!selectedPage) {
                    ErrorToast("Please select a topic page");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedPage}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Full Post Preview */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/60">
              {post && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={post.author?.profilePicture}
                      alt={post.author?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {post.author?.name}
                      </p>
                      <p className="text-xs text-gray-500">
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
                  {hasMedia && (
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
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
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
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
                  )}
                </div>
              )}
            </div>

            {/* Footer - Back / Share */}
            <div className="p-4 border-t bg-white flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-full font-medium hover:bg-gray-50"
                disabled={isPosting}
              >
                Back
              </button>
              <button
                onClick={handlePostStory}
                disabled={isPosting}
                className="flex-1 bg-orange-600 text-white py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </>
        )}
      </div>
    </div>
  );
};

export default PostStoryModal;
