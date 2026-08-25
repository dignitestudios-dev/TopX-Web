import React, { useEffect, useState, useCallback, useRef } from "react";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPageById,
  fetchPagePosts,
} from "../../redux/slices/trending.slice";
import {
  Lock,
  MessageCircleWarning,
  MessageSquareText,
  MoreHorizontal,
  UserCheck,
  SlidersHorizontal,
} from "lucide-react";
import CollectionModal from "../../components/global/CollectionModal";
import UnsubscribeModal from "../../components/global/UnsubscribeModal";
import FollowRequestsModal from "../../components/app/profile/FollowRequestsModal";
import CommentFilterModal from "../../components/app/profile/CommentFilterModal";
import Avatar from "../../components/common/Avatar";
import {
  addPageToCollections,
  removePageFromCollections,
} from "../../redux/slices/collection.slice";
import { getMyCollections } from "../../redux/slices/collection.slice";

import {
  fetchTrendingPages,
  fetchRecommendedPages,
} from "../../redux/slices/trending.slice";
import ReportModal from "../../components/global/ReportModal";
import { sendReport, resetReportState } from "../../redux/slices/reports.slice";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import { FaArrowLeft } from "react-icons/fa6";
import PagePostsComponent from "../../components/global/PagePostsComponent";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TbNotification } from "react-icons/tb";
import UploadPostStory from "../../components/app/profile/UploadPostStory";
import { getPageDetail } from "../../redux/slices/pages.slice";
import axios from "../../axios";

const Trendingpagedetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openUnsubscribeModal, setOpenUnsubscribeModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [reportmodal, setReportmodal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [suggestPostModal, setSuggestPostModal] = useState(false);
  const [followRequestsModal, setFollowRequestsModal] = useState(false);
  const [followRequestsCount, setFollowRequestsCount] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [commentFilter, setCommentFilter] = useState("all");
  const dropdownRef = useRef(null);
  const optionsDropdownRef = useRef(null);

  const { user, allUserData } = useSelector((state) => state.auth);
  const currentUserId = user?._id || allUserData?._id;

  /* ================= FETCH PAGE DETAIL ================= */
  useEffect(() => {
    dispatch(fetchPageById(id));
  }, [dispatch, id]);

  const { pagePosts } = useSelector((state) => state.trending);

  useEffect(() => {
    dispatch(
      fetchPagePosts({
        pageId: id,
        filterType: commentFilter,
        commentFilter: commentFilter,
        applyFilter: true,
      })
    );
  }, [dispatch, id, commentFilter]);

  const { reportSuccess, reportLoading } = useSelector(
    (state) => state.reports,
  );

  const { pageDetail, pageDetailLoading } = useSelector(
    (state) => state.trending,
  );

  const isPageOwner = Boolean(
    pageDetail && (
      pageDetail.isOwner ||
      pageDetail.user?._id === currentUserId ||
      pageDetail.user === currentUserId ||
      pageDetail.author?._id === currentUserId ||
      pageDetail.author === currentUserId
    )
  );
  const isPrivatePage = pageDetail?.pageType === "private" || pageDetail?.isPrivate;
  const isRequestPending = pageDetail?.requestStatus === "pending";

  const fetchFollowRequestsCount = useCallback(async () => {
    if (!id || !isPageOwner) return;
    try {
      const url = `/requests/follow?pageId=${id}&page=1&limit=20`;
      const res = await axios.get(url);
      const reqs = res.data?.data || [];
      const pendingReqs = Array.isArray(reqs)
        ? reqs.filter((r) => r?.status === "pending" || !r?.status)
        : [];
      setFollowRequestsCount(pendingReqs.length);
    } catch (err) {
      console.error("Failed to fetch follow requests count:", err);
      setFollowRequestsCount(0);
    }
  }, [id, isPageOwner]);

  useEffect(() => {
    if (id && isPageOwner && isPrivatePage) {
      fetchFollowRequestsCount();
    }
  }, [id, isPageOwner, isPrivatePage, fetchFollowRequestsCount]);

  // Join stream from Trending page – just navigate, LiveStreampage handles role + join logic
  const handleJoinStream = useCallback(
    (pageId) => {
      console.log("Navigating to live stream from Trendingpagedetail", {
        pageId,
      });
      navigate(`/live-stream/${pageId}`);
    },
    [navigate],
  );

  useEffect(() => {
    if (reportSuccess) {
      SuccessToast("Report submitted successfully");
      dispatch(resetReportState());
      setReportmodal(false);
    }
  }, [reportSuccess, dispatch]);

  /* ================= SET SUBSCRIPTION STATE ================= */
  useEffect(() => {
    if (pageDetail) {
      setIsSubscribed(!!pageDetail.isSubscribed);
    }
  }, [pageDetail]);

  /* ================= SUBSCRIBE = OPEN MODAL ================= */
  const handleSubscribeClick = () => {
    setSelectedPage({ _id: id }); // modal expects page._id
    setOpenModal(true);
  };

  /* ================= SAVE TO COLLECTION ================= */
  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(
      addPageToCollections({
        collections: selectedCollections,
        page: id,
      }),
    ).then((res) => {
      if (!res.error) {
        setIsSubscribed(true); // 🔓 unlock private page
        dispatch(fetchPageById(id));
        setOpenModal(false);

        dispatch(getMyCollections({ page: 1, limit: 100 }));
        dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
        dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));
      }
    });
  };

  /* ================= UNSUBSCRIBE = OPEN MODAL ================= */
  const handleUnsubscribeClick = () => {
    setSelectedPage({ 
      _id: id,
      name: pageDetail?.name 
    });
    setOpenUnsubscribeModal(true);
    setShowOptionsDropdown(false);
  };

  /* ================= HANDLE UNSUBSCRIBE FROM MODAL ================= */
  const handleUnsubscribeComplete = () => {
    setIsSubscribed(false);
    dispatch(fetchPageById(id));
    setOpenUnsubscribeModal(false);
    dispatch(getMyCollections({ page: 1, limit: 100 }));
    dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
    dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (
        showOptionsDropdown &&
        optionsDropdownRef.current &&
        !optionsDropdownRef.current.contains(event.target)
      ) {
        setShowOptionsDropdown(false);
      }
    };

    if (showDropdown || showOptionsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown, showOptionsDropdown]);

  /* ================= LOADING STATE ================= */
  if (pageDetailLoading) {
    return (
      <div className="flex max-w-7xl mx-auto min-h-screen">
        <div className="w-full overflow-y-auto p-3 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600 font-semibold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pageDetail) {
    return (
      <div className="flex max-w-7xl mx-auto min-h-screen">
        <div className="w-1/4 bg-[#F2F2F2] sticky top-20 h-screen overflow-y-auto pt-3">
          <Profilecard />
          <div className="pt-4">
            <MySubscription />
          </div>
        </div>
        <div className="w-3/4 overflow-y-auto p-3 flex items-center justify-center">
          <p className="text-lg text-gray-600">No page details found</p>
        </div>
      </div>
    );
  }

  /* ================= PRIVATE PAGE CHECK ================= */
  const isPrivateAndNotSubscribed =
    isPrivatePage && !isSubscribed && !isPageOwner;

  return (
    <div className="flex max-w-7xl mx-auto min-h-screen">
      {/* ================= MAIN CONTENT ================= */}
      <div className="w-full overflow-y-auto p-3">
        <div
          className={`bg-gradient-to-r from-orange-600 to-orange-400 rounded-3xl overflow-hidden shadow-lg ${
            isPrivateAndNotSubscribed ? "blur-sm" : ""
          }`}
        >
          {/* Header */}
          <div className="h-[6em] relative flex items-start justify-between px-6 pt-5">
            <FaArrowLeft
              size={24}
              onClick={() => navigate(-1)}
              color="white"
              className="cursor-pointer hover:opacity-80 transition"
            />

            <div className="flex items-center gap-3">
              {/* Comment Filter Button in Header */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                title="Comment Filter"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all text-xs font-semibold shadow-sm backdrop-blur-sm cursor-pointer"
              >
                <SlidersHorizontal size={16} />
                <span>Comment Filter</span>
              </button>

              {/* Options Dropdown (3-dots) */}
              <div
                className="relative"
                ref={optionsDropdownRef}
              >
                <button
                  onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                  className="cursor-pointer p-2 hover:bg-white/20 rounded-full transition relative"
                >
                  <BsThreeDotsVertical color="white" size={22} />
                  {followRequestsCount > 0 && isPageOwner && isPrivatePage && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </button>
                {showOptionsDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[170px] overflow-hidden py-1">
                    {/* Follow Requests in dropdown for page owner */}
                    {isPageOwner && isPrivatePage && (
                      <button
                        onClick={() => {
                          setFollowRequestsModal(true);
                          setShowOptionsDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between gap-2 font-medium cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck size={16} className="text-orange-500" />
                          <span>Follow Requests</span>
                        </div>
                        {followRequestsCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {followRequestsCount}
                          </span>
                        )}
                      </button>
                    )}
                    {/* View Post Requests for page owner */}
                    {isPageOwner && (
                      <button
                        onClick={() => {
                          navigate("/profile", { state: { id, req: true } });
                          setShowOptionsDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <TbNotification size={16} className="text-orange-500" />
                        <span>View Post Requests</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsFilterModalOpen(true);
                        setShowOptionsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <SlidersHorizontal size={16} />
                      <span>Comment Filter</span>
                    </button>
                    {isSubscribed && !isPageOwner && (
                      <button
                        onClick={handleUnsubscribeClick}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        Unsubscribe
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setReportmodal(true);
                        setShowOptionsDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-0">
              <div className="flex items-end gap-4 min-w-0 flex-1">
                {pageDetail.image ? (
                  <Avatar
                    src={pageDetail.image}
                    alt={pageDetail.name || "Topic Page"}
                    size="xl"
                    className="w-[5em] sm:w-[6em] h-[5em] sm:h-[6em] rounded-full border-4 border-white object-cover bg-white shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className="text-2xl sm:text-3xl w-[3em] h-[3em] bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-md flex-shrink-0">
                    {pageDetail.name?.charAt(0).toUpperCase() || "P"}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1 pb-2">
                  <h1
                    className="text-xl sm:text-2xl font-bold text-white capitalize break-words line-clamp-2 max-w-full"
                    title={pageDetail.name}
                  >
                    {pageDetail.name}
                  </h1>
                  <p className="text-gray-100 text-[1em] break-words line-clamp-2 max-w-xl">
                    #{pageDetail.about || "topic"}
                  </p>
                  <div className="flex items-center gap-2 pt-2 flex-wrap text-xs text-white">
                    <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full font-semibold border border-white/20 shadow-xs">
                      {pageDetail?.postsCount ?? (Array.isArray(pageDetail?.posts) ? pageDetail.posts.length : (Array.isArray(pagePosts) ? pagePosts.length : 0))} Posts
                    </span>
                    <div className="flex -space-x-2 items-center pl-2">
                      {pageDetail.followers &&
                        pageDetail.followers
                          .slice(0, 3)
                          .map((img, i) =>
                            img ? (
                              <img
                                key={i}
                                src={img}
                                alt="follower"
                                className="w-6 h-6 rounded-full border-2 border-white object-cover bg-white flex-shrink-0"
                              />
                            ) : (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex-shrink-0"
                              />
                            ),
                          )}
                      <p className="text-xs text-white/95 font-medium pl-3 truncate">
                        {pageDetail.followersCount || 0}+ People Follow
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-[0em] items-center flex-wrap flex-shrink-0">
                {/* Follow Requests Button - Show for private page owner */}
                {isPageOwner && isPrivatePage && (
                  <button
                    onClick={() => setFollowRequestsModal(true)}
                    className="p-2 px-5 flex items-center gap-2 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 shadow-sm border border-orange-200 relative"
                  >
                    <UserCheck size={20} />
                    <span>Follow Requests</span>
                    {followRequestsCount > 0 && (
                      <span className="flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1 shadow-sm animate-pulse">
                        {followRequestsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Non-owner Buttons */}
                {!isPageOwner && (
                  <>
                    {/* Request Pending Button */}
                    {isPrivatePage && isRequestPending && !isSubscribed && (
                      <button
                        disabled
                        className="p-2 px-8 rounded-2xl font-semibold bg-gray-200 text-gray-600 cursor-not-allowed"
                      >
                        Request Pending
                      </button>
                    )}

                    {/* Subscribe / Follow Request Button - Show when not subscribed */}
                    {!isSubscribed && (!isPrivatePage || !isRequestPending) && (
                      <button
                        onClick={handleSubscribeClick}
                        className="p-2 px-8 rounded-2xl font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 shadow-sm"
                      >
                        {isPrivatePage ? "Follow Request" : "Subscribe"}
                      </button>
                    )}

                    {/* Subscribed State */}
                    {isSubscribed && (
                      <button
                        disabled
                        className="p-2 px-8 rounded-2xl font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                      >
                        Subscribed
                      </button>
                    )}
                  </>
                )}

                {/* Live Chat Button - Only show when subscribed or page owner */}
                {(isSubscribed || isPageOwner) && (
                  <button
                    onClick={async () => {
                      await dispatch(getPageDetail(id));
                      navigate(`/live-chat`, {
                        state: {
                          pageId: id,
                          pageName: pageDetail?.name,
                          pageOwner: pageDetail?.liveChat,
                          page: pageDetail,
                        },
                      });
                    }}
                    className="p-2 px-4 flex items-center gap-2 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50 shadow-sm border border-orange-200"
                  >
                    <MessageSquareText size={20} />
                    <span>Start A Live Chat</span>
                    <span className="bg-orange-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                       {pageDetail?.liveChatCount || pageDetail?.liveChatCount?.length || 0} 
                    </span>
                  </button>
                )}

                {/* Suggest Post Button - Only show when subscribed and not page owner */}
                {isSubscribed && !isPageOwner && (
                  <button
                    onClick={() => setSuggestPostModal(true)}
                    className="p-2 px-4 flex items-center gap-2 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50"
                  >
                    <MessageCircleWarning size={20} />
                    Suggest Post
                  </button>
                )}
              </div>

              <div className="mb-[0em]">
                {pageDetail?.isLiveStreaming && (
                  <button
                    onClick={() => handleJoinStream(pageDetail._id)}
                    className="p-2 px-4 flex gap-4 rounded-2xl items-center cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-50"
                  >
                    <RiLiveLine size={20} />
                    Join Live Stream
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= PRIVATE PAGE OVERLAY ================= */}
        {isPrivateAndNotSubscribed && (
          <div className="flex items-center justify-center mt-10 relative z-10 h-80">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="mb-4 flex justify-center">
                <Lock size={40} className="text-orange-500" />
              </div>

              {/* Heading change based on requestStatus */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {pageDetail.requestStatus === "pending"
                  ? "Request Pending"
                  : "This Page is Private"}
              </h2>

              <p className="text-gray-600 mb-6">
                {pageDetail.requestStatus === "pending"
                  ? "Your follow request is currently under review by the page owner."
                  : "You need to follow or subscribe to view this page's content"}
              </p>

              {/* Hide button when request is pending */}
              {pageDetail.requestStatus !== "pending" && (
                <button
                  onClick={handleSubscribeClick}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-semibold transition-colors shadow-md"
                >
                  Send Follow Request
                </button>
              )}
            </div>
          </div>
        )}

        <div className={`${isPrivateAndNotSubscribed ? "hidden" : ""}`}>
          <PagePostsComponent pageId={id} commentFilter={commentFilter} />
        </div>

        {/* ================= COLLECTION MODAL ================= */}
        {openModal && (
          <CollectionModal
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            page={selectedPage}
            onSave={handleSaveToCollection}
          />
        )}

        {/* ================= UNSUBSCRIBE MODAL ================= */}
        {openUnsubscribeModal && (
          <UnsubscribeModal
            isOpen={openUnsubscribeModal}
            onClose={() => {
              setOpenUnsubscribeModal(false);
            }}
            onUnsubscribe={handleUnsubscribeComplete}
            page={selectedPage}
          />
        )}

        {/* ================= REPORT MODAL ================= */}
        <ReportModal
          isOpen={reportmodal}
          onClose={() => setReportmodal(false)}
          loading={reportLoading}
          onSubmit={(reason) => {
            dispatch(
              sendReport({
                reason,
                targetModel: "Page",
                targetId: id,
                isReported: true,
              }),
            );
          }}
        />

        {/* Suggest Post Modal */}
        <UploadPostStory
          isOpen={suggestPostModal}
          setIsOpen={setSuggestPostModal}
          setSelectedType={() => {}}
          title="Suggest Post"
          selectedPages={[id]}
        />

        {/* Follow Requests Modal */}
        <FollowRequestsModal
          isOpen={followRequestsModal}
          onClose={() => {
            setFollowRequestsModal(false);
            fetchFollowRequestsCount();
          }}
          pageId={id}
          onActionComplete={() => {
            fetchFollowRequestsCount();
            dispatch(fetchPageById(id));
          }}
        />

        {/* Comment Filter Modal */}
        <CommentFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={(filter) => setCommentFilter(filter)}
          selectedFilter={commentFilter}
        />
      </div>
    </div>
  );
};

export default Trendingpagedetail;

