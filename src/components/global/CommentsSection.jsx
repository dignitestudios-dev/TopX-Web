import React, { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, MoreVertical, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  deleteComment,
  elevateComment,
  getComment,
  likeComment,
} from "../../redux/slices/postfeed.slice";
import { timeAgo } from "../../lib/helpers";
import { likePost } from "../../redux/slices/posts.slice";

export default function CommentsSection({ postId }) {
  const [comments, setComments] = useState([
    {
      id: "1",
      author: "Merry James",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Amazing. Keep it up!",
      likes: 2,
      isLiked: false,
      timeAgo: "1hr ago",
      replies: [
        {
          id: "1-1",
          author: "David Laid",
          avatar: "https://randomuser.me/api/portraits/men/44.jpg",
          text: "It very a really bad experience.",
          likes: 2,
          isLiked: false,
          timeAgo: "1w ago",
          replies: [],
        },
      ],
    },
    {
      id: "2",
      author: "Peter Parker",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      isAdmin: true,
      text: "It very a really bad experience.",
      likes: 2,
      isLiked: false,
      timeAgo: "1w ago",
      replies: [],
    },
    {
      id: "3",
      author: "Victoria James",
      avatar: "https://randomuser.me/api/portraits/women/47.jpg",
      text: "I've been using their services 2 years ago.",
      likes: 2,
      isLiked: false,
      timeAgo: "2w ago",
      replies: [],
    },
  ]);
  const { user } = useSelector((state) => state.auth);
  const { commentLoading, postComments, getCommentsLoading } = useSelector(
    (state) => state.postsfeed
  );

  const [newComment, setNewComment] = useState("");
  const dispatch = useDispatch();
  console.log(postComments, "postComments");
  const handleGetComments = async () => {
    await dispatch(getComment(postId));
  };
  useEffect(() => {
    handleGetComments();
  }, [postId]);

  const addComment = async () => {
    if (newComment.trim()) {
      const data = {
        post: postId,
        text: newComment,
      };
      await dispatch(createComment(data)).unwrap();
      handleGetComments();
      setNewComment("");
    }
  };

  const addReply = async (commentId, replyText) => {
    if (replyText.trim()) {
      const data = {
        post: postId,
        text: replyText,
        comment: commentId,
      };

      await dispatch(createComment(data)).unwrap();
      handleGetComments();
    }
  };

  const toggleLike = (commentId) => {
    const comment = postComments.find((c) => c._id === commentId);
    if (!comment) return;

    const newLikeStatus = !comment.isLiked;

    // Optimistic update is handled in slice, no need to calculate newLikesCount here
    dispatch({
      type: "posts/likeComment/pending",
      meta: { arg: { commentId, likeToggle: newLikeStatus } },
    });

    dispatch(likeComment({ commentId, likeToggle: newLikeStatus }));
  };

  const handleDeleteComment = async (commentId) => {
    // Dispatch delete comment action
    await dispatch(deleteComment(commentId)).unwrap();
    // Refresh comments after deletion
    handleGetComments();
  };
  const handleElevateComment = async (commentId) => {
    // Dispatch delete comment action
    await dispatch(elevateComment(commentId)).unwrap();
    // Refresh comments after deletion
    handleGetComments();
  };

  const CommentItem = ({
    comment,
    isReply = false,
    parentId = null,
    onAddReply,
  }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      function handleClickOutside(event) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
      {
        label: "Undo Elevate",
        action: () => handleElevateComment(comment?._id),
      },
      {
        label: "Report",
        action: () => console.log("Report"),
      },
      {
        label: "Delete",
        action: () => handleDeleteComment(comment?._id),
      },
      {
        label: "Block",
        action: () => console.log("block"),
      },
    ];

    const handleItemClick = (action) => {
      action();
      setIsOpen(false);
    };

    const submitReply = async () => {
      await onAddReply(comment._id, replyText);
      setReplyText("");
      setIsReplying(false);
    };
    const isAuthor = comment?.user?._id === user?._id;

    return (
      <div className={` overflow-auto ${isReply ? "ml-12 mt-3" : "mt-4"}`}>
        <div className="flex gap-3 ">
          <img
            src={comment.user?.profilePicture}
            alt={comment.user?.username}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <p className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                {comment.user?.username}
                {comment.isAdmin && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-700">{comment.text}</p>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <button
                onClick={() => toggleLike(comment._id)}
                className="flex items-center gap-1 hover:text-orange-500 transition"
              >
                <Heart
                  className={`w-4 h-4 ${
                    comment.isLiked ? "fill-orange-500 text-orange-500" : ""
                  }`}
                />
                <span
                  className={
                    comment.isLiked ? "text-orange-500 font-medium" : ""
                  }
                >
                  {Number(comment.likesCount ?? 0)}
                </span>
              </button>
              <button
                onClick={() => setIsReplying(comment._id)}
                className="hover:text-orange-500 transition font-medium"
              >
                Reply
              </button>
              <span>{timeAgo(comment.createdAt)}</span>
            </div>
          </div>
          {!isReply && (
            <div className="relative z-50">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isOpen && (
                <div className="absolute  right-0 mt-1 w-40  bg-white rounded-lg shadow-lg border border-gray-200 py-1  z-50">
                  {menuItems.map((item, index) => {
                    if (
                      !isAuthor &&
                      !["Delete", "Report"].includes(item.label)
                    ) {
                      return null;
                    }

                    return (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply Input */}
        {isReplying == comment._id && (
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
                onClick={() => submitReply()}
                className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
              >
                Reply
              </button>
              <button
                onClick={() => setIsReplying(null)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            isReply={true}
            parentId={comment._id}
            onAddReply={addReply}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6 border-t border-gray-200 p-6">
      <div className="flex gap-3 mb-4">
        <img
          src={user?.profilePicture}
          alt="You"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addComment()}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={addComment}
            className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
          >
            {commentLoading ? "Posting" : " Post"}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-1">
        {postComments.map((comment) => (
          <CommentItem
            key={comment.id}
            onAddReply={addReply}
            comment={comment}
          />
        ))}
      </div>
    </div>
  );
}
