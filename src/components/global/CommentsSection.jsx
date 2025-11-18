import React, { useState } from 'react';
import { Heart, MessageCircle, MoreVertical, X } from 'lucide-react';

export default function CommentsSection({ postId }) {
    const [comments, setComments] = useState([
        {
            id: '1',
            author: 'Merry James',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            text: 'Amazing. Keep it up!',
            likes: 2,
            isLiked: false,
            timeAgo: '1hr ago',
            replies: [
                {
                    id: '1-1',
                    author: 'David Laid',
                    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
                    text: 'It very a really bad experience.',
                    likes: 2,
                    isLiked: false,
                    timeAgo: '1w ago',
                    replies: []
                }
            ]
        },
        {
            id: '2',
            author: 'Peter Parker',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            isAdmin: true,
            text: 'It very a really bad experience.',
            likes: 2,
            isLiked: false,
            timeAgo: '1w ago',
            replies: []
        },
        {
            id: '3',
            author: 'Victoria James',
            avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
            text: "I've been using their services 2 years ago.",
            likes: 2,
            isLiked: false,
            timeAgo: '2w ago',
            replies: []
        }
    ]);

    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const addComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now().toString(),
                author: 'You',
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                text: newComment,
                likes: 0,
                isLiked: false,
                timeAgo: 'now',
                replies: []
            };
            setComments([comment, ...comments]);
            setNewComment('');
        }
    };

    const addReply = (commentId) => {
        if (replyText.trim()) {
            setComments(comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [
                            ...comment.replies,
                            {
                                id: Date.now().toString(),
                                author: 'You',
                                avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
                                text: replyText,
                                likes: 0,
                                isLiked: false,
                                timeAgo: 'now',
                                replies: []
                            }
                        ]
                    };
                }
                return comment;
            }));
            setReplyText('');
            setReplyingTo(null);
        }
    };

    const toggleLike = (commentId) => {
        setComments(comments.map(comment => ({
            ...comment,
            isLiked: comment.id === commentId ? !comment.isLiked : comment.isLiked,
            likes: comment.id === commentId ? (comment.isLiked ? comment.likes - 1 : comment.likes + 1) : comment.likes,
            replies: comment.replies.map(reply => ({
                ...reply,
                isLiked: reply.id === commentId ? !reply.isLiked : reply.isLiked,
                likes: reply.id === commentId ? (reply.isLiked ? reply.likes - 1 : reply.likes + 1) : reply.likes
            }))
        })));
    };

    const CommentItem = ({ comment, isReply = false, parentId = null }) => (
        <div className={`${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
            <div className="flex gap-3">
                <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                            {comment.author}
                            {comment.isAdmin && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Admin</span>}
                        </p>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <button
                            onClick={() => toggleLike(comment.id)}
                            className="flex items-center gap-1 hover:text-orange-500 transition"
                        >
                            <Heart
                                className={`w-4 h-4 ${comment.isLiked ? 'fill-orange-500 text-orange-500' : ''}`}
                            />
                            <span className={comment.isLiked ? 'text-orange-500 font-medium' : ''}>
                                {comment.likes}
                            </span>
                        </button>
                        <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="hover:text-orange-500 transition font-medium"
                        >
                            Reply
                        </button>
                        <span>{comment.timeAgo}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
                <div className="ml-8 mt-3 flex gap-2">
                    <img
                        src="https://randomuser.me/api/portraits/men/1.jpg"
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-orange-500"
                        />
                        <button
                            onClick={() => addReply(comment.id)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
                        >
                            Reply
                        </button>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Nested Replies */}
            {comment.replies.map(reply => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    parentId={comment.id}
                />
            ))}
        </div>
    );

    return (
        <div className="mt-6 border-t border-gray-200 p-6">
            <div className="flex gap-3 mb-4">
                <img
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addComment()}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-orange-500"
                    />
                    <button
                        onClick={addComment}
                        className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
                    >
                        Post
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-1">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
}