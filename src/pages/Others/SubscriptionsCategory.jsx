import { useEffect, useState } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";
import { nofound, notes, postone, topics } from "../../assets/export";
import Profilecard from "../../components/homepage/Profilecard";
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import SubscriptionStories from "../../components/global/SubscriptionStories";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  getCollectionFeed,
  getPageStories,
  viewOtherStories,
  getMySubsctiptions,
} from "../../redux/slices/Subscription.slice";
import CollectionFeedPostCard from "../../components/global/CollectionFeedPostCard";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { Link, useNavigate } from "react-router";
import ActiveStoryModal from "../../components/app/profile/ActiveStoryModal";
import axios from "../../axios";
import { IoChevronBackSharp } from "react-icons/io5";

export default function SubscriptionsCategory() {
  const [liked, setLiked] = useState({});
  const [activeTab, setActiveTab] = useState("my");
  const [selectedPageId, setSelectedPageId] = useState(null); // Selected page for filtering
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  console.log(CollectionFeeds, "CollectionFeeds");
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

  const subscriptions =
    activeTab === "my" ? mySubscriptions : savedSubscriptions;

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [open, setOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [pagesWithStories, setPagesWithStories] = useState(new Set());
  const { PageStories, mySubscriptions: reduxSubscriptions } = useSelector(
    (state) => state.subscriptions,
  );

  // Fetch collection name from mySubscriptions
  useEffect(() => {
    const fetchCollectionName = async () => {
      if (location.state?.id) {
        // First try from reduxSubscriptions
        if (reduxSubscriptions && Array.isArray(reduxSubscriptions)) {
          const collection = reduxSubscriptions.find(
            (col) => col._id === location.state.id,
          );
          if (collection) {
            setCollectionName(collection.name || "");
            return;
          }
        }

        // Fallback: fetch directly from API
        try {
          const res = await axios.get(`/collections/${location.state.id}`);
          console.log("Collection API Response:", res.data);
          if (res.data?.success && res.data?.data) {
            setCollectionName(res.data.data.name || "");
          } else if (res.data?.data?.name) {
            setCollectionName(res.data.data.name);
          } else if (res.data?.name) {
            setCollectionName(res.data.name);
          }
        } catch (error) {
          console.error("Failed to fetch collection name:", error);
          // Try alternative endpoint
          try {
            const altRes = await axios.get(`/collections/my`);
            if (altRes.data?.success && altRes.data?.data) {
              const collection = altRes.data.data.find(
                (col) => col._id === location.state.id,
              );
              if (collection) {
                setCollectionName(collection.name || "");
              }
            }
          } catch (altError) {
            console.error("Alternative fetch also failed:", altError);
          }
        }
      }
    };
    fetchCollectionName();
  }, [location.state?.id, reduxSubscriptions]);

  // Also fetch collections if not already loaded
  useEffect(() => {
    if (location.state?.id && !reduxSubscriptions) {
      dispatch(getMySubsctiptions({ page: 1, limit: 100 }));
    }
  }, [location.state?.id, reduxSubscriptions, dispatch]);

  console.log(collectionName, "collectionName");

  // Check stories for each page
  useEffect(() => {
    const checkStoriesForPages = async () => {
      if (!CollectionFeeds || CollectionFeeds.length === 0) return;

      const pageIds = new Set();
      CollectionFeeds.forEach((post) => {
        if (post?.page?._id) {
          pageIds.add(post.page._id);
        }
      });

      const storiesSet = new Set();
      await Promise.all(
        Array.from(pageIds).map(async (pageId) => {
          try {
            const result = await dispatch(
              getPageStories({ id: pageId }),
            ).unwrap();
            if (
              result?.data &&
              Array.isArray(result.data) &&
              result.data.length > 0
            ) {
              storiesSet.add(pageId);
            }
          } catch (error) {
            // Ignore errors for individual pages
          }
        }),
      );
      setPagesWithStories(storiesSet);
    };

    checkStoriesForPages();
  }, [CollectionFeeds, dispatch]);

  // Extract unique pages from CollectionFeeds
  const uniquePages = (() => {
    if (!CollectionFeeds || CollectionFeeds.length === 0) return [];
    const pageMap = new Map();
    CollectionFeeds.forEach((post) => {
      if (post?.page?._id && !pageMap.has(post.page._id)) {
        pageMap.set(post.page._id, {
          _id: post.page._id,
          name: post.page.name,
          image: post.page.image,
          user: post.page.user || post.page.author,
        });
      }
    });
    return Array.from(pageMap.values());
  })();

  // Filter posts based on selected page
  const filteredPosts = selectedPageId
    ? CollectionFeeds?.filter((post) => post?.page?._id === selectedPageId) ||
      []
    : CollectionFeeds || [];

  console.log(PageStories, "uniquePages");

  // Handle page click - check for stories or navigate
  const handlePageClick = async (pageId) => {
    try {
      // Fetch stories for this page
      const result = await dispatch(getPageStories({ id: pageId })).unwrap();

      // Check if stories exist (response structure: { data: [...stories], pagination: {...} })
      if (
        result?.data &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        // Open story modal
        setActiveStory(result.data);
        if (result.data[0]?._id) {
          await dispatch(viewOtherStories({ storyId: result.data[0]._id }));
        }
      } else {
        // Navigate to page detail
        navigate(`/trending-page-detail/${pageId}`);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      // On error, navigate to page detail
      navigate(`/trending-page-detail/${pageId}`);
    }
  };

  const handleViewStory = async (storyId) => {
    await dispatch(viewOtherStories({ storyId }));
  };

  console.log(CollectionFeeds?.[0], "collection-feeds");
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
                          className="cursor-pointer font-[400] text-[14px] hover:text-orange-600 transition-colors"
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
        {/* Pages List - Horizontal Scrollable */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 pl-3 pr-3 rounded-2xl">
          <div className="flex items-center">
            {/* Collection Name */}
            <IoChevronBackSharp
              color="white"
              size={24}
              className="cursor-pointer"
              onClick={() => navigate(-1)}
            />
            <div className="flex justify-center w-full">
              {collectionName && (
                <div className="mb-4">
                  <h2 className="text-[20px] text-white text-center pt-3">
                    {collectionName}
                  </h2>
                </div>
              )}
            </div>
          </div>
          {uniquePages.length > 0 && (
            <div className="mt-0 mb-0">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                {/* Individual Pages */}
                {uniquePages.map((page) => {
                  const hasStories = pagesWithStories.has(page._id);
                  return (
                    <button
                      key={page._id}
                      onClick={() => handlePageClick(page._id)}
                      className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-xl transition-all bg-transparent text-white hover:bg-orange-300 relative"
                    >
                      {/* Page Image with Glow Effect */}
                      <div
                        className={`relative ${hasStories ? "ring-4 ring-orange-300 ring-offset-2 ring-offset-orange-500 rounded-full" : ""}`}
                      >
                        <div
                          className={`w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md ${hasStories ? "shadow-yellow-200" : ""}`}
                        >
                          {page.image ? (
                            <img
                              src={page.image}
                              alt={page.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                              {page.name?.charAt(0)?.toUpperCase() || "P"}
                            </div>
                          )}
                        </div>
                        {/* Author Image at Bottom */}
                        {page.user?.profilePicture && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-white">
                            <img
                              src={page.user.profilePicture}
                              alt={page.user.name || page.user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center max-w-[80px] truncate">
                        {page.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          {filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
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
                text={post?.bodyText}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src={nofound}
                alt="No posts available"
                height={300}
                width={300}
                className="opacity-70"
              />
              <p className="font-bold pt-4 text-black">
                {selectedPageId
                  ? "No posts found for this page"
                  : "No posts available"}
              </p>
            </div>
          )}
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

      {/* Story Modal */}
      <ActiveStoryModal
        activeStory={activeStory}
        setActiveStory={setActiveStory}
        handleViewStory={handleViewStory}
      />
    </div>
  );
}
