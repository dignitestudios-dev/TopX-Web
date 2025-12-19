import React, { useEffect, useRef, useState } from "react";
import { Heart, MoreVertical, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  deleteComment,
  elevateComment,
  getComment,
  likeComment,
  updateComment,
} from "../../redux/slices/postfeed.slice";
import { timeAgo } from "../../lib/helpers";
import { likePost } from "../../redux/slices/posts.slice";

export default function CommentsSection({ postId }) {
  const { user } = useSelector((state) => state.auth);
  const { commentLoading, postComments, getCommentsLoading } = useSelector(
    (state) => state.postsfeed
  );
  const [editingCommentId, setEditingCommentId] = useState(null);

  const [newComment, setNewComment] = useState("");
  const dispatch = useDispatch();
  console.log(postComments, "postComments");
  const handleGetComments = async () => {
    await dispatch(getComment(postId));
  };
  useEffect(() => {
    handleGetComments();
  }, [postId]);

  const addOrUpdateComment = async () => {
    if (!newComment.trim()) return;

    try {
      if (editingCommentId) {
        // 🔁 UPDATE
        await dispatch(
          updateComment({
            commentId: editingCommentId,
            text: newComment,
          })
        ).unwrap();
      } else {
        // ➕ CREATE
        await dispatch(
          createComment({
            post: postId,
            text: newComment,
          })
        ).unwrap();
      }

      setNewComment("");
      setEditingCommentId(null);
      handleGetComments();
    } catch (err) {
      console.error(err);
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

  const findCommentById = (comments, commentId) => {
    for (let comment of comments) {
      if (comment._id === commentId) {
        return comment;
      }

      if (comment.replies?.length) {
        const found = findCommentById(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleLike = (commentId) => {
    const comment = findCommentById(postComments, commentId);

    if (!comment) return;

    const newLikeStatus = !comment.isLiked;

    // 🔥 Optimistic update trigger
    dispatch({
      type: "posts/likeComment/pending",
      meta: { arg: { commentId, likeToggle: newLikeStatus } },
    });

    dispatch(likeComment({ commentId, likeToggle: newLikeStatus }));
  };

  const handleDeleteComment = async (commentId) => {
    await dispatch(deleteComment(commentId)).unwrap();
    handleGetComments();
  };
  const handleElevateComment = async (commentId) => {
    await dispatch(elevateComment(commentId)).unwrap();
    handleGetComments();
  };

  const CommentItem = ({
    comment,
    isReply = false,
    parentId = null,
    onAddReply,
    setNewComment,
    setEditingCommentId,
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
        label: "Edit",
        action: () => {
          setNewComment(comment.text); // input fill
          setEditingCommentId(comment._id); // edit mode ON
        },
      },
      {
        label: "Delete",
        action: () => handleDeleteComment(comment?._id),
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
      <div className={`py-5 ${isReply ? "ml-12 mt-3" : "mt-4"}`}>
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
                onClick={() => toggleLike(comment?._id)}
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
                  if (!isAuthor && !["Delete", "Report"].includes(item.label)) {
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
            setNewComment={setNewComment}
            setEditingCommentId={setEditingCommentId}
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
            placeholder={
              editingCommentId ? "Update your comment..." : "Add a comment"
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addComment()}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={addOrUpdateComment}
            disabled={commentLoading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
    ${
      commentLoading
        ? "bg-orange-300 cursor-not-allowed"
        : "bg-orange-500 hover:bg-orange-600 text-white"
    }
  `}
          >
            {commentLoading
              ? editingCommentId
                ? "Updating..."
                : "Posting..."
              : editingCommentId
              ? "Update"
              : "Post"}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-1">
        {getCommentsLoading
          ? Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 py-3 animate-pulse">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gray-300 rounded-full" />

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-gray-300 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          : postComments.map((comment) => (
              <CommentItem
                key={comment.id}
                onAddReply={addReply}
                comment={comment}
                setNewComment={setNewComment}
                setEditingCommentId={setEditingCommentId}
              />
            ))}
      </div>
    </div>
  );
}
