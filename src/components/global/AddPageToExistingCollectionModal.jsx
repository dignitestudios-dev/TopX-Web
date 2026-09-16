import React, { useEffect, useState } from "react";
import { X, Check, Search, Lock, Globe, Layers, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SkeletonCard from "./SkeletonCard";
import {
  createPageToCollections,
  getMySubsctiptions,
} from "../../redux/slices/Subscription.slice";
import { getRecommendations } from "../../redux/slices/onboarding.slice";
import Button from "../common/Button";
import Avatar from "../common/Avatar";
import { SuccessToast, ErrorToast } from "./Toaster";

export default function AddPageToExistingCollectionModal({
  isOpen,
  onClose,
  initialCollection = null,
}) {
  const dispatch = useDispatch();
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    initialCollection?._id || ""
  );
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedPagesData, setSelectedPagesData] = useState([]); // full page objects
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);


  const { mySubscriptions } = useSelector((state) => state.subscriptions);
  const {
    recommendations,
    isLoading: recommendationsLoading,
    recommendationPagination,
  } = useSelector((state) => state.onboarding);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setHasMore(true);
      setIsFetchingMore(false);
      dispatch(getMySubsctiptions({ page: 1, limit: 100 }));
      dispatch(getRecommendations({ page: 1, limit: 20, search }));
      setSelectedPages([]);
      setSelectedPagesData([]);
      setSearch("");
      setIsSaving(false);
      setIsDropdownOpen(false);
      if (initialCollection?._id) {
        setSelectedCollectionId(initialCollection._id);
      } else if (mySubscriptions && mySubscriptions.length > 0) {
        setSelectedCollectionId(mySubscriptions[0]._id);
      }
    }
  }, [isOpen, initialCollection]);

  // Sync if mySubscriptions loads after open and nothing is selected
  useEffect(() => {
    if (!selectedCollectionId && mySubscriptions && mySubscriptions.length > 0) {
      setSelectedCollectionId(mySubscriptions[0]._id);
    }
  }, [mySubscriptions, selectedCollectionId]);

  if (!isOpen) return null;

  const selectedCollection = (mySubscriptions || []).find(
    (c) => c._id === selectedCollectionId
  );

  useEffect(() => {
    setSelectedPages([]);
    setSelectedPagesData([]);
  }, [selectedCollectionId]);

  const isPageAlreadyInCollection = (pageId) => {
    if (!selectedCollection || !pageId) return false;

    // Check pageIds array
    if (Array.isArray(selectedCollection.pageIds)) {
      const match = selectedCollection.pageIds.some((p) => {
        if (!p) return false;
        const id = typeof p === "object" ? p._id || p.id : p;
        return String(id) === String(pageId);
      });
      if (match) return true;
    }

    // Check pages array
    if (Array.isArray(selectedCollection.pages)) {
      const match = selectedCollection.pages.some((p) => {
        if (!p) return false;
        const id = typeof p === "object" ? p._id || p.id : p;
        return String(id) === String(pageId);
      });
      if (match) return true;
    }

    return false;
  };

  const toggleSelectPage = (pageId, pageData) => {
    if (isPageAlreadyInCollection(pageId)) return;

    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter((id) => id !== pageId));
      setSelectedPagesData(selectedPagesData.filter((p) => p._id !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
      if (pageData) setSelectedPagesData([...selectedPagesData, pageData]);
    }
  };

  const filteredPages =
    recommendations?.filter((page) =>
      (page?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (page?.topic || "").toLowerCase().includes(search.toLowerCase()) ||
      (page?.ownerName || "").toLowerCase().includes(search.toLowerCase())
    ) || [];

  // Already in collection: shown separately at top, removed from main list
  const alreadyAddedItems = filteredPages.filter((p) => p && isPageAlreadyInCollection(p._id));
  // Selected items: use stored data so they stay on top even after search is cleared
  const selectedItems = selectedPagesData.filter((p) => p && selectedPages.includes(p._id));
  // Unselected items: exclude already-in-collection AND already-selected
  const unselectedItems = filteredPages.filter((p) => p && !selectedPages.includes(p._id) && !isPageAlreadyInCollection(p._id));
  const sortedPages = [...selectedItems, ...unselectedItems];

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (recommendationsLoading || isFetchingMore || !hasMore || search.trim()) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      const nextPage = currentPage + 1;
      if (
        recommendationPagination?.totalPages &&
        recommendationPagination.totalPages > 1 &&
        currentPage >= recommendationPagination.totalPages
      ) {
        setHasMore(false);
        return;
      }

      setIsFetchingMore(true);
      dispatch(getRecommendations({ page: nextPage, limit: 20 }))
        .unwrap()
        .then((res) => {
          const newItems = res?.list || (Array.isArray(res) ? res : []);
          if (!newItems || newItems.length === 0) {
            setHasMore(false);
          } else {
            setCurrentPage(nextPage);
            if (
              res?.pagination?.totalPages &&
              nextPage >= res.pagination.totalPages
            ) {
              setHasMore(false);
            }
          }
        })
        .catch(() => {
          setHasMore(false);
        })
        .finally(() => {
          setIsFetchingMore(false);
        });
    }
  };
  console.log(filteredPages, "filteredPages======")
  const handleSave = async () => {
    if (!selectedCollectionId) {
      ErrorToast("Please select a collection first.");
      return;
    }
    if (selectedPages.length === 0) {
      ErrorToast("Please select at least one page to add.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await dispatch(
        createPageToCollections({
          pages: selectedPages,
          collectionId: selectedCollectionId,
        })
      ).unwrap();

      SuccessToast(res?.message || "Pages successfully added to collection!");
      dispatch(getMySubsctiptions({ page: 1, limit: 10, search: "" }));
      onClose();
    } catch (err) {
      ErrorToast(err?.message || err || "Failed to add pages to collection");
    } finally {
      setIsSaving(false);
    }
  };
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      dispatch(
        getRecommendations({
          page: 1,
          limit: 20,
          search: search.trim(),
        })
      );

      setCurrentPage(1);
      setHasMore(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, isOpen, dispatch]);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">
                Add Pages to Collection
              </h2>
              <p className="text-xs text-gray-500">
                Select a collection and choose pages to add
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Collection Picker */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
              Target Collection
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-all text-left"
              >
                {selectedCollection ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={selectedCollection.image}
                      alt={selectedCollection.name}
                      size="sm"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {selectedCollection.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedCollection.pages?.length || 0} pages already in collection
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    Select a collection...
                  </span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto p-1.5 space-y-1">
                  {mySubscriptions && mySubscriptions.length > 0 ? (
                    mySubscriptions.filter(Boolean).map((col) => {
                      const isSelected = col?._id === selectedCollectionId;
                      return (
                        <div
                          key={col?._id}
                          onClick={() => {
                            if (col?._id) {
                              setSelectedCollectionId(col._id);
                            }
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${isSelected
                            ? "bg-orange-50 text-orange-700"
                            : "hover:bg-gray-100 text-gray-800"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              src={col?.image}
                              alt={col?.name}
                              size="sm"
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                            <span className="text-sm font-medium truncate">
                              {col?.name}
                            </span>
                          </div>
                          {isSelected && <Check size={16} className="text-orange-600" />}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 p-3 text-center">
                      No collections found. Create one first!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Pages */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Select Pages
              </label>
              {selectedPages.length > 0 && (
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  {selectedPages.length} selected
                </span>
              )}
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search pages by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Pages List */}
          <div
            onScroll={handleScroll}
            className="space-y-2 max-h-[260px] overflow-y-auto pr-1"
          >
            {(recommendationsLoading && currentPage === 1 && (!recommendations || recommendations.length === 0)) ? (
              [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {/* Already in collection section */}
                {alreadyAddedItems.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Already Added</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    {alreadyAddedItems.map((page) => {
                      const isPrivate = page.pageType === "private" || page.isPrivate;
                      return (
                        <div
                          key={page?._id}
                          className="flex items-center justify-between p-2.5 border border-gray-200 rounded-xl bg-gray-50 opacity-60 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar
                              src={page.image || page.user?.profilePicture || page.author?.profilePicture || page.userData?.profilePicture}
                              alt={page.name}
                              size="md"
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                  {page?.ownerName ? `${page.ownerName}'s ` : ""}{page?.name}
                                </p>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded-full ${isPrivate ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                                  {isPrivate ? <><Lock size={9} /><span>Private</span></> : <><Globe size={9} /><span>Public</span></>}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-medium">Already in this collection</p>
                            </div>
                          </div>
                          <div className="w-5 h-5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0 ml-2">
                            <Check size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Selectable pages section */}
                {sortedPages.length > 0 ? (
                  <>
                    {sortedPages.map((page, idx) => {
                      const isSelected = selectedPages.includes(page?._id);
                      const isPrivate = page.pageType === "private" || page.isPrivate;
                      const showDivider = idx === selectedItems.length && selectedItems.length > 0 && unselectedItems.length > 0;

                      return (
                        <React.Fragment key={page?._id}>
                          {showDivider && (
                            <div className="flex items-center gap-2 py-1">
                              <div className="flex-1 h-px bg-gray-200" />
                              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Other Pages</span>
                              <div className="flex-1 h-px bg-gray-200" />
                            </div>
                          )}
                          <div
                            onClick={() => { if (page?._id) toggleSelectPage(page._id, page); }}
                            className={`flex items-center justify-between p-2.5 border rounded-xl transition-all ${isSelected ? "border-orange-500 bg-orange-50/50 cursor-pointer" : "border-gray-200 hover:bg-gray-50 cursor-pointer"}`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar
                                src={page.image || page.user?.profilePicture || page.author?.profilePicture || page.userData?.profilePicture}
                                alt={page.name}
                                size="md"
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-800 text-sm truncate">
                                    {page?.ownerName ? `${page.ownerName}'s ` : ""}{page?.name}
                                  </p>
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded-full ${isPrivate ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                                    {isPrivate ? <><Lock size={9} /><span>Private</span></> : <><Globe size={9} /><span>Public</span></>}
                                  </span>
                                </div>
                                {page.topic && <p className="text-xs text-gray-400 truncate">{page.topic}</p>}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ml-2 ${isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 bg-white"}`}>
                              {isSelected && <Check size={14} />}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  !alreadyAddedItems.length && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      {search ? `No pages found matching "${search}"` : "No pages found"}
                    </div>
                  )
                )}
              </>
            )}

            {isFetchingMore && (
              <div className="py-2.5 flex items-center justify-center gap-2 text-xs text-orange-600 font-medium bg-orange-50/50 rounded-xl">
                <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading more pages...</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <Button
            variant="orange"
            size="full"
            onClick={handleSave}
            disabled={selectedPages.length === 0 || !selectedCollectionId || isSaving}
            loading={isSaving}
            className="flex-1 py-2.5 rounded-xl font-medium text-sm shadow-sm"
          >
            Add ({selectedPages.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
