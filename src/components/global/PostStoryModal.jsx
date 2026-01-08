import React, { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { createStory } from "../../redux/slices/posts.slice";
import domtoimage from "dom-to-image";
import StorySnippet from "./StorySnippet";
import { SuccessToast, ErrorToast } from "./Toaster";

const PostStoryModal = ({ onClose, post }) => {
  const [selectedPage, setSelectedPage] = useState(null); // Single page selection
  const [searchQuery, setSearchQuery] = useState("");
  const snippetRef = useRef(null);
  const [isPosting, setIsPosting] = useState(false);

  const dispatch = useDispatch();
  const { myPages } = useSelector((state) => state?.pages);

  useEffect(() => {
    dispatch(fetchMyPages({}));
  }, []);

  // Filter pages based on search
  const filteredPages = myPages?.filter((page) =>
    page.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePostStory = async () => {
    if (!selectedPage) {
      ErrorToast("Please select a topic page");
      return;
    }

    try {
      setIsPosting(true);
      
      // Wait for images to load
      const images = snippetRef.current?.querySelectorAll("img");
      if (images && images.length > 0) {
        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              if (!img.crossOrigin) {
                img.crossOrigin = "anonymous";
                const src = img.src;
                img.src = "";
                img.src = src;
              }
            });
          })
        );
      }

      // Convert post preview to image
      const blob = await domtoimage.toBlob(snippetRef.current, {
        quality: 0.95,
        bgcolor: "#ffffff",
        width: 360,
        height: 640,
      });

      if (!blob) throw new Error("Failed to create story image");

      const file = new File([blob], "story.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("pages[0]", selectedPage);
      formData.append("media", file);

      const result = await dispatch(createStory(formData)).unwrap();
      
      SuccessToast("Story posted successfully!");
      onClose("");
    } catch (err) {
      console.error("Story creation failed", err);
      ErrorToast(err || "Failed to post story");
    } finally {
      setIsPosting(false);
    }
  };

  // Format post data for StorySnippet
  const formatPostForSnippet = () => {
    if (!post) return null;
    
    return {
      user: post.author?.name || post.author?.username || "User",
      time: new Date(post.createdAt).toLocaleDateString(),
      text: post.bodyText || "",
      postimage: post.media?.map((m) => m.fileUrl) || [],
    };
  };

  const postSnippetData = formatPostForSnippet();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Select your topic page</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Post Preview */}
        {post && (
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Post Preview:</p>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={post.author?.profilePicture}
                  alt={post.author?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{post.author?.name}</p>
                  <p className="text-xs text-gray-500">@{post.author?.username}</p>
                </div>
              </div>
              {post.bodyText && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{post.bodyText}</p>
              )}
              {post.media && post.media.length > 0 && (
                <div className="rounded-lg overflow-hidden">
                  {post.media[0].type === "image" ? (
                    <img
                      src={post.media[0].fileUrl}
                      alt="Post"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : post.media[0].type === "video" ? (
                    <video
                      src={post.media[0].fileUrl}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search pages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Pages List with Radio Buttons */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
          {filteredPages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pages found</div>
          ) : (
            filteredPages.map((page) => (
              <div
                key={page._id}
                onClick={() => setSelectedPage(page._id)}
                className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={page.image || "https://via.placeholder.com/40"}
                    alt={page.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{page.name}</span>
                </div>

                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedPage === page._id
                    ? "border-orange-500"
                    : "border-gray-300"
                }`}>
                  {selectedPage === page._id && (
                    <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handlePostStory}
            disabled={!selectedPage || isPosting}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPosting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              "Post Now"
            )}
          </button>
        </div>
      </div>

      {/* Hidden story preview for image capture */}
      {postSnippetData && (
        <div className="absolute -left-[9999px] top-0">
          <StorySnippet ref={snippetRef} post={postSnippetData} />
        </div>
      )}
    </div>
  );
};

export default PostStoryModal;
