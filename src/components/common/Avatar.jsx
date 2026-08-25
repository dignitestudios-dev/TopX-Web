import React, { useState } from "react";
import { isEmoji } from "../../lib/helpers";

const DEFAULT_FALLBACK_IMG =
  "https://cdn-icons-png.flaticon.com/512/12478/12478035.png";

const sizeClasses = {
  xs: "w-5 h-5 text-[11px]",
  sm: "w-6 h-6 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-2xl",
  "2xl": "w-28 h-28 text-4xl",
};

const emojiSizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
  "2xl": "text-5xl",
};

export default function Avatar({
  src,
  alt = "",
  size = "md",
  className = "",
  fallbackSrc = null,
  fallbackText = "",
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  const baseSize = sizeClasses[size] || sizeClasses.md;
  const emojiSize = emojiSizeClasses[size] || emojiSizeClasses.md;
  const initial =
    (fallbackText || alt)?.trim()?.charAt(0)?.toUpperCase() || "P";

  // If source is a raw Unicode emoji (e.g. "😀", "🚀", "🐶")
  if (src && typeof src === "string" && isEmoji(src)) {
    return (
      <div
        onClick={onClick}
        className={`${baseSize} rounded-full bg-orange-50/90 border border-orange-100 flex items-center justify-center flex-shrink-0 select-none ${emojiSize} ${className}`}
        title={alt}
      >
        <span>{src}</span>
      </div>
    );
  }

  // If image URL is present and hasn't errored
  if (src && typeof src === "string" && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        onError={() => setImgError(true)}
        className={`${baseSize} rounded-full object-cover flex-shrink-0 bg-gray-50 border border-gray-100 ${className}`}
      />
    );
  }

  // Fallback: If fallbackSrc is available and hasn't errored
  if (fallbackSrc && !imgError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        onClick={onClick}
        onError={() => setImgError(true)}
        className={`${baseSize} rounded-full object-cover flex-shrink-0 bg-gray-50 border border-gray-100 ${className}`}
      />
    );
  }

  // Fallback: Initials letter inside gradient badge
  return (
    <div
      onClick={onClick}
      className={`${baseSize} rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0 select-none ${className}`}
      title={alt}
    >
      {initial}
    </div>
  );
}
