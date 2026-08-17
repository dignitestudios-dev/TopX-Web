import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  MessageCircleWarning,
  Filter,
  Zap,
  BarChart2,
} from "lucide-react";
import BoostPostModal from "./BoostPostModal";
import BoostAnalyticsModal from "./BoostAnalyticsModal";
import { fetchPagePosts } from "../../redux/slices/trending.slice";
import ReportModal from "./ReportModal";
import { sendReport, resetReportState } from "../../redux/slices/reports.slice";
import { SuccessToast } from "./Toaster";
import { likePost } from "../../redux/slices/postfeed.slice";
import CommentsSection from "./CommentsSection";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import ShareToPagesModal from "./ShareToPagesModal";
import CommentFilterModal from "../app/profile/CommentFilterModal";
import { VscSettings } from "react-icons/vsc";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { getLinkPreview } from "../../lib/helpers";
import LinkPreviewCard from "./LinkPreviewCard";



export default function PagePostsComponent({ pageId, commentFilter: externalFilter = "all" }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [sharepost, setSharepost] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { pagePosts, pagePostsLoading, pagePostsPagination } = useSelector(
    (state) => state.trending
  );
  const { user } = useSelector((state) => state.auth || {});
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports
  );

  const [moreOpenPostId, setMoreOpenPostId] = useState(null);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [selectedBoostPost, setSelectedBoostPost] = useState(null);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [selectedAnalyticsBoostId, setSelectedAnalyticsBoostId] = useState(null);

  const [currentMediaIndex, setCurrentMediaIndex] = useState({});
  const [loadingMedia, setLoadingMedia] = useState({});
  const [reportmodal, setReportmodal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postLikes, setPostLikes] = useState({}); // Track like state and count
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);
  const [commentFilter, setCommentFilter] = useState(externalFilter || "all");
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    if (externalFilter) {
      setCommentFilter(externalFilter);
    }
  }, [externalFilter]);

  useEffect(() => {
    if (pageId) {
      dispatch(
        fetchPagePosts({
          pageId,
          filterType: commentFilter,
          commentFilter: commentFilter,
          applyFilter: true,
        })
      );
    }
  }, [dispatch, pageId, commentFilter]);

  // Initialize post likes from localStorage on mount
  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    setPostLikes(savedLikes);
  }, []);

  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportmodal(false);
    }
  }, [reportSuccess, dispatch]);

  const handleNextMedia = (postId, maxIndex) => {
    setLoadingMedia((prev) => ({ ...prev, [postId]: true }));
    setCurrentMediaIndex((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % maxIndex,
    }));
  };

  const handlePrevMedia = (postId, maxIndex) => {
    setLoadingMedia((prev) => ({ ...prev, [postId]: true }));
    setCurrentMediaIndex((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + maxIndex) % maxIndex,
    }));
  };

  const handleMediaLoad = (postId) => {
    setLoadingMedia((prev) => ({ ...prev, [postId]: false }));
  };

  const handleLikeClick = (postId, currentLikeStatus, currentLikesCount) => {
    const newLikeStatus = !currentLikeStatus;

    // Calculate new likes count
    const newLikesCount = newLikeStatus
      ? (currentLikesCount ?? 0) + 1
      : Math.max((currentLikesCount ?? 0) - 1, 0);

    // Optimistic update in localStorage
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = { isLiked: newLikeStatus, likesCount: newLikesCount };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Update UI immediately
    setPostLikes((prev) => ({
      ...prev,
      [postId]: { isLiked: newLikeStatus, likesCount: newLikesCount },
    }));

    // Call API
    dispatch(likePost({ postId, likeToggle: newLikeStatus }));
  };

  const getPostLikeData = (postId, post) => {
    if (postLikes[postId]) {
      return {
        isLiked: postLikes[postId].isLiked,
        likesCount: postLikes[postId].likesCount,
      };
    }
    return {
      isLiked: post.isLiked || false,
      likesCount: post.likesCount || 0,
    };
  };

  const handleReportClick = (postId) => {
    setSelectedPostId(postId);
    setReportmodal(true);
  };

  const handleReportSubmit = (reason) => {
    if (selectedPostId) {
      dispatch(
        sendReport({
          reason,
          targetModel: "Post",
          targetId: selectedPostId,
          isReported: true,
        })
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Comment filter applies to comments inside posts, not the posts themselves
  const filteredPosts = pagePosts || [];

  if (pagePostsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];
  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        {/* Posts Column - Left Side */}
        <div className="lg:col-span-2">
          {/* Comment Filter Button */}
          <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-600">
              {commentFilter === "none-comments" || commentFilter === "no"
                ? "Showing: No Comments"
                : commentFilter === "elevated-comments" || commentFilter === "elevated"
                ? "Showing: Elevated Comments"
                : commentFilter === "liked-comments" || commentFilter === "userLiked"
                ? "Showing: Liked Comments"
                : "Showing: All Comments"}
            </div>
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all text-xs font-semibold cursor-pointer border border-orange-200 shadow-xs"
            >
              <VscSettings size={16} className="text-orange-500" />
              <span>Comment Filter</span>
            </button>
          </div>

          <div className="space-y-6">
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => {
                const mediaIndex = currentMediaIndex[post._id] || 0;
                const currentMedia = post.media?.[mediaIndex];
                const hasMultipleMedia = post.media && post.media.length > 1;
                const hasMedia = Boolean(post.media && post.media.length > 0);
                const linkData = getLinkPreview(post.bodyText || post.text);
                const isMediaLoading = loadingMedia[post._id] || false;
                const likeData = getPostLikeData(post._id, post);

                return (
                  <div
                    key={post._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {post.author?.profilePicture ? (
                            <img
                              src={post.author.profilePicture}
                              alt={post.author.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {post.author?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {post.author?.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              @{post.author?.username}
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
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                            aria-label="Options"
                          >
                            <PiDotsThreeOutlineFill color="black" size={20} />
                          </button>

                          {moreOpenPostId === post._id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                              {post.author?._id === user?._id ? (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                                    onClick={() => {
                                      setMoreOpenPostId(null);
                                      setSelectedBoostPost(post);
                                      setBoostModalOpen(true);
                                    }}
                                  >
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    <span>Boost Post</span>
                                  </button>
                                  {(post?.isBoosted || post?.boostId || post?.boost) && (
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                                      onClick={() => {
                                        setMoreOpenPostId(null);
                                        setSelectedAnalyticsBoostId(post?.boostId || post?.boost?._id);
                                        setAnalyticsModalOpen(true);
                                      }}
                                    >
                                      <BarChart2 className="w-4 h-4 text-blue-500" />
                                      <span>Boost Analytics</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setMoreOpenPostId(null);
                                    handleReportClick(post._id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  Report
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                     
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Media Section */}
                      {currentMedia && (
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                          {isMediaLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                          )}

                          {currentMedia.type === "image" ? (
                            <img
                              src={currentMedia.fileUrl}
                              alt="Post media"
                              className="w-full h-auto object-cover max-h-96"
                              loading="lazy"
                              onLoad={() => handleMediaLoad(post._id)}
                            />
                          ) : currentMedia.type === "video" ? (
                            <video
                              src={currentMedia.fileUrl}
                              controls
                              className="w-full h-auto object-cover max-h-96"
                              onLoadedData={() => handleMediaLoad(post._id)}
                            />
                          ) : null}

                          {/* Media Navigation */}
                          {hasMultipleMedia && (
                            <>
                              <button
                                onClick={() =>
                                  handlePrevMedia(post._id, post.media.length)
                                }
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-5"
                                aria-label="Previous media"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleNextMedia(post._id, post.media.length)
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-5"
                                aria-label="Next media"
                              >
                                <ChevronRight size={20} />
                              </button>
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-5">
                                {mediaIndex + 1} / {post.media.length}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {!hasMedia && linkData && (
                        <LinkPreviewCard linkData={linkData} />
                      )}

                      {(() => {
                        const rawText = post?.bodyText || post?.text || "";
                        const cleanText = linkData
                          ? rawText.replace(linkData.url, "").trim()
                          : rawText;
                        if (!cleanText) return null;
                        return (
                          <p className="text-gray-800 mb-4 text-base leading-relaxed">
                            {cleanText}
                          </p>
                        );
                      })()}
                    </div>

                    {/* Footer - Interactions */}
                    {/* Stats */}
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
                      <button
                        onClick={() =>
                          handleLikeClick(
                            post._id,
                            likeData.isLiked,
                            likeData.likesCount
                          )
                        }
                        className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                      >
                        <Heart
                          className={`w-5 h-5 transition ${
                            likeData.isLiked
                              ? "fill-orange-500 text-orange-500"
                              : "text-gray-600"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            likeData.isLiked
                              ? "text-orange-500"
                              : "text-gray-600"
                          }`}
                        >
                          {Number(likeData.likesCount ?? 0)}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setOpenCommentsPostId(
                            openCommentsPostId === post._id ? null : post._id
                          )
                        }
                        className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {post?.commentsCount}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPostForShare(post._id);
                          setSharepost(true);
                        }}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                      >
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {post?.sharesCount}
                        </span>
                      </button>
                    </div>
                    {openCommentsPostId === post._id && (
                      <CommentsSection
                        postId={post._id}
                        pageId={pageId}
                        isPageOwner={post.author?._id === user?._id}
                        applyFilter={true}
                        commentFilter={commentFilter}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">
                  {pagePosts && pagePosts.length > 0
                    ? `No posts found for selected filter`
                    : "No posts available"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagePostsPagination && pagePostsPagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition disabled:opacity-50">
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagePostsPagination.currentPage} /{" "}
                {pagePostsPagination.totalPages}
              </span>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Right Side (Hidden on Mobile) */}
        <div className="hidden lg:block">
          {pagePosts && pagePosts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 space-y-6">
              {/* Page Header */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {pagePosts[0]?.page?.name}
                </h3>
                {pagePosts[0]?.page?.about && (
                  <p className="text-sm text-gray-600 mt-2">
                    {pagePosts[0].page.about}
                  </p>
                )}
              </div>

              {/* Topic */}
              {pagePosts[0]?.page?.topic && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Topic
                  </p>
                  <p className="text-sm font-medium text-black mt-1">
                    {pagePosts[0].page.topic}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Followers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pagePosts[0]?.page?.followersCount || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Posts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pagePosts[0]?.author?.postsCount || 0}
                  </p>
                </div>
              </div>

              {/* Interests */}
              {pagePosts[0]?.author?.interests &&
                pagePosts[0].author.interests.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pagePosts[0].author.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Keywords */}
              {pagePosts[0]?.page?.keywords &&
                pagePosts[0].page.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pagePosts[0].page.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
      {sharepost && (
        <SharePostModal
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          setSharepost={setSharepost}
          options={options}
          post={pagePosts?.find(p => p._id === selectedPostForShare) || { _id: selectedPostForShare }}
        />
      )}

      {(selectedOption === "Share in Individuals Chats" ||
        selectedOption === "Share in Group Chats") && (
        <ShareToChatsModal onClose={setSelectedOption} />
      )}

      {selectedOption === "Share to your Story" && selectedPostForShare && (
        <ShareToPagesModal
          postId={selectedPostForShare}
          onClose={(value) => {
            setSelectedOption(value);
            setSelectedPostForShare(null);
          }}
        />
      )}
      {selectedOption === "Share with Topic Page" && selectedPostForShare && (
        <ShareRepostModal
          postId={selectedPostForShare}
          onClose={(value) => {
            setSelectedOption(value);
            setSelectedPostForShare(null);
          }}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportmodal}
        onClose={() => setReportmodal(false)}
        loading={reportLoading}
        onSubmit={handleReportSubmit}
      />

      {/* Comment Filter Modal */}
      <CommentFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filter) => {
          setCommentFilter(filter);
          setFilterModalOpen(false);
        }}
        selectedFilter={commentFilter}
      />

      {/* Boost Post Stepper Modal */}
      {boostModalOpen && (
        <BoostPostModal
          isOpen={boostModalOpen}
          onClose={() => {
            setBoostModalOpen(false);
            setSelectedBoostPost(null);
          }}
          post={selectedBoostPost}
        />
      )}

      {/* Boost Analytics Modal */}
      {analyticsModalOpen && (
        <BoostAnalyticsModal
          isOpen={analyticsModalOpen}
          onClose={() => {
            setAnalyticsModalOpen(false);
            setSelectedAnalyticsBoostId(null);
          }}
          boostId={selectedAnalyticsBoostId}
        />
      )}
    </div>
  );
}
