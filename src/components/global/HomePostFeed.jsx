import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import PostImageViewerModal from "./PostDetailModal";
import CommentsSection from "./CommentsSection";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../redux/slices/postfeed.slice";
import { useNavigate } from "react-router";
import { PostUnderReview } from "../../assets/export";
import ReportModal from "./ReportModal";
import { resetReportState, sendReport } from "../../redux/slices/reports.slice";
import { SuccessToast } from "./Toaster";
import SharePostModal from "./SharePostModal";
import ShareToChatsModal from "./ShareToChatsModal";
import PostStoryModal from "./PostStoryModal";
import ShareRepostModal from "./ShareRepostModal";

export default function HomePostFeed({ post, liked, toggleLike }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isVideo = (url) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const [activeMedia, setActiveMedia] = useState(null);
  console.log("postpostpostpostpost", post)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLiked = liked[post.id];
  const hasImages = Array.isArray(post.postimage) && post.postimage.length > 0;
  const firstMedia = hasImages ? post.postimage[0] : null;
  const firstMediaIsVideo = firstMedia ? isVideo(firstMedia) : false;

  const [reportmodal, setReportmodal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [sharepost, setSharepost] = useState(false);
  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );
  const { user: authUser } = useSelector((state) => state.auth);

  const handleLikeClick = async (
    postId,
    currentLikeStatus,
    currentLikesCount,
  ) => {
    const newLikeStatus = !currentLikeStatus;
    const newLikesCount = newLikeStatus
      ? (currentLikesCount ?? 0) + 1
      : Math.max((currentLikesCount ?? 0) - 1, 0);

    const likes = JSON.parse(localStorage.getItem("postLikes") || "{}");
    likes[postId] = { isLiked: newLikeStatus, likesCount: newLikesCount };
    localStorage.setItem("postLikes", JSON.stringify(likes));
    toggleLike(postId, newLikeStatus, newLikesCount);
    await dispatch(likePost({ postId, likeToggle: newLikeStatus }));
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
    <div className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-amber-800 text-white flex justify-center items-center rounded-full capitalize">
              {post.user.split(" ")[0][0] + post.user.split(" ")[1][0]}
            </div>
            <img
              src={post.author.profilePicture}
              alt={post.user}
              className="w-5 h-5 absolute -right-1 -bottom-0 rounded-full object-cover"
            />
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
      ${post.isAllowedByAdmin
              ? "cursor-pointer hover:opacity-90"
              : "cursor-not-allowed"
            }
    `}
          onClick={() => {
            if (post.isAllowedByAdmin) {
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
    ${!post?.isAllowedByAdmin ? "blur-sm" : ""}`}
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
    ${!post?.isAllowedByAdmin ? "blur-sm" : ""}`}
            />
          )}

          {/* Image count badge */}
          {post.postimage.length > 1 && post.isAllowedByAdmin && (
            <div className="absolute top-[30px] right-[30px] bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
              +{post.postimage.length}
            </div>
          )}

          {/* 🔒 Under Review Overlay */}
          {!post.isAllowedByAdmin && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center 
                bg-black/40 backdrop-blur-md rounded-2xl"
            >
              <img
                src={PostUnderReview}
                className="w-[150px]"
                alt="postUnderreview"
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        {/* {post.isAllowedByAdmin ? ( */}
        <p className="text-sm text-gray-700 leading-relaxed">{post.text}</p>
        {/* ) : ( */}
        {/* <p className="text-sm text-gray-400 italic">
            This post is currently under review.
          </p>
        )} */}
      </div>

      {/* Stats - Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
        <button
          type="button" // 👈 YE ADD KARO
          onClick={() =>
            handleLikeClick(post.id, post.isLiked, post.likesCount)
          }
          className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${post.isLiked ? "fill-orange-500 text-orange-500" : "text-gray-600"
              }`}
          />
          <span
            className={`text-sm font-medium ${post.isLiked ? "text-orange-500" : "text-gray-600"
              }`}
          >
            {Number(post.likesCount ?? 0)}
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
          <ShareToChatsModal onClose={setSelectedOption} />
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
    </div>
  );
}