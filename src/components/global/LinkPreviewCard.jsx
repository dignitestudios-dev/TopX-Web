import React, { useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";

export default function LinkPreviewCard({ linkData }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!linkData || !linkData.url) return null;

  const { url, fullUrl, domain, thumbnail, isYoutube, videoId } = linkData;
  const href = fullUrl || (url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isYoutube && videoId) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full my-3 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow transition-all duration-200">
      {/* Media / Video Section */}
      {isYoutube && isPlaying && videoId ? (
        <div className="relative w-full aspect-video bg-black min-h-[220px] max-h-[450px]">
          <iframe
            className="w-full h-full min-h-[220px] rounded-t-2xl"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(false);
            }}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors z-10 shadow-md"
            title="Close video player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : thumbnail ? (
        <div
          onClick={isYoutube && videoId ? handlePlayClick : undefined}
          className={`block relative group overflow-hidden bg-black max-h-[420px] ${isYoutube && videoId ? "cursor-pointer" : ""
            }`}
        >
          <img
            src={thumbnail}
            alt="Link thumbnail"
            className="w-full h-auto max-h-[420px] object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {isYoutube && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
              <div className="w-16 h-11 bg-red-600 group-hover:bg-red-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Info Section */}
      <div className="p-3 bg-gray-50/60 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium capitalize mb-0.5 flex items-center gap-1">
            {domain}
            <ExternalLink className="w-3 h-3 text-gray-400 inline shrink-0" />
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-normal break-all hover:underline leading-relaxed block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
        </div>

        {isYoutube && videoId && !isPlaying && (
          <button
            onClick={handlePlayClick}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            <span>Play</span>
          </button>
        )}
      </div>
    </div>
  );
}
