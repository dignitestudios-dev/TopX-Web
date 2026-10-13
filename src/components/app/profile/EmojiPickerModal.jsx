
import React, { useState, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import axios from "../../../axios";
import { ErrorToast } from "../../global/Toaster";

const LIMIT = 100;

export default function EmojiPickerModal({
  isOpen,
  onClose,
  onSelectEmoji,
  zIndex = "z-[130]",
}) {
  const [emojis, setEmojis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const scrollContainerRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const requestIdRef = useRef(0);

  // Fetch first page when modal opens or search changes
  useEffect(() => {
    if (!isOpen) return;

    const requestId = ++requestIdRef.current;

    loadingRef.current = false;
    pageRef.current = 1;
    totalPagesRef.current = 1;

    setEmojis([]);
    setPage(1);
    setTotalPages(1);
    setLoadingMore(false);
    setLoading(true);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    const timer = setTimeout(() => {
      fetchEmojis(searchQuery, 1, false, requestId);
    }, searchQuery.trim() ? 400 : 0);

    return () => {
      clearTimeout(timer);
      requestIdRef.current++;
    };
  }, [isOpen, searchQuery]);

  // Fetch paginated emojis from backend
  const fetchEmojis = async (
    search = "",
    nextPage = 1,
    append = false,
    requestId = requestIdRef.current
  ) => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get("/emojis", {
        params: {
          limit: LIMIT,
          page: nextPage,
          search: search.trim(),
        },
      });

      // Ignore stale responses
      if (requestId !== requestIdRef.current) return;

      const body = response?.data;
      const emojiList = Array.isArray(body?.data)
        ? body.data
        : [];

      const pagination = body?.pagination || {};

      const currentPage = Number(
        pagination.currentPage ?? nextPage
      );

      const pages = Number(
        pagination.totalPages ?? currentPage
      );

      setEmojis((previous) => {
        if (!append) return emojiList;

        const existingIds = new Set(
          previous.map((emoji) => emoji._id)
        );

        const uniqueEmojis = emojiList.filter(
          (emoji) => !existingIds.has(emoji._id)
        );

        return [...previous, ...uniqueEmojis];
      });

      pageRef.current = currentPage;
      totalPagesRef.current = pages;

      setPage(currentPage);
      setTotalPages(pages);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error("Failed to fetch emojis:", error);
        ErrorToast("Failed to load emojis. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // Load the next page when scrolling near the bottom
  const handleEmojiScroll = (event) => {
    const element = event.currentTarget;

    const nearBottom =
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - 100;

    if (
      nearBottom &&
      !loadingRef.current &&
      pageRef.current < totalPagesRef.current
    ) {
      fetchEmojis(
        searchQuery,
        pageRef.current + 1,
        true,
        requestIdRef.current
      );
    }
  };

  // Automatically fill the visible area if 30 items
  // are not enough to make the container scrollable.
  useEffect(() => {
    if (
      !isOpen ||
      loading ||
      loadingMore ||
      emojis.length === 0 ||
      page >= totalPages
    ) {
      return;
    }

    const element = scrollContainerRef.current;

    if (
      element &&
      element.scrollHeight <= element.clientHeight + 1
    ) {
      fetchEmojis(
        searchQuery,
        pageRef.current + 1,
        true,
        requestIdRef.current
      );
    }
  }, [isOpen, loading, loadingMore, emojis, page, totalPages, searchQuery]);

  const handleClose = () => {
    requestIdRef.current++;
    loadingRef.current = false;
    setLoading(false);
    setLoadingMore(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${zIndex} transition-opacity`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}
      >
        <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl relative border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">
                Choose an Emoji
              </h3>

              <p className="text-[12px] text-gray-500">
                Select an emoji to set as your profile picture
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Backend Search */}
          <div className="my-4 relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search emojis..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              className="w-full h-[42px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-[14px] text-[14px] outline-none focus:border-[#f85e00] focus:bg-white transition-all"
            />
          </div>

          {/* Emoji Grid */}
          <div
            ref={scrollContainerRef}
            onScroll={handleEmojiScroll}
            className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[220px]"
          >
            {loading ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2
                  className="animate-spin text-[#f85e00]"
                  size={28}
                />

                <span className="text-sm font-medium">
                  Loading emojis...
                </span>
              </div>
            ) : emojis.length > 0 ? (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji._id}
                      type="button"
                      onClick={() => {
                        onSelectEmoji(emoji.url);
                        handleClose();
                      }}
                      className="group relative flex items-center justify-center p-3 rounded-[16px] border border-gray-100 hover:border-[#f85e00] bg-gray-50/60 hover:bg-[#FFF5F2] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <img
                        src={emoji.url}
                        alt={emoji.name || "Emoji"}
                        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
                    <Loader2
                      className="animate-spin text-[#f85e00]"
                      size={20}
                    />

                    <span className="text-sm">
                      Loading more emojis...
                    </span>
                  </div>
                )}

                {!loadingMore && page >= totalPages && (
                  <p className="text-center text-xs text-gray-400 py-3">
                    No more emojis
                  </p>
                )}
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm font-medium">
                No emojis found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
