import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import PostCard from "../../components/global/PostCard";
import { useSelector } from "react-redux";
import CollectionFeedPostCard from "../../components/global/CollectionFeedPostCard";

const SearchItem = () => {
  const [activeTab, setActiveTab] = useState("Pages");
  const { globalSearch } = useSelector((state) => state.globalSearch);
  const [liked, setLiked] = useState({});

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

  return (
    <div className="container max-w-6xl mx-auto p-5">
      {/* Tabs */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        {["Pages", "Keywords", "Post", "People"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${
              activeTab === tab
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pages.length > 0 ? (
              pages.map((page) => (
                <div
                  key={page._id}
                  className="border rounded-2xl border-gray-200 bg-white p-4"
                >
                  <img
                    src={page.image}
                    alt={page.name}
                    className="w-full h-40 object-cover rounded-xl mb-3"
                  />
                  <h3 className="font-semibold text-lg">{page.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{page.about}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    Followers: {page.followersCount}
                  </p>
                  <button className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm">
                    Subscribe
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-500">
                No pages found.
              </p>
            )}
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === "Keywords" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keywords.posts.length || keywords.pages.length ? (
              <>
                {keywords.posts.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="border p-3 rounded-lg bg-white text-sm"
                  >
                    {keyword}
                  </div>
                ))}
                {keywords.pages.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="border p-3 rounded-lg bg-white text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-500 col-span-full text-center">
                No keywords found.
              </p>
            )}
          </div>
        )}

        {/* Post Tab */}
        {activeTab === "Post" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {posts.length > 0 ? (
              posts?.map((post) => (
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
              ))
            ) : (
              <p className="text-center text-gray-500">No posts found.</p>
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
                  className="flex items-center justify-between border p-3 rounded-lg bg-white"
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
                      <p className="text-xs text-gray-500">
                        {person.bio || "No bio available"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-orange-500 cursor-pointer"
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItem;
