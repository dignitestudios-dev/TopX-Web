import { useEffect, useState } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { nofound, notes, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchpostfeed } from "../../redux/slices/postfeed.slice";
import PostSkeleton from "../../components/global/PostSkeleton";
import HomePostFeed from "../../components/global/HomePostFeed";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import { fetchMyPages } from "../../redux/slices/pages.slice";

export default function Home() {
  const [liked, setLiked] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allfeedposts, postsLoading } = useSelector(
    (state) => state.postsfeed,
  );
  const { myPages, pagesLoading } = useSelector((state) => state.pages);
  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 10 }));
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchpostfeed({ page: 1, limit: 10 }));
  }, [dispatch]);

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggling like based on the postId
    }));
  };

  const [activeIndexes, setActiveIndexes] = useState([]);

  const handleClick = (index) => {
    setActiveIndexes((prevActiveIndexes) => {
      if (prevActiveIndexes.includes(index)) {
        return prevActiveIndexes.filter((i) => i !== index);
      } else {
        return [...prevActiveIndexes, index];
      }
    });
  };

  // Function to convert time to human-readable "X time ago"
  const timeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);

    if (days > 0) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else {
      return "Just now";
    }
  };

  // Get localStorage likes for merge
  const storedLikes = JSON.parse(localStorage.getItem("postLikes") || "{}");

  const transformedPosts = Array.isArray(allfeedposts)
    ? allfeedposts.map((post) => {
        const local = storedLikes[post._id]; // merge saved likes
        return {
          id: post._id,
          user: post.page?.name || post.author?.name || "Unknown User",
          username: `@${
            post.page?.user?.username || post.author?.username || "user"
          }`,
          time: timeAgo(post.createdAt), // Use the new timeAgo function here
          tag: post.page?.topic || "",
          gradient: "from-pink-500 via-orange-500 to-yellow-500",
          text: post.bodyText || "No description available",
          // 🔥 STATS FOR DISPLAY
          stats: {
            likes: (local?.likesCount ?? post.likesCount ?? 0).toString(),
            comments: (post.commentsCount ?? 0).toString(),
            shares: (post.sharesCount ?? 0).toString(),
          },
          // 🔥 NORMALIZED KEYS (UI + optimistic updates)
          isLiked: local?.isLiked ?? post.isLiked ?? false,
          likesCount: local?.likesCount ?? post.likesCount ?? 0,
          avatar:
            post.page?.user?.profilePicture ||
            post.author?.profilePicture ||
            "https://randomuser.me/api/portraits/men/1.jpg",
          postimage: post.media?.map((m) => m.fileUrl) || [],
          media: post.media || [],
          author: post.author || null,
          page: post.page || null,
          isAllowedByAdmin: post?.isAllowedByAdmin,
          // ✅ pass reported flag to HomePostFeed
          isReported: post?.isReported,
          sharedBy: post?.sharedBy,
        };
      })
    : [];

  console.log(allfeedposts, "allfeedposts");

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
            {pagesLoading
              ? Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="pb-4 border-b border-gray-200 last:border-0 animate-pulse"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Avatar */}
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
              : myPages?.slice(0, 3).map((item, idx) => (
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

                      <div className="flex gap-2 items-center">
                        <p
                          onClick={() =>
                            navigate(`/profile`, {
                              state: { id: item._id },
                            })
                          }
                          className="cursor-pointer font-[400] text-[14px]"
                        >
                          {item?.name}
                        </p>
                        <img src={notes} alt="" />
                      </div>
                    </div>

                    <p className="text-[14px] text-gray-600 leading-snug">
                      {item?.about}
                    </p>

                    <p className="text-[14px] text-gray-700 mt-1">
                      <span className="text-black font-[600]">
                        {item?.followersCount}+
                      </span>{" "}
                      Follows
                    </p>
                  </div>
                ))}
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
      <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto px-3 py-4 scrollbar-hide">
        {postsLoading ? (
          // Show skeleton loaders while loading
          <div>
            {[1, 2, 3, 4, 5].map((item) => (
              <PostSkeleton key={item} />
            ))}
          </div>
        ) : transformedPosts.length > 0 ? (
          // Show actual posts when loaded
          transformedPosts.map((post) => (
            <HomePostFeed
              key={post.id}
              post={post} // ✅ normalized keys: post.isLiked + post.likesCount
              liked={liked} // optional, can remove if you rely only on post.isLiked
              toggleLike={toggleLike} // optional, can remove if you rely on handleLikeClick inside component
            />
          ))
        ) : (
          // Show empty state
          <div className="pl-3 pr-3 text-center">
            <p className="text-gray-500 text-sm pl-1 flex justify-center rounded-3xl">
              <img src={nofound} height={300} width={300} alt="" />
            </p>
            <p className="font-bold pt-4">Nothing in Home Feed.</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto border-gray-200 scrollbar-hide">
        <div className="p-0">
          {/* Trending Pages Section */}
          <TrendingPagesGlobal />

          {/* Suggestions Section */}
          <SuggestionsPagesGlobal />
        </div>
      </div>
    </div>
  );
}
