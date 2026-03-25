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
  elevatePost,
  demotePost,
} from "../../redux/slices/posts.slice";
import { FaRegTrashCan } from "react-icons/fa6";
import { TiPin } from "react-icons/ti";
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
  // Elevate Post
  const [elevateLoadingId, setElevateLoadingId] = useState(null); // used for undo/unelevate loading
  const [isElevateModalOpen, setIsElevateModalOpen] = useState(false);
  const [elevatePostId, setElevatePostId] = useState(null);
  const [elevateDuration, setElevateDuration] = useState("24h");
  const [elevateLoading, setElevateLoading] = useState(false);
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

  const formatPostTime = (timeValue) => {
    if (!timeValue) return "";
    if (timeValue instanceof Date) {
      return formatDate(timeValue);
    }

    if (typeof timeValue !== "string") return String(timeValue);

    // If backend sends relative time like "5 mins ago", keep it as is.
    const lower = timeValue.toLowerCase();
    if (lower.includes("ago")) return timeValue;

    // Try parsing as ISO first.
    const iso = new Date(timeValue);
    if (!Number.isNaN(iso.getTime())) {
      return formatDate(iso);
    }

    // Fallback: parse "DD/MM/YYYY, HH:mm:ss" produced by toLocaleString.
    const normalized = timeValue.replace(",", " ").trim();
    const m = normalized.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
    );
    if (!m) return timeValue;

    const day = Number(m[1]);
    const month = Number(m[2]);
    const yearRaw = Number(m[3]);
    const hour = m[4] ? Number(m[4]) : 0;
    const minute = m[5] ? Number(m[5]) : 0;
    const second = m[6] ? Number(m[6]) : 0;
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;

    const dt = new Date(year, month - 1, day, hour, minute, second);
    if (Number.isNaN(dt.getTime())) return timeValue;

    return formatDate(dt);
  };

  const formatDate = (d) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Recent (last 7 days) => show weekday (Tuesday)
    if (diffDays >= 0 && diffDays < 7) {
      return d.toLocaleDateString(undefined, { weekday: "long" });
    }

    // Older => show DD/MM (10/03)
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}`;
  };

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
  
  // ✅ Combine video and images: video first, then images
  const allMedia = [];
  if (post.videoUrl) {
    allMedia.push({ type: "video", url: post.videoUrl });
  }
  images.forEach((img) => {
    allMedia.push({ type: "image", url: img });
  });

  const hasMedia = allMedia.length > 0;
  const currentMedia = hasMedia ? allMedia[currentImageIndex] : null;

  const openImageModal = () => {
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  const nextMedia = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
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

  const handleElevateToggle = async (targetPost = post) => {
    const postId = targetPost?._id || targetPost?.id;
    if (!postId) return;

    // If already elevated => undo instantly
    if (targetPost?.isElevated) {
      setElevateLoadingId(postId);
      try {
        await dispatch(demotePost(postId)).unwrap();
        SuccessToast("Post demoted successfully");
        await dispatch(getMyPosts({ page: 1, limit: 10 })).unwrap();
      } catch (error) {
        console.error("Failed to unelevate post:", error);
      } finally {
        setElevateLoadingId(null);
      }
      return;
    }

    // Otherwise => open popup to choose duration
    setElevatePostId(postId);
    setElevateDuration("24h");
    setIsElevateModalOpen(true);
  };

  const handleElevateSave = async () => {
    if (!elevatePostId) return;

    try {
      setElevateLoading(true);
      await dispatch(
        elevatePost({ postId: elevatePostId, duration: elevateDuration }),
      ).unwrap();

      await dispatch(getMyPosts({ page: 1, limit: 10 })).unwrap();
      setIsElevateModalOpen(false);
      setElevatePostId(null);
    } catch (error) {
      console.error("Failed to elevate post:", error);
    } finally {
      setElevateLoading(false);
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
              <div className="flex items-center gap-2 mb-2 pb-2">
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
                  <p className="text-sm font-bold flex items-center text-gray-700">
                    {post?.author?.name ? `${post.author.name}'s ` : ""}
                    {post?.page?.name}
                    {activeTab === "postrequest" && (
                      <span className="text-xs text-black">
                        <Pin size={16} />
                      </span>
                    )}
                    {post?.isElevated && (
                      <span className="text-xs text-black inline-flex items-center ml-1">
                        <TiPin size={20} />
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
                          {post.username} • {formatPostTime(post.time)}
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
                className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-[10em] z-50"
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
                    handleElevateToggle(post);
                  }}
                  disabled={elevateLoadingId === post?._id}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {post?.isElevated ? "Unelevate Post" : "Elevate Post"}
                </button>

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

        {/* Media Section - Video first, then images (carousel) */}
        {hasMedia && (
          <div className="m-4 relative">
            <div className="relative cursor-pointer" onClick={openImageModal}>
              {/* Current Media Display */}
              {currentMedia?.type === "video" ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="w-full h-[27em] object-cover rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={currentMedia?.url}
                  alt="Post"
                  className="w-full h-[27em] object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
              )}

              {/* Media Counter */}
              {allMedia.length > 1 && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                  {currentImageIndex + 1}/{allMedia.length}
                </div>
              )}

              {/* Navigation Arrows */}
              {allMedia.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevMedia();
                    }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10"
                  >
                    ◀
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextMedia();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>
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
            <div className="text-sm flex gap-4 ml-3 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 mb-2 w-[18em]">
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
          {showComments && (
            <CommentsSection postId={post._id} isMyPostsPage={true} />
          )}
        </div>
      </div>

      {/* Media Modal - Show Video and Images */}
      {showImageModal && hasMedia && (
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
                <p className="font-bold text-base">
                  {post?.author?.name ? `${post.author.name}'s ` : ""}
                  {post?.page?.name || post.user}
                </p>
                <p className="text-xs text-gray-300">
                  {post.username} • {formatPostTime(post.time)}
                </p>
              </div>
            </div>
            <p className="text-sm pt-2">{post.text}</p>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center mt-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Current Media Display */}
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.url}
                controls
                className="max-w-5xl max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
              />
            ) : (
              <img
                src={currentMedia?.url}
                alt="Fullscreen"
                className="max-w-5xl max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
              />
            )}

            {/* Previous Button */}
            {allMedia.length > 1 && (
              <button
                onClick={prevMedia}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors z-20"
              >
                ◀
              </button>
            )}

            {/* Next Button */}
            {allMedia.length > 1 && (
              <button
                onClick={nextMedia}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors z-20"
              >
                ▶
              </button>
            )}

            {/* Media Counter */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-8 text-white text-center z-20">
                <p className="text-lg font-semibold">
                  {currentImageIndex + 1} / {allMedia.length}
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

      {/* Elevate Post Modal */}
      {isElevateModalOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[27em]">
            {/* Modal Header with Close Button */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-center">
                Elevated Post
              </h3>
              <button
                onClick={() => {
                  setIsElevateModalOpen(false);
                  setElevatePostId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <p className="text-sm text-gray-600 mt-3">
              Highlight important posts for greater visibility. Choose how
              long they stay elevated:
            </p>

            {/* Radio Buttons */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="elevated-post"
                  value="24h"
                  id="day"
                  className="appearance-none hidden"
                  checked={elevateDuration === "24h"}
                  onChange={() => setElevateDuration("24h")}
                />
                <span
                  className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${
                    elevateDuration === "24h" ? "bg-orange-500" : ""
                  }`}
                  onClick={() => setElevateDuration("24h")}
                />
                <label htmlFor="day" className="text-sm">
                  Day (Visible for 24 hours)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  name="elevated-post"
                  value="7d"
                  id="week"
                  className="appearance-none hidden"
                  checked={elevateDuration === "7d"}
                  onChange={() => setElevateDuration("7d")}
                />
                <span
                  className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${
                    elevateDuration === "7d" ? "bg-orange-500" : ""
                  }`}
                  onClick={() => setElevateDuration("7d")}
                />
                <label htmlFor="week" className="text-sm">
                  Week (Visible for 7 days)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  name="elevated-post"
                  value="1m"
                  id="month"
                  className="appearance-none hidden"
                  checked={elevateDuration === "1m"}
                  onChange={() => setElevateDuration("1m")}
                />
                <span
                  className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${
                    elevateDuration === "1m" ? "bg-orange-500" : ""
                  }`}
                  onClick={() => setElevateDuration("1m")}
                />
                <label htmlFor="month" className="text-sm">
                  Month (Visible for 30 days)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  name="elevated-post"
                  value="manual"
                  id="until-change"
                  className="appearance-none hidden"
                  checked={elevateDuration === "manual"}
                  onChange={() => setElevateDuration("manual")}
                />
                <span
                  className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${
                    elevateDuration === "manual" ? "bg-orange-500" : ""
                  }`}
                  onClick={() => setElevateDuration("manual")}
                />
                <label htmlFor="until-change" className="text-sm">
                  Until I Change It (Stay elevated until manually updated)
                </label>
              </div>
            </div>

            {/* Modal Footer with Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                className="bg-orange-500 text-white w-full py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleElevateSave}
                disabled={elevateLoading}
              >
                {elevateLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
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
