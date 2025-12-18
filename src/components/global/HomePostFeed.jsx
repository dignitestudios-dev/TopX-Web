import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch } from "react-redux";
import { likePost } from "../../redux/slices/postfeed.slice";
import { useNavigate } from "react-router";

export default function HomePostFeed({ post, liked, toggleLike }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLiked = liked[post.id]; // Check if this post is liked using the post.id key

  console.log(post, "allnewpost");

  const postislike = post.postlike;

  // Check if postimage is array and has images
  const hasImages = Array.isArray(post.postimage) && post.postimage.length > 0;
  const firstImage = hasImages ? post.postimage[0] : null;

  const handleLikeClick = (postId, currentLikeStatus, currentLikesCount) => {
    const newLikeStatus = !currentLikeStatus;

    // Calculate increment based on toggle
    const newLikesCount = newLikeStatus
      ? (currentLikesCount ?? 0) + 1
      : Math.max((currentLikesCount ?? 0) - 1, 0);

    // Optimistic update in localStorage
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = { isLiked: newLikeStatus, likesCount: newLikesCount };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Update UI immediately
    toggleLike(postId, newLikeStatus, newLikesCount);

    // Call API
    dispatch(likePost({ postId, likeToggle: newLikeStatus }));
  };
  console.log(post, "postUsername");
  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-amber-800 text-white flex justify-center items-center rounded-full capitalize">
              {post.user.split(" ")[0][0] + post.user.split(" ")[1][0]}
            </div>
            <img
              src={post.avatar}
              alt={post.user}
              className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover"
            />
          </div>
          <div>
            <h3
              
              className=" font-semibold text-sm text-gray-900"
            >
              {post.user}
            </h3>
            <p onClick={() =>
                navigate("/other-profile", { state: { id: post.author } })
              } className="text-xs cursor-pointer text-gray-500">
              {post.username} · {post.time}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="relative p-2 hover:bg-gray-50 rounded-full transition"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Tag */}
      {/* {post.tag && (
                <div className="px-4 pt-3 pb-2">
                    <span className="inline-block text-orange-600 text-xs font-medium">
                        {post.tag}
                    </span>
                </div>
            )} */}

      {/* Post Images - Thumbnail */}
      {hasImages && (
        <div
          className="w-full bg-white overflow-hidden p-4 cursor-pointer hover:opacity-90 transition relative"
          onClick={() => setImageViewerOpen(true)}
        >
          <img
            src={firstImage}
            alt="post"
            className="w-full h-auto rounded-2xl object-cover max-h-96"
          />

          {/* Image count badge */}
          {post.postimage.length > 1 && (
            <div className="absolute top-[30px] right-[30px] bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
              +{post.postimage.length}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
      </div>

      {/* Stats - Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          onClick={() =>
            handleLikeClick(post.id, post.isLiked, post.likesCount)
          }
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${
              post.isLiked ? "fill-orange-500 text-orange-500" : "text-gray-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              post.isLiked ? "text-orange-500" : "text-gray-600"
            }`}
          >
            {Number(post.likesCount ?? 0)}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.stats.comments}</span>
        </button>

        <button className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.stats.shares}</span>
        </button>
      </div>

      {/* Image Viewer Modal */}
      <PostImageViewerModal
        post={post}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />

      {/* Comments Section */}
      {commentsOpen && <CommentsSection postId={post.id} />}
    </div>
  );
}
