import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight, TrendingUp } from 'lucide-react';
import { notes, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { FaAngleRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';
import TrendingPostCard from '../../components/global/TrendingPostCard';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedPages, fetchTrendingPages, fetchTrendingPosts } from '../../redux/slices/trending.slice';
import CollectionModal from '../../components/global/CollectionModal';
import { addPageToCollections, getMyCollections, removePageFromCollections } from '../../redux/slices/collection.slice';


export default function Trending() {
    const [liked, setLiked] = useState({});
    const [open, setOpen] = useState(false);
    const [postsPage, setPostsPage] = useState(1);
    const dispatch = useDispatch();
    const postsObserverTarget = useRef(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [unsubscribingPageId, setUnsubscribingPageId] = useState(null);
    const navigate = useNavigate();


    const {
        trendingPages,
        trendingPagination,
        trendingLoading,
        recommendedPages,
        recommendedLoading,
        recommendedPagination,
        trendingPosts,
        trendingPostsLoading,
        trendingPostsPagination,
        error,
    } = useSelector((state) => state.trending);

    const { removepageLoading } = useSelector((state) => state.collections);

    useEffect(() => {
        dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
        dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchTrendingPosts({ page: postsPage, limit: 10 }));
    }, [dispatch, postsPage]);


    const handleSaveToCollection = ({ selectedCollections }) => {
        dispatch(addPageToCollections({
            collections: selectedCollections,
            page: selectedPage._id,
        })).then(() => {
            // Refresh collections
            dispatch(getMyCollections({ page: 1, limit: 100 }));

            dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
            dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));
            setOpenModal(false);
        });
    };


    const handleUnsubscribe = (page) => {
        setUnsubscribingPageId(page._id); // mark specific page as loading

        dispatch(removePageFromCollections({
            collections: page.collections || [],
            page: page._id,
        })).then(() => {
            dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
            dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));

            setUnsubscribingPageId(null); // stop loader for that page only
        });
    };


    // Infinite scroll for posts
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !trendingPostsLoading && trendingPostsPagination?.hasNextPage) {
                    setPostsPage(prev => prev + 1);
                }
            },
            { threshold: 0.5 }
        );

        if (postsObserverTarget.current) {
            observer.observe(postsObserverTarget.current);
        }

        return () => observer.disconnect();
    }, [trendingPostsLoading, trendingPostsPagination]);

    const toggleLike = (postId) => {
        setLiked(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    console.log(trendingPages, "trendingPages")


    const handleSubscribeClick = (page) => {
        setSelectedPage(page);
        setOpenModal(true);
    };

    const handleScroll = (direction, scrollRef) => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = 300;
            if (direction === 'left') {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const suggestionsRef = useRef(null);
    const trendingRef = useRef(null);

    return (
        <div className="flex max-w-7xl mx-auto min-h-screen">
            {/* Left Sidebar */}
            <div className="w-1/4 bg-[#F2F2F2] sticky top-20 h-screen overflow-y-auto pt-3">
                <Profilecard smallcard={true} />
                <div className="pt-4">
                    <MySubscription />
                </div>
            </div>


            {/* Main Feed */}
            <div className="w-3/4 overflow-y-auto">
                {/* Suggestions Section */}
                <div className="bg-[#F2F2F2] p-4 border-b border-gray-200">
                    <div className='flex justify-between items-center p-3'>
                        <h1 className='font-bold text-[18px] text-gray-900'>Suggestions based on your Interests</h1>
                        <Link to="/suggested-pages">
                            <div className='flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 cursor-pointer'>
                                <span>View all</span>
                                <FaAngleRight size={14} />
                            </div>
                        </Link>
                    </div>

                    <div className="relative group">
                        <div
                            ref={suggestionsRef}
                            className='flex overflow-x-auto gap-3 px-3 pb-2 scrollbar-hide scroll-smooth'
                        >
                            {recommendedPages && recommendedPages.length > 0 ? (
                                recommendedPages.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img
                                                src={item.image || item.user?.profilePicture || topics}
                                                alt={item.name}
                                                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex gap-2 items-center">
                                                    <p className="font-semibold text-[14px] cursor-pointer text-gray-900 truncate" onClick={() => {
                                                        navigate(`/trending-page-detail/${item._id}`)
                                                    }}>
                                                        {item.name}
                                                    </p>
                                                    <img src={notes} alt="" className="w-4 h-4 flex-shrink-0" />
                                                </div>
                                                <p className="text-[12px] text-gray-500 mt-1 truncate">
                                                    {item.topic}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {item.about}
                                        </p>

                                        {/* Keywords */}
                                        {item.keywords && item.keywords.length > 0 && (
                                            <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                                                {item.keywords.slice(0, 2).join(' ')}
                                            </p>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
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
                                                <p className="text-xs text-gray-600 font-medium">
                                                    {item.followersCount}+ Follows
                                                </p>
                                            </div>
                                            {item.isSubscribed ? (
                                                <button
                                                    onClick={() => handleUnsubscribe(item)}
                                                    disabled={unsubscribingPageId === item._id}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                                                  ${unsubscribingPageId === item._id
                                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            : "bg-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {unsubscribingPageId === item._id ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                                                            Removing...
                                                        </span>
                                                    ) : (
                                                        "Unsubscribe"
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSubscribeClick(item)}
                                                    className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                                >
                                                    Subscribe
                                                </button>
                                            )}




                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-8">No suggestions available</div>
                            )}
                        </div>

                        {/* Scroll Buttons */}
                        <button
                            onClick={() => handleScroll('left', suggestionsRef)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 hidden group-hover:block transition-all"
                        >
                            <ChevronRight size={20} className="rotate-180 text-gray-700" />
                        </button>
                        <button
                            onClick={() => handleScroll('right', suggestionsRef)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 hidden group-hover:block transition-all"
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Trending Pages Section */}
                <div className="bg-[#F2F2F2] p-4 border-b border-gray-200">
                    <div className='flex justify-between items-center p-3'>
                        <h1 className='font-bold text-[18px] text-gray-900'>Trending Pages</h1>
                        <Link to="/trendingsuggested-pages">
                            <div className='flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 cursor-pointer'>
                                <span>View all</span>
                                <FaAngleRight size={14} />
                            </div>
                        </Link>
                    </div>

                    <div className="relative group">
                        <div
                            ref={trendingRef}
                            className='flex overflow-x-auto gap-3 px-3 pb-2 scrollbar-hide scroll-smooth'
                        >
                            {trendingPages && trendingPages.length > 0 ? (
                                trendingPages.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img
                                                src={item.image || item.user?.profilePicture || topics}
                                                alt={item.name}
                                                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex gap-2 items-center">
                                                    <p className="font-semibold text-[14px] cursor-pointer text-gray-900 truncate" onClick={() => {
                                                        navigate(`/trending-page-detail/${item._id}`)
                                                    }}>
                                                        {item.name}
                                                    </p>
                                                    <img src={notes} alt="" className="w-4 h-4 flex-shrink-0" />
                                                </div>
                                                <p className="text-[12px] text-gray-500 mt-1 truncate">
                                                    {item.topic}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {item.about}
                                        </p>

                                        {/* Keywords */}
                                        {item.keywords && item.keywords.length > 0 && (
                                            <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                                                {item.keywords.slice(0, 2).join(' ')}
                                            </p>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
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
                                                <p className="text-xs text-gray-600 font-medium">
                                                    {item.followersCount}+ Follows
                                                </p>
                                            </div>
                                            {item.isSubscribed ? (
                                                <button
                                                    onClick={() => handleUnsubscribe(item)}
                                                    disabled={unsubscribingPageId === item._id}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                                             ${unsubscribingPageId === item._id
                                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            : "bg-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {unsubscribingPageId === item._id ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                                                            Removing...
                                                        </span>
                                                    ) : (
                                                        "Unsubscribe"
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSubscribeClick(item)}
                                                    className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                                >
                                                    Subscribe
                                                </button>
                                            )}


                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-8">No pages available</div>
                            )}
                        </div>

                        {/* Scroll Buttons */}
                        <button
                            onClick={() => handleScroll('left', trendingRef)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 hidden group-hover:block transition-all"
                        >
                            <ChevronRight size={20} className="rotate-180 text-gray-700" />
                        </button>
                        <button
                            onClick={() => handleScroll('right', trendingRef)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 hidden group-hover:block transition-all"
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Trending Posts Section */}
                <div className="pl-10 pt-4">
                    <h1 className='font-bold text-[20px] text-gray-900 mb-6'>Trending Posts</h1>

                    {trendingPostsLoading && postsPage === 1 ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 max-w-2xl ml-0">
                                {trendingPosts && trendingPosts.length > 0 ? (
                                    trendingPosts.map((post) => (
                                        <TrendingPostCard
                                            key={post._id}
                                            post={post}
                                            liked={liked}
                                            toggleLike={toggleLike}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <TrendingUp size={48} className="text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No posts available</p>
                                    </div>
                                )}
                            </div>

                            {/* Loading for pagination */}
                            {trendingPostsLoading && postsPage > 1 && (
                                <div className="flex justify-center items-center py-8 mt-8">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Infinite scroll trigger */}
                            <div ref={postsObserverTarget} className="h-10 mt-8" />

                            {/* No more posts */}
                            {!trendingPostsLoading && !trendingPostsPagination?.hasNextPage && trendingPosts.length > 0 && (
                                <div className="text-center py-8 text-gray-500 mt-8">
                                    <p className="font-medium">No more posts to load</p>
                                </div>
                            )}
                        </>
                    )}
                </div>


                {openModal && (
                    <CollectionModal
                        isOpen={openModal}
                        onClose={() => setOpenModal(false)}
                        page={selectedPage}
                        onSave={handleSaveToCollection}
                    />
                )}

                {open && <ChatWidget />}
                <FloatingChatButton onClick={() => setOpen(!open)} />
            </div>
        </div>
    );
}