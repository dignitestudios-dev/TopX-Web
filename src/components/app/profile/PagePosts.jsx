import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, X } from 'lucide-react';
import { getPostsByPageId } from '../../../redux/slices/posts.slice';
import { useDispatch, useSelector } from 'react-redux';

const PagePosts = ({ pageId }) => {

    const dispatch = useDispatch();
    const { pagepost, pagepostLoading, pageposterror } = useSelector((state) => state.posts);

    const [liked, setLiked] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch posts on component mount
    useEffect(() => {
        if (pageId) {
            dispatch(getPostsByPageId({ pageId: pageId, page: 1, limit: 100 }));
        }
    }, [pageId, dispatch]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMins = Math.floor(diffTime / (1000 * 60));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const toggleLike = (postId) => {
        setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const openImageModal = (images) => {
        setCurrentImages(images);
        setCurrentImageIndex(0);
        setShowImageModal(true);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    };

    // Loading State
    if (pagepostLoading) {
        return (
            <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
                <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
                            {/* Header Skeleton */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                                    <div className="h-2 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Image Skeleton */}
                            <div className="h-72 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>

                            {/* Content Skeleton */}
                            <div className="space-y-2 mb-4">
                                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                            </div>

                            {/* Actions Skeleton */}
                            <div className="flex gap-4">
                                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error State
    if (pageposterror) {
        return (
            <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-800 font-medium mb-2">❌ Error Loading Posts</p>
                    <p className="text-red-600 text-sm">{pageposterror}</p>
                </div>
            </div>
        );
    }

    // Empty State
    if (!pagepost || pagepost.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-12 text-center">
                    <p className="text-gray-600 font-medium">📝 No posts found</p>
                    <p className="text-gray-500 text-sm mt-1">This page hasn't posted anything yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">

            {/* Posts List */}
            <div className="space-y-6">
                {pagepost.map((post) => (
                    <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <img
                                    src={post.author.profilePicture}
                                    alt={post.author.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-sm">{post.author.name}</p>
                                    <p className="text-xs text-gray-600">
                                        {post.author.username} • {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreHorizontal className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* First Image Only */}
                        {post.media && post.media.length > 0 && (
                            <div className="m-4 cursor-pointer" onClick={() => openImageModal(post.media)}>
                                <div className="relative">
                                    <img
                                        src={post.media[0].fileUrl}
                                        alt="Post"
                                        className="w-full rounded-lg hover:opacity-90 transition-opacity"
                                    />
                                    {post.media.length > 1 && (
                                        <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                                            1/{post.media.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Topic Tag */}
                        {post.page?.topic && (
                            <div className="px-4">
                                <span className="inline-block bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                                    {post.page.topic}
                                </span>
                            </div>
                        )}

                        {/* Body Text */}
                        <div className="p-4">
                            <p className="text-sm text-gray-700 mb-4">{post.bodyText}</p>

                            {/* Stats & Actions */}
                            <div className="flex items-center gap-4 text-sm text-orange-500 mb-2 pb-2">
                                <button
                                    onClick={() => toggleLike(post._id)}
                                    className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                                >
                                    <Heart
                                        className={`w-5 h-5 ${liked[post._id] ? "fill-orange-500 text-orange-500" : ""}`}
                                    />
                                    <span>{post.likesCount}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{post.commentsCount}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    <span>{post.sharesCount}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Image Modal */}
            {showImageModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors z-10"
                    >
                        <X size={32} />
                    </button>

                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={currentImages[currentImageIndex].fileUrl}
                            alt="Full screen"
                            className="max-w-5xl max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
                        />

                        {/* Previous Button */}
                        {currentImages.length > 1 && (
                            <button
                                onClick={prevImage}
                                className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors z-20"
                            >
                                ◀
                            </button>
                        )}

                        {/* Next Button */}
                        {currentImages.length > 1 && (
                            <button
                                onClick={nextImage}
                                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 rounded-full transition-colors z-20"
                            >
                                ▶
                            </button>
                        )}

                        {/* Image Counter */}
                        {currentImages.length > 1 && (
                            <div className="absolute bottom-8 text-white text-center z-20">
                                <p className="text-lg font-semibold">
                                    {currentImageIndex + 1} / {currentImages.length}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagePosts;