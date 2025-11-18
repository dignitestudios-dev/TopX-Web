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
import { likePost, getMyPosts, getcommentsofpost, commentonpost, deleteComment } from "../../redux/slices/posts.slice";
import { FaRegTrashCan } from "react-icons/fa6";
import { SuccessToast } from "./Toaster";


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
    toggleLike = () => { },
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
    const [deleteModal, setDeleteModal] = useState(false);
    const popupRef = useRef(null);
    const buttonRef = useRef(null);

    const [selectedOption, setSelectedOption] = useState("Share with Topic Page");

    const options = [
        "Share to your Story",
        "Share with Topic Page",
        "Share in Individuals Chats",
        "Share in Group Chats",
    ];

    const { comments, commentsLoading } = useSelector((state) => state.posts);

    console.log(comments, "comments")




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
            return () => document.removeEventListener("mousedown", handleClickOutside);
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
            })
        ).then(() => {
            dispatch(getcommentsofpost({ postId: post._id }));
        });

        setCommentInput("");
    };


    const isPostLiked = liked[post.id] ?? post.isLiked;
    const images = post.postImages && post.postImages.length > 0 ? post.postImages : [];
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
    const handleLikeToggle = () => {
        if (likeLoading) return; // Prevent multiple clicks while loading

        const postId = post._id || post.id; // Use MongoDB _id if available, fallback to id
        const currentLikeStatus = isPostLiked;
        const newLikeStatus = !currentLikeStatus;

        // Dispatch the likePost action
        dispatch(likePost({
            id: postId,
            likeToggle: newLikeStatus,
            isPost: true
        }));
        dispatch(getMyPosts({ page: 1, limit: 100 }));
    };


    const handleDeleteComment = (commentId) => {
        dispatch(deleteComment({ commentId }))
            .then((res) => {
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
                id: comment._id,      // comment ID
                likeToggle: newLikeStatus,
                isPost: false         // IMPORTANT
            })
        ).then(() => {
            // Refresh comments after like
            dispatch(getcommentsofpost({ postId: post._id }));
        });
    };




    return (
        <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300">
                {/* Header */}
                <div className="p-4 flex items-start justify-between border-b border-gray-100 relative">
                    <div className="flex items-center gap-3 flex-1">
                        <img
                            src={post.avatar}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-bold text-sm flex items-center gap-2">
                                {post.user}
                                {activeTab === "postrequest" && (
                                    <span className="text-xs text-black">
                                        <Pin size={16} />
                                    </span>
                                )}
                            </p>
                            <Link to="/other-profile">
                                <p className="text-xs text-gray-600">
                                    {post.username} • {post.time}
                                </p>
                            </Link>
                        </div>
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
                                <button
                                    onClick={() => {
                                        setEditModal(true);
                                        setShowpopup(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => {
                                        setDeleteModal(true);
                                        setShowpopup(false);
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
                                className="w-full rounded-lg hover:opacity-90 transition-opacity"
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
                        <video
                            src={post.videoUrl}
                            controls
                            className="w-full rounded-lg"
                        />
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

                    {/* Actions */}
                    {activeTab !== "postrequest" ? (
                        <div className="flex items-center gap-4 text-sm text-orange-500 mb-2 pb-2">
                            {/* ✅ LIKE BUTTON - WITH LOADING STATE */}
                            <button
                                onClick={handleLikeToggle}
                                disabled={likeLoading}
                                className={`flex items-center gap-2 rounded-full p-1 transition-all ${likeLoading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:text-orange-600 bg-orange-400/10"
                                    }`}
                            >
                                <Heart
                                    className={`w-5 h-5 transition-all ${isPostLiked
                                        ? "fill-orange-500 text-orange-500"
                                        : likeLoading
                                            ? "text-gray-400"
                                            : "text-orange-500"
                                        }`}
                                />
                                <span className="text-orange-500">{post.stats?.likes || 0}</span>
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
                        <div className="mt-4 space-y-4">
                            <h3 className="font-semibold text-gray-800 text-sm">Comments</h3>

                            {/* Add Comment */}
                            <div className="flex items-center gap-2">
                                <img
                                    src="https://randomuser.me/api/portraits/lego/1.jpg"
                                    alt="User"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1 flex items-center border rounded-full px-3 py-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment"
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        className="w-full text-sm outline-none"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        className="text-orange-500 hover:text-orange-600"
                                    >
                                        <SendHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-4">
                                {commentsLoading && (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
                                    </div>
                                )}


                                {!commentsLoading && comments.length === 0 && (
                                    <p className="text-gray-500 text-sm">No comments yet.</p>
                                )}

                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex items-start gap-3 relative">

                                        {/* Avatar */}
                                        <img
                                            src={comment.user?.profilePicture}
                                            alt={comment.user?.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />

                                        {/* Comment Content */}
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-xl px-3 py-2 inline-block">
                                                <p className="text-sm font-semibold">
                                                    {comment.user?.name}{" "}
                                                    <span className="text-xs text-gray-500">@{comment.user?.username}</span>
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    {comment.text}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <button
                                                    onClick={() => !likeLoading && handleLikeComment(comment)}
                                                    disabled={likeLoading}
                                                    className={`flex items-center gap-1 transition-all 
        ${likeLoading ? "opacity-50 cursor-not-allowed" : "hover:text-orange-600 text-orange-500"}
    `}
                                                >
                                                    {likeLoading ? (
                                                        // 🔄 Small Loading Spinner
                                                        <svg
                                                            className="animate-spin h-4 w-4 text-orange-500"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                            ></path>
                                                        </svg>
                                                    ) : (
                                                        <Heart
                                                            className={`w-4 h-4 transition-all ${comment.isLiked ? "fill-orange-500 text-orange-500" : ""
                                                                }`}
                                                        />
                                                    )}

                                                    <span>{comment.likesCount}</span>
                                                </button>



                                                <button className="hover:text-orange-600">Reply</button>

                                                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* DELETE COMMENT BUTTON */}
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="absolute right-0 top-6 text-gray-400 hover:text-red-500 transition"
                                            title="Delete Comment"
                                        >
                                            <FaRegTrashCan color="#FB903A" size={16} />

                                        </button>

                                    </div>
                                ))}

                                {/* REPLIES */}
{comment.replies && comment.replies.length > 0 && (
    <div className="ml-10 mt-2 space-y-3">

        {comment.replies.map((reply) => (
            <div key={reply._id} className="flex items-start gap-3">

                {/* Reply Avatar */}
                <img
                    src={reply.user?.profilePicture}
                    alt={reply.user?.name}
                    className="w-7 h-7 rounded-full object-cover"
                />

                {/* Reply Content */}
                <div className="flex-1">
                    <div className="bg-gray-100 rounded-xl px-3 py-2 inline-block">
                        <p className="text-sm font-semibold">
                            {reply.user?.name}{" "}
                            <span className="text-xs text-gray-500">
                                @{reply.user?.username}
                            </span>
                        </p>

                        <p className="text-sm text-gray-700">
                            {reply.text}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <button className="flex items-center gap-1 text-orange-500 hover:text-orange-600">
                            <Heart
                                className={`w-4 h-4 ${reply.isLiked ? "fill-orange-500 text-orange-500" : ""}`}
                            />
                            <span>{reply.likesCount}</span>
                        </button>

                        <span>{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                </div>

            </div>
        ))}

    </div>
)}




                            </div>
                        </div>
                    )}
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
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white w-[380px] rounded-2xl shadow-xl">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h2 className="text-[17px] font-semibold">Share Post With</h2>
                            <button
                                onClick={() => setSharepost(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="flex flex-col py-3">
                            {options.map((option, index) => (
                                <label
                                    key={index}
                                    className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                        setSelectedOption(option);
                                        setSharepost(false);
                                    }}
                                >
                                    <span className="text-[15px] text-gray-800">{option}</span>
                                    <span
                                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 ${selectedOption === option
                                            ? "border-orange-500"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        {selectedOption === option && (
                                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal for post */}
            {editModal && (
                <EditPostModal
                    post={post}
                    onClose={() => setEditModal(false)}
                    onSave={(updatedPost) => console.log("Updated Post:", updatedPost)}
                />
            )}

            {deleteModal && (
                <DeletePostModal
                    onClose={() => setDeleteModal(false)}
                    onConfirm={() => console.log("✅ Post deleted")}
                />
            )}
        </>
    );
};

export default PostCard;