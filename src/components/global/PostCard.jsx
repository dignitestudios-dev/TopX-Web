import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  SendHorizontal,
  X,
  Pin,
} from "lucide-react";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  likePost,
  getMyPosts,
  getcommentsofpost,
  commentonpost,
  deleteComment,
  deletePost,
  editPost,
} from "../../redux/slices/posts.slice";
import { FaRegTrashCan } from "react-icons/fa6";
import { SuccessToast } from "./Toaster";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import CommentsSection from "./CommentsSection";

const Button = ({ size = "md", variant = "orange", children, onClick }) => {
  const sizeClasses = {
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    orange: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

const PostCard = ({
  post = {
    id: 1,
    user: "Mike's Basketball",
    username: "@mikesmith35",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "5 mins ago",
    postimage:
      "https://images.unsplash.com/photo-1546519638-68711109d298?w=500&h=500&fit=crop",
    tag: "Sports",
    gradient: "from-orange-400 to-orange-600",
    text: "Just finished an amazing basketball session! Feel the energy! 🏀",
    stats: { likes: 234, comments: 45, shares: 12 },
    isLiked: false,
  },
  liked = {},
  toggleLike = () => {},
  activeTab = "feed",
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sharepost, setSharepost] = useState(false);
  const [showpopup, setShowpopup] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState();
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState("");
  //   Edit Post
  const [moreOpenPostId, setMoreOpenPostId] = useState(null);
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
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];

  const { comments, commentsLoading, isLoading } = useSelector(
    (state) => state.posts,
  );

  console.log(comments, "comments");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowpopup(false);
      }
    };

    if (showpopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showpopup]);

  const handleCommentLike = (id) => {
    setCommentLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;

    dispatch(
      commentonpost({
        postId: post._id,
        text: commentInput,
      }),
    ).then(() => {
      dispatch(getcommentsofpost({ postId: post._id }));
    });

    setCommentInput("");
  };

  const isPostLiked = liked[post.id] ?? post.isLiked;
  const images =
    post.postImages && post.postImages.length > 0 ? post.postImages : [];
  const firstImage = images.length > 0 ? images[0] : null;

  const openImageModal = () => {
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const dispatch = useDispatch();
  const { likeLoading } = useSelector((state) => state.posts);

  // ✅ FIXED: Proper like toggle handler
  const handleLikeToggle = async () => {
    if (likeLoading) return; // Prevent multiple clicks while loading

    const postId = post._id || post.id; // Use MongoDB _id if available, fallback to id
    const currentLikeStatus = isPostLiked;
    const newLikeStatus = !currentLikeStatus;

    // Dispatch the likePost action
    await dispatch(
      likePost({
        id: postId,
        likeToggle: newLikeStatus,
        isPost: true,
      }),
    ).unwrap();
    await dispatch(getMyPosts({ page: 1, limit: 100 })).unwrap();
  };

  const handleDeleteComment = (commentId) => {
    dispatch(deleteComment({ commentId })).then((res) => {
      if (res.payload?.success) {
        SuccessToast("Comment deleted successfully!");
      }

      dispatch(getcommentsofpost({ postId: post._id }));
    });
  };

  const handleLikeComment = (comment) => {
    const newLikeStatus = !comment.isLiked;

    dispatch(
      likePost({
        id: comment._id, // comment ID
        likeToggle: newLikeStatus,
        isPost: false, // IMPORTANT
      }),
    ).then(() => {
      // Refresh comments after like
      dispatch(getcommentsofpost({ postId: post._id }));
    });
  };

  // const handleDeleteModal = async () => {
  //   await dispatch(deletePost({ postId: selectedPost })).unwrap();
  //   setDeleteModal(false);
  //   await dispatch(getMyPosts({}));
  // };

  // Edit Post FUnctions
  const handleDeletePost = async (postId) => {
    if (!postId) return;
    setDeleteLoadingId(postId);
    try {
      await dispatch(deletePost({ postId })).unwrap();
      await dispatch(getMyPosts({ page: 1, limit: 100 })).unwrap();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditText(post.text || "");
    setEditFiles([]);
    setEditFilePreviews([]);
    console.log(post, "medias");
    setExistingMedia(post.media); // array

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

      // New media files
      editFiles.forEach((file) => {
        formData.append("media", file);
      });

      // Existing media
      // assume existingMedia is an array of objects with "_id" property
      if (existingMedia.length > 0) {
        existingMedia.forEach((media, index) => {
          // send only the _id of the media
          formData.append(`existingMedia[${index}]`, media._id);
        });
      } else {
        // if empty, send empty array string
        formData.append("existingMedia", JSON.stringify([]));
      }

      // ✅ Add keywords from editingPost
      const postKeywords = editingPost.keywords || []; // <- make sure to define
      postKeywords.forEach((keyword, index) => {
        formData.append(`keywords[${index}]`, keyword);
      });

      await dispatch(editPost({ postId: editingPost.id, formData })).unwrap();
      await dispatch(getMyPosts({ page: 1, limit: 10 }));
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
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="p-4 flex items-start justify-between border-b border-gray-100 relative">
          <div className="flex items-center gap-3 flex-1">
            {post?.page && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                {post?.page?.image ? (
                  <img
                    src={post?.page?.image}
                    alt={post?.page?.name}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10  object-cover  text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
                    {post?.page?.name.split(" ")[0][0]}
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm font-bold  text-gray-700">
                    {post?.page?.name}
                    {activeTab === "postrequest" && (
                      <span className="text-xs text-black">
                        <Pin size={16} />
                      </span>
                    )}
                  </p>
                  {post && (
                    <div className="flex items-center gap-1 mt-0.5 -ml-[20px]">
                      {post?.avatar && (
                        <img
                          src={post?.avatar}
                          alt={post?.username}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <Link to="/other-profile">
                        <p className="text-xs text-gray-600">
                          {post.username} • {post.time}
                        </p>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* More Options Button */}
          <button
            ref={buttonRef}
            onClick={() => setShowpopup(!showpopup)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <MoreHorizontal className="w-5 h-5 text-black" />

            {/* Popup Menu */}
            {showpopup && (
              <div
                ref={popupRef}
                className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-32 z-50"
              >
                {/* Edit sirf tab jab repost nahi hai */}
                {!post.sharedBy && (
                  <button
                    onClick={() => {
                      setMoreOpenPostId(null);
                      openEditModal(post);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => {
                    setMoreOpenPostId(null);
                    handleDeletePost(post._id);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </button>
        </div>

        {/* Image Section - Show Only First Image */}
        {firstImage && (
          <div className="m-4 cursor-pointer" onClick={openImageModal}>
            <div className="relative">
              <img
                src={firstImage}
                alt="Post"
                className="w-full h-[27em] object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                  1/{images.length}
                </div>
              )}
            </div>
          </div>
        )}

        {post.videoUrl && !firstImage && (
          <div className="m-4">
            <video src={post.videoUrl} controls className="w-full rounded-lg" />
          </div>
        )}

        {/* Tag */}
        {activeTab !== "postrequest" && post?.tag && post?.tag.length > 0 && (
          <div
            className={`bg-gradient-to-r ${post.gradient} text-white text-xs font-medium px-3 py-1 ml-4 mt-3 inline-block rounded-full`}
          >
            {post.tag}
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-700 mb-4">{post.text}</p>
          {post.sharedBy ? (
            <div className="text-sm flex gap-4 ml-3 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 mb-2 w-[14em]">
              {post.sharedBy?.profilePicture ? (
                <img
                  src={post.sharedBy.profilePicture}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 object-cover text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
                  {post.sharedBy?.name.split(" ")[0][0]}
                </div>
              )}
              {/* <img
            src={post.sharedBy.profilePicture}
            className="w-7 h-7 rounded-full object-cover"
          /> */}
              {post.sharedBy.name} Reposted
            </div>
          ) : null}
          {/* Actions */}
          {activeTab !== "postrequest" ? (
            <div className="flex items-center gap-4 text-sm text-orange-500 mb-2 pb-2">
              {/* ✅ LIKE BUTTON - WITH LOADING STATE */}
              <button
                onClick={handleLikeToggle}
                disabled={likeLoading}
                className={`flex items-center gap-2 rounded-full p-1 transition-all ${
                  likeLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-orange-600 bg-orange-400/10"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isPostLiked
                      ? "fill-orange-500 text-orange-500"
                      : likeLoading
                        ? "text-gray-400"
                        : "text-orange-500"
                  }`}
                />
                <span className="text-orange-500">
                  {post.stats?.likes || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowComments((prev) => !prev);
                  if (!showComments) {
                    dispatch(getcommentsofpost({ postId: post._id }));
                  }
                }}
                className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post?.stats?.comments || 0}</span>
              </button>

              <button
                onClick={() => setSharepost(true)}
                className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>{post?.stats?.shares || 0}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="md" variant="orange">
                Approve
              </Button>
              <Button size="md" variant="secondary">
                Reject
              </Button>
            </div>
          )}

          {/* Comments Section */}
          {showComments && <CommentsSection postId={post._id} />}
        </div>
      </div>

      {/* Image Modal - Show All Images */}
      {showImageModal && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200 z-10"
          >
            <X size={32} />
          </button>

          <div className="absolute top-6 left-8 max-w-6xl text-white z-10">
            <div className="flex items-center gap-3">
              <img
                src={post.avatar}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
              <div>
                <p className="font-bold text-base">{post.user}</p>
                <p className="text-xs text-gray-300">
                  {post.username} • {post.time}
                </p>
              </div>
            </div>
            <p className="text-sm pt-2">{post.text}</p>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center mt-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex]}
              alt="Fullscreen"
              className="max-w-5xl max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
            />

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors z-20"
              >
                ◀
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors z-20"
              >
                ▶
              </button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-8 text-white text-center z-20">
                <p className="text-lg font-semibold">
                  {currentImageIndex + 1} / {images.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Post Modal */}
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
        <ShareRepostModal postId={post?._id} onClose={setSelectedOption} />
      )}

      {/* Edit Modal for post */}
      {editModal && (
        <EditPostModal
          post={post}
          isLoading={isLoading}
          onClose={() => setEditModal(false)}
          onSave={async (updatedPost) => {
            await dispatch(
              editPost({
                postId: selectedPost?._id,
                formData: updatedPost,
              }),
            );
            await dispatch(getMyPosts({}));
          }}
        />
      )}

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
              {existingMedia?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Media
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {existingMedia?.map((m) => (
                      <div
                        key={m._id}
                        className="relative w-full overflow-hidden rounded-lg border"
                      >
                        {m.type === "image" ? (
                          <img
                            src={m?.fileUrl}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <video
                            src={m?.fileUrl}
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
    </>
  );
};
export default PostCard;
