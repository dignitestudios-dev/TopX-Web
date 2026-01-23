import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { repostPostToPages } from "../../redux/slices/pages.slice";
import { SuccessToast, ErrorToast } from "./Toaster";

const ShareToPagesModal = ({ postId, onClose }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { myPages, pagesLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);

  const togglePage = (pageId) => {
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter((id) => id !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  const handleShare = async () => {
    if (!postId || selectedPages.length === 0) {
      ErrorToast("Please select at least one page");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        repostPostToPages({
          postId,
          pageIds: selectedPages,
        })
      ).unwrap();
      SuccessToast("Post shared successfully");
      onClose("");
      setSelectedPages([]);
    } catch (error) {
      ErrorToast(error || "Failed to share post");
    } finally {
      setLoading(false);
    }
  };

  // Filter pages based on search term
  const filteredPages = myPages.filter((page) =>
    page.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Share to Your Pages</h2>
          <button
            onClick={() => onClose("")}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search pages"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
          {pagesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredPages.length > 0 ? (
            filteredPages.map((page) => (
              <div
                key={page._id}
                onClick={() => togglePage(page._id)}
                className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
              >
                <div className="flex items-center gap-3">
                  {page.image ? (
                    <img
                      src={page.image}
                      alt={page.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      {page.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {page.name}
                    </span>
                    {page.topic && (
                      <p className="text-xs text-gray-500">{page.topic}</p>
                    )}
                  </div>
                </div>

                <div
                  className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ${
                    selectedPages.includes(page._id)
                      ? "bg-orange-500 border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPages.includes(page._id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                {searchTerm ? "No pages found" : "No pages available"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleShare}
            disabled={!selectedPages.length || loading}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sharing..." : `Share to ${selectedPages.length} Page${selectedPages.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareToPagesModal;




