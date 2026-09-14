import React, { useState, useEffect } from "react";
import { X, Search, Plus, Radio } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchMyPages } from "../../../redux/slices/pages.slice";
import { startStream } from "../../../redux/slices/livestream.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";
import { checkMediaPermissions } from "../../../lib/helpers";
import LivePermissionModal from "../../global/LivePermissionModal";

export default function LiveStreaming({
  setIsOpen,
  isOpen,
  title = "Start Live Streaming",
  setSelectedType,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPageId, setLoadingPageId] = useState(null);
  const [pendingPageId, setPendingPageId] = useState(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionErrorMessage, setPermissionErrorMessage] = useState("");
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { myPages, pagesLoading } = useSelector((state) => state.pages);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMyPages({ page: 1, limit: 100 }));
    }
  }, [dispatch, isOpen]);

  const userPages = Array.isArray(myPages) ? myPages : [];

  const filteredPages = userPages.filter((page) =>
    (page?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoLive = async (pageId) => {
    if (!pageId) {
      ErrorToast("Page ID is required");
      return;
    }

    setLoadingPageId(pageId);
    setPendingPageId(pageId);

    // Check camera & mic permissions first
    const permissionResult = await checkMediaPermissions();
    if (!permissionResult.success) {
      setLoadingPageId(null);
      setPermissionErrorMessage(permissionResult.error);
      setPermissionModalOpen(true);
      return;
    }

    try {
      const res = await dispatch(startStream(pageId));

      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast("Stream started successfully! Redirecting...");
        setTimeout(() => {
          setIsOpen(false);
          navigate(`/live-stream/${pageId}`, {
            state: { fromGoLive: true },
          });
          setLoadingPageId(null);
        }, 1000);
      } else {
        ErrorToast(
          res.payload?.message ||
            res.payload ||
            res.error?.message ||
            "Failed to start live stream"
        );
        setLoadingPageId(null);
      }
    } catch (err) {
      ErrorToast(err.message || "Failed to start live stream");
      setLoadingPageId(null);
    }
  };

  const handleRetryPermission = async () => {
    setIsCheckingPermission(true);
    const permissionResult = await checkMediaPermissions();
    setIsCheckingPermission(false);

    if (permissionResult.success) {
      setPermissionModalOpen(false);
      if (pendingPageId) {
        handleGoLive(pendingPageId);
      }
    } else {
      setPermissionErrorMessage(permissionResult.error);
      ErrorToast(permissionResult.error);
    }
  };

  const handleCreateNewPage = () => {
    if (typeof setSelectedType === "function") {
      setSelectedType("Create New Page");
    } else {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden pointer-events-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Radio className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {title || "Select Page to Go Live"}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            {userPages.length > 0 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-orange-500 transition-all border border-gray-100"
                />
              </div>
            )}

            {/* Pages List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {pagesLoading ? (
                <div className="py-12 text-center">
                  <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium animate-pulse">
                    Loading your pages...
                  </p>
                </div>
              ) : userPages.length === 0 ? (
                /* Empty state: User has no pages */
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50/70 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                    <Radio size={24} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    No Pages Found
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs mb-4 leading-relaxed">
                    You need to own at least one page to start a live stream. Create a new page to get started!
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateNewPage}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Create New Page</span>
                  </button>
                </div>
              ) : filteredPages.length === 0 ? (
                /* Empty search results */
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">
                    No pages found matching &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              ) : (
                filteredPages.map((page) => {
                  const isCurrentLoading = loadingPageId === page._id;
                  return (
                    <div
                      key={page._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        {page.image ? (
                          <img
                            src={page.image}
                            alt={page.name}
                            className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold uppercase flex-shrink-0 text-base shadow-sm">
                            {page.name?.charAt(0) || "P"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-gray-900 font-semibold text-sm block truncate">
                            {page.name}
                          </span>
                          {page.topic && (
                            <span className="text-xs text-gray-400 block truncate">
                              {page.topic}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleGoLive(page._id)}
                        disabled={loadingPageId !== null}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
                      >
                        {isCurrentLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <Radio size={13} />
                            <span>Go live</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <LivePermissionModal
        isOpen={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        onRetry={handleRetryPermission}
        errorMessage={permissionErrorMessage}
        isChecking={isCheckingPermission}
      />
    </>
  );
}