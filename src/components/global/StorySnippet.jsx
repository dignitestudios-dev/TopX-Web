import React from "react";

const StorySnippet = React.forwardRef(({ post }, ref) => {
  return (
    <div
      ref={ref}
      className="w-[360px] h-[640px] bg-white p-4 flex flex-col justify-start relative"
      style={{ fontFamily: "sans-serif" }}
    >
      {/* User info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
          {post.user.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{post.user}</span>
          <span className="text-xs text-gray-500">{post.time}</span>
        </div>
      </div>

      {/* Post text */}
      {post.text && (
        <p className="text-gray-900 text-sm mb-2 line-clamp-3">{post.text}</p>
      )}

      {/* Post image with CORS fix */}
      {post.postimage?.[0] && (
        <img
          src={post.postimage[0]}
          alt="post"
          crossOrigin="anonymous"
          className="w-full h-auto max-h-[400px] object-cover rounded-lg"
        />
      )}
    </div>
  );
});

export default StorySnippet;
