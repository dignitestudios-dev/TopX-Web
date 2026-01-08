import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import PostCard from "../../components/global/PostCard";
import { useDispatch, useSelector } from "react-redux";
import CollectionFeedPostCard from "../../components/global/CollectionFeedPostCard";
import { VscReport } from "react-icons/vsc";
import {
  addPageToCollections,
  removePageFromCollections,
} from "../../redux/slices/collection.slice";
import CollectionModal from "../../components/global/CollectionModal";
import { setApiTrigger } from "../../redux/slices/Global.Slice";
import { Link, useNavigate } from "react-router";

const SearchItem = () => {
  const [activeTab, setActiveTab] = useState("Pages");
  const { globalSearch } = useSelector((state) => state.globalSearch);
  const [liked, setLiked] = useState({});
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [unsubscribingPageId, setUnsubscribingPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();
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
  const handleSubscribeClick = (page) => {
    console.log(page, "page-record");
    setSelectedPage(page);
    setOpenModal(true);
  };
  const handleUnsubscribe = (page) => {
    setUnsubscribingPageId(page._id); // mark specific page as loading

    dispatch(
      removePageFromCollections({
        collections: page.collections || [],
        page: page._id,
      })
    ).then(() => {
      dispatch(setApiTrigger(true));
      setUnsubscribingPageId(null); // stop loader for that page only
    });
  };
  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(
      addPageToCollections({
        collections: selectedCollections,
        page: selectedPage._id,
      })
    ).then(() => {
      dispatch(setApiTrigger(true));
      setOpenModal(false);
    });
  };
  return (
    <div className="container max-w-6xl mx-auto p-5">
      {/* Tabs */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        {["For You", "Pages", "Keywords", "Post", "People"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${activeTab === tab
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
                  {page.isSubscribed ? (
                    <button
                      onClick={() => handleUnsubscribe(page)}
                      disabled={unsubscribingPageId === page._id}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                                                  ${unsubscribingPageId ===
                          page._id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {unsubscribingPageId === page._id ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></span>
                          Removing...
                        </span>
                      ) : (
                        "Unsubscribe"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribeClick(page)}
                      className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:from-[#d95d2f] hover:to-[#c6410a] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    >
                      Subscribe
                    </button>
                  )}
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
  className="text-orange-500 cursor-pointer"
  onClick={() =>
    navigate("/other-profile", {
      state: { id: person }, // ✅ correct
    })
  }
/>

                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users found.</p>
            )}
          </div>
        )}


        {/* For You Tab */}
        {activeTab === "For You" && (
          <div className="space-y-10">

            {/* Pages Section */}
            {pages.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Pages</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {pages.map((page) => (
                    <div
                      key={page._id}
                      className="border rounded-2xl border-gray-200 bg-white p-4"
                    >
                      <img
                        src={page.image}
                        alt={page.name}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                      <h3 className="font-semibold">{page.name}</h3>
                      <p className="text-sm text-gray-500">{page.about}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {posts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Posts</h2>
                <div className="space-y-6 max-w-2xl mx-auto">
                  {posts.map((post) => (
                    <CollectionFeedPostCard
                      key={post._id}
                      isPostId={post._id}
                      post={post.media}
                      fullPost={post}
                      author={post.author}
                      likedCount={post.likesCount}
                      commentCount={post.commentsCount}
                      shareCount={post.sharesCount}
                      toggleLike={toggleLike}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* People Section */}
            {people.length > 0 && (
              <div>
                <div className="space-y-4 max-w-2xl mx-auto">
                  {people.map((person) => (
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
  className="text-orange-500 cursor-pointer"
  onClick={() =>
    navigate("/other-profile", {
      state: { id: person }, // ✅ correct
    })
  }
/>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords Section */}
            {(keywords.posts.length > 0 || keywords.pages.length > 0) && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Keywords</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...keywords.posts, ...keywords.pages].map((keyword, idx) => (
                    <div
                      key={idx}
                      className="border p-3 rounded-lg bg-white text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {pages.length === 0 &&
              posts.length === 0 &&
              people.length === 0 &&
              keywords.posts.length === 0 &&
              keywords.pages.length === 0 && (
                <p className="text-center text-gray-500">
                  No results found.
                </p>
              )}
          </div>
        )}


        {openModal && (
          <CollectionModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            page={selectedPage}
            onSave={handleSaveToCollection}
          />
        )}
      </div>
    </div>
  );
};

export default SearchItem;
