import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, X } from 'lucide-react';
import { getPostsByPageId, likePost, commentonpost, getcommentsofpost, elevatePost, demotePost } from '../../../redux/slices/posts.slice';
import { useDispatch, useSelector } from 'react-redux';
import CommentsSection from '../../global/CommentsSection';
import SharePostModal from '../../global/SharePostModal';
import ShareToChatsModal from '../../global/ShareToChatsModal';
import PostStoryModal from '../../global/PostStoryModal';
import ShareRepostModal from '../../global/ShareRepostModal';
import ReportModal from '../../global/ReportModal';
import { sendReport, resetReportState } from '../../../redux/slices/reports.slice';
import { TiPin } from "react-icons/ti";
import { nofound } from '../../../assets/export';


const PagePosts = ({ pageId, commentFilter = "all", isPageOwner = false, elevatedPosts = [] }) => {

    const dispatch = useDispatch();
    const { pagepost, pagepostLoading, pageposterror } = useSelector((state) => state.posts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [moreOpenPostId, setMoreOpenPostId] = useState(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportPostId, setReportPostId] = useState(null);
    const [elevatePostId, setElevatePostId] = useState(null);
    const [elevateDuration, setElevateDuration] = useState("24h"); // "24h", "7d", "1m", "manual"
    const [elevateLoading, setElevateLoading] = useState(false);

    const [liked, setLiked] = useState({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
    const [sharepost, setSharepost] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedOption, setSelectedOption] = useState("");

    const { reportSuccess, reportLoading } = useSelector(
        (state) => state.reports
    );

    console.log(pagepost, "pagepostpagepostpagepostpagepost")

    const options = [
        "Share to your Story",
        "Share with Topic Page",
        "Share in Individuals Chats",
        "Share in Group Chats",
    ];

    // Fetch posts on component mount
    useEffect(() => {
        if (pageId) {
            dispatch(getPostsByPageId({ pageId: pageId, page: 1, limit: 100 }));
        }
    }, [pageId, dispatch]);

    console.log(pagepost, "pagepost")

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

    // Initialize likes from posts data
    useEffect(() => {
        if (pagepost && pagepost.length > 0) {
            const initialLikes = {};
            pagepost.forEach((post) => {
                initialLikes[post._id] = {
                    isLiked: post.isLiked || false,
                    likesCount: post.likesCount || 0,
                };
            });
            setLiked(initialLikes);
        }
    }, [pagepost]);

    const handleLikeClick = (postId, currentLikeStatus, currentLikesCount) => {
        const newLikeStatus = !currentLikeStatus;

        // Calculate new likes count
        const newLikesCount = newLikeStatus
            ? (currentLikesCount ?? 0) + 1
            : Math.max((currentLikesCount ?? 0) - 1, 0);

        // Optimistic update - update both isLiked and likesCount
        setLiked((prev) => ({
            ...prev,
            [postId]: {
                isLiked: newLikeStatus,
                likesCount: newLikesCount,
            },
        }));

        // Call API - Redux reducer will update the state automatically
        dispatch(likePost({ id: postId, likeToggle: newLikeStatus, isPost: true }))
            .then((result) => {
                // If API call fails, revert the optimistic update
                if (result.type === 'posts/likePost/rejected') {
                    setLiked((prev) => ({
                        ...prev,
                        [postId]: {
                            isLiked: currentLikeStatus,
                            likesCount: currentLikesCount ?? 0,
                        },
                    }));
                }
            });
    };

    // Helper function to get like data for a post
    const getPostLikeData = (post) => {
        if (liked[post._id]) {
            return {
                isLiked: liked[post._id].isLiked,
                likesCount: liked[post._id].likesCount,
            };
        }
        return {
            isLiked: post.isLiked || false,
            likesCount: post.likesCount || 0,
        };
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

    useEffect(() => {
        if (reportSuccess) {
            // Optional: toast already handled globally in other places
            dispatch(resetReportState());
            setReportModalOpen(false);
            setReportPostId(null);
        }
    }, [reportSuccess, dispatch]);

    const handleReportSubmit = (reason) => {
        if (!reportPostId) return;
        dispatch(
            sendReport({
                reason,
                targetModel: "Post",
                targetId: reportPostId,
                isReported: true,
            })
        );
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

    // Merge elevatedPosts (from page) + normal page posts
    const mergedPosts = (() => {
        const base = pagepost || [];
        if (!elevatedPosts || elevatedPosts.length === 0) return base;

        const baseIds = new Set(base.map((p) => p._id));
        const uniqueElevated = elevatedPosts.filter((p) => !baseIds.has(p._id));
        // Elevated posts first, then normal posts
        return [...uniqueElevated, ...base];
    })();

    // Empty State
    if (!mergedPosts || mergedPosts.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-12 text-center">
                    <div className=" flex justify-center">
                        <img src={nofound} height={300} width={300} alt="" />
                    </div>
                    <p className="font-bold pt-4 text-black">
                        No Posts Found

                    </p>
                </div>
            </div>
        );
    }

    console.log(mergedPosts, "pagepost (merged with elevated)")

    // Filter posts based on commentFilter
    const getFilteredPosts = () => {
        if (!mergedPosts || mergedPosts.length === 0) return [];

        switch (commentFilter) {
            case "all":
                return mergedPosts;
            case "no":
                return mergedPosts.filter((post) => post.commentsCount === 0);
            case "elevated":
                return mergedPosts.filter((post) => post.isElevated === true && post.likesCount > 0);
            case "userLiked":
                return mergedPosts.filter((post) => post.isLiked === true);
            default:
                return mergedPosts;
        }
    };

    const filteredPosts = getFilteredPosts();


    // Toggle Elevate modal
    const handleModalToggle = (postId = null) => {
        setIsModalOpen((prev) => !prev);
        setElevatePostId(postId);
        // Reset duration when opening
        if (!isModalOpen && postId) {
            setElevateDuration("24h");
        }
    };

    const handleElevateSave = async () => {
        if (!elevatePostId) return;
        try {
            setElevateLoading(true);
            await dispatch(
                elevatePost({ postId: elevatePostId, duration: elevateDuration })
            ).unwrap();
            // Refresh posts so isElevated updates
            if (pageId) {
                await dispatch(
                    getPostsByPageId({ pageId: pageId, page: 1, limit: 100 })
                ).unwrap();
            }
            setIsModalOpen(false);
            setElevatePostId(null);
        } catch (error) {
            console.error("Failed to elevate post:", error);
        } finally {
            setElevateLoading(false);
        }
    };

    const handleUnelevate = async (postId) => {
        try {
            setElevateLoading(true);
            // Call demote endpoint to unelevate post
            await dispatch(
                demotePost(postId)
            ).unwrap();
            // Refresh posts so isElevated updates
            if (pageId) {
                await dispatch(
                    getPostsByPageId({ pageId: pageId, page: 1, limit: 100 })
                ).unwrap();
            }
        } catch (error) {
            console.error("Failed to unelevate post:", error);
        } finally {
            setElevateLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">

            {/* Posts List */}
            <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-12 text-center">
                        <p className="text-gray-600 font-medium">📝 No posts found</p>
                        <p className="text-gray-500 text-sm mt-1">No posts match the selected filter</p>
                    </div>
                ) : (
                    filteredPosts.map((post) => (
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
                                        <div className='flex items-center gap-1'>
                                            <p className="font-bold text-sm">{post.author.name}</p>
                                            {post.isElevated && <TiPin />}
                                        </div>

                                        <p className="text-xs text-gray-600">
                                            {post.author.username} • {formatDate(post.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setMoreOpenPostId(
                                                moreOpenPostId === post._id ? null : post._id
                                            )
                                        }
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                    </button>

                                    {moreOpenPostId === post._id && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            {post.isElevated ? (
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                                    disabled={elevateLoading}
                                                    onClick={() => {
                                                        setMoreOpenPostId(null);
                                                        handleUnelevate(post._id);
                                                    }}
                                                >
                                                    {elevateLoading ? "Updating..." : "Unelevate Post"}
                                                </button>
                                            ) : (
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                                    onClick={() => {
                                                        setMoreOpenPostId(null);
                                                        handleModalToggle(post._id);
                                                    }}
                                                >
                                                    Elevate Post
                                                </button>
                                            )}
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    setMoreOpenPostId(null);
                                                    setReportPostId(post._id);
                                                    setReportModalOpen(true);
                                                }}
                                            >
                                                Report
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isModalOpen && (
                                <div className="fixed inset-0 bg-black/20 bg-opacity-50 z-50 flex items-center justify-center">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-[27em]">
                                        {/* Modal Header with Close Button */}
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-center">Elevated Post</h3>
                                            <button
                                                onClick={() => setIsModalOpen(false)} // Close modal
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Modal Body */}
                                        <p className="text-sm text-gray-600 mt-3">
                                            Highlight important posts for greater visibility. Choose how long they stay elevated:
                                        </p>

                                        {/* Radio Buttons */}
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="elevated-post"
                                                    value="24h"
                                                    id="day"
                                                    className="appearance-none hidden"
                                                    checked={elevateDuration === "24h"}
                                                    onChange={() => setElevateDuration("24h")}
                                                />
                                                <span
                                                    className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${elevateDuration === "24h" ? "bg-orange-500" : ""
                                                        }`}
                                                    onClick={() => setElevateDuration("24h")}
                                                />
                                                <label htmlFor="day" className="text-sm">Day (Visible for 24 hours)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="elevated-post"
                                                    value="7d"
                                                    id="week"
                                                    className="appearance-none hidden"
                                                    checked={elevateDuration === "7d"}
                                                    onChange={() => setElevateDuration("7d")}
                                                />
                                                <span
                                                    className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${elevateDuration === "7d" ? "bg-orange-500" : ""
                                                        }`}
                                                    onClick={() => setElevateDuration("7d")}
                                                />
                                                <label htmlFor="week" className="text-sm">Week (Visible for 7 days)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="elevated-post"
                                                    value="1m"
                                                    id="month"
                                                    className="appearance-none hidden"
                                                    checked={elevateDuration === "1m"}
                                                    onChange={() => setElevateDuration("1m")}
                                                />
                                                <span
                                                    className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${elevateDuration === "1m" ? "bg-orange-500" : ""
                                                        }`}
                                                    onClick={() => setElevateDuration("1m")}
                                                />
                                                <label htmlFor="month" className="text-sm">Month (Visible for 30 days)</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="elevated-post"
                                                    value="manual"
                                                    id="until-change"
                                                    className="appearance-none hidden"
                                                    checked={elevateDuration === "manual"}
                                                    onChange={() => setElevateDuration("manual")}
                                                />
                                                <span
                                                    className={`w-4 h-4 mr-2 border-2 border-orange-500 rounded-full inline-block cursor-pointer ${elevateDuration === "manual" ? "bg-orange-500" : ""
                                                        }`}
                                                    onClick={() => setElevateDuration("manual")}
                                                />
                                                <label htmlFor="until-change" className="text-sm">
                                                    Until I Change It (Stay elevated until manually updated)
                                                </label>
                                            </div>
                                        </div>

                                        {/* Modal Footer with Buttons */}
                                        <div className="mt-6 flex justify-between">
                                            <button
                                                className="bg-orange-500 text-white w-full py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={handleElevateSave}
                                                disabled={elevateLoading}
                                            >
                                                {elevateLoading ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* First Image Only */}
                            {post.media && post.media.length > 0 && (
                                <div
                                    className="m-4 cursor-pointer"
                                    onClick={() => openImageModal(post.media)}
                                >
                                    <div className="relative">
                                        {post.media[0].type === "image" ? (
                                            <img
                                                src={post.media[0].fileUrl}
                                                alt="Post"
                                                className="w-full rounded-lg hover:opacity-90 transition-opacity"
                                            />
                                        ) : post.media[0].type === "video" ? (
                                            <video
                                                src={post.media[0].fileUrl}
                                                controls
                                                className="w-full h-[40em] rounded-lg"
                                            />
                                        ) : null}

                                        {post.media.length > 1 && (
                                            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-medium">
                                                1/{post.media.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {post.sharedBy ? (
                                <div className='text-sm flex gap-4 ml-4 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 w-[14em]'>
                                    <img
                                        src={post.sharedBy.profilePicture}
                                        className="w-7 h-7 rounded-full object-cover"
                                    />
                                    {post.sharedBy.username} Reposted
                                </div>
                            ) : null}




                            {/* Topic Tag */}
                            {/* {post.page?.topic && (
                                <div className="px-4">
                                    <span className="inline-block bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                                        {post.page.topic}
                                    </span>
                                </div>
                            )} */}

                            {/* Body Text */}
                            <div className="p-4">
                                <p className="text-sm text-gray-700 mb-4">{post.bodyText}</p>

                                {/* Stats & Actions */}
                                <div className="flex items-center gap-4 text-sm text-orange-500 mb-2 pb-2">
                                    {(() => {
                                        const likeData = getPostLikeData(post);
                                        return (
                                            <button
                                                onClick={() => handleLikeClick(post._id, likeData.isLiked, likeData.likesCount)}
                                                className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${likeData.isLiked ? "fill-orange-500 text-orange-500" : ""}`}
                                                />
                                                <span>{likeData.likesCount}</span>
                                            </button>
                                        );
                                    })()}

                                    <button
                                        onClick={() => {
                                            setOpenCommentsPostId(
                                                openCommentsPostId === post._id ? null : post._id
                                            );
                                            if (openCommentsPostId !== post._id) {
                                                dispatch(getcommentsofpost({ postId: post._id }));
                                            }
                                        }}
                                        className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>{post.commentsCount || 0}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setSharepost(true);
                                        }}
                                        className="flex items-center gap-2 hover:text-orange-600 bg-orange-400/10 rounded-full p-1 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span>{post.sharesCount || 0}</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {openCommentsPostId === post._id && (
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <CommentsSection postId={post._id} isPageOwner={isPageOwner} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
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

            {/* Share Post Modal */}
            {sharepost && selectedPost && (
                <SharePostModal
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    setSharepost={setSharepost}
                    options={options}
                />
            )}

            {(selectedOption === "Share in Individuals Chats" ||
                selectedOption === "Share in Group Chats") && (
                    <ShareToChatsModal 
                        onClose={() => setSelectedOption("")} 
                        post={selectedPost}
                    />
                )}

            {selectedOption === "Share to your Story" && selectedPost && (
                <PostStoryModal post={selectedPost} onClose={() => setSelectedOption("")} />
            )}

            {selectedOption === "Share with Topic Page" && selectedPost && (
                <ShareRepostModal postId={selectedPost._id} onClose={() => setSelectedOption("")} />
            )}

            {/* Report Modal */}
            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => {
                    setReportModalOpen(false);
                    setReportPostId(null);
                }}
                loading={reportLoading}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
};

export default PagePosts;