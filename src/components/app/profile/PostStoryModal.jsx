import { useEffect, useState } from "react";
import { X, Search, Plus, ChevronRight, FileText } from "lucide-react";
import Input from "../../common/Input";
import Button from "../../common/Button";
import Avatar from "../../common/Avatar";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../../redux/slices/pages.slice";
import { ErrorToast } from "../../global/Toaster";

export default function PostStoryModal({
  setIsOpen,
  isOpen,
  title,
  setSelectedType,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const [selectedPages, setSelectedPages] = useState([]);

  const { myPages, pagesLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);

  const togglePageSelection = (pageId) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleCreateNewPage = () => {
    if (typeof setSelectedType === "function") {
      setSelectedType("Create New Page");
    }
  };

  const userPages = Array.isArray(myPages) ? myPages : [];

  const filteredPages = userPages.filter((page) =>
    (page?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    if (selectedPages.length > 2) {
      ErrorToast("You can select only 2 pages");
      return;
    }

    if (selectedPages.length === 0) {
      ErrorToast("Please select at least 1 page");
      return;
    }

    setSelectedType({
      type: "upload story",
      pages: selectedPages,
    });
  };

  return (
    <div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {title || "Select Page"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select a page to publish your{" "}
                    {title?.toLowerCase()?.includes("story") ? "story" : "post"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-4">
                {/* Search Bar - only when pages exist */}
                {userPages.length > 0 && (
                  <div className="relative mb-3">
                    <Input
                      type="text"
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      iconLeft={<Search className="text-gray-400" size={18} />}
                      size="md"
                    />
                  </div>
                )}

                {/* Create New Page Shortcut Button */}
                {userPages.length > 0 && (
                  <div
                    onClick={handleCreateNewPage}
                    className="flex items-center justify-between p-3 rounded-xl border border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50 transition-all cursor-pointer group mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 group-hover:bg-orange-500 text-orange-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus size={18} />
                      </div>
                      <div>
                        <span className="text-orange-600 font-semibold text-sm block">
                          Create New Page
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Add a new topic page to post to
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-orange-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                )}

                {/* Pages List Container */}
                <div className="space-y-2 max-h-72 overflow-y-auto mb-4 pr-1 custom-scrollbar">
                  {pagesLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <p className="text-gray-500 text-sm animate-pulse">
                        Loading your pages...
                      </p>
                    </div>
                  ) : userPages.length === 0 ? (
                    /* EMPTY STATE: User has no created pages */
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50/70 rounded-2xl border border-gray-100">
                      <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                        <FileText size={28} />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        No Topic Pages Yet
                      </h3>
                      <p className="text-xs text-gray-500 max-w-xs mb-5 leading-relaxed">
                        You need at least one topic page to create and publish a post. Create a new page now to get started!
                      </p>
                      <button
                        type="button"
                        onClick={handleCreateNewPage}
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-sm active:scale-98 cursor-pointer"
                      >
                        <Plus size={18} />
                        <span>Create New Page</span>
                      </button>
                    </div>
                  ) : filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <div
                        key={page._id}
                        onClick={() => togglePageSelection(page._id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedPages.includes(page._id)
                            ? "border-orange-500 bg-orange-50/30"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar
                            src={page.image}
                            alt={page.name}
                            size="md"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-900 font-medium text-sm block truncate">
                              {page.name}
                            </span>
                            {page.topic && (
                              <span className="text-xs text-gray-400 block truncate">
                                {page.topic}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ml-2 ${
                            selectedPages.includes(page._id)
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selectedPages.includes(page._id) && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Search empty state */
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-gray-500 text-sm mb-3">
                        No pages match "{searchQuery}"
                      </p>
                      <button
                        type="button"
                        onClick={handleCreateNewPage}
                        className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-semibold text-xs transition cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Create a new page instead</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                {userPages.length > 0 && (
                  <Button
                    onClick={handleNext}
                    className="w-full flex justify-center"
                    variant="orange"
                    size="lg"
                    disabled={selectedPages.length === 0}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
