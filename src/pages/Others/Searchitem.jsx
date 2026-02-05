import { ChevronRight, Heart, MessageCircle, Share2, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import PostCard from "../../components/global/PostCard";
import { useDispatch, useSelector } from "react-redux";
import CollectionFeedPostCard from "../../components/global/CollectionFeedPostCard";
import { VscReport } from "react-icons/vsc";
import {
  addPageToCollections,
  removePageFromCollections,
} from "../../redux/slices/collection.slice";
import CollectionModal from "../../components/global/CollectionModal";
import { setApiTrigger } from "../../redux/slices/Global.Slice";
import { Link, useNavigate } from "react-router";
import { timeAgo } from "../../lib/helpers";
import KnowledgePostComments from "../../components/global/KnowledgePostComments";
import ShareToChatsModal from "../../components/global/ShareToChatsModal";
import {
  likePost as likeKnowledgePost,
  toggleKnowledgePageSubscription,
} from "../../redux/slices/knowledgepost.slice";
import { nofound, notes, topics } from "../../assets/export";
import { SuccessToast } from "../../components/global/Toaster";

const SearchItem = () => {
  const [activeTab, setActiveTab] = useState("Pages");
  const { globalSearch } = useSelector((state) => state.globalSearch);
  const { user, allUserData } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState({});
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [unsubscribingPageId, setUnsubscribingPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();
  const [kpCommentsOpenId, setKpCommentsOpenId] = useState(null);
  const [kpSharePost, setKpSharePost] = useState(null);
  const [kpLocalReactions, setKpLocalReactions] = useState({});
  const [knowledgeSubs, setKnowledgeSubs] = useState({});
  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Extract data from globalSearch
  const pages = globalSearch?.pages || [];
  const posts = globalSearch?.posts || [];
  const people = globalSearch?.users || [];
  const keywords = globalSearch?.keywords || { posts: [], pages: [] };
  const knowledgePosts = globalSearch?.knowledgePosts || [];
  const currentUserId = user?._id || allUserData?._id;

  const getGradient = (index) => {
    const gradients = [
      "from-pink-500 via-orange-500 to-yellow-500",
      "from-blue-600 to-blue-400",
      "from-purple-500 to-pink-400",
      "from-green-400 to-blue-500",
      "from-orange-400 to-red-500",
    ];
    return gradients[index % gradients.length];
  };


  console.log(pages, "pagespagespages")

  const getKnowledgeReaction = (post) => {
    const baseIsLiked = currentUserId
      ? post.userLikes?.includes(currentUserId)
      : false;
    const local = kpLocalReactions[post._id];

    return {
      isLiked: local?.isLiked ?? baseIsLiked,
      likesCount: local?.likesCount ?? post.likesCount ?? 0,
    };
  };

  const handleKnowledgeLikeClick = (post) => {
    const postId = post._id;
    const baseIsLiked = currentUserId
      ? post.userLikes?.includes(currentUserId)
      : false;

    setKpLocalReactions((prev) => {
      const current = prev[postId] || {
        isLiked: baseIsLiked,
        likesCount: post.likesCount ?? 0,
      };

      const nextIsLiked = !current.isLiked;
      const nextLikesCount = Math.max(
        (current.likesCount ?? 0) + (nextIsLiked ? 1 : -1),
        0,
      );

      return {
        ...prev,
        [postId]: {
          isLiked: nextIsLiked,
          likesCount: nextLikesCount,
        },
      };
    });

    // Fire API (global feed will update its own slice; here we manage local state)
    dispatch(
      likeKnowledgePost({
        postId,
        likeToggle: !baseIsLiked,
      }),
    );
  };
  const handleSubscribeClick = (page) => {
    console.log(page, "page-record");
    setSelectedPage(page);
    setOpenModal(true);
  };
  const handleUnsubscribe = (page) => {
    setUnsubscribingPageId(page._id); // mark specific page as loading

    dispatch(
      removePageFromCollections({
        collections: page.collections || [],
        page: page._id,
      })
    ).then(() => {
      dispatch(setApiTrigger(true));
      setUnsubscribingPageId(null); // stop loader for that page only
    });
  };
  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(
      addPageToCollections({
        collections: selectedCollections,
        page: selectedPage._id,
      })
    ).then(() => {
      dispatch(setApiTrigger(true));
      setOpenModal(false);
    });
  };

  // Direct subscribe for knowledge pages (no \"Organize Your Interest\" modal)
  const handleKnowledgePageSubscribe = async (page) => {
    if (!page?._id) return;

    const pageId = page._id;

    // If already locally marked subscribed, ignore
    const alreadySubscribed = knowledgeSubs[pageId] ?? page.isSubscribed;
    if (alreadySubscribed) return;

    try {
      // Optimistic local state
      setKnowledgeSubs((prev) => ({
        ...prev,
        [pageId]: true,
      }));

      const res = await dispatch(
        toggleKnowledgePageSubscription({ pageId }),
      ).unwrap();

      SuccessToast(
        res?.message || "Subscribed to knowledge page successfully",
      );
    } catch (error) {
      console.error("Knowledge page subscription failed:", error);
      // Revert optimistic state
      setKnowledgeSubs((prev) => ({
        ...prev,
        [pageId]: page.isSubscribed || false,
      }));
    }
  };
  return (
    <div className="container max-w-6xl mx-auto p-5">
      {/* Tabs */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        {["For You", "Pages", "Keywords", "Post", "Knowledge Posts", "People"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${activeTab === tab
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Pages Tab */}
        {activeTab === "Pages" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 py-6">
            {pages.length > 0 ? (
              pages.map((page) => (
                <div
                  key={page._id}
                  onClick={() => {
                    if (page.contentType === "knowledge") {
                      navigate(`/knowledge-page-detail/${page._id}`);
                    } else {
                      navigate(`/trending-page-detail/${page._id}`);
                    }
                  }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={page.image || page.user?.profilePicture || topics}
                      alt={page.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 items-center">
                        <p className="font-semibold text-[14px] text-gray-900 truncate">
                          {page.name}
                        </p>
                        <img src={notes} alt="" className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <p className="text-[12px] text-gray-500 mt-1 truncate">
                        {page.topic}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {page.about}
                  </p>

                  {/* Keywords/Hashtags */}
                  {page.keywords && page.keywords.length > 0 && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                      {page.keywords.slice(0, 3).join(" ")}
                    </p>
                  )}

                  {/* Footer - Followers */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {page.followers &&
                          page.followers.slice(0, 3).map((img, i) =>
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
                            ),
                          )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                        {page.followersCount || 0}+ Follows
                      </p>
                    </div>
                    {/* Subscribe Button - Only for knowledge pages (direct subscribe) */}
                    {page.contentType === "knowledge" && (() => {
                      const isSubscribed =
                        knowledgeSubs[page._id] ?? page.isSubscribed;
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSubscribed) {
                              navigate(`/trending-page-detail/${page._id}`);
                            } else {
                              handleKnowledgePageSubscribe(page);
                            }
                          }}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                            ${
                              isSubscribed
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white"
                            }`}
                        >
                          {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 col-span-3 text-center py-10">
                <div className=" flex justify-center">
                  <img src={nofound} height={300} width={300} alt="" />
                </div>
                <p className="font-bold pt-4 text-black">No results found</p>
              </div>
            )}
          </div>
        )}

        {/* Knowledge Posts Tab */}
        {activeTab === "Knowledge Posts" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {knowledgePosts.length > 0 ? (
              knowledgePosts.map((post, index) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                >
                  {/* Header */}
                  <div className="p-4 flex items-start justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={
                          post.author?.profilePicture ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz68b1g8MSxSUqvFtuo44MvagkdFGoG7Z7DQ&s"
                        }
                        alt={post.author?.name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {post.author?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{post.author?.username} • {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div
                    className={`bg-gradient-to-br ${getGradient(
                      index,
                    )} rounded-2xl m-3 px-6 py-12 min-h-[200px] flex items-center justify-center relative`}
                    style={
                      post.background
                        ? {
                          backgroundImage: `url(${post.background})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                        : {}
                    }
                  >
                    {post.page?.topic && (
                      <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full absolute top-4 left-4">
                        {post.page.topic}
                      </span>
                    )}
                    <p className="text-white text-lg font-semibold text-center leading-snug">
                      {post.text}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-10 text-sm text-orange-500 p-4 border-t border-gray-100">
                    {/* Like */}
                    <button
                      type="button"
                      onClick={() => handleKnowledgeLikeClick(post)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                    >
                      {(() => {
                        const { isLiked, likesCount } = getKnowledgeReaction(post);
                        return (
                          <>
                            <Heart
                              className={`w-5 h-5 transition ${isLiked
                                ? "fill-orange-500 text-orange-500"
                                : "text-gray-600"
                                }`}
                            />
                            <span
                              className={`text-sm font-medium ${isLiked ? "text-orange-500" : "text-gray-600"
                                }`}
                            >
                              {likesCount}
                            </span>
                          </>
                        );
                      })()}
                    </button>

                    {/* Comments */}
                    <button
                      type="button"
                      onClick={() =>
                        setKpCommentsOpenId((prev) =>
                          prev === post._id ? null : post._id,
                        )
                      }
                      className="flex items-center gap-2 hover:text-orange-600 text-gray-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentsCount}</span>
                    </button>

                    {/* Share */}
                    <button
                      type="button"
                      onClick={() => setKpSharePost(post)}
                      className="flex items-center gap-2 hover:text-orange-600 text-gray-600"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.sharesCount}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {kpCommentsOpenId === post._id && (
                    <div className="px-4 pb-4">
                      <KnowledgePostComments postId={post._id} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 col-span-3 text-center py-10">
                <div className=" flex justify-center">
                  <img src={nofound} height={300} width={300} alt="" />
                </div>
                <p className="font-bold pt-4 text-black">No results found</p>
              </div>
            )}
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === "Keywords" && (
          <div className="space-y-8">
            {/* All Keywords List */}
            {(keywords.posts.length > 0 || keywords.pages.length > 0) && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Keywords</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {keywords.posts.map((keyword, idx) => (
                    <div
                      key={`post-keyword-${idx}`}
                      className="border p-3 rounded-lg bg-white text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                  {keywords.pages.map((keyword, idx) => (
                    <div
                      key={`page-keyword-${idx}`}
                      className="border p-3 rounded-lg bg-white text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pages Matching Keywords */}
            {(() => {
              // Get all unique keywords
              const allKeywords = [...keywords.posts, ...keywords.pages];

              console.log("Keywords Tab Debug:", {
                allKeywords,
                keywordsPosts: keywords.posts,
                keywordsPages: keywords.pages,
                pagesCount: pages.length,
                pages: pages.map(p => ({ name: p.name, topic: p.topic, keywords: p.keywords }))
              });

              // If no keywords but pages exist, show all pages (they were returned by search API)
              // Otherwise, filter pages that match keywords
              let matchingPages = [];

              if (allKeywords.length === 0 && pages.length > 0) {
                // No keywords found, but pages exist - show all pages
                matchingPages = pages;
                console.log("Showing all pages (no keywords):", matchingPages.length);
              } else if (allKeywords.length > 0) {
                // Filter pages that match any keyword
                matchingPages = pages.filter((page) => {
                  // Check if page topic matches any keyword
                  if (page.topic) {
                    const topicMatch = allKeywords.some((keyword) =>
                      page.topic.toLowerCase().includes(keyword.toLowerCase()) ||
                      keyword.toLowerCase().includes(page.topic.toLowerCase())
                    );
                    if (topicMatch) return true;
                  }

                  // Check if page keywords array matches
                  if (page.keywords && page.keywords.length > 0) {
                    const keywordsMatch = page.keywords.some((pageKeyword) =>
                      allKeywords.some((keyword) =>
                        pageKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
                        keyword.toLowerCase().includes(pageKeyword.toLowerCase())
                      )
                    );
                    if (keywordsMatch) return true;
                  }

                  // Check if page name matches
                  if (page.name) {
                    const nameMatch = allKeywords.some((keyword) =>
                      page.name.toLowerCase().includes(keyword.toLowerCase())
                    );
                    if (nameMatch) return true;
                  }

                  // Check if page about matches
                  if (page.about) {
                    const aboutMatch = allKeywords.some((keyword) =>
                      page.about.toLowerCase().includes(keyword.toLowerCase())
                    );
                    if (aboutMatch) return true;
                  }

                  return false;
                });
              }

              console.log("Matching pages count:", matchingPages.length);

              if (matchingPages.length === 0 && keywords.posts.length === 0 && keywords.pages.length === 0 && pages.length === 0) {
                return (
                  <div className="text-gray-500 col-span-3 text-center py-10">
                    <div className=" flex justify-center">
                      <img src={nofound} height={300} width={300} alt="" />
                    </div>
                    <p className="font-bold pt-4 text-black">No results found</p>
                  </div>
                );
              }

              if (matchingPages.length === 0) return null;

              return (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Matching Pages</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 py-6">
                    {matchingPages.map((page) => (
                      <div
                        key={page._id}
                        onClick={() => {
                          if (page.contentType === "knowledge") {
                            navigate(`/knowledge-page-detail/${page._id}`);
                          } else {
                            navigate(`/trending-page-detail/${page._id}`);
                          }
                        }}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={page.image || page.user?.profilePicture || topics}
                            alt={page.name}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex gap-2 items-center">
                              <p className="font-semibold text-[14px] text-gray-900 truncate">
                                {page.name}
                              </p>
                              <img src={notes} alt="" className="w-4 h-4 flex-shrink-0" />
                            </div>
                            <p className="text-[12px] text-gray-500 mt-1 truncate">
                              {page.topic}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {page.about}
                        </p>

                        {/* Keywords/Hashtags */}
                        {page.keywords && page.keywords.length > 0 && (
                          <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                            {page.keywords.slice(0, 3).join(" ")}
                          </p>
                        )}

                        {/* Footer - Followers */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {page.followers &&
                                page.followers.slice(0, 3).map((img, i) =>
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
                                  ),
                                )}
                            </div>
                            <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                              {page.followersCount || 0}+ Follows
                            </p>
                          </div>
                          {/* Subscribe Button - Only for knowledge pages (direct subscribe) */}
                          {page.contentType === "knowledge" && (() => {
                            const isSubscribed =
                              knowledgeSubs[page._id] ?? page.isSubscribed;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isSubscribed) {
                                    navigate(`/trending-page-detail/${page._id}`);
                                  } else {
                                    handleKnowledgePageSubscribe(page);
                                  }
                                }}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                                  ${
                                    isSubscribed
                                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                      : "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white"
                                  }`}
                              >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}



        {/* Post Tab */}
        {activeTab === "Post" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {posts.length > 0 ? (
              posts?.map((post) => {
                // Check if post's page is private and user is not subscribed
                const postPage = pages.find((p) => p._id === post?.page?._id);
                const isPrivatePage = post?.page?.pageType === "private";
                const isSubscribed = postPage?.isSubscribed || false;
                const shouldShowContent = !isPrivatePage || isSubscribed;

                if (!shouldShowContent) {
                  return (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
                    >
                      {/* Header - Always visible */}
                      <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <img
                            src={post?.author?.profilePicture}
                            alt={post?.author?.name}
                            onClick={() => {
                              if (post?.author) {
                                navigate("/other-profile", {
                                  state: { id: post.author },
                                });
                              }
                            }}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                          />
                          <div>
                            <h3
                              onClick={() => {
                                if (post?.author) {
                                  navigate("/other-profile", {
                                    state: { id: post.author },
                                  });
                                }
                              }}
                              className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                            >
                              {post?.author?.name}
                            </h3>
                            <p
                              onClick={() => {
                                if (post?.author) {
                                  navigate("/other-profile", {
                                    state: { id: post.author },
                                  });
                                }
                              }}
                              className="text-xs text-gray-500 cursor-pointer hover:text-orange-600 transition-colors"
                            >
                              @{post?.author?.username} · {post?.createdAt ? timeAgo(post.createdAt) : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Post Content - Blurred with overlay */}
                      <div className="relative pt-[4em] pb-[4em]">
                        {/* Blurred Content */}
                        <div className="blur-md pointer-events-none select-none">
                          {/* Media */}
                          {post?.media && post.media.length > 0 && (
                            <div className="w-full bg-white overflow-hidden p-4">
                              {post.media[0]?.type === "image" ? (
                                <img
                                  src={post.media[0].fileUrl}
                                  alt="post"
                                  className="w-full h-auto rounded-2xl object-cover max-h-96"
                                />
                              ) : post.media[0]?.type === "video" ? (
                                <video
                                  controls
                                  className="w-full h-auto rounded-2xl object-cover max-h-96"
                                  src={post.media[0].fileUrl}
                                />
                              ) : null}
                            </div>
                          )}
                          {/* Body Text */}
                          {post?.bodyText && (
                            <div className="px-4 py-3">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.bodyText}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Private Post Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                          <div className="text-center px-6">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
                              <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                            <p className="text-base font-semibold text-orange-500">
                              Private post
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <CollectionFeedPostCard
                    key={post._id}
                    isPostId={post?._id}
                    post={post?.media}
                    fullPost={post}
                    author={post?.author}
                    likedCount={post?.likesCount}
                    commentCount={post?.commentsCount}
                    shareCount={post?.sharesCount}
                    toggleLike={toggleLike}
                  />
                );
              })
            ) : (
              <div className="text-gray-500 col-span-3 text-center py-10">
                <div className=" flex justify-center">
                  <img src={nofound} height={300} width={300} alt="" />
                </div>
                <p className="font-bold pt-4 text-black">No results found</p>
              </div>
            )}
          </div>
        )}

        {/* People Tab */}
        {activeTab === "People" && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {people.length > 0 ? (
              people.map((person) => (
                <div
                  key={person._id}
                  onClick={() =>
                      navigate("/other-profile", {
                        state: { id: person }, // ✅ correct
                      })
                    }
                  className="cursor-pointer flex items-center justify-between border p-3 rounded-lg bg-white"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        person.profilePicture ||
                        "https://www.w3schools.com/w3images/avatar2.png"
                      }
                      alt={person.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{person.name}</h3>

                    </div>
                  </div>

                  <ChevronRight
                    className="text-orange-500 cursor-pointer"
                    
                  />

                </div>
              ))
            ) : (
              <div className="text-gray-500 col-span-3 text-center py-10">
                <div className=" flex justify-center">
                  <img src={nofound} height={300} width={300} alt="" />
                </div>
                <p className="font-bold pt-4 text-black">No results found</p>
              </div>
            )}
          </div>
        )}


        {/* For You Tab */}
        {activeTab === "For You" && (
          <div className="space-y-10">

            {/* Posts Section */}
            {posts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Posts</h2>
                <div className="space-y-6 max-w-2xl mx-auto">
                  {posts.map((post) => {
                    // Check if post's page is private and user is not subscribed
                    const postPage = pages.find((p) => p._id === post?.page?._id);
                    const isPrivatePage = post?.page?.pageType === "private";
                    const isSubscribed = postPage?.isSubscribed || false;
                    const shouldShowContent = !isPrivatePage || isSubscribed;

                    if (!shouldShowContent) {
                      return (
                        <div
                          key={post._id}
                          className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
                        >
                          {/* Header - Always visible */}
                          <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <img
                                src={post?.author?.profilePicture}
                                alt={post?.author?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <h3 className="font-semibold text-sm text-gray-900">
                                  {post?.author?.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  @{post?.author?.username} · {post?.createdAt ? timeAgo(post.createdAt) : ""}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Post Content - Blurred with overlay */}
                          <div className="relative min-h-[200px] py-8">
                            {/* Blurred Content */}
                            <div className="blur-md pointer-events-none select-none">
                              {/* Media */}
                              {post?.media && post.media.length > 0 && (
                                <div className="w-full bg-white overflow-hidden p-4">
                                  {post.media[0]?.type === "image" ? (
                                    <img
                                      src={post.media[0].fileUrl}
                                      alt="post"
                                      className="w-full h-auto rounded-2xl object-cover max-h-96"
                                    />
                                  ) : post.media[0]?.type === "video" ? (
                                    <video
                                      controls
                                      className="w-full h-auto rounded-2xl object-cover max-h-96"
                                      src={post.media[0].fileUrl}
                                    />
                                  ) : null}
                                </div>
                              )}
                              {/* Body Text */}
                              {post?.bodyText && (
                                <div className="px-4 py-3">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {post.bodyText}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Private Post Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                              <div className="text-center px-6">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
                                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                                </div>
                                <p className="text-base font-semibold text-orange-500">
                                  Private post
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <CollectionFeedPostCard
                        key={post._id}
                        isPostId={post._id}
                        post={post.media}
                        fullPost={post}
                        author={post.author}
                        likedCount={post.likesCount}
                        commentCount={post.commentsCount}
                        shareCount={post.sharesCount}
                        toggleLike={toggleLike}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pages Section */}
            {pages.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Pages</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 py-6">
                  {pages.map((page) => (
                    <div
                      key={page._id}
                      onClick={() => {
                        if (page.contentType === "knowledge") {
                          navigate(`/knowledge-page-detail/${page._id}`);
                        } else {
                          navigate(`/trending-page-detail/${page._id}`);
                        }
                      }}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={page.image || page.user?.profilePicture || topics}
                          alt={page.name}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-2 items-center">
                            <p className="font-semibold text-[14px] text-gray-900 truncate">
                              {page.name}
                            </p>
                            <img src={notes} alt="" className="w-4 h-4 flex-shrink-0" />
                          </div>
                          <p className="text-[12px] text-gray-500 mt-1 truncate">
                            {page.topic}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {page.about}
                      </p>

                      {/* Keywords/Hashtags */}
                      {page.keywords && page.keywords.length > 0 && (
                        <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                          {page.keywords.slice(0, 3).join(" ")}
                        </p>
                      )}

                      {/* Footer - Followers */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {page.followers &&
                              page.followers.slice(0, 3).map((img, i) =>
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
                                ),
                              )}
                          </div>
                          <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                            {page.followersCount || 0}+ Follows
                          </p>
                        </div>
                        {/* Subscribe Button - Only for knowledge pages (direct subscribe) */}
                        {page.contentType === "knowledge" && (() => {
                          const isSubscribed =
                            knowledgeSubs[page._id] ?? page.isSubscribed;
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSubscribed) {
                                  navigate(`/trending-page-detail/${page._id}`);
                                } else {
                                  handleKnowledgePageSubscribe(page);
                                }
                              }}
                              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                                ${
                                  isSubscribed
                                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    : "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white"
                                }`}
                            >
                              {isSubscribed ? "Subscribed" : "Subscribe"}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Posts Section */}
            {knowledgePosts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Knowledge Posts
                </h2>
                <div className="space-y-6 max-w-2xl mx-auto">
                  {knowledgePosts.map((post, index) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                    >
                      <div className="p-4 flex items-start justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={
                              post.author?.profilePicture ||
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz68b1g8MSxSUqvFtuo44MvagkdFGoG7Z7DQ&s"
                            }
                            alt={post.author?.name || "User"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-800">
                              {post.author?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{post.author?.username} •{" "}
                              {timeAgo(post.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`bg-gradient-to-br ${getGradient(
                          index,
                        )} rounded-2xl m-3 px-6 py-12 min-h-[200px] flex items-center justify-center relative`}
                        style={
                          post.background
                            ? {
                              backgroundImage: `url(${post.background})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                            : {}
                        }
                      >
                        {post.page?.topic && (
                          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full absolute top-4 left-4">
                            {post.page.topic}
                          </span>
                        )}
                        <p className="text-white text-lg font-semibold text-center leading-snug">
                          {post.text}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-10 text-sm text-orange-500 p-4 border-t border-gray-100">
                        {/* Like */}
                        <button
                          type="button"
                          onClick={() => handleKnowledgeLikeClick(post)}
                          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                        >
                          {(() => {
                            const { isLiked, likesCount } =
                              getKnowledgeReaction(post);
                            return (
                              <>
                                <Heart
                                  className={`w-5 h-5 transition ${isLiked
                                    ? "fill-orange-500 text-orange-500"
                                    : "text-gray-600"
                                    }`}
                                />
                                <span
                                  className={`text-sm font-medium ${isLiked
                                    ? "text-orange-500"
                                    : "text-gray-600"
                                    }`}
                                >
                                  {likesCount}
                                </span>
                              </>
                            );
                          })()}
                        </button>

                        {/* Comments */}
                        <button
                          type="button"
                          onClick={() =>
                            setKpCommentsOpenId((prev) =>
                              prev === post._id ? null : post._id,
                            )
                          }
                          className="flex items-center gap-2 hover:text-orange-600 text-gray-600"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.commentsCount}</span>
                        </button>

                        {/* Share */}
                        <button
                          type="button"
                          onClick={() => setKpSharePost(post)}
                          className="flex items-center gap-2 hover:text-orange-600 text-gray-600"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>{post.sharesCount}</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {kpCommentsOpenId === post._id && (
                        <div className="px-4 pb-4">
                          <KnowledgePostComments postId={post._id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* People Section */}
            {people.length > 0 && (
              <div>
                <div className="space-y-4 max-w-2xl mx-auto">
                  {people.map((person) => (
                    <div
                      key={person._id}
                      className="flex items-center justify-between border p-3 rounded-lg bg-white"
                     onClick={() =>
                          navigate("/other-profile", {
                            state: { id: person }, // ✅ correct
                          })
                        }>
                      <div className="flex items-center gap-4 cursor-pointer"  >
                        <img
                          src={
                            person.profilePicture ||
                            "https://www.w3schools.com/w3images/avatar2.png"
                          }
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{person.name}</h3>
                        
                        </div>
                      </div>
                      <ChevronRight
                        className="text-orange-500 cursor-pointer"
                       
                      />

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords Section */}
            {(keywords.posts.length > 0 || keywords.pages.length > 0) && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Keywords</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...keywords.posts, ...keywords.pages].map((keyword, idx) => (
                    <div
                      key={idx}
                      className="border p-3 rounded-lg bg-white text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {pages.length === 0 &&
              posts.length === 0 &&
              people.length === 0 &&
              keywords.posts.length === 0 &&
              keywords.pages.length === 0 && (
                <div className="text-gray-500 col-span-3 text-center py-10">
                  <div className=" flex justify-center">
                    <img src={nofound} height={300} width={300} alt="" />
                  </div>
                  <p className="font-bold pt-4 text-black">No results found</p>
                </div>
              )}
          </div>
        )}


        {openModal && (
          <CollectionModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            page={selectedPage}
            onSave={handleSaveToCollection}
          />
        )}

        {/* Share Knowledge Post Modal */}
        {kpSharePost && (
          <ShareToChatsModal
            onClose={() => setKpSharePost(null)}
            post={{
              _id: kpSharePost._id,
              contentType: "knowledge",
              type: "knowledge",
              text: kpSharePost.text,
              bodyText: kpSharePost.text,
              content: kpSharePost.text,
              backgroundCode: kpSharePost.background,
              page: kpSharePost.page,
              pageImage: kpSharePost.page?.image,
              pageName: kpSharePost.page?.name,
              author: kpSharePost.author,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SearchItem;
