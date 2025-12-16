import React, { useEffect, useState } from 'react';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPageById, fetchPagePosts } from '../../redux/slices/trending.slice';
import { Lock, MessageCircleWarning, MessageSquareText } from 'lucide-react';
import CollectionModal from '../../components/global/CollectionModal';
import { addPageToCollections } from '../../redux/slices/collection.slice';
import { getMyCollections } from '../../redux/slices/collection.slice';
import { VscReport } from "react-icons/vsc";


import {
    fetchTrendingPages,
    fetchRecommendedPages,
} from '../../redux/slices/trending.slice';
import ReportModal from '../../components/global/ReportModal';
import { sendReport, resetReportState } from '../../redux/slices/reports.slice';
import { SuccessToast } from '../../components/global/Toaster';
import { FaArrowLeft } from 'react-icons/fa6';

const Trendingpagedetail = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const navigate = useNavigate();

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [reportmodal, setReportmodal] = useState(false);

    /* ================= FETCH PAGE DETAIL ================= */
    useEffect(() => {
        dispatch(fetchPageById(id));
    }, [dispatch, id]);

    const { pagePosts } = useSelector((state) => state.trending)


    useEffect(()=>{
        dispatch(fetchPagePosts({pageId:id}))
    }, [dispatch, id]);

    console.log(pagePosts,"pagePosts")

    const { reportSuccess, reportLoading } = useSelector((state) => state.reports)

    const { pageDetail, pageDetailLoading } = useSelector(
        (state) => state.trending
    );

    console.log(pageDetail, "pageDetail")

    useEffect(() => {
        if (reportSuccess) {
            SuccessToast("Report submitted successfully");

            // reset success so it does not fire again
            dispatch(resetReportState());

            // optional: close modal
            setReportmodal(false);
        }
    }, [reportSuccess, dispatch]);

    console.log(pageDetail, "pageDetail")

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
            })
        ).then((res) => {
            if (!res.error) {
                setIsSubscribed(true); // 🔓 unlock private page
                dispatch(fetchPageById(id));
                setOpenModal(false);

                // optional refresh (already in your flow)
                dispatch(getMyCollections({ page: 1, limit: 100 }));
                dispatch(fetchTrendingPages({ page: 1, limit: 10 }));
                dispatch(fetchRecommendedPages({ page: 1, limit: 10 }));
            }
        });
    };

    /* ================= LOADING STATE ================= */
    if (pageDetailLoading) {
        return (
            <div className="flex max-w-7xl mx-auto min-h-screen">
                <div className="w-full overflow-y-auto p-3 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg text-gray-600 font-semibold">
                            Loading...
                        </p>
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
                    <p className="text-lg text-gray-600">
                        No page details found
                    </p>
                </div>
            </div>
        );
    }

    /* ================= PRIVATE PAGE CHECK ================= */
    const isPrivateAndNotSubscribed =
        pageDetail.pageType === 'private' && !isSubscribed;


    return (
        <div className="flex max-w-7xl mx-auto min-h-screen">
            {/* ================= MAIN CONTENT ================= */}
            <div className="w-full overflow-y-auto p-3">
                <div
                    className={`bg-gradient-to-r from-orange-600 to-orange-400 rounded-3xl overflow-hidden shadow-lg ${isPrivateAndNotSubscribed ? 'blur-sm' : ''
                        }`}
                >
                    {/* Header */}
                    <div className="h-[6em] relative">
                        <FaArrowLeft
                            size={24}
                            onClick={() => navigate(-1)}  // This will go back to the previous page
                            color='white'
                            className='absolute left-4 top-4 cursor-pointer'  // Adjust the positioning as needed
                        />
                    </div>




                    {/* Profile Content */}
                    <div className="px-8 pb-6">

                        <div className="flex items-end gap-4 -mt-16 mb-0">
                            {/* Profile Image */}
                            <img
                                src={
                                    pageDetail.image ||
                                    'https://www.w3schools.com/w3images/avatar2.png'
                                }
                                alt="Profile"
                                className="w-[6em] h-[6em] rounded-full border-4 border-white object-cover"
                            />

                            {/* Info */}
                            <div className="flex-1 pb-2">
                                <h1 className="text-2xl font-bold text-white capitalize">
                                    {pageDetail.name}
                                </h1>
                                <p className="text-gray-300 text-[1em]">
                                    @{pageDetail.about || 'username'}
                                </p>
                                <div>
                                    <div className="flex -space-x-2 items-center pt-1">
                                        {pageDetail.followers && pageDetail.followers.slice(0, 3).map((img, i) => (
                                            img ? (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt="follower"
                                                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                                />
                                            ) : (
                                                <div
                                                    key={i}
                                                    className="w-6 h-6 rounded-full border-2 border-white bg-gray-300"
                                                />
                                            )
                                        ))}
                                        <p className="text-xs text-white font-medium pl-4">
                                            {pageDetail.followersCount}+ Follows
                                        </p>
                                    </div>

                                </div>
                            </div>





                            {/* Subscribe Button */}
                            <div className="mb-[0em]">
                                <div>
                                    <VscReport color='white' size={26} onClick={() => setReportmodal(true)} className='absolute top-[6.8em] right-[11em] cursor-pointer' />
                                </div>
                                <button
                                    onClick={handleSubscribeClick}
                                    disabled={isSubscribed}
                                    className={`p-2 px-8 rounded-2xl font-semibold transition-all duration-300 ${isSubscribed
                                        ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                                        : 'bg-white text-orange-500 hover:bg-orange-50'
                                        }`}
                                >
                                    {isSubscribed
                                        ? 'UnSubscribe'
                                        : 'Subscribe'}
                                </button>

                            </div>

                            <div className="mb-[0em]">
                                <div>
                                    <VscReport color='white' size={26} onClick={() => setReportmodal(true)} className='absolute top-[6.8em] right-[11em] cursor-pointer' />
                                </div>
                                <button
                                    onClick={handleSubscribeClick}
                                    disabled={isSubscribed}
                                    className=" p-2 px-4 flex gap-4 rounded-2xl cursor-pointer font-semibold transition-all duration-300 bg-white text-orange-500 hover:bg-orange-5"
                                >
                                    <MessageSquareText />
                                    Star A Live Chat
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= PRIVATE PAGE OVERLAY ================= */}
                {isPrivateAndNotSubscribed && (
                    <div className="flex items-center justify-center mt-10 relative z-10 h-80">
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <Lock size={40} />
                            </div>

                            {/* Heading change based on requestStatus */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {pageDetail.requestStatus === "pending"
                                    ? "Request Pending"
                                    : "This is a Private Page"}
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {pageDetail.requestStatus === "pending"
                                    ? "Your request is under review."
                                    : "You need to subscribe to view this page's content"}
                            </p>

                            {/* Hide button when request is pending */}
                            {pageDetail.requestStatus !== "pending" && (
                                <button
                                    onClick={handleSubscribeClick}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-semibold transition-colors"
                                >
                                    Subscribe Now
                                </button>
                            )}
                        </div>
                    </div>
                )}




                {/* ================= COLLECTION MODAL ================= */}
                {openModal && (
                    <CollectionModal
                        isOpen={openModal}
                        onClose={() => setOpenModal(false)}
                        page={selectedPage}
                        onSave={handleSaveToCollection}
                    />
                )}

                <ReportModal
                    isOpen={reportmodal}
                    onClose={() => setReportmodal(false)}
                    loading={reportLoading}   // 👈 ADD THIS
                    onSubmit={(reason) => {
                        dispatch(
                            sendReport({
                                reason,
                                targetModel: "Page",
                                targetId: id,
                                isReported: true,
                            })
                        );
                    }}
                />



            </div>
        </div >
    );
};

export default Trendingpagedetail;
