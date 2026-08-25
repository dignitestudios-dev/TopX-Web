import React, { useEffect, useState } from "react";
import { X, Search, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyPages,
  repostPostToPages,
} from "../../redux/slices/pages.slice";
import { ErrorToast, SuccessToast } from "./Toaster";

const ShareRepostModal = ({ onClose, postId }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { myPages } = useSelector((state) => state?.pages);
  const togglePage = (pageId) => {
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter((id) => id !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  const filteredPages = (myPages || []).filter((page) =>
    page?.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleRepost = () => {
    if (selectedPages.length === 0) {
      ErrorToast("Please select at least one page");
      return;
    }

    dispatch(
      repostPostToPages({
        postId: postId, // jo post share ho rahi
        pageIds: selectedPages,
      }),
    )
      .unwrap()
      .then(() => {
        dispatch(fetchMyPages({ page: 1, limit: 100 }));
        SuccessToast("Post reposted successfully");
        onClose();
      })
      .catch((err) => ErrorToast(err));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Repost</h2>
          <button
            onClick={onClose}
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
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
          {filteredPages.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-6">
              No pages found
            </p>
          ) : (
            filteredPages.map((page) => (
              <div
                key={page._id}
                onClick={() => togglePage(page._id)}
                className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Page Image with Initial Letter Fallback */}
                  <div className="w-10 h-10 flex-shrink-0">
                    {page.image ? (
                      <img
                        src={page.image}
                        alt={page.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: page.image ? "none" : "flex" }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 items-center justify-center text-white font-bold text-sm select-none flex-shrink-0"
                    >
                      {page.name?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                  </div>

                  <span className="font-medium text-sm text-gray-900 truncate">
                    {page.name}
                  </span>
                </div>

                <span
                  className={`w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0 ml-2 ${
                    selectedPages.includes(page._id)
                      ? "bg-orange-500 border-orange-500 text-white font-bold text-xs"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPages.includes(page._id) && "✓"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleRepost}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium hover:bg-orange-700 transition"
          >
            Repost Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareRepostModal;
