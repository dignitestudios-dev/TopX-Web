import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch } from "react-redux";
import { fetchpostfeed, likePost } from "../../redux/slices/postfeed.slice";
import { timeAgo } from "../../lib/helpers";

export default function CollectionFeedPostCard({
  post,
  author,
  likedCount,
  commentCount,
  shareCount,
  toggleLike,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const dispatch = useDispatch();

  const isLiked = likedCount[post.id];

  console.log(post[0]?.fileUrl, "allnewpost");

  const postislike = post.postlike;

  const firstImage = post[0]?.fileUrl;

  const handleLikeClick = (postId, currentLikeStatus) => {
    toggleLike(postId);
    dispatch(likePost({ postId, likeToggle: !currentLikeStatus }));
  };

  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={author.profilePicture}
            alt={author.user}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              {author.name}
            </h3>
            <p className="text-xs text-gray-500">
              {author.username} · {timeAgo(author.createdAt)}
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
      {firstImage && (
        <div
          className="w-full bg-white overflow-hidden p-4 cursor-pointer hover:opacity-90 transition relative"
          onClick={() => {
            setImageViewerOpen(true);
          }}
        >
          <img
            src={firstImage}
            alt="post"
            className="w-full h-auto rounded-2xl object-cover max-h-96"
          />

          {/* Image count badge */}
          {/* {post.postimage.length > 1 && (
            <div className="absolute top-[30px] right-[30px] bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
              +{post.postimage.length}
            </div>
          )} */}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
      </div>

      {/* Stats - Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          onClick={() => handleLikeClick(post.id, postislike)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${
              postislike ? "fill-orange-500 text-orange-500" : "text-gray-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              postislike ? "text-orange-500" : "text-gray-600"
            }`}
          >
            {post.stats?.likes}
          </span>
        </button>

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>

        <button className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{shareCount}</span>
        </button>
      </div>

      {/* Image Viewer Modal */}
      <PostImageViewerModal
        post={post}
        author={author}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />

      {/* Comments Section */}
      {commentsOpen && <CommentsSection postId={post.id} />}
    </div>
  );
}
