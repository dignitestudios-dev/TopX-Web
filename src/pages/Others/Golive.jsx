import React, { useEffect, useState } from "react";
import { Search, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchMyPages } from "../../redux/slices/pages.slice";
import { startStream } from "../../redux/slices/livestream.slice";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import ChatWidget from "../../components/global/ChatWidget";
import FloatingChatButton from "../../components/global/ChatWidget";
import { nofound } from "../../assets/export";

export default function Golive() {
  const [liked, setLiked] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingPageId, setLoadingPageId] = useState(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myPages } = useSelector((state) => state.pages);
  const { livestreamError } = useSelector(
    (state) => state.livestream
  );

  useEffect(() => {
    dispatch(fetchMyPages({ page: 1, limit: 10 }));
  }, [dispatch]);

  const filteredPages = myPages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = (postId) => {
    setLiked((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleGoLive = async (pageId) => {
    setLoadingPageId(pageId);
    try {
      const res = await dispatch(startStream(pageId));

      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast("Stream started successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/live-stream/${pageId}`, {
            state: { fromGoLive: true },
          });
          setLoadingPageId(null);
        }, 500);
      } else {
        ErrorToast(
          res.payload || livestreamError || "Failed to start stream"
        );
        setLoadingPageId(null);
      }
    } catch (error) {
      ErrorToast(error.message || "Failed to start stream");
      setLoadingPageId(null);
    }
  };

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar - 1/4 width */}
      <div className="w-1/4 !bg-[#F2F2F2] overflow-y-auto pt-3">
        {/* Profile Card */}
        <Profilecard smallcard={true} />

        {/* My Subscription */}
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Middle Feed - 1/2 width */}
      <div className="w-1/2 bg-[#F2F2F2] min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header + Search */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Select page to go live
            </h2>
            <div className="relative w-64">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
          </div>
          {/* Pages List */}
          <div className="space-y-3 mt-4">
            {filteredPages && filteredPages.length > 0 ? (
              filteredPages.map((page, i) => (
                <div
                  key={page._id || i}
                  className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={page.image || "https://blog.holosophic.org/wp-content/uploads/2018/05/Countries-page-image-placeholder-800x500.jpg"}
                      alt={page.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span
                      onClick={() =>
                        navigate(`/profile`, {
                          state: { id: page._id },
                        })
                      }
                      className="text-gray-800 cursor-pointer font-medium text-sm"
                    >
                      {page.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleGoLive(page._id)}
                    disabled={loadingPageId === page._id}
                    className="bg-orange-500 text-white text-sm px-4 py-2 rounded-md hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingPageId === page._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Starting...</span>
                      </>
                    ) : (
                      "Go live"
                    )}
                  </button>
                </div>
              ))
            ) : (
                <div className="text-gray-500 col-span-3 text-center py-10">
            <div className=" flex justify-center">
              <img src={nofound} height={300} width={300} alt="" />
            </div>
            <p className="font-bold pt-4 text-black">No Pages Found</p>
          </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - 1/4 width */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto border-gray-200">
        <div className="p-0">
          {/* Trending Pages Section */}
          <TrendingPagesGlobal />

          {/* Suggestions Section */}
          <SuggestionsPagesGlobal />

          {open && <ChatWidget />}
          <FloatingChatButton onClick={() => setOpen(!open)} />
        </div>
      </div>
    </div>
  );
}