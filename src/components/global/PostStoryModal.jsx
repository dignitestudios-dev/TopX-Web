import React, { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { createStory } from "../../redux/slices/posts.slice";
import domtoimage from "dom-to-image";
import StorySnippet from "./StorySnippet";

const PostStoryModal = ({ onClose, post }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const snippetRef = useRef(null);

  const dispatch = useDispatch();
  const { myPages } = useSelector((state) => state?.pages);

  useEffect(() => {
    dispatch(fetchMyPages({}));
  }, []);

  const togglePage = (pageId) => {
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter((id) => id !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  const handlePostStory = async () => {
    try {
      // Wait for images to load before capturing
      const images = snippetRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Force reload with crossOrigin
            if (!img.crossOrigin) {
              img.crossOrigin = "anonymous";
              const src = img.src;
              img.src = "";
              img.src = src;
            }
          });
        })
      );

      // dom-to-image use karein
      const blob = await domtoimage.toBlob(snippetRef.current, {
        quality: 0.95,
        bgcolor: "#ffffff",
        width: 360,
        height: 640,
      });

      if (!blob) throw new Error("Failed to create story image");

      const file = new File([blob], "story.png", { type: "image/png" });

      const formData = new FormData();
      selectedPages.forEach((pageId, index) => {
        formData.append(`pages[${index}]`, pageId);
      });
      formData.append("media", file);

      dispatch(createStory(formData));
      onClose("");
    } catch (err) {
      console.error("Story creation failed", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-[17px] font-semibold">Post Story</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
          {myPages.map((page) => (
            <div
              key={page._id}
              onClick={() => togglePage(page._id)}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2"
            >
              <div className="flex items-center gap-3">
                <img src={page.image} className="w-10 h-10 rounded-full" />
                <span>{page.name}</span>
              </div>

              <span
                className={`w-5 h-5 border-2 rounded-md ${
                  selectedPages.includes(page._id)
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-300"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handlePostStory}
            disabled={!selectedPages.length}
            className="w-full bg-orange-600 text-white py-2.5 rounded-full font-medium disabled:opacity-50"
          >
            Post Now
          </button>
        </div>
      </div>

      {/* Hidden story preview for image capture */}
      <div className="absolute -left-[9999px] top-0">
        <StorySnippet ref={snippetRef} post={post} />
      </div>
    </div>
  );
};

export default PostStoryModal;
