import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight, TrendingUp, Plus, ChevronsRight, ArrowLeft, Search } from "lucide-react";
import { notes, postone, profile, profilehigh, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { TbNotes } from "react-icons/tb";
import { FaAngleRight, FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import PostCard from "../../components/global/PostCard";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedPages } from '../../redux/slices/trending.slice';
import CollectionModal from "../../components/global/CollectionModal";
import { addPageToCollections, getMyCollections } from "../../redux/slices/collection.slice";

export default function Suggestpage() {
  const [liked, setLiked] = useState({});
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigate();
  const observerTarget = useRef(null);
  const dispatch = useDispatch();

  const {
    trendingPagination,
    recommendedPages,
    recommendedLoading,
    recommendedPagination,
    error,
  } = useSelector((state) => state.trending);

  const { removepageLoading } = useSelector((state) => state.collections);

  useEffect(() => {
    dispatch(fetchRecommendedPages({ page: page, limit: 12 }));
  }, [dispatch, page]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !recommendedLoading && recommendedPagination?.hasNextPage) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [recommendedLoading, recommendedPagination]);

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(addPageToCollections({
      collections: selectedCollections,
      page: selectedPage._id,
    })).then(() => {
      dispatch(getMyCollections({ page: 1, limit: 100 }));
      dispatch(fetchRecommendedPages({ page: 1, limit: 12 }));
      setOpenModal(false);
    });
  };


  const handleSubscribeClick = (pageItem) => {
    setSelectedPage(pageItem);
    setOpenModal(true);
  };

  // Filter pages based on search query
  const filteredPages = recommendedPages?.filter((page) =>
    page?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex max-w-7xl mx-auto min-h-screen">
      {/* Left Sidebar - 25% width (Fixed) */}
      <div className="w-1/4 bg-[#F2F2F2] pt-3 pb-3 overflow-y-auto">
        <Profilecard smallcard={true} />
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Main Feed - 75% width (Scrollable) */}
      <div className="w-3/4 bg-transparent overflow-y-auto">
        <div className="p-0">
          {/* Header */}
          <div className="flex gap-3 items-center p-4 bg-[#F2F2F2] rounded-xl mb-4">
            <button
              onClick={() => navigation(-1)}
              className="hover:bg-gray-300 p-2 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="font-bold text-[22px] text-gray-900">Suggested Pages</h1>
          </div>

          {/* Search Input */}
          <div className="px-8 mb-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search pages by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Loading State */}
          {recommendedLoading && page === 1 && (
            <div className="flex justify-center items-center py-12">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}

          {/* Display trending pages in a 3-column grid */}
          {recommendedPages && recommendedPages.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-6 px-8 py-6">
                {(searchQuery ? filteredPages : recommendedPages).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={item.image || item.user?.profilePicture || topics}
                        alt={item.name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-center">
                          <p className="font-semibold text-[14px] text-gray-900 truncate">{item.name}</p>
                          <img src={notes} alt="" className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <p className="text-[12px] text-gray-500 mt-1 truncate">{item.topic}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.about}
                    </p>

                    {/* Keywords/Hashtags */}
                    {item.keywords && item.keywords.length > 0 && (
                      <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                        {item.keywords.slice(0, 3).join(' ')}
                      </p>
                    )}

                    {/* Footer - Followers and Subscribe */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {item.followers && item.followers.slice(0, 3).map((img, i) => (
                            img ? (
                              <img
                                key={i}
                                src={img}
                                alt="follower"
                                className="w-6 h-6 rounded-full border-2 border-white object-cover"
                              />
                            ) : (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-white bg-gray-300"
                              />
                            )
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                          {item.followersCount}+ Follows
                        </p>
                      </div>

                      {item.isSubscribed ? (
                        <button
                          onClick={() => navigation(`/trending-page-detail/${item._id}`)}
                          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          Subscribed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribeClick(item)}
                          className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white px-5 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        >
                          Subscribe
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading Indicator for pagination */}
              {recommendedLoading && page > 1 && (
                <div className="flex justify-center items-center py-8 mt-8">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}

              {/* Infinite Scroll Trigger - Only show when not searching */}
              {!searchQuery && <div ref={observerTarget} className="h-10 mt-8" />}
            </>
          ) : (
            <div className="text-center py-16">
              <TrendingUp size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? "No pages found matching your search" : "No pages available"}
              </p>
            </div>
          )}

          {/* Show message when search has no results but pages exist */}
          {searchQuery && filteredPages.length === 0 && recommendedPages && recommendedPages.length > 0 && (
            <div className="text-center py-16 px-8">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No pages found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Collection Modal */}
        {openModal && (
          <CollectionModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            page={selectedPage}
            onSave={handleSaveToCollection}
          />
        )}

        {/* Chat Widget */}
        {open && <ChatWidget />}
        <FloatingChatButton onClick={() => setOpen(!open)} />
      </div>
    </div>
  );
}