import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronBackOutline } from "react-icons/io5";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  getKnowledgePostDetail,
  deleteKnowledgePost,
  resetKnowledge,
  likePost,
} from "../../../redux/slices/knowledgepost.slice";
import { SuccessToast, ErrorToast } from "../../global/Toaster";
import ReportModal from "../../global/ReportModal";
import ShareRepostModal from "../../global/ShareRepostModal";
import PostStoryModal from "./PostStoryModal";
import SharePostModal from "../../global/SharePostModal";
import CommentsSection from "../../global/CommentsSection";
import KnowledgeCommentsSection from "../../global/KnowledgeCommentsSection";
import ShareToChatsModal from "../../global/ShareToChatsModal";
import { sendReport } from "../../../redux/slices/reports.slice";

export default function KnowledgePostPageDetail({
  pageId,
  setIsKnowledgePageOpen,
}) {
  const dispatch = useDispatch();
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [likesCounts, setLikesCounts] = useState({}); // Track optimistic likes counts
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [likingPostId, setLikingPostId] = useState(null);
  const [activeSubTopic, setActiveSubTopic] = useState("All");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [sharepost, setSharepost] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [selectedOption, setSelectedOption] = useState("");
  const [reportmodal, setReportmodal] = useState(false);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

  const presetBackgrounds = [
    { id: 1, name: "bg_blue", imagePath: "/bg_blue.jpg" },
    { id: 2, name: "bg_orange_gradient", imagePath: "/bg_orange_gradient.jpg" },
    { id: 3, name: "bg_red_gradient", imagePath: "/bg_red_gradient.png" },
    { id: 4, name: "bg_green", imagePath: "/bg_green.png" },
    { id: 5, name: "bg_multicolor", imagePath: "/bg_multicolor.png" },
  ];
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];
  const [selectedPostForShare, setSelectedPostForShare] = useState(null);

  const deleteMenuRefs = useRef({});

  const {
    knowledgePageDetail,
    knowledgePagePosts,
    knowledgePageLoading,
    deleteLoading,
    deleteSuccess,
  } = useSelector((state) => state.knowledgepost);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );
  useEffect(() => {
    if (pageId) {
      dispatch(getKnowledgePostDetail({ pageId, page: 1, limit: 10 }));
    }
  }, [pageId]);

  // Initialize liked posts from localStorage and API data
  useEffect(() => {
    if (knowledgePagePosts && user?._id) {
      const localLikes = JSON.parse(
        localStorage.getItem("knowledgePostLikes") || "{}",
      );
      const initialLiked = new Set();
      const initialCounts = {};

      knowledgePagePosts.forEach((post) => {
        // Check localStorage first, then API data
        const isLocallyLiked = localLikes[post._id] === true;
        const isApiLiked = post.userLikes?.includes(user._id) || post.isLiked;

        if (isLocallyLiked || isApiLiked) {
          initialLiked.add(post._id);
        }

        // Store initial counts from API
        initialCounts[post._id] = post.likesCount || 0;
      });

      setLikedPosts(initialLiked);
      setLikesCounts(initialCounts);
    }
  }, [knowledgePagePosts, user?._id]);

  // Close the delete menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any open menu
      if (showDeleteMenu) {
        const menuRef = deleteMenuRefs.current[showDeleteMenu];
        if (menuRef && !menuRef.contains(event.target)) {
          setShowDeleteMenu(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteMenu]);

  // Initialize liked posts from localStorage and API data
  useEffect(() => {
    if (knowledgePagePosts && user?._id) {
      const localLikes = JSON.parse(
        localStorage.getItem("knowledgePostLikes") || "{}",
      );
      const initialLiked = new Set();
      const initialCounts = {};

      knowledgePagePosts.forEach((post) => {
        // Check localStorage first, then API data
        const isLocallyLiked = localLikes[post._id] === true;
        const isApiLiked = post.userLikes?.includes(user._id) || post.isLiked;

        if (isLocallyLiked || isApiLiked) {
          initialLiked.add(post._id);
        }

        // Store initial counts from API
        initialCounts[post._id] = post.likesCount || 0;
      });

      setLikedPosts(initialLiked);
      setLikesCounts(initialCounts);
    }
  }, [knowledgePagePosts, user?._id]);

  // Close the delete menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any open menu
      if (showDeleteMenu) {
        const menuRef = deleteMenuRefs.current[showDeleteMenu];
        if (menuRef && !menuRef.contains(event.target)) {
          setShowDeleteMenu(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteMenu]);

  if (deleteSuccess) {
    SuccessToast("Post deleted successfully");

    setTimeout(() => {
      dispatch(resetKnowledge());
    }, 1500);
  }

  const handleLikeClick = async (postId, isKnowlegdeLike) => {
    dispatch(
      likePost({
        postId: postId,
        likeToggle: !isKnowlegdeLike,
      }),
    );
  };

  const handleDelete = (postId) => {
    dispatch(deleteKnowledgePost(postId));
    setShowDeleteMenu(null);
  };

  const getFontClass = (fontFamily) => {
    const fontMap = {
      Classic: "font-sans",
      Signature: "font-serif",
      Editor: "font-mono",
      Poster: "font-black",
      Bubble: "font-serif",
    };
    return fontMap[fontFamily] || "font-sans";
  };

  if (knowledgePageLoading || !knowledgePageDetail) {
    return (
      <div className="p-6 text-center text-gray-500 font-semibold">
        Loading page...
      </div>
    );
  }

  // Build unique subTopic tabs from posts (split by comma, trim)
  const subTopicSet = new Set();
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

  const timeAgo = (dateString) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (diffInSeconds < minute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < hour) {
      return `${Math.floor(diffInSeconds / minute)} minutes ago`;
    } else if (diffInSeconds < day) {
      return `${Math.floor(diffInSeconds / hour)} hours ago`;
    } else if (diffInSeconds < week) {
      return `${Math.floor(diffInSeconds / day)} days ago`;
    } else if (diffInSeconds < month) {
      return `${Math.floor(diffInSeconds / week)} weeks ago`;
    } else if (diffInSeconds < year) {
      return `${Math.floor(diffInSeconds / month)} months ago`;
    } else {
      return `${Math.floor(diffInSeconds / year)} years ago`;
    }
  };

  // Filter posts by active subTopic
  const filteredPosts =
    activeSubTopic === "All"
      ? knowledgePagePosts
      : knowledgePagePosts?.filter((post) => {
          if (!post?.subTopic) return false;
          return post.subTopic
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
            .some((topic) => topic === activeSubTopic);
        });

  return (
    <div className="bg-transparent min-h-screen max-w-2xl">
      {/* Header Card */}
      <div className=" pb-3">
        {/* Back Button */}
        <button
          onClick={() => setIsKnowledgePageOpen(false)}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold"
        >
          <IoChevronBackOutline size={24} /> Back
        </button>

        {/* Page Header + SubTopic Tabs */}

        {subTopicTabs.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2 bg-white/40 rounded-2xl p-2 backdrop-blur-sm">
              <button
                onClick={() => setActiveSubTopic("All")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeSubTopic === "All"
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                }`}
              >
                All
              </button>
              {subTopicTabs.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setActiveSubTopic(topic)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeSubTopic === topic
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts &&
          filteredPosts.map((post) => (
            <div
              key={post._id}
              className="rounded-3xl overflow-hidden bg-white"
            >
              {/* Post Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-white relative">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base">
                      {post.author.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      @{post.author.username} • {timeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* More Options Button */}
                <div
                  className="relative"
                  ref={(el) => {
                    if (el) {
                      deleteMenuRefs.current[post._id] = el;
                    } else {
                      delete deleteMenuRefs.current[post._id];
                    }
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteMenu(
                        showDeleteMenu === post._id ? null : post._id,
                      );
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreHorizontal size={20} className="text-gray-600" />
                  </button>

                  {/* Delete Menu */}
                  {showDeleteMenu === post._id &&
                    (post?.sharedBy ? (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-44">
                        <button
                          onClick={() => {
                            handleDelete(post?._id);
                            console.log("Report clicked");
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-44">
                        <button
                          onClick={() => {
                            setSelectedPostForShare(post);
                            setReportmodal(!reportmodal);
                            console.log("Report clicked");
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Report
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Post Card with Background */}
              <div className="px-6 py-4">
                <div
                  className="rounded-3xl overflow-hidden flex items-center justify-center p-12 min-h-[320px] relative shadow-xl"
                  style={
                    // Check if the post has a background image URL
                    post.background
                      ? {
                          backgroundImage: `url(${post.background})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : // If there's a backgroundCode, match it with presetBackgrounds
                        post.backgroundCode
                        ? {
                            backgroundImage: `url(${
                              presetBackgrounds.find(
                                (bg) => bg.name === post.backgroundCode,
                              )?.imagePath
                            })`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : // Default gradient background if no background or code is found
                          {
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          }
                  }
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/5 rounded-3xl"></div>

                  {/* Category Badge - Top Left */}
                  {post.subTopic && (
                    <div className="absolute top-4 left-4 z-20 inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30">
                      {post.subTopic.split(",")[0].trim()}
                    </div>
                  )}

                  <div className="text-center w-full space-y-3 relative z-10">
                    {/* Post Text */}
                    <p
                      className={`leading-relaxed drop-shadow-2xl mx-auto max-w-2xl ${getFontClass(post.fontFamily)}`}
                      style={{
                        fontSize: `${post.fontSize}px`,
                        color: post.color,
                        fontWeight: post.isBold ? "700" : "500",
                        fontStyle: post.isItalic ? "italic" : "normal",
                        textDecoration: post.isUnderline ? "underline" : "none",
                        textAlign: post.textAlignment,
                      }}
                    >
                      {post.text}
                    </p>
                  </div>
                </div>
              </div>
              {post.sharedBy ? (
                <div className="text-sm flex gap-4 ml-4 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 w-[14em]">
                  <img
                    src={post.sharedBy.profilePicture}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  {post.sharedBy.username} Reposted
                </div>
              ) : null}

              {/* Post Footer - Interaction Buttons */}
              <div className="px-6 py-5 bg-white flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => handleLikeClick(post._id, post.isLiked)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      post?.isLiked
                        ? "fill-orange-500 text-orange-500"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      post?.isLiked ? "text-orange-500" : "text-gray-600"
                    }`}
                  >
                    {post?.likesCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setOpenCommentsPostId(post._id);
                    setCommentsOpen(!commentsOpen);
                  }}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {post?.commentsCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPostForShare({
                      ...post,
                      contentType: "knowledge",
                      page: knowledgePageDetail,
                      pageName: knowledgePageDetail?.name,
                      pageImage: knowledgePageDetail?.image,
                    });
                    setShareModalOpen(true);
                  }}
                  className="flex items-center gap-2 group transition-colors"
                >
                  <Share2
                    size={22}
                    className="text-gray-500 group-hover:text-orange-500 transition-colors"
                  />
                  <span className="text-sm font-semibold text-gray-600">
                    {post.sharesCount}
                  </span>
                </button>
              </div>
              {openCommentsPostId === post._id && (
                <KnowledgeCommentsSection
                  postId={post._id}
                  onClose={() => setCommentsOpen(false)}
                />
              )}
            </div>
          ))}

        {/* Empty State */}
        {knowledgePagePosts && knowledgePagePosts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-500 font-semibold">No posts yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Be the first to create a post!       


              
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareToChatsModal
          onClose={() => {
            setShareModalOpen(false);
            setSelectedPostForShare(null);
          }}
          post={selectedPostForShare}
        />
      )}

      <ReportModal
        isOpen={reportmodal}
        onClose={() => setReportmodal(false)}
        loading={reportLoading}
        onSubmit={(reason) => {
          dispatch(
            sendReport({
              reason,
              targetModel: "Post",
              targetId: selectedPostForShare._id,
              isReported: true,
            }),
          );
          setReportmodal(false);
        }}
      />
    </div>
  );
}
