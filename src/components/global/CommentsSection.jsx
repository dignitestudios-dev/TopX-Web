import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, MoreVertical, X, Star } from "lucide-react";
import {
  createComment,
  deleteComment,
  demoteComment,
  elevateComment,
  getComment,
  likeComment,
  updateComment,
} from "../../redux/slices/postfeed.slice";
import { timeAgo } from "../../lib/helpers";
import ReportModal from "./ReportModal"; // Report Modal
import BlockingOptionsModal from "./BlockingOptionsModal"; // Block Modal
import { sendReport } from "../../redux/slices/reports.slice";
import { blockUser } from "../../redux/slices/profileSetting.slice";
import { SuccessToast, ErrorToast } from "./Toaster";
import { TiPin } from "react-icons/ti";

export default function CommentsSection({
  postId,
  isPageOwner = false,
  pageId = null,
}) {
  const { user } = useSelector((state) => state.auth);
  const { commentLoading, postComments, getCommentsLoading } = useSelector(
    (state) => state.postsfeed,
  );
  // Get post from Redux state to extract pageId and page owner
  const { posts, pagepost, allfeedposts } = useSelector(
    (state) => state.posts || {},
  );
  const allPosts = [
    ...(posts || []),
    ...(pagepost || []),
    ...(allfeedposts || []),
  ];
  const currentPost = allPosts.find((p) => p._id === postId);
  // Extract pageId from post
  const postPageId =
    currentPost?.page?._id ||
    currentPost?.pageId ||
    currentPost?.page ||
    pageId;
  // Extract page owner ID (user who owns the page)
  const pageOwnerId =
    currentPost?.page?.user?._id ||
    currentPost?.page?.user ||
    currentPost?.author?._id ||
    currentPost?.author ||
    user?._id;
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [reportmodal, setReportmodal] = useState(false); // To manage report modal state
  const [reportTargetId, setReportTargetId] = useState(null); // Store the comment ID to report
  const [blockModal, setBlockModal] = useState(false); // To manage block modal state
  const [blockTargetId, setBlockTargetId] = useState(null); // Store the comment/user ID to block
  const [blockUserId, setBlockUserId] = useState(null); // Store the user ID to block (comment user)
  const [blockPageId, setBlockPageId] = useState(null); // Store the page ID for blocking
  const [blockPageOwnerId, setBlockPageOwnerId] = useState(null); // Store the page owner ID for blocking
  const { isLoading: blockLoading } = useSelector(
    (state) => state.profileSetting || {},
  );
  const dispatch = useDispatch();

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
          }),
        ).unwrap();
      } else {
        // ➕ CREATE
        await dispatch(
          createComment({
            post: postId,
            text: newComment,
          }),
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

  const handleElevateComment = async (commentId, status) => {
    try {
      if (status == "demote") {
        await dispatch(demoteComment(commentId)).unwrap();
      } else {
        await dispatch(elevateComment(commentId)).unwrap();
      }
      SuccessToast(
        status == "demote"
          ? "Comment undo elevated successfully"
          : "Comment elevated successfully",
      );
      handleGetComments();
    } catch (error) {
      console.error("Failed to elevate comment:", error);
      // Prefer exact API message over generic text
      const apiMessage =
        (typeof error === "string" && error) ||
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.payload?.message ||
        error?.message ||
        "Failed to elevate comment";
      ErrorToast(apiMessage);
    }
  };

  const handleBlockUser = (commentId, userId, commentPageId = null) => {
    setBlockTargetId(commentId);
    setBlockUserId(userId); // Comment user ID (who is being blocked)
    // Use pageId from comment, post, prop, or fallback
    setBlockPageId(commentPageId || postPageId || pageId);
    // Set page owner ID (page owner who is blocking)
    setBlockPageOwnerId(pageOwnerId);
    setBlockModal(true);
  };

  const handleBlockSubmit = async (option) => {
    try {
      // Map option to blockedFrom value
      const blockedFromMap = {
        comment: "Comment",
        view: "Page",
        all: "Global",
      };

      // Determine targetId based on option:
      // - "view": use pageId
      // - "all": use pageOwnerId (page owner's ID who is blocking)
      // - "comment": use commentId
      let targetId;
      if (option === "view") {
        targetId = blockPageId;
      } else if (option === "all") {
        targetId = blockPageOwnerId; // Use page owner ID for global block
      } else {
        targetId = blockTargetId; // Use comment ID for comment block
      }

      if (!targetId) {
        if (option === "view") {
          ErrorToast("Page ID not found. Unable to block from viewing.");
        } else if (option === "all") {
          ErrorToast("Page owner ID not found. Unable to block user.");
        } else {
          ErrorToast("Target ID not found");
        }
        return;
      }

      const payload = {
        reason: "User blocked from comment",
        userId: blockUserId,
        blockedFrom: blockedFromMap[option] || "Comment",
        targetId: targetId,
        isBlocked: true,
      };

      await dispatch(blockUser(payload)).unwrap();
      SuccessToast("User blocked successfully");
      setBlockModal(false);
      setBlockTargetId(null);
      setBlockUserId(null);
      setBlockPageId(null);
      setBlockPageOwnerId(null);
      handleGetComments(); // Refresh comments
    } catch (error) {
      console.error("Failed to block user:", error);
      ErrorToast(error?.message || "Failed to block user");
    }
  };

  const CommentItem = ({
    comment,
    isReply = false,
    parentId = null,
    onAddReply,
    setNewComment,
    setEditingCommentId,
    onDeleteComment,
    onElevateComment,
    onReportComment,
    onBlockUser,
  }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    console.log(comment, "comments--->");
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

    // Menu items for comment actions
    const menuItems = [
      // Show "Edit" only if the comment belongs to the logged-in user
      ...(comment.user._id === user._id
        ? [
            {
              label: "Edit",
              action: () => {
                setNewComment(comment.text); // input fill
                setEditingCommentId(comment._id); // edit mode ON
              },
            },
          ]
        : []),

      // Show "Delete" if the comment belongs to the logged-in user
      ...(comment.user._id === user._id
        ? [
            {
              label: "Delete",
              action: () => handleDeleteComment(comment?._id),
            },
          ]
        : []),

      // Show "Elevate Comment" if the comment belongs to the logged-in user
      ...(comment.user._id === user._id
        ? [
            {
              label: comment?.isElevated
                ? "Undo Elevate Comment"
                : "Elevate Comment",
              action: () => {
                onElevateComment(
                  comment._id,
                  comment?.isElevated ? "demote" : "elevate",
                );
              },
            },
          ]
        : []),

      // Show options based on whether it's user's own page or someone else's page
      ...(comment.user._id !== user._id
        ? isPageOwner
          ? [
              // If it's MY page, show these options for comments from others
              {
                label: comment?.isElevated ? "Undo Elevate" : "Elevate Comment",
                action: () => {
                  onElevateComment(
                    comment._id,
                    comment?.isElevated ? "demote" : "elevate",
                  );
                },
              },
              // Only show "Report and Delete" if not already reported
              ...(!comment.reportedByCurrentUser
                ? [
                    {
                      label: "Report and Delete",
                      action: () => {
                        onReportComment(comment._id);
                      },
                    },
                  ]
                : []),
              {
                label: "Delete.",
                action: () => {
                  onDeleteComment(comment._id);
                },
              },
              {
                label: "Block",
                action: () => {
                  // Extract pageId from comment.post.page._id or comment.post.pageId
                  const commentPageId =
                    comment?.post?.page?._id ||
                    comment?.post?.pageId ||
                    comment?.page?._id ||
                    comment?.pageId ||
                    null;
                  onBlockUser(comment._id, comment.user._id, commentPageId);
                },
              },
            ]
          : [
              // If it's someone else's page, only show Report if not already reported
              ...(!comment.reportedByCurrentUser
                ? [
                    {
                      label: "Report",
                      action: () => {
                        onReportComment(comment._id);
                      },
                    },
                  ]
                : []),
            ]
        : []),
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

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false); // Close dropdown if clicked outside
        }
      };

      // Add event listener on component mount
      document.addEventListener("mousedown", handleClickOutside);

      // Cleanup event listener on component unmount
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className={`py-5 ${isReply ? "ml-12 mt-3" : "mt-4"}`}>
        <div className="flex gap-3 ">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ED6416] text-white flex-shrink-0">
            {comment.user?.profilePicture ? (
              <img
                src={comment.user?.profilePicture}
                alt={comment.user?.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="font-[600] text-sm uppercase">
                {comment?.user?.username ? comment.user.username[0] : "?"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <p className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                {comment.user?.name}
                {comment.isElevated && <TiPin />}
                {comment.isAdmin && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-700">{comment.text}</p>
              {comment.reportedByCurrentUser && (
                <p className="text-xs text-orange-500 font-medium mt-2">
                  This Comment has been reported
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <button
                onClick={() => toggleLike(comment?._id)}
                className="flex items-center gap-1 hover:text-orange-500 transition"
              >
                <Heart
                  className={`w-4 h-4 ${comment.isLiked ? "fill-orange-500 text-orange-500" : ""}`}
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
          {/* Only show three dots icon if there are menu items available */}
          {menuItems.length > 0 && (
            <div className="relative z-50">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isOpen && (
                <div
                  ref={dropdownRef} // Attach ref to the dropdown menu
                  className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 -z-1"
                >
                  {menuItems.map((item, index) => {
                    if (!isAuthor && item.label === "Delete") {
                      return null; // Prevent the delete option from showing for other users
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
            setNewComment={setNewComment}
            setEditingCommentId={setEditingCommentId}
            onDeleteComment={onDeleteComment}
            onElevateComment={onElevateComment}
            onReportComment={onReportComment}
            onBlockUser={onBlockUser}
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

      {/* Top-level comments: elevated first */}
      {(() => {
        const sortedComments = Array.isArray(postComments)
          ? [...postComments].sort((a, b) => {
              const aElevated = a?.isElevated ? 1 : 0;
              const bElevated = b?.isElevated ? 1 : 0;
              // Elevated comments first; keep relative order otherwise
              return bElevated - aElevated;
            })
          : [];

        return (
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
              : sortedComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    onAddReply={addReply}
                    comment={comment}
                    setNewComment={setNewComment}
                    setEditingCommentId={setEditingCommentId}
                    onDeleteComment={handleDeleteComment}
                    onElevateComment={handleElevateComment}
                    onReportComment={(commentId) => {
                      setReportTargetId(commentId);
                      setReportmodal(true);
                    }}
                    onBlockUser={handleBlockUser}
                  />
                ))}
          </div>
        );
      })()}

      {/* Old list kept for reference
      {/* Report Modal */}
      <ReportModal
        isOpen={reportmodal}
        onClose={() => setReportmodal(false)}
        loading={commentLoading}
        onSubmit={(reason) => {
          dispatch(
            sendReport({
              reason,
              targetModel: "Comment",
              targetId: reportTargetId, // Use the comment's target ID for reporting
              isReported: true,
            }),
          );
        }}
      />

      {/* Block Modal */}
      <BlockingOptionsModal
        isOpen={blockModal}
        onClose={() => {
          setBlockModal(false);
          setBlockTargetId(null);
          setBlockUserId(null);
          setBlockPageId(null);
          setBlockPageOwnerId(null);
        }}
        onSubmit={handleBlockSubmit}
        loading={blockLoading}
      />
    </div>
  );
}
