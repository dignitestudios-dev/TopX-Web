import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Link, TrendingUp } from "lucide-react";
import { nofound, notes, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import PostCard from "../../components/global/PostCard";
import { getMyPosts } from "../../redux/slices/posts.slice";
import { useDispatch, useSelector } from "react-redux";
import SkeletonPost from "../../components/global/SkeletonPost";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import { useNavigate } from "react-router";
import useViewerLocation from "../../hooks/useViewerLocation";

export default function Mypost() {
  useViewerLocation();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { postsLoading, posts, pagination } = useSelector(
    (state) => state.posts,
  );

  const { myPages, pagesLoading } = useSelector((state) => state.pages);
  const { user } = useSelector((state) => state.auth);

  const [allPosts, setAllPosts] = useState([]);
  const feedRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 100 }));
  }, [dispatch]);
  // API call
  useEffect(() => {
    dispatch(getMyPosts({ page, limit }));
  }, [dispatch, page]);

  console.log(posts, "allposts");

  // Append pages so user sees "all posts"
  useEffect(() => {
    if (!Array.isArray(posts)) return;

    setAllPosts((prev) => {
      if (page === 1) return posts;

      const existingIds = new Set(prev.map((p) => p?._id));
      const next = posts.filter((p) => p?._id && !existingIds.has(p._id));
      return [...prev, ...next];
    });
  }, [posts, page]);

  const handleFeedScroll = () => {
    const el = feedRef.current;
    if (!el) return;
    if (postsLoading) return;
    const canLoadMore =
      pagination?.hasNextPage === true ||
      (typeof pagination?.currentPage === "number" &&
        typeof pagination?.totalPages === "number" &&
        pagination.currentPage < pagination.totalPages);

    if (!canLoadMore) return;

    // Load next page when close to bottom
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setPage((p) => p + 1);
    }
  };

  // API -> UI mapping
  const mapApiPostToUiPost = (p) => {
    const firstMedia = p.media && p.media.length > 0 ? p.media : [];

    let postImages = [];
    let videoUrl = null;

    firstMedia.forEach((media) => {
      if (media.type === "image") {
        postImages.push(media.fileUrl);
      } else if (media.type === "video") {
        videoUrl = media.fileUrl;
      }
    });

    return {
      _id: p._id, // ✅ Important: use _id for Redux
      id: p._id, // Also keep id for backward compatibility
      user: p.page?.name || p.author?.name || "",
      username: p.author?.username ? `@${p.author.username}` : "",
      isElevated: Boolean(p.isElevated),
      elevationType: p.elevationType || null,
      author: p.author
        ? {
            name: p.author.name,
            username: p.author.username,
            profilePicture: p.author.profilePicture,
          }
        : null,
      avatar: p.author?.profilePicture,
      time: new Date(p.createdAt).toLocaleString(),
      postImages,
      videoUrl,
      tag: p.page?.topic || "",
      gradient: "from-orange-400 to-orange-600",
      text: p.bodyText,
      media: p?.media,
      sharedBy: p.sharedBy
        ? {
            username: p.sharedBy.username,
            name: p.sharedBy.name,
            profilePicture: p.sharedBy.profilePicture,
          }
        : null,
      stats: {
        likes: p.likesCount,
        comments: p.commentsCount,
        shares: p.sharesCount,
      },
      page: p?.page,
      isLiked: p.isLiked,
      isBoosted: Boolean(p.isBoosted || p.boostId || p.boost),
      boostId: p.boostId || p.boost?._id || null,
      boost: p.boost || null,
    };
  };

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="flex h-screen max-w-7xl mx-auto overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide">
        <Profilecard smallcard={true} />
        <div className="pt-4">
          <MySubscription />
        </div>

        {/* Topic Pages */}
        <div className="px-4 py-4 bg-white rounded-xl mt-4 border border-gray-200 mb-4">
          <h3 className="font-[500] text-lg mb-4 flex items-center gap-2">
            <TbNotes className="w-5 h-5 text-orange-500" />
            Topic Pages
          </h3>
          <div className="space-y-4">
            {pagesLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="pb-4 border-b border-gray-200 last:border-0 animate-pulse"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 bg-gray-300 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>

                  {/* About */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-4/5 bg-gray-200 rounded" />
                  </div>

                  {/* Followers */}
                  <div className="h-3 w-24 bg-gray-300 rounded mt-3" />
                </div>
              ))
            ) : myPages?.length > 0 ? (
              myPages.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={item?.image}
                        className="w-full h-full object-cover rounded-full"
                        alt=""
                      />
                    </div>

                    <div className="flex gap-2 items-center min-w-0 flex-1">
                      <p
                        onClick={() =>
                          navigate(`/profile`, { state: { id: item._id } })
                        }
                        className="cursor-pointer font-[400] text-[14px] truncate"
                        title={
                          user?.name || user?.username
                            ? `${user?.name || user?.username}'s ${item?.name}`
                            : item?.name
                        }
                      >
                        {user?.name || user?.username
                          ? `${user?.name || user?.username}'s ${item?.name}`
                          : item?.name}
                      </p>
                      <img src={notes} alt="" className="shrink-0" />
                    </div>
                  </div>

                  <p className="text-[14px] text-gray-600 leading-snug break-words">
                    {item?.about}
                  </p>

                  <p className="text-[14px] text-gray-700 mt-1">
                    <span className="text-black font-[600]">
                      {item?.followersCount}+
                    </span>{" "}
                    Follows
                  </p>
                </div>
              ))
            ) : (
              /* 🔴 NOT FOUND STATE */
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm font-medium">No topic pages found</p>
                <p className="text-xs mt-1">
                  Try searching or create a new page
                </p>
              </div>
            )}
          </div>

          <Link to="/profile">
            <div className="flex items-center gap-2 mt-4 text-black cursor-pointer font-semibold text-sm">
              View All
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Middle Feed */}
      <div
        ref={feedRef}
        onScroll={handleFeedScroll}
        className="w-1/2 overflow-y-auto px-3 py-4 scrollbar-hide"
      >
        <h1 className="text-2xl font-semibold pb-0 pl-1">
          Your Personal Post Archive
        </h1>
        <p className="text-sm pl-2 pr-2 pb-4 text-slate-700">
          Here you can find all the posts you've ever made across all your topic
          pages.Easily browse, edit, or delete your past posts in one place.
          Stay organized and keep track of your contributions!
        </p>

        {postsLoading && allPosts.length === 0 ? (
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        ) : (
          <>
            {Array.isArray(allPosts) && allPosts.length > 0 ? (
              allPosts.map((p) => {
                const mappedPost = mapApiPostToUiPost(p);
                return (
                  <div key={mappedPost._id} className="mb-4">
                    <PostCard post={mappedPost} activeTab="feed" />
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm pl-1 border-2 flex justify-center rounded-3xl">
                <img src={nofound} alt="" />
              </p>
            )}
          </>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto overflow-x-hidden border-gray-200 scrollbar-hide">
        <div className="p-0">
          {/* Trending Pages */}
          <TrendingPagesGlobal />

          {/* Suggestions */}
          {/* Suggestions Section */}
          <SuggestionsPagesGlobal />
        </div>
      </div>
    </div>
  );
}
