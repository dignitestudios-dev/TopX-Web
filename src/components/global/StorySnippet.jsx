import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { Heart, MessageCircle, Share2 } from "lucide-react";

const StorySnippet = React.forwardRef(({ post }, ref) => {
  const originalUrl = post?.postimage?.[0];
  const [imageSrc, setImageSrc] = useState(null);

  // Fetch image through backend proxy with proper headers, then use a blob URL
  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadImage = async () => {
      if (!originalUrl) {
        setImageSrc(null);
        return;
      }

      try {
        const response = await axios.get("/uploads/proxy-image", {
          params: { url: originalUrl },
          responseType: "blob",
        });

        if (!isMounted) return;

        objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (error) {
        console.error("Failed to load story image via proxy", error);
        if (isMounted) {
          // Fallback: use original URL directly so image still appears in screenshot
          setImageSrc(originalUrl || null);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [originalUrl]);

  return (
    <div
      ref={ref}
      className="w-[360px] h-[640px] bg-black flex items-center justify-center"
      style={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Centered post card */}
      <div className="w-[340px] bg-white rounded-2xl shadow-md overflow-hidden flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
            {post?.user?.slice(0, 2)?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-gray-900">
              {post?.user}
            </span>
            <span className="text-xs text-gray-500">{post?.time}</span>
          </div>
        </div>

        {/* Image */}
        {imageSrc && (
          <div className="w-full mb-3 rounded-xl overflow-hidden">
            <img
              src={imageSrc}
              alt="post"
              className="w-full h-[220px] object-cover"
            />
          </div>
        )}

        {/* Text */}
        {post?.text && (
          <p className="text-sm text-gray-900 leading-snug mb-3">
            {post?.text}
          </p>
        )}

        {/* Actions row (visual only) */}
        <div className="mt-auto flex items-center gap-6 text-xs text-orange-500">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Share2 className="w-4 h-4" />
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StorySnippet;
