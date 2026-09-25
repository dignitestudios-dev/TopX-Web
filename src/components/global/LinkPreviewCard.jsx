import React, { useState, useEffect } from "react";
import { ExternalLink, Play, X } from "lucide-react";

export default function LinkPreviewCard({ linkData, compact = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ogData, setOgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state immediately when the URL changes
    setOgData(null);
    setIsPlaying(false);

    if (linkData && !linkData.isYoutube && !linkData.thumbnail) {
      setIsLoading(true);
      // Fetch OpenGraph metadata securely
      fetch(`https://api.microlink.io/?url=${encodeURIComponent(linkData.fullUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            setOgData({
              image: data.data.image?.url || data.data.logo?.url,
              title: data.data.title,
              description: data.data.description
            });
          }
        })
        .catch(err => console.error("Error fetching OG data:", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [linkData?.fullUrl]);

  if (!linkData || !linkData.url) return null;

  if (isLoading) {
    return (
      <div className="w-full my-2 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm p-3 flex items-center gap-3">
        <div className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  const { url, fullUrl, domain, thumbnail, isYoutube, videoId } = linkData;
  const href = fullUrl || (url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`);
  
  // Fallback to high-res icon if site uses Cloudflare/anti-bot protection (like Outfitters)
  const fallbackImage = `https://icon.horse/icon/${domain}`;
  const displayThumbnail = thumbnail || ogData?.image || fallbackImage;
  const displayTitle = ogData?.title || domain;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isYoutube && videoId) {
      setIsPlaying(true);
    }
  };

  // Compact horizontal layout (used when post already has user-uploaded image/video)
  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="block w-full my-2 border border-gray-200 hover:border-orange-300 rounded-xl overflow-hidden bg-gray-50/80 hover:bg-orange-50/20 transition-all p-2.5 group shadow-xs hover:shadow-sm"
      >
        <div className="flex items-center gap-3">
          {displayThumbnail && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200/80 relative">
              <img
                src={displayThumbnail}
                alt="Link thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
              {isYoutube && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
                {domain}
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
              {displayTitle}
            </p>
            {ogData?.description && (
              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                {ogData.description}
              </p>
            )}
            <p className="text-[11px] text-orange-600 truncate mt-0.5 font-normal">
              {url}
            </p>
          </div>
        </div>
      </a>
    );
  }

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
      ) : displayThumbnail ? (
        <div
          onClick={isYoutube && videoId ? handlePlayClick : undefined}
          className={`block relative group overflow-hidden bg-black max-h-[420px] ${isYoutube && videoId ? "cursor-pointer" : ""
            }`}
        >
          <img
            src={displayThumbnail}
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
          <p className="text-sm font-semibold text-gray-900 mb-0.5 line-clamp-1">
            {displayTitle}
          </p>
          {ogData?.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
              {ogData.description}
            </p>
          )}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-normal break-all hover:underline leading-relaxed block truncate mt-1"
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
