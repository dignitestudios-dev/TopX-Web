import { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../redux/slices/posts.slice";
import { useNavigate } from "react-router";
import { PostUnderReview } from "../../assets/export";
import ReportModal from "./ReportModal";
import { resetReportState, sendReport } from "../../redux/slices/reports.slice";
import { SuccessToast } from "./Toaster";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";
import { IoWarning } from "react-icons/io5";
import PrivatePostModal from "./PrivatePostModal";

export default function HomePostFeed({ post, liked, toggleLike }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [isPrivatePost, setIsPrivatePost] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isVideo = (url) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const [activeMedia, setActiveMedia] = useState(null);
  console.log("postpostpostpostpost", post);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasImages = Array.isArray(post.postimage) && post.postimage.length > 0;
  const firstMedia = hasImages ? post.postimage[0] : null;
  const firstMediaIsVideo = firstMedia ? isVideo(firstMedia) : false;
  const isUnderReview = Boolean(post?.isReported);

  const [reportmodal, setReportmodal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [sharepost, setSharepost] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );
  const { user: authUser } = useSelector((state) => state.auth);

  // Get initial like state from post or localStorage
  const getInitialLikeState = () => {
    const postId = post.id || post._id;

    // Check localStorage first (for optimistic updates)
    const localLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    const cachedLike = localLikes[postId];

    if (cachedLike) {
      return {
        isLiked: cachedLike.isLiked || false,
        likesCount: cachedLike.likesCount || 0,
      };
    }

    // Use post data
    return {
      isLiked: post.isLiked || false,
      likesCount: post.likesCount || 0,
    };
  };

  const [localLikeState, setLocalLikeState] = useState(getInitialLikeState());

  // Update local state when post changes
  useEffect(() => {
    const newState = getInitialLikeState();
    setLocalLikeState(newState);
  }, [post.id, post.isLiked, post.likesCount]);

  const handleLikeClick = async () => {
    const postId = post.id || post._id;
    if (!postId) {
      console.error("Post ID not found", { post });
      return;
    }

    const currentIsLiked = localLikeState.isLiked;
    const currentLikesCount = localLikeState.likesCount || 0;
    const newIsLiked = !currentIsLiked;
    const newLikesCount = newIsLiked
      ? currentLikesCount + 1
      : Math.max(currentLikesCount - 1, 0);

    console.log(
      "🔵 Like clicked - Post ID:",
      postId,
      "New Like Status:",
      newIsLiked,
    );

    // Optimistic update - update UI immediately
    setLocalLikeState({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    });

    // Call parent toggleLike callback if provided
    if (toggleLike && typeof toggleLike === "function") {
      toggleLike(postId);
    }

    // Save to localStorage for persistence
    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = {
      isLiked: newIsLiked,
      likesCount: newLikesCount,
    };
    localStorage.setItem("postLikes", JSON.stringify(likes));

    // Call API - Same as PostCard/Mypost.jsx
    try {
      console.log("🔵 Dispatching likePost API:", {
        id: postId,
        likeToggle: newIsLiked,
        isPost: true,
      });
      const result = await dispatch(
        likePost({
          id: postId,
          likeToggle: newIsLiked,
          isPost: true,
        }),
      ).unwrap();

      console.log("✅ Like API success:", result);

      // Update with API response - check result.data structure
      if (result?.data) {
        const apiData = result.data;
        setLocalLikeState({
          isLiked: apiData.likeToggle ?? newIsLiked,
          likesCount: apiData.likesCount ?? newLikesCount,
        });
      } else {
        // If response structure is different, keep optimistic update
        setLocalLikeState({
          isLiked: newIsLiked,
          likesCount: newLikesCount,
        });
      }
    } catch (error) {
      // If API call failed, revert optimistic update
      console.error("❌ Like API failed:", error);
      setLocalLikeState({
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      });

      // Also revert localStorage
      const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
      likes[postId] = {
        isLiked: currentIsLiked,
        likesCount: currentLikesCount,
      };
      localStorage.setItem("postLikes", JSON.stringify(likes));
    }
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportmodal(false);
    }
  }, [reportSuccess, dispatch]);

  const options = [
    "Share to your Story",
    "Share with Topic Page",
    "Share in Individuals Chats",
    "Share in Group Chats",
  ];

  const handlePageClick = () => {
    if (!post.page) {
      return;
    }

    const isMyPage = post.page?.user?._id === authUser?._id;

    if (isMyPage) {
      // Open page in my Profile with ProfilePost
      navigate("/profile", { state: { id: post.page._id } });
    } else {
      // Open in OtherProfile and directly open this page
      navigate("/other-profile", {
        state: {
          id: post.page.user, // full user object
          pageId: post.page._id,
        },
      });
    }
  };

  const handleAuthorClick = () => {
    if (!post.author) return;

    navigate("/other-profile", {
      state: { id: post.author },
    });
  };
  return (
    <div className="bg-white relative h-[350px] rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-amber-800 text-white flex justify-center items-center rounded-full capitalize">
              {post.user.split(" ")[0][0] + post.user.split(" ")[1][0]}
            </div>
            {post.author.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={post.user}
                className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 absolute -right-1 -bottom-0 text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
                {post.user.split(" ")[0][0] + post.user.split(" ")[1][0]}
              </div>
            )}
          </div>
          <div>
            {/* Page Name (or fallback to user) */}
            <h3
              className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
              onClick={post.page ? handlePageClick : handleAuthorClick}
            >
              {post.page?.name || post.user}
            </h3>
            {/* Author username */}
            <p
              onClick={handleAuthorClick}
              className="text-xs cursor-pointer text-gray-500 hover:text-orange-600 transition-colors"
            >
              {post.author.username} · {post.time}
            </p>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="p-2 hover:bg-gray-50 rounded-full transition"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  setReportmodal(!reportmodal);
                  console.log("Report clicked");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Images - Thumbnail */}
      {hasImages && (
        <div
          className={`w-full bg-white overflow-hidden p-4 relative transition 
      ${!isUnderReview ? "cursor-pointer hover:opacity-90" : "cursor-not-allowed"}
    `}
          onClick={() => {
            if (!isUnderReview) {
              setActiveMedia(post); // ✅ CHANGE: Pass entire post object, not just URL
              setImageViewerOpen(true);
            }
          }}
        >
          {/* Image */}
          {firstMediaIsVideo ? (
            <video
              src={firstMedia}
              className={`w-full rounded-2xl max-h-96 object-cover
    ${isUnderReview ? "blur-sm" : ""}`}
              muted
              controls
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={firstMedia}
              alt="post"
              className={`w-full h-auto rounded-2xl object-cover max-h-96
    ${isUnderReview ? "blur-sm" : ""}`}
            />
          )}

          {/* Image count badge */}
          {post.postimage.length > 1 && !isUnderReview && (
            <div className="absolute top-[30px] right-[30px] bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
              +{post.postimage.length}
            </div>
          )}

          {/* 🔒 Under Review Overlay */}
          {isUnderReview && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center 
                bg-black/40 backdrop-blur-md rounded-2xl"
            >
              <img
                src={PostUnderReview}
                className="w-[150px]"
                alt="postUnderreview"
              />
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-orange-100">
                <AlertTriangle className="w-4 h-4" />
                <span>Post is under review</span>
              </div>
            </div>
          )}
        </div>
      )}
      {post.sharedBy ? (
        <div className="text-sm flex gap-4 ml-4 justify-center items-center bg-slate-200 rounded-3xl text-center p-2 w-[14em]">
          {post.sharedBy?.profilePicture ? (
            <img
              src={post.sharedBy.profilePicture}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 object-cover text-[10px] bg-purple-800 text-white flex justify-center items-center rounded-full capitalize">
              {post.sharedBy?.name.split(" ")[0][0]}
            </div>
          )}
          {/* <img
            src={post.sharedBy.profilePicture}
            className="w-7 h-7 rounded-full object-cover"
          /> */}
          {post.sharedBy.name} Reposted
        </div>
      ) : null}
      {post?.page?.pageType == "private" && (
        <div className="flex items-center h-full top-14 absolute inset-1 justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center px-6">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <p
              onClick={() => {
                setIsPrivatePost(!isPrivatePost);
              }}
              className="text-base cursor-pointer  font-semibold text-orange-500"
            >
              Private post
            </p>
          </div>
        </div>
      )}
      {/* Content */}
      {/* <div className="px-4 py-3">
        {!isUnderReview ? (
          <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
        ) : (
          <div className="items-center gap-2 text-sm text-orange-600 p-10">
            <div className="flex justify-center">
              <IoWarning size={70} />
            </div>
            <div className="flex justify-center mt-3">
              <p className="leading-relaxed w-[11em] text-center p-1 rounded-full bg-orange-600 text-white">
                Post Under Review
              </p>
            </div>
          </div>
        )}
      </div> */}

      {/* Stats - Action Bar */}
      {!isUnderReview ||
        (post?.page?.pageType == "private" && (
          <div className="px-4 py-3 absolute bottom-0 border-t border-gray-100 flex items-center gap-6">
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
            >
              <Heart
                className={`w-5 h-5 transition ${
                  localLikeState.isLiked
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  localLikeState.isLiked ? "text-orange-500" : "text-gray-600"
                }`}
              >
                {Number(localLikeState.likesCount ?? 0)}
              </span>
            </button>

            <button
              onClick={() => setCommentsOpen(!commentsOpen)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.stats.comments}</span>
            </button>

            <button
              onClick={() => setSharepost(true)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{post.stats.shares}</span>
            </button>
          </div>
        ))}

      {/* Image Viewer Modal */}
      <PostImageViewerModal
        post={activeMedia} // ✅ CHANGE: Pass activeMedia directly
        isOpen={imageViewerOpen}
        onClose={() => {
          setImageViewerOpen(false);
          setActiveMedia(null);
        }}
      />

      {/* Comments Section */}
      {commentsOpen && <CommentsSection postId={post.id} />}

      {/* Share Post Modal */}
      {sharepost && (
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
          onClose={setSelectedOption}
          post={{
            _id: post.id,
            page: post.page,
            media: post.postimage?.map((url) => ({ fileUrl: url })) || [],
            bodyText: post.text,
            author: post.author,
          }}
        />
      )}

      {selectedOption === "Share to your Story" && (
        <PostStoryModal post={post} onClose={setSelectedOption} />
      )}
      {selectedOption === "Share with Topic Page" && (
        <ShareRepostModal postId={post.id} onClose={setSelectedOption} />
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
              targetId: post.id,
              isReported: true,
            }),
          );
        }}
      />
      {isPrivatePost && (
        <PrivatePostModal
          post={post}
          onClose={() => setIsPrivatePost(!isPrivatePost)}
        />
      )}
    </div>
  );
}
