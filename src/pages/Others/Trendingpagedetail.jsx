import React, { useEffect, useState } from 'react';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPageById } from '../../redux/slices/trending.slice';

const Trendingpagedetail = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        dispatch(fetchPageById(id));
    }, [dispatch, id]);

    const { pageDetail, pageDetailLoading } = useSelector(
        (state) => state.trending
    );

    useEffect(() => {
        if (pageDetail) {
            setIsSubscribed(pageDetail.isSubscribed);
        }
    }, [pageDetail]);

    // Loading State
    if (pageDetailLoading) {
        return (
            <div className="flex max-w-7xl mx-auto min-h-screen">
                <div className="w-1/4 bg-[#F2F2F2] sticky top-20 h-screen overflow-y-auto pt-3">
                    <Profilecard />
                    <div className="pt-4">
                        <MySubscription />
                    </div>
                </div>
                <div className="w-3/4 overflow-y-auto p-3 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg text-gray-600 font-semibold">Loading page details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!pageDetail) {
        return (
            <div className="flex max-w-7xl mx-auto min-h-screen">
                <div className="w-1/4 bg-[#F2F2F2] sticky top-20 h-screen overflow-y-auto pt-3">
                    <Profilecard />
                    <div className="pt-4">
                        <MySubscription />
                    </div>
                </div>
                <div className="w-3/4 overflow-y-auto p-3 flex items-center justify-center">
                    <p className="text-lg text-gray-600">No page details found</p>
                </div>
            </div>
        );
    }

    // Check if page is private and not subscribed
    const isPrivateAndNotSubscribed = pageDetail.pageType === 'private' && !isSubscribed;

    const handleSubscribeToggle = () => {
        setIsSubscribed(!isSubscribed);
        // Add your API call here to subscribe/unsubscribe
    };

    return (
        <div className="flex max-w-7xl mx-auto min-h-screen">
            {/* Sidebar Section */}
            <div className="w-1/4 bg-[#F2F2F2] sticky top-20 h-screen overflow-y-auto pt-3">
                <Profilecard />
                <div className="pt-4">
                    <MySubscription />
                </div>
            </div>

            {/* Main Content Section */}
            <div className="w-3/4 overflow-y-auto p-3">
                <div className={`bg-white rounded-3xl overflow-hidden shadow-lg ${isPrivateAndNotSubscribed ? 'blur-sm' : ''}`}>
                    {/* Orange Header */}
                    <div className="h-[6em] bg-gradient-to-r from-orange-500 to-orange-400"></div>

                    {/* Profile Content */}
                    <div className="px-8 pb-6">
                        {/* Profile Section */}
                        <div className="flex items-end gap-4 -mt-16 mb-0">
                            {/* Profile Picture */}
                            <div className="relative">
                                <img
                                    src={pageDetail.user?.profilePicture || "https://www.w3schools.com/w3images/avatar2.png"}
                                    alt="Profile"
                                    className="w-[6em] h-[6em] rounded-full border-4 border-white object-cover"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 pb-2">
                                <h1 className="text-2xl font-bold text-white capitalize">{pageDetail.user?.name || pageDetail.name}</h1>
                                <p className="text-gray-300 text-lg">@{pageDetail.user?.username || 'username'}</p>
                            </div>

                            {/* Subscribe Button */}
                            <div className='mb-[4em]'>
                                <button
                                    onClick={handleSubscribeToggle}
                                    className={`p-2 px-8 rounded-2xl font-semibold transition-all duration-300 ${
                                        isSubscribed
                                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            : 'bg-white text-orange-500 hover:bg-orange-50'
                                    }`}
                                >
                                    {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                                </button>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 border-gray-200">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Topic</p>
                                    <p className="text-gray-900 font-semibold">{pageDetail.topic || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Page Type</p>
                                    <p className="text-gray-900 font-semibold capitalize">{pageDetail.pageType}</p>
                                </div>
                                <div>
                                    {/* Keywords */}
                                    {pageDetail.keywords && pageDetail.keywords.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Keywords</p>
                                            <div className="flex flex-wrap gap-2">
                                                {pageDetail.keywords.map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Private Page Overlay */}
                {isPrivateAndNotSubscribed && (
                    <div className="flex items-center justify-center -mt-72 relative z-10 h-80">
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">This is a Private Page</h2>
                            <p className="text-gray-600 mb-6">You need to subscribe to view this page's content</p>
                            <button
                                onClick={handleSubscribeToggle}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-semibold transition-colors"
                            >
                                Subscribe Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trendingpagedetail;