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
import { fetchMyPages } from "../../redux/slices/pages.slice";

export default function Home() {
  const [liked, setLiked] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allfeedposts, postsLoading } = useSelector(
    (state) => state.postsfeed
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

  const trending = [
    {
      title: "Justin's Basketball",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
      title: "Justin's Basketball",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
  ];

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
          time: new Date(post.createdAt).toLocaleDateString(),
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
          author: post.author || null,
        };
      })
    : [];

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
          <div className="pl-3 pr-3">
            <p className="text-gray-500 text-sm pl-1 border-2 flex justify-center rounded-3xl">
              <img src={nofound} alt="" />
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto border-gray-200 scrollbar-hide">
        <div className="p-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
            {/* Header */}
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-gray-900">Trending Pages</span>
            </h3>

            {/* Trending List */}
            <div className="space-y-6">
              {trending.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={topics}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex gap-2">
                        <p className="font-[400] text-[14px]"> {item.title}</p>
                        <img src={notes} alt="" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 leading-snug">
                    {item.desc}
                  </p>

                  {/* Hashtags */}
                  <p className="text-xs text-gray-700 mb-3">
                    {item.hashtags.map((tag, i) => (
                      <span key={i} className="mr-1 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </p>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <img
                              src="https://randomuser.me/api/portraits/women/1.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/men/2.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/women/3.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        50+ Follows
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => handleClick(idx)}
                        className={`bg-orange-500 ${
                          activeIndexes.includes(idx)
                            ? "bg-slate-400"
                            : "hover:bg-orange-600"
                        } text-white px-16 py-1.5 rounded-[10px] text-sm font-semibold`}
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <Link to="/trending">
              <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
                <span>View All</span>
                <FaChevronRight color="orange" />
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
            {/* Header */}
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-gray-900">
                Suggestions based on your Interests/Activity
              </span>
            </h3>

            {/* Trending List */}
            <div className="space-y-6">
              {trending.map((item, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={topics}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex gap-2">
                        <p className="font-[400] text-[14px]"> {item.title}</p>
                        <img src={notes} alt="" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 leading-snug">
                    {item.desc}
                  </p>

                  {/* Hashtags */}
                  <p className="text-xs text-gray-700 mb-3">
                    {item.hashtags.map((tag, i) => (
                      <span key={i} className="mr-1 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </p>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <img
                              src="https://randomuser.me/api/portraits/women/1.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/men/2.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                            <img
                              src="https://randomuser.me/api/portraits/women/3.jpg"
                              alt=""
                              className="w-6 h-6 rounded-full border-2 border-white"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        50+ Follows
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => handleClick(idx)}
                        className={`bg-orange-500 ${
                          activeIndexes.includes(idx)
                            ? "bg-slate-400"
                            : "hover:bg-orange-600"
                        } text-white px-16 py-1.5 rounded-[10px] text-sm font-semibold`}
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
              <Link to="/profile">
                <span>View All</span>
              </Link>
              <FaChevronRight color="orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
