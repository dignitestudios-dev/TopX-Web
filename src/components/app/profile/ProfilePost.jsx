import React, { useEffect, useState, useRef } from "react";
import { Plus, MoreVertical, Lightbulb, X, Heart, Share2, Filter, LucideSettings2 } from "lucide-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getPageDetail } from "../../../redux/slices/pages.slice";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import PagePosts from "./PagePosts";
import CommentFilterModal from "./CommentFilterModal";
import UploadPostStory from "./UploadPostStory";

import {
  getPageStories,
  LikeOtherStories,
  viewOtherStories,
} from "../../../redux/slices/Subscription.slice";
import { timeAgo } from "../../../lib/helpers";
import ActiveStoryModal from "./ActiveStoryModal";
import { useNavigate } from "react-router";
import { Lock } from "lucide-react";
import CollectionModal from "../../global/CollectionModal";
import { addPageToCollections, getMyCollections, removePageFromCollections } from "../../../redux/slices/collection.slice";
import ReportModal from "../../global/ReportModal";
import { sendReport, resetReportState } from "../../../redux/slices/reports.slice";
import { SuccessToast } from "../../global/Toaster";

export default function ProfilePost({ setIsProfilePostOpen, pageId }) {
  const [activeTab, setActiveTab] = useState("post");
  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [commentFilter, setCommentFilter] = useState("all");
  const [suggestPostModal, setSuggestPostModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  console.log(user, "userrrrrrrrrrrrrr");

  const dispatch = useDispatch();
  const { pageDetail, pageDetailLoading } = useSelector((state) => state.pages);
  const { PageStories, isLoading } = useSelector(
    (state) => state.subscriptions
  );
  const { reportLoading, reportSuccess } = useSelector((state) => state.reports);
  const page = pageDetail;
  const isPrivatePage = page?.pageType === "pr  ivate";
  const isRequestPending = page?.requestStatus === "pending";
  const isRequestAccepted = page?.requestStatus === "accepted";
  const shouldShowContent = !isPrivatePage || isSubscribed || isRequestAccepted;
  const isPageOwner = user?._id === page?.user?._id || user?._id === page?.user;

  // Fetch page details and stories on mount
  useEffect(() => {
    if (pageId) {
      dispatch(getPageStories({ id: pageId }));
      dispatch(getPageDetail(pageId));
    }
  }, [pageId, dispatch]);

  // Set subscription state from pageDetail
  useEffect(() => {
    if (pageDetail) {
      setIsSubscribed(!!pageDetail.isSubscribed);
    }
  }, [pageDetail]);

  // Handle report success
  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportModal(false);
    }
  }, [reportSuccess, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Subscribe click handler - open modal
  const handleSubscribeClick = () => {
    setSelectedPage({ _id: pageId });
    setOpenModal(true);
  };

  // Save to collection handler
  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(
      addPageToCollections({
        collections: selectedCollections,
        page: pageId,
      })
    ).then((res) => {
      if (!res.error) {
        setIsSubscribed(true);
        dispatch(getPageDetail(pageId));
        setOpenModal(false);
        dispatch(getMyCollections({ page: 1, limit: 100 }));
      }
    });
  };

  // Handle unsubscribe
  const handleUnsubscribe = () => {
    dispatch(
      removePageFromCollections({
        collections: page?.collections || [],
        page: pageId,
      })
    ).then((res) => {
      if (!res.error) {
        setIsSubscribed(false);
        dispatch(getPageDetail(pageId));
        dispatch(getMyCollections({ page: 1, limit: 100 }));
        setShowDropdown(false);
      }
    });
  };

  // Handle report submit
  const handleReportSubmit = (reason) => {
    dispatch(
      sendReport({
        reason,
        targetModel: "Page",
        targetId: pageId,
        isReported: true,
      })
    );
  };

  const handleViewStory = async (storyId) => {
    await dispatch(viewOtherStories({ storyId }));
  };

  // Early return if the page is loading or doesn't exist
  if (pageDetailLoading || !pageDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 font-semibold">
            Loading page details...
          </p>
        </div>
      </div>
    );
  }

  const maxLength = 70;

  console.log(pageDetail, "pageDetail")

  return (
    <div className="relative">
      <div >
        <div className="bg-white rounded-[15px] overflow-hidden">
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

                  {isPageOwner && (
                    <button className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md">
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

                {/* PAGE NAME + ABOUT */}
                <div className="mt-12">
                  <h1 className="text-[18px] font-[500] text-[#000000] mb-2">
                    {page?.name}
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">
                    {page?.about.substring(0, maxLength)}...
                  </p>
                  <div className="flex items-center gap-[70px] relative">
                    <span className="text-gray-600 font-medium text-sm">
                      {/* Add followers count if necessary */}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 mt-14">
                {/* Request Pending Button - Show when requestStatus is pending */}
                {isPrivatePage && isRequestPending && (
                  <button
                    disabled
                    className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-gray-200 text-gray-700 cursor-not-allowed border-2"
                  >
                    Request Pending
                  </button>
                )}

                {/* Subscribe Button - Only show when subscribed (to show UnSubscribe) */}
                {isSubscribed && (!isPrivatePage || (isPrivatePage && !isRequestPending)) && !isPageOwner && (
                  <button
                    // onClick={handleUnsubscribe}
                    className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 border-2"
                  >
                    Subscribed
                  </button>
                )}


                {/* Subscribe Button - Show when not subscribed */}
                {!isSubscribed && (!isPrivatePage || (isPrivatePage && !isRequestPending)) && (
                  <button
                    onClick={handleSubscribeClick}
                    className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 border-2"
                  >
                    Subscribe
                  </button>
                )}

                {/* Live Chat Button - Only show when subscribed */}
                {isSubscribed && (!isPrivatePage || isRequestAccepted) && (
                  <button
                    onClick={() => {
                      console.log("Button clicked, navigating with:", { pageId, pageName: pageDetail?.name });
                      navigate(`/live-chat`, { state: { pageId: pageId, pageName: pageDetail?.name } });
                    }}
                    className="border-[1px] p-2 px-8 flex gap-4 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-5"
                  >
                    {page?.liveChat ? "Join A Live Chat" : "Start A Live Chat"}
                  </button>
                )}

                {/* Suggest Post Button - Only show when subscribed */}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-[10px] mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">

                      {isSubscribed && !isRequestPending && (
                        <button
                          onClick={() => {
                            handleUnsubscribe();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          Unsubscribe Page
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setReportModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        Report
                      </button>

                      {isSubscribed && (
                        <button
                          onClick={() => setSuggestPostModal(true)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          Suggest Post
                        </button>
                      )}

                    </div>

                  )}
                </div>
              </div>
            </div>

            {/* KEYWORDS (Hashtags) */}
            <div className="flex flex-wrap gap-2 mb-3 mt-4">
              {page?.keywords?.map((keyword, idx) => (
                <span key={idx} className="text-gray-400 text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className={!shouldShowContent ? "blur-md pointer-events-none select-none" : "flex items-center justify-between border-b border-gray-200"} >
          <div className="flex gap-2">
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

            {/* Post Request Tab - Only show for page owner */}
            {isPageOwner && (
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
            )}
          </div>

          {/* Filter Icon - Show only for post tab when content is visible */}
          {activeTab === "post" && shouldShowContent && (
            <button
              onClick={() => setFilterModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              title="Filter Comments"
            >
              <LucideSettings2 className="w-5 h-5 text-gray-600" />

            </button>
          )}
        </div>

        {/* POSTS LIST */}
        <div className={!shouldShowContent ? "blur-md hidden pointer-events-none select-none" : "mr-[15em] mx-auto p-4 space-y-4"}>
          <PagePosts pageId={pageId} commentFilter={commentFilter} />
        </div>
      </div>

      {/* Story Modal */}
      <ActiveStoryModal
        PageStories={PageStories}
        activeStory={activeStory}
        setActiveStory={setActiveStory}
        handleViewStory={handleViewStory}
      />

      {/* Private Page Modal - Show on top of blurred content */}
      {isPrivatePage && !isSubscribed && !isRequestAccepted && (
        <div className="absolute inset-0 top-[30em] flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100">
              <Lock className="w-7 h-7 text-orange-600" />
            </div>
            {isRequestPending ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  Request Pending
                </h2>
                <p className="text-sm text-gray-500 text-center max-w-[220px]">
                  You have subscribe this page and request is pending
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900">
                  This Page is Private
                </h2>
                <p className="text-sm text-gray-500 text-center max-w-[220px]">
                  You don't have permission to view this content.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {openModal && (
        <CollectionModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          page={selectedPage}
          onSave={handleSaveToCollection}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        loading={reportLoading}
        onSubmit={handleReportSubmit}
      />

      {/* Comment Filter Modal */}
      <CommentFilterModal
        isOpen={filterModal}
        onClose={() => setFilterModal(false)}
        onApply={(filter) => setCommentFilter(filter)}
        selectedFilter={commentFilter}
      />

      {/* Suggest Post Modal */}
      <UploadPostStory
        isOpen={suggestPostModal}
        setIsOpen={setSuggestPostModal}
        setSelectedType={() => { }}
        title="Suggest Post"
        selectedPages={[pageId]}
      />
    </div>
  );
}