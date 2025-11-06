import React, { useState } from "react";
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    SendHorizonal,
} from "lucide-react";
import { TiPin } from "react-icons/ti";
import Button from "../common/Button";

const PostCard = ({ post, liked, toggleLike, activeTab }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [commentLikes, setCommentLikes] = useState({});
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
            comment: "I’ve been using their services 2 years ago.",
            time: "2w ago",
            likes: 2,
        },
    ]);

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
console.log(activeTab);
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="p-4 flex items-start justify-between border-b border-gray-100">
                <div className="flex items-center gap-3 flex-1">
                    <img
                        src={post.avatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-bold text-sm flex items-center gap-2">{post.user} 
                            {activeTab === "postrequest" && (
                                <span className=" text-[#181818]"><TiPin size={20} /></span>
                            )}
                        </p>
                        <p className="text-xs text-gray-600">
                            {post.username} • {post.time}
                        </p>

                    </div>
                </div>

                <MoreHorizontal className="w-5 h-5 text-gray-400" />

            </div>

            {post?.postimage && post?.postimage.length > 0 && (
                <div className="m-4">
                    <img src={post?.postimage} alt="" />
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
                        className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1"
                    >
                        <Heart
                            className={`w-5 h-5 ${liked[post.id] ? "fill-orange-500 text-orange-500" : ""
                                }`}
                        />
                        <span>{post.stats.likes}</span>
                    </button>

                    {/* 💬 Toggle Comments */}
                    <button
                        onClick={() => setShowComments((prev) => !prev)}
                        className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.stats.comments}</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1">
                        <Share2 className="w-5 h-5" />
                        <span>{post.stats.shares}</span>
                    </button>
                </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="orange" size="md" className="px-8">Approve</Button>
                    <Button variant="secondary" size="md" className="  px-8">Reject</Button>
                  </div>
                )}
                {/* 🧩 Comments Section */}
                {showComments && (
                    <div className="mt-4 space-y-4 animate-fadeIn">
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
                                    <SendHorizonal className="w-4 h-4" />
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
                                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
