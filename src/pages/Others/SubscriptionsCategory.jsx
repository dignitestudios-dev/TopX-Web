import { useEffect, useState } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { notes, postone, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import SubscriptionStories from "../../components/global/SubscriptionStories";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getCollectionFeed } from "../../redux/slices/Subscription.slice";
import CollectionFeedPostCard from "../../components/global/CollectionFeedPostCard";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { Link, useNavigate } from "react-router";



export default function SubscriptionsCategory() {
  const [liked, setLiked] = useState({});
  const [activeTab, setActiveTab] = useState("my");
  const location = useLocation();
  const dispatch = useDispatch();
  const naigate = useNavigate();
  const { CollectionFeeds } = useSelector((state) => state.subscriptions);
  useEffect(() => {
    if (location.state && location.state.id) {
      // Fetch data based on the passed ID
      dispatch(getCollectionFeed({ id: location.state.id }));
      // You can dispatch an action here to fetch data if needed
    }
  }, [location.state]);


  const { myPages, pagesLoading } = useSelector((state) => state.pages);
  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 10 }));
  }, [dispatch]);


  console.log(CollectionFeeds, location.state.id, "list-collection-feed");
  const mySubscriptions = [
    { title: "My Basketball", pages: "50+" },
    { title: "My Fitness", pages: "50+" },
    { title: "My Cooking", pages: "50+" },
    { title: "My Makeup", pages: "50+" },
    { title: "My Opinions", pages: "50+" },
    { title: "My Politics", pages: "50+" },
  ];

  const savedSubscriptions = [
    { title: "Peter’s Basketball", pages: "50+" },
    { title: "Justin’s Fitness", pages: "50+" },
    { title: "Rose’s Cooking", pages: "50+" },
    { title: "Sophie’s Makeup", pages: "50+" },
    { title: "Olivia’s Opinions", pages: "50+" },
    { title: "Adam’s Politics", pages: "50+" },
  ];

  const posts = [
    {
      id: "post1",
      user: "Mike’s Basketball",
      username: "@mikesmith35",
      time: "5mins ago",
      tag: "Cars: Ferrari",
      gradient: "from-pink-500 via-orange-500 to-yellow-500",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      stats: { likes: "10,403", comments: "500", shares: "105" },
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      postimage: postone,
    },
    {
      id: "post2",
      user: "Peter’s Basketball",
      username: "@petersmith35",
      time: "5mins ago",
      gradient: "from-blue-600 to-blue-400",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      stats: { likes: "8,205", comments: "420", shares: "67" },
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "post3",
      user: "Mike’s Basketball",
      username: "@mikesmith35",
      time: "5mins ago",
      tag: "Cars: Ferrari",
      gradient: "from-pink-500 via-orange-500 to-yellow-500",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      stats: { likes: "10,403", comments: "500", shares: "105" },
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      postimage: postone,
    },
  ];

  const subscriptions =
    activeTab === "my" ? mySubscriptions : savedSubscriptions;

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [open, setOpen] = useState(false);

  const trending = [
    {
      title: "Justin’s Basketball",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
      title: "Justin’s Basketball",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
  ];
  console.log(CollectionFeeds?.[0], "collection-feeds")
  return (
    <div className="flex h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide">
        {/* Profile Card */}

        <Profilecard smallcard={true} />

       
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

      {/* Middle Feed - 1/2 width */}
      <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto px-3 py-4 scrollbar-hide">
        <SubscriptionStories pageId={location.state.id || null} />

        <div className="mt-6">
          {CollectionFeeds?.map((post) => (
            <CollectionFeedPostCard
              key={post.id}
              post={post?.media}
              author={post?.author}
              likedCount={post?.likesCount}
              commentCount={post?.commentsCount}
              shareCount={post?.sharesCount}
              toggleLike={toggleLike}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide  border-gray-200">
        <div className="p-0">
          {/* Trending Pages Section */}
          <TrendingPagesGlobal />

          {/* Suggestions Section */}
          <SuggestionsPagesGlobal />


          {open && <ChatWidget />} {/* Your actual chat panel */}
          <FloatingChatButton onClick={() => setOpen(!open)} />
        </div>
      </div>
    </div>
  );
}
