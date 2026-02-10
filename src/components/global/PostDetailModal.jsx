import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { timeAgo } from "../../lib/helpers";

export default function PostImageViewerModal({
  post,
  author,
  isOpen,
  onClose,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ ADD: media type helper
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  const images = React.useMemo(() => {
    if (!post) return [];

    if (Array.isArray(post)) {
      return post.map((item) => item?.fileUrl).filter(Boolean);
    }

    if (Array.isArray(post?.postimage)) {
      return post.postimage.filter(Boolean);
    }

    if (post?.fileUrl) {
      return [post.fileUrl];
    }

    return [];
  }, [post]);

  console.log(post,"postpost")

  const currentImage = images[currentImageIndex];

  useEffect(() => {
    if (currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images, currentImageIndex]);

  // ✅ SAFETY
  if (!isOpen || !currentImage) return null;

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleClose = () => {
    setCurrentImageIndex(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[95vh] flex flex-col bg-black rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-black">
          <div className="flex items-center gap-3">
            <img
              src={author?.profilePicture}
              alt={author?.user}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-white text-sm">
                {author?.name}
              </h3>
              <p className="text-gray-500 text-xs">
                {author?.username} ·{" "}
                {timeAgo(author?.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-gray-900 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Text */}
        <div className="px-4 py-3 bg-black border-b border-gray-700">
          <p className="text-white text-sm leading-relaxed">
            {post.text}
          </p>
        </div>

        {/* Media Container */}
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden min-h-[300px]">
          {/* ✅ REPLACE IMG WITH CONDITIONAL MEDIA */}
          {isVideo(currentImage) ? (
            <video
              src={currentImage}
              controls
              playsInline
              muted={false}
              preload="metadata"
              onClick={(e) => e.stopPropagation()}   // ✅ MOST IMPORTANT
              className="max-w-full max-h-full w-full h-full object-contain rounded-lg"
            />


          ) : (
            <img
              src={currentImage}
              alt="post"
              className="max-w-full max-h-full object-contain"
            />
          )}

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-gray-800 p-2 rounded-full transition bg-black bg-opacity-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-gray-800 p-2 rounded-full transition bg-black bg-opacity-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="p-3 bg-black border-t border-gray-700 flex gap-2 justify-center">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`transition ${index === currentImageIndex
                  ? "bg-white w-6 h-1.5"
                  : "bg-gray-600 w-1.5 h-1.5"
                  } rounded-full`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
