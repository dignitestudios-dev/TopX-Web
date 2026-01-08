import React, { useEffect, useState } from "react";
import { Plus, MoreVertical, Lightbulb, X, Heart, Share2 } from "lucide-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getPageDetail } from "../../../redux/slices/pages.slice";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import Button from "../../common/Button";
import PagePosts from "./PagePosts";
import {
  getPageStories,
  LikeOtherStories,
  viewOtherStories,
} from "../../../redux/slices/Subscription.slice";
import { timeAgo } from "../../../lib/helpers";
import ActiveStoryModal from "./ActiveStoryModal";
import { useNavigate } from "react-router";

export default function ProfilePost({ setIsProfilePostOpen, pageId }) {
  // ✅ ALL hooks at top
  const [activeTab, setActiveTab] = useState("post");
  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { pageDetail, pageDetailLoading } = useSelector((state) => state.pages);
  const { PageStories, isLoading } = useSelector(
    (state) => state.subscriptions
  );
  console.log(PageStories, "stories");

  // ✅ useEffect #1
  useEffect(() => {
    if (pageId) {
      dispatch(getPageStories({ id: pageId }));
      dispatch(getPageDetail(pageId));
    }
  }, [pageId]);

  const handleViewStory = async (storyId) => {
    await dispatch(viewOtherStories({ storyId }));
  };
  // ✅ NOW early return (SAFE)
  if (pageDetailLoading || !pageDetail) {
    return (
      <div className="p-5 text-center font-semibold text-gray-500">
        Loading page details...
      </div>
    );
  }

  const page = pageDetail;
  const user = page?.user;


  return (
    <div className="">
      <div className="">
        <div className="bg-white rounded-[15px] overflow-hidden ">
          {/* HEADER */}
          <div className="h-28 bg-gradient-to-l from-[#DE4B12] to-[#E56F41] p-2">
            <div
              onClick={() => setIsProfilePostOpen(false)}
              className="flex items-center justify-center bg-white w-[30px] h-[30px] rounded-full cursor-pointer"
            >
              <IoChevronBackOutline className="w-4 h-4 text-[#DE4B12]" />
            </div>
          </div>

          {/* PROFILE SECTION */}
          <div className="px-4 pb-6">
            <div className="flex items-start justify-between -mt-12">
              {/* IMAGE + NAME */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    onClick={() => {
                      setActiveStory(PageStories);
                      handleViewStory(PageStories[0]?._id);
                    }}
                    className="w-[135px] cursor-pointer h-[135px] rounded-full p-[4px] bg-gradient-to-r from-[#fd8d1c] to-[#ffd906]"
                  >
                    <img
                      src={page?.image}
                      alt="Page"
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>

                  <button className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md">
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* PAGE NAME + FOLLOWERS */}
                <div className="mt-12">
                  <h1 className="text-[18px] font-[500] text-[#000000] mb-2">
                    {page?.name}
                  </h1>

                  <div className="flex items-center gap-[70px] relative">
                    <div className="flex items-center">
                      {/* Followers Avatars (using user profile only as sample) */}
                      <img
                        src={user?.profilePicture}
                        alt=""
                        className="w-[24px] h-[24px] rounded-full absolute top-0 left-0"
                      />
                      <img
                        src={user?.profilePicture}
                        alt=""
                        className="w-[24px] h-[24px] rounded-full absolute top-0 left-5"
                      />
                      <img
                        src={user?.profilePicture}
                        alt=""
                        className="w-[24px] h-[24px] rounded-full absolute top-0 left-10"
                      />
                    </div>

                    <span className="text-gray-600 font-medium text-sm">
                      <span className="text-[#000000]">
                        {page?.followersCount}+
                      </span>{" "}
                      Follows
                    </span>
                  </div>
                </div>
              </div>



              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 mt-14">
                <button
                  onClick={() => {
                    console.log("Button clicked, navigating with:", { pageId, pageName: pageDetail?.name });
                    navigate(`/live-chat`, { state: { pageId: pageId, pageName: pageDetail?.name } });
                  }}
                  className=" p-2 px-4 flex gap-4 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-5"
                >
                  {page?.liveChat ? "Join A Live Chat" : "Start A Live Chat"}
                </button>

                <button className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* KEYWORDS (Hashtags) */}
            <div className="flex flex-wrap gap-2 mb-3">
              {page?.keywords?.map((keyword, idx) => (
                <span key={idx} className="text-gray-400 text-sm">
                  #{keyword}
                </span>
              ))}
            </div>

            {/* DESCRIPTION */}
            <div className="flex items-start justify-between gap-4">
              <p className="text-gray-500 text-sm leading-relaxed flex-1">
                {page?.about}
              </p>

              {activeTab === "post" && (
                <Button
                  className="px-5 flex items-center justify-center"
                  variant="orange"
                  size="md"
                >
                  Create Post
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("post")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${activeTab === "post"
                ? "text-orange-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <BsFileEarmarkTextFill size={19} />
            <span className="text-[14px] font-[500]">Post</span>
            {activeTab === "post" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("postrequest")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${activeTab === "postrequest"
                ? "text-orange-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <div
              className={`p-1.5 rounded ${activeTab === "postrequest" ? "bg-orange-600" : "bg-gray-400"
                }`}
            >
              <Lightbulb className="text-white" size={16} />
            </div>
            <span className="text-[13px] font-[500]">Post Request</span>
            {activeTab === "postrequest" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
            )}
          </button>
        </div>

        {/* POSTS LIST (STATIC FOR NOW) */}
        <div className="mr-[15em] mx-auto p-4 space-y-4">
          {/* You can replace with real post API later */}
          <PagePosts pageId={pageId} />
        </div>
      </div>
      {/* Story Modal - Full Screen Mobile Optimized */}
      <ActiveStoryModal
        PageStories={PageStories}
        activeStory={activeStory}
        setActiveStory={setActiveStory}
        handleViewStory={handleViewStory}
      />
    </div>
  );
}
