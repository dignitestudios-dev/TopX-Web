import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { nofound, notes, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { useDispatch, useSelector } from "react-redux";
import {
  getKnowledgePostDetail,
  likePost as likeKnowledgePost,
  toggleKnowledgePageSubscription,
} from "../../redux/slices/knowledgepost.slice";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import KnowledgePostComments from "../../components/global/KnowledgePostComments";
import ShareToChatsModal from "../../components/global/ShareToChatsModal";
import ReportModal from "../../components/global/ReportModal";
import { resetReportState, sendReport } from "../../redux/slices/reports.slice";
import { SuccessToast } from "../../components/global/Toaster";
import { timeAgo } from "../../lib/helpers";

export default function KnowledgePageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [kpCommentsOpenId, setKpCommentsOpenId] = useState(null);
  const [kpSharePost, setKpSharePost] = useState(null);
  const [kpLocalReactions, setKpLocalReactions] = useState({});
  const [moreOpenId, setMoreOpenId] = useState(null);
  const [reportmodal, setReportmodal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeSubTopic, setActiveSubTopic] = useState("");
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?._id;

  const {
    knowledgePageDetail,
    knowledgePagePosts,
    knowledgePageLoading,
  } = useSelector((state) => state.knowledgepost);

  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );


  console.log(knowledgePageDetail,"knowledgePageDetail")
  console.log(knowledgePagePosts,"knowledgePagePosts")

  // Fetch page detail and posts
  useEffect(() => {
    if (id) {
      dispatch(getKnowledgePostDetail({ pageId: id, page: 1, limit: 10 }));
    }
  }, [dispatch, id]);

  // Sync local subscription state from API detail
  useEffect(() => {
    if (knowledgePageDetail) {
      setIsSubscribed(!!knowledgePageDetail.isSubscribed);
    }
  }, [knowledgePageDetail]);

  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportmodal(false);
    }
  }, [reportSuccess, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setMoreOpenId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  // Subscribe to knowledge page (simple one-click subscribe)
  const handleSubscribeClick = async () => {
    if (!knowledgePageDetail?._id) return;
    if (isSubscribed) return; // already subscribed

    try {
      // Optimistic update
      setIsSubscribed(true);

      const res = await dispatch(
        toggleKnowledgePageSubscription({ pageId: knowledgePageDetail._id }),
      ).unwrap();

      SuccessToast(
        res?.message || "Subscribed to knowledge page successfully",
      );
    } catch (error) {
      console.error("Knowledge page subscription failed:", error);
      // Revert on failure
      setIsSubscribed(false);
    }
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

    // Fire API
    dispatch(
      likeKnowledgePost({
        postId,
        likeToggle: !baseIsLiked,
      }),
    );
  };

  if (knowledgePageLoading) {
    return (
      <div className="flex min-h-screen max-w-7xl mx-auto">
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3">
          <Profilecard smallcard={true} />
          <div className="pt-4">
            <MySubscription />
          </div>
        </div>
        <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto flex items-center justify-center">
          <div className="text-gray-500 font-semibold">Loading...</div>
        </div>
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>
    );
  }

  if (!knowledgePageDetail) {
    return (
      <div className="flex min-h-screen max-w-7xl mx-auto">
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3">
          <Profilecard smallcard={true} />
          <div className="pt-4">
            <MySubscription />
          </div>
        </div>
        <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <img src={nofound} height={300} width={300} alt="" />
            <p className="font-bold pt-4 text-black">Page not found</p>
          </div>
        </div>
        <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>
    );
  }

  // Build subTopic tabs from page.subTopic and posts
  const subTopicSet = new Set();

  if (Array.isArray(knowledgePageDetail.subTopic)) {
    knowledgePageDetail.subTopic
      .map((s) => s && s.trim())
      .filter(Boolean)
      .forEach((topic) => subTopicSet.add(topic));
  }

  (knowledgePagePosts || []).forEach((post) => {
    if (post?.subTopic) {
      post.subTopic
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((topic) => subTopicSet.add(topic));
    }
  });

  const subTopicTabs = Array.from(subTopicSet);

  // Filter posts by active subTopic (or show all if no active)
  const filteredPosts =
    subTopicTabs.length === 0 || !activeSubTopic
      ? knowledgePagePosts
      : (knowledgePagePosts || []).filter((post) => {
          if (!post?.subTopic) return false;
          const topics = post.subTopic
            .split(",")
            .map((p) => p.trim().toLowerCase())
            .filter(Boolean);
          return topics.includes(activeSubTopic.toLowerCase());
        });

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide">
        <Profilecard smallcard={true} />
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Middle Feed */}
      <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* SubTopic Tabs */}
          {subTopicTabs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {subTopicTabs.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveSubTopic(topic)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    activeSubTopic === topic
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}


          {/* Posts */}
          {filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
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
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                    ref={dropdownRef}
                  >
                    <button
                      onClick={() =>
                        setMoreOpenId(moreOpenId === post._id ? null : post._id)
                      }
                      className="p-2 hover:bg-gray-50 rounded-full transition"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>

                    {moreOpenId === post._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => {
                            setMoreOpenId(null);
                            setSelectedPostId(post._id);
                            setReportmodal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Report
                        </button>
                      </div>
                    )}
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
                            className={`w-5 h-5 transition ${
                              isLiked
                                ? "fill-orange-500 text-orange-500"
                                : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isLiked ? "text-orange-500" : "text-gray-600"
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
            <div className="bg-white rounded-2xl p-12 text-center items-center justify-center shadow-sm">
              <div className="flex justify-center">
              <img src={nofound} height={200} width={200} alt="" />
              </div>
              <p className="text-gray-500 font-semibold mt-4">
                {subTopicTabs.length === 0 || !activeSubTopic
                  ? "No posts yet"
                  : `No posts found for \"${activeSubTopic}\"`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto border-gray-200 scrollbar-hide">
        <div className="p-0">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>

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

      {/* Report Modal */}
      {selectedPostId && (
        <ReportModal
          isOpen={reportmodal}
          onClose={() => {
            setReportmodal(false);
            setSelectedPostId(null);
          }}
          loading={reportLoading}
          onSubmit={(reason) => {
            dispatch(
              sendReport({
                reason,
                targetModel: "Post",
                targetId: selectedPostId,
                isReported: true,
              }),
            );
          }}
        />
      )}
    </div>
  );
}

