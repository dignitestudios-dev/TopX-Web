import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  AlertTriangle,
  X,
} from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, likePost } from "../../redux/slices/posts.slice";
import { timeAgo } from "../../lib/helpers";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import ReportModal from "./ReportModal";
import { sendReport } from "../../redux/slices/reports.slice";
import { useNavigate } from "react-router";
import PrivatePostModal from "./PrivatePostModal";
import { IoWarning } from "react-icons/io5";
import DeletePostModal from "./DeletePostModal";

export default function CollectionFeedPostCard({
  post,
  author,
  likedCount,
  commentCount,
  shareCount,
  toggleLike,
  isPostId,
  fullPost,
  text,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, allUserData } = useSelector((state) => state.auth);
  const { isLoading: postsUpdating } = useSelector((state) => state.posts);
  const currentUserId = user?._id || allUserData?._id;
  const [isPrivatePost, setIsPrivatePost] = useState(false);
  const isUnderReview = Boolean(fullPost?.isReported);

  //  Edit / delete Post Stats

  const [existingMedia, setExistingMedia] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [editFiles, setEditFiles] = useState([]);
  const [editFilePreviews, setEditFilePreviews] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleAuthorClick = () => {
    if (!author) return;
    navigate("/other-profile", {
      state: { id: author },
    });
  };

  // Get initial like state from fullPost or props
  const getInitialLikeState = () => {
    const postId = fullPost?._id || isPostId;

    // Check localStorage first (for optimistic updates)
    const localLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    const cachedLike = localLikes[postId];

    if (cachedLike) {
      return {
        isLiked: cachedLike.isLiked || false,
        likesCount: cachedLike.likesCount || 0,
      };
    }

    if (fullPost) {
      // Check if current user is in userLikes array
      const baseIsLiked = currentUserId
        ? fullPost.userLikes?.includes(currentUserId) || false
        : fullPost.isLiked || false;

      return {
        isLiked: baseIsLiked,
        likesCount: fullPost.likesCount || likedCount || 0,
      };
    }
    return {
      isLiked: false,
      likesCount: likedCount || 0,
    };
  };

  const [localLikeState, setLocalLikeState] = useState(getInitialLikeState());

  // Update local state when fullPost changes
  useEffect(() => {
    const newState = getInitialLikeState();
    setLocalLikeState(newState);
  }, [
    fullPost?._id,
    fullPost?.userLikes,
    fullPost?.likesCount,
    likedCount,
    currentUserId,
  ]);

  const handleLikeClick = async () => {
    const postId = fullPost?._id || isPostId;
    if (!postId) {
      console.error("Post ID not found", { fullPost, isPostId });
      return;
    }

    const currentIsLiked = localLikeState.isLiked;
    const currentLikesCount = localLikeState.likesCount || 0;
    const newIsLiked = !currentIsLiked;
    const newLikesCount = newIsLiked
      ? currentLikesCount + 1
      : Math.max(currentLikesCount - 1, 0);

    console.log(
      "🔵 Like clicked - Post ID:",
      postId,
      "New Like Status:",
      newIsLiked,
    );

    // Optimistic update - update UI immediately
    setLocalLikeState({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    });

    // Call parent toggleLike callback if provided
    if (toggleLike && typeof toggleLike === "function") {
      toggleLike(postId);
    }

    // Save to localStorage for persistence
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = {
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Call API - Same as PostCard/Mypost.jsx
    try {
      console.log("🔵 Dispatching likePost API:", {
        id: postId,
        likeToggle: newIsLiked,
        isPost: true,
      });
      const result = await dispatch(
        likePost({
          id: postId,
          likeToggle: newIsLiked,
          isPost: true,
        }),
      ).unwrap();

      console.log("✅ Like API success:", result);

      // Update with API response - check result.data structure
      if (result?.data) {
        const apiData = result.data;
        setLocalLikeState({
          isLiked: apiData.likeToggle ?? newIsLiked,
          likesCount: apiData.likesCount ?? newLikesCount,
        });
      } else {
        // If response structure is different, keep optimistic update
        setLocalLikeState({
          isLiked: newIsLiked,
          likesCount: newLikesCount,
        });
      }
    } catch (error) {
      // If API call failed, revert optimistic update
      console.error("❌ Like API failed:", error);
      setLocalLikeState({
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      });
    }
  };

  const [selectedOption, setSelectedOption] = useState("");
  const [reportmodal, setReportmodal] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );
  const [sharepost, setSharepost] = useState(false);
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];

  // Close dropdown on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render image or video
  const renderMedia = (mediaItem) => {
    if (mediaItem.type === "image") {
      return (
        <img
          src={mediaItem.fileUrl}
          alt="post"
          className="w-full h-auto rounded-2xl object-cover max-h-96"
        />
      );
    } else if (mediaItem.type === "video") {
      return (
        <video
          controls
          className="w-full h-auto rounded-2xl object-cover max-h-96"
          src={mediaItem.fileUrl}
        />
      );
    }
    return null; // Return null if neither image nor video
  };

  const handleDeletePost = async (postId) => {
    if (!postId) return;
    setDeleteLoadingId(postId);
    try {
      await dispatch(deletePost({ postId })).unwrap();
      if (pageId) {
        await dispatch(
          getPostsByPageId({ pageId: pageId, page: 1, limit: 100 }),
        ).unwrap();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditText(post.bodyText || "");
    setEditFiles([]);
    setEditFilePreviews([]);
    setExistingMedia(post.media || []); // 👈 important
    setEditModalOpen(true);
  };

  const removeExistingMedia = (id) => {
    setExistingMedia((prev) => prev.filter((m) => m._id !== id));
  };

  const handleEditFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEditFiles((prev) => [...prev, ...files]); // 👈 merge

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setEditFilePreviews((prev) => [...prev, ...previews]);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeEditFile = (index) => {
    const newFiles = editFiles.filter((_, i) => i !== index);
    const newPreviews = editFilePreviews.filter((_, i) => i !== index);
    setEditFiles(newFiles);
    setEditFilePreviews(newPreviews);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditSave = async () => {
    if (!editingPost) return;

    try {
      setEditSaving(true);

      const formData = new FormData();
      formData.append("bodyText", editText || "");

      // new files
      if (editFiles.length > 0) {
        editFiles.forEach((file) => {
          formData.append("media", file);
        });
      } else {
        formData.append("media", "");
      }

      // existing media (remaining only)
      existingMedia.forEach((m) => {
        formData.append("existingMedia[]", JSON.stringify(m));
      });

      await dispatch(
        editPost({ postId: editingPost._id, formData, isFormData: true }),
      ).unwrap();

      if (pageId) {
        await dispatch(
          getPostsByPageId({ pageId, page: 1, limit: 100 }),
        ).unwrap();
      }

      setEditModalOpen(false);
      setEditingPost(null);
      setEditFiles([]);
      setEditFilePreviews([]);
      setExistingMedia([]);
    } catch (err) {
      console.error(err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteModal = async () => {
    await dispatch(deletePost({ postId: selectedPost })).unwrap();
    setDeleteModal(false);
    if (pageId) {
      await dispatch(
        getPostsByPageId({ pageId: pageId, page: 1, limit: 100 }),
      ).unwrap();
    }
  };
  console.log(fullPost, "sharedRepost");
  return (
    <div className="bg-white relative rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Page Image with Author Image Overlay */}
          <div className="relative">
            {fullPost?.page?.image ? (
              <img
                src={fullPost.page.image}
                alt={fullPost.page.name || "Page"}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
            ) : (
              <div className="w-10 h-10 bg-amber-800 text-white flex justify-center items-center rounded-full capitalize">
                {fullPost?.page?.name
                  ? fullPost.page.name.split(" ").length > 1
                    ? fullPost.page.name.split(" ")[0][0] +
                      fullPost.page.name.split(" ")[1][0]
                    : fullPost.page.name.charAt(0)
                  : "P"}
              </div>
            )}
            {author?.profilePicture && (
              <img
                src={author.profilePicture}
                alt={author.name || author.username}
                onClick={handleAuthorClick}
                className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover border-2 border-white cursor-pointer hover:opacity-80 transition"
              />
            )}
          </div>

          <div>
            <h3
              onClick={handleAuthorClick}
              className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
            >
              {fullPost?.page?.name}
            </h3>
            <p
              onClick={handleAuthorClick}
              className="text-xs text-gray-500 cursor-pointer hover:text-orange-600 transition-colors"
            >
              @{author.username} ·{" "}
              {fullPost?.createdAt ? timeAgo(fullPost.createdAt) : ""}
            </p>
          </div>
        </div>
        <div className="relative pb-10" ref={dropdownRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="p-2 hover:bg-gray-50 rounded-full transition"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
              {user?._id == author._id && !fullPost.isShare ? (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      openEditModal(fullPost);
                    }}
                  >
                    Edit Post
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={deleteLoadingId === fullPost._id}
                    onClick={() => {
                      handleDeletePost(fullPost._id);
                    }}
                  >
                    {deleteLoadingId === fullPost._id
                      ? "Deleting..."
                      : "Delete Post"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    setReportmodal(!reportmodal);
                    console.log("Report clicked");
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Post Media - Render Image or Video */}
      {post && post.length > 0 && (
        <div
          className="w-full bg-white overflow-hidden p-4 cursor-pointer hover:opacity-90 transition relative"
          onClick={() => {
            setImageViewerOpen(true);
          }}
        >
          {renderMedia(post[0])}
        </div>
      )}

      {/* Content */}
      {(text || fullPost?.bodyText) && (
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {text || fullPost?.bodyText}
          </p>
        </div>
      )}
      {fullPost?.sharedBy ? (
        <div className="text-sm flex gap-4 ml-4 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 w-[14em]">
          {fullPost?.profilePicture ? (
            <img
              src={fullPost.sharedBy.profilePicture}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 object-cover text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
              {fullPost.sharedBy.name.split(" ")[0][0]}
            </div>
          )}
          {/* <img
            src={post.sharedBy.profilePicture}
            className="w-7 h-7 rounded-full object-cover"
          /> */}
          {fullPost?.sharedBy?.name} Reposted
        </div>
      ) : null}
      {fullPost?.page?.pageType == "private" && (
        <div className="flex items-center absolute inset-1 justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center px-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <p
              onClick={() => {
                setIsPrivatePost(!isPrivatePost);
              }}
              className="text-base cursor-pointer  font-semibold text-orange-500"
            >
              Private post
            </p>
          </div>
        </div>
      )}
      <div className="px-4 py-3">
        {!isUnderReview ? (
          <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
        ) : (
          <div className="items-center gap-2 text-sm text-orange-600 p-10">
            <div className="flex justify-center">
              <IoWarning size={70} />
            </div>
            <div className="flex justify-center mt-3">
              <p className="leading-relaxed w-[11em] text-center p-1 rounded-full bg-orange-600 text-white">
                Post Under Review
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Stats - Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLikeClick();
          }}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition cursor-pointer"
        >
          <Heart
            className={`w-5 h-5 transition ${
              localLikeState.isLiked
                ? "fill-orange-500 text-orange-500"
                : "text-gray-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              localLikeState.isLiked ? "text-orange-500" : "text-gray-600"
            }`}
          >
            {localLikeState.likesCount}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>

        <button
          onClick={() => setSharepost(true)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{shareCount}</span>
        </button>
      </div>

      {isPrivatePost && (
        <PrivatePostModal
          post={fullPost}
          onClose={() => setIsPrivatePost(!isPrivatePost)}
        />
      )}
      {/* Image Viewer Modal */}
      <PostImageViewerModal
        post={post}
        author={author}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />
      {sharepost && (
        <SharePostModal
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          setSharepost={setSharepost}
          options={options}
        />
      )}

      {(selectedOption === "Share in Individuals Chats" ||
        selectedOption === "Share in Group Chats") && (
        <ShareToChatsModal onClose={setSelectedOption} />
      )}

      {selectedOption === "Share to your Story" && (
        <PostStoryModal onClose={setSelectedOption} />
      )}
      {selectedOption === "Share with Topic Page" && (
        <ShareRepostModal postId={fullPost._id} onClose={setSelectedOption} />
      )}

      <ReportModal
        isOpen={reportmodal}
        onClose={() => setReportmodal(false)}
        loading={reportLoading}
        onSubmit={(reason) => {
          dispatch(
            sendReport({
              reason,
              targetModel: "Post",
              targetId: fullPost._id,
              isReported: true,
            }),
          );
        }}
      />
      {/* Comments Section */}
      {commentsOpen && <CommentsSection postId={isPostId} />}

      {/* Delete Modal */}
      {deleteModal && (
        <DeletePostModal
          onClose={() => setDeleteModal(false)}
          onConfirm={() => handleDeleteModal()}
          isLoading={postsUpdating}
        />
      )}

      {/* Edit Post Modal */}
      {editModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Post</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text
                </label>
                <textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Write your post text..."
                />
              </div>

              {/* Existing media preview - Clickable (only when no new media selected) */}
              {existingMedia.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Media
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {existingMedia.map((m) => (
                      <div
                        key={m._id}
                        className="relative w-full overflow-hidden rounded-lg border"
                      >
                        {m.type === "image" ? (
                          <img
                            src={m.fileUrl}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <video
                            src={m.fileUrl}
                            className="w-full h-32 object-cover"
                            controls
                          />
                        )}

                        {/* ❌ remove button */}
                        <button
                          onClick={() => removeExistingMedia(m._id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleEditFilesChange}
                className="hidden"
              />

              {/* New file previews */}
              {editFilePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Media (Selected)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {editFilePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                      >
                        {preview.type === "image" ? (
                          <img
                            src={preview.preview}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <video
                            src={preview.preview}
                            className="w-full h-32 object-cover"
                            controls
                          />
                        )}
                        <button
                          onClick={() => removeEditFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add more media button */}
              <div>
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  {editFilePreviews.length > 0
                    ? "+ Add More Media"
                    : "+ Add Media (Optional)"}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  {editFilePreviews.length > 0
                    ? "New media will replace existing media. Click existing images above to replace them."
                    : "Click existing images above or this button to add/replace media. Leave empty to keep existing media."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  // Clean up preview URLs
                  editFilePreviews.forEach((preview) => {
                    URL.revokeObjectURL(preview.preview);
                  });
                  setEditModalOpen(false);
                  setEditingPost(null);
                  setEditFiles([]);
                  setEditFilePreviews([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
