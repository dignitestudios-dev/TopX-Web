import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export default function TrendingPostCard({ post, liked, toggleLike }) {
  const timeAgo = (createdAt) => {
    const now = new Date();
    const then = new Date(createdAt);
    const seconds = Math.floor((now - then) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  console.log(post, "postcode")

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-start justify-between border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={post.author?.profilePicture || "https://rapidapi.com/hub/_next/image?url=https%3A%2F%2Frapidapi-prod-apis.s3.amazonaws.com%2Fbdcd6ceb-1d10-4c3b-b878-4fc8d2e2059f.png&w=3840&q=75"}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-800">
              {post.author?.name}
            </p>
            <p className="text-xs text-gray-500">
              @{post.author?.username} • {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      {/* Page Info */}
      {/* {post.page && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src={post.page?.image || post.page?.user?.profilePicture}
              alt={post.page?.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-800">
                {post.page?.name}
              </p>
              <p className="text-xs text-gray-500">{post.page?.topic}</p>
            </div>
          </div>
        </div>
      )} */}

      {/* Post Content */}
      <div className="p-4">


        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 mb-3 ${post.media.length === 1 ? 'grid-cols-1' :
              post.media.length === 2 ? 'grid-cols-2' :
                'grid-cols-2'
            }`}>
            {post.media.slice(0, 4).map((media, idx) => (
              <div
                key={media._id || idx}
                className={`rounded-lg overflow-hidden bg-gray-200 ${post.media.length === 1 ? 'h-72' : 'h-48'
                  }`}
              >
                {media.type === 'image' ? (
                  <img
                    src={media.fileUrl}
                    alt="post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                ) : (
                  <video
                    src={media.fileUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
            ))}
            {post.media.length > 4 && (
              <div className="rounded-lg bg-gray-300 h-48 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{post.media.length - 4}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-800 leading-snug mb-3">
          {post.bodyText}
        </p>

        {/* Keywords */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.keywords.slice(0, 3).map((keyword, idx) => (
              <span
                key={idx}
                className="text-xs text-orange-500 font-medium cursor-pointer hover:text-orange-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-600 px-4 py-3 border-t border-gray-100">
        <button
          onClick={() => toggleLike(post._id)}
          className="flex items-center gap-2 hover:text-orange-500 transition-colors group"
        >
          <Heart
            className={`w-5 h-5 transition-all ${liked[post._id] ? 'fill-orange-500 text-orange-500' : 'text-gray-400 group-hover:text-orange-500'
              }`}
          />
          <span className={liked[post._id] ? 'text-orange-500 font-semibold' : ''}>
            {post.likesCount}
          </span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
          <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
          <span>{post.commentsCount}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
          <Share2 className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
          <span>{post.sharesCount}</span>
        </button>
      </div>
    </div>
  );
}