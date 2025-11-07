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
        postimage: "https://images.unsplash.com/photo-1546519638-68711109d298?w=500&h=500&fit=crop",
        tag: "Sports",
        gradient: "from-orange-400 to-orange-600",
        text: "Just finished an amazing basketball session! Feel the energy! 🏀",
        stats: { likes: 234, comments: 45, shares: 12 }
    },
    liked = {},
    toggleLike = () => { },
    activeTab = "feed"
}) => {
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [commentLikes, setCommentLikes] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
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

    const [commentList, setCommentList] = useState([
        {
            id: 1,
            name: "Merry James✦",
            avatar: "https://randomuser.me/api/portraits/women/79.jpg",
            comment: "Amazing. Keep it up!",
            time: "1 hr ago",
            likes: 2,
        },
        {
            id: 2,
            name: "David Laid",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
            comment: "It very a really bad experience.",
            time: "1w ago",
            likes: 2,
        },
        {
            id: 3,
            name: "Peter Parker",
            role: "Admin",
            avatar: "https://randomuser.me/api/portraits/men/41.jpg",
            comment: "It very a really bad experience.",
            time: "1w ago",
            likes: 2,
        },
        {
            id: 4,
            name: "Victoria James",
            avatar: "https://randomuser.me/api/portraits/women/56.jpg",
            comment: "I've been using their services 2 years ago.",
            time: "2w ago",
            likes: 2,
        },
    ]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)) {
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
        if (commentInput.trim() === "") return;
        const newComment = {
            id: Date.now(),
            name: "You",
            avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
            comment: commentInput,
            time: "Just now",
            likes: 0,
        };
        setCommentList([newComment, ...commentList]);
        setCommentInput("");
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
                                    <span className="text-xs text-black"><Pin size={16} /></span>
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

                {post?.postimage && post?.postimage.length > 0 && (
                    <div className="m-4 cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <img
                            src={post?.postimage}
                            alt="Post"
                            className="w-full rounded-lg hover:opacity-90 transition-opacity"
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
                            <button
                                onClick={() => toggleLike(post.id)}
                                className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                            >
                                <Heart
                                    className={`w-5 h-5 ${liked[post.id] ? "fill-orange-500 text-orange-500" : ""
                                        }`}
                                />
                                <span>{post.stats.likes}</span>
                            </button>

                            <button
                                onClick={() => setShowComments((prev) => !prev)}
                                className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.stats.comments}</span>
                            </button>

                            <button
                                onClick={() => setSharepost(true)}
                                className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                <span>{post.stats.shares}</span>
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
                                {commentList.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-3">
                                        <img
                                            src={comment.avatar}
                                            alt={comment.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-xl px-3 py-2 inline-block">
                                                <p className="text-sm font-semibold">
                                                    {comment.name}{" "}
                                                    {comment.role && (
                                                        <span className="text-xs text-gray-500">
                                                            {comment.role}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-700">{comment.comment}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <button
                                                    onClick={() => handleCommentLike(comment.id)}
                                                    className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                                                >
                                                    <Heart
                                                        className={`w-4 h-4 ${commentLikes[comment.id]
                                                            ? "fill-orange-500 text-orange-500"
                                                            : ""
                                                            }`}
                                                    />
                                                    <span>{comment.likes}</span>
                                                </button>
                                                <button className="hover:text-orange-600">Reply</button>
                                                <span>{comment.time}</span>
                                            </div>
                                        </div>
                                        <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && (
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

                    <div className="absolute top-6 left-30 max-w-6xl text-white z-10">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.avatar}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover border-2 border-white"
                            />
                            <div>
                                <p className="font-bold text-base">{post.user}</p>
                                <p className="text-xs text-gray-300">{post.username} • {post.time}</p>
                            </div>
                        </div>
                        <p className="text-sm pt-2">{post.text}</p>
                    </div>

                    <div
                        className="relative w-full h-full flex items-center justify-center mt-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={post.postimage}
                            alt="Fullscreen"
                            className="max-w-5xl max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
                        />
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