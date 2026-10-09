import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  Share2,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  User,
  PartyPopper,
} from "lucide-react";
import Profilecard from "../../components/homepage/Profilecard";
import MySubscription from "../../components/homepage/MySubscription";
import TrendingPagesGlobal from "../../components/global/TrendingPagesGlobal";
import SuggestionsPagesGlobal from "../../components/global/SuggestionsPagesGlobal";
import PrizeDeliveryModal from "../../components/affiliate/PrizeDeliveryModal";
import {
  getCurrentContest,
  getPrizeDeliveryDetails,
  getReferralLink,
  getReferralsHistory,
} from "../../redux/slices/affiliate.slice";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";

// Skeleton for Current Prize Hero
const PrizeHeroSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse mb-6">
    <div className="w-full h-56 bg-gray-200 rounded-xl mb-4" />
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-full bg-gray-100 rounded mb-1" />
    <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
    <div className="h-10 w-full bg-gray-200 rounded-xl" />
  </div>
);

// Skeleton for Referral Row
const ReferralRowSkeleton = () => (
  <div className="flex items-center justify-between bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-28 bg-gray-200 rounded" />
        <div className="h-2.5 w-20 bg-gray-100 rounded" />
      </div>
    </div>
    <div className="h-3 w-16 bg-gray-200 rounded" />
  </div>
);

export default function Affiliates() {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    currentContest,
    referralCounts,
    hasPrizeDeliveryAddress,
    prizeDeliveryDetails,
    noActiveContest,
    isContestLoading,
    referrals,
    pagination,
    isReferralsLoading,
    isLinkLoading,
  } = useSelector((state) => state.affiliate);

  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [isShareTriggeredModal, setIsShareTriggeredModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if routed from a winner notification
  const isWinnerNavigated = location.state?.isWinner || false;

  // Track if share was initiated to automatically retry after address save
  const pendingShareResume = useRef(false);

  // Load initial contest and referral data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      dispatch(getCurrentContest()),
      dispatch(getPrizeDeliveryDetails()),
      dispatch(getReferralsHistory({ page: 1, limit: 10 })),
    ]);
    setCurrentPage(1);
    setIsRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute native or web sharing
  const executeShare = useCallback(async (link) => {
    const shareText = `Join me on TopX using my referral link: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TopX Referral Contest",
          text: shareText,
          url: link,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          // User cancelled native share sheet
          return;
        }
        // Fallback to clipboard if native share errors
      }
    }

    try {
      await navigator.clipboard.writeText(link);
      SuccessToast("Referral link copied to clipboard!");
    } catch {
      // Manual fallback
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      SuccessToast("Referral link copied to clipboard!");
    }
  }, []);

  // Main Share button handler
  const handleShareClick = useCallback(async () => {
    if (noActiveContest) {
      ErrorToast("There is no active referral contest to share right now.");
      return;
    }

    try {
      const res = await dispatch(getReferralLink()).unwrap();
      if (res?.data?.referralLink) {
        await executeShare(res.data.referralLink);
      }
    } catch (err) {
      // Check for PRIZE_DETAILS_REQUIRED (HTTP 422)
      if (err?.code === "PRIZE_DETAILS_REQUIRED") {
        pendingShareResume.current = true;
        setIsShareTriggeredModal(true);
        setDeliveryModalOpen(true);
      } else if (err?.code === "NO_ACTIVE_CONTEST") {
        ErrorToast(err.message || "There is no active contest running.");
      } else {
        ErrorToast(err?.message || "Failed to retrieve referral link. Please try again.");
      }
    }
  }, [dispatch, executeShare, noActiveContest]);

  // Handle successful save from modal
  const handleDeliveryModalSuccess = useCallback(async () => {
    setDeliveryModalOpen(false);

    // Refresh current contest info to sync delivery status
    dispatch(getCurrentContest());

    // If modal was opened due to Share click, resume sharing automatically
    if (pendingShareResume.current) {
      pendingShareResume.current = false;
      setIsShareTriggeredModal(false);
      try {
        const res = await dispatch(getReferralLink()).unwrap();
        if (res?.data?.referralLink) {
          await executeShare(res.data.referralLink);
        }
      } catch (err) {
        ErrorToast(err?.message || "Failed to retrieve referral link after saving address.");
      }
    }
  }, [dispatch, executeShare]);

  // Handle modal close / cancellation
  const handleDeliveryModalClose = useCallback(() => {
    pendingShareResume.current = false;
    setIsShareTriggeredModal(false);
    setDeliveryModalOpen(false);
  }, []);

  // Handle load more referrals
  const handleLoadMoreReferrals = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await dispatch(getReferralsHistory({ page: nextPage, limit: 10 }));
  };

  // Date formatting helper
  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Determine contest status label
  const getContestStatusBadge = (contest) => {
    if (!contest) return null;
    const now = new Date();
    const ends = new Date(contest.endsAt);
    const msDiff = ends - now;
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3 && daysLeft > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock size={12} /> Ending Soon ({daysLeft}d left)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        <Sparkles size={12} /> Active Contest
      </span>
    );
  };

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto">
      {/* Left Sidebar */}
      <div className="w-1/4 !bg-[#F2F2F2] overflow-y-auto pt-3 hidden lg:block">
        <Profilecard smallcard={true} />
        <div className="pt-4">
          <MySubscription />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:w-1/2 bg-[#F2F2F2] min-h-screen p-4 sm:p-6 mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#DE4B12] to-[#E56F41] flex items-center justify-center text-white shadow-sm">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Referral Contest
              </h1>
              <p className="text-xs text-gray-500">
                Invite friends, increase your referral count & participate to win!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isRefreshing}
            aria-label="Refresh contest information"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-colors cursor-pointer shadow-2xs"
            title="Refresh contest data"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin text-orange-600" : ""}
            />
          </button>
        </div>

        {/* Winner Notification Banner (if user navigated from winner notification) */}
        {isWinnerNavigated && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-2xl mb-6 shadow-md relative overflow-hidden animate-in fade-in">
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <PartyPopper size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">
                  Congratulations! You&apos;ve Won!
                </h3>
                <p className="text-xs text-white/95 leading-relaxed">
                  Congratulations! You&apos;ve been selected as the winner of this referral contest.
                  Our team will contact you using your saved delivery details to arrange your prize delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Prize Hero Section */}
        {isContestLoading ? (
          <PrizeHeroSkeleton />
        ) : noActiveContest || !currentContest ? (
          /* No Active Contest State */
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200/80 mb-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              No Referral Contest Right Now
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
              There is no referral contest running right now. Check back soon for the next prize!
              You can still invite friends and your lifetime referrals will remain in your record.
            </p>
            <button
              type="button"
              onClick={loadData}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Check Again
            </button>
          </div>
        ) : (
          /* Active Contest Prize Card */
          <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200/80 mb-6">
            {/* Prize Image */}
            <div className="relative w-full h-56 sm:h-64 bg-gray-900 overflow-hidden group">
              <img
                src={currentContest.image}
                alt={currentContest.name || "Contest Prize"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10">
                {getContestStatusBadge(currentContest)}
              </div>

              {/* Prize Title & Dates on image */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <span className="text-xs font-semibold tracking-wider uppercase text-orange-300">
                  Current Prize
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-xs">
                  {currentContest.name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {formatDate(currentContest.startsAt)} -{" "}
                    {formatDate(currentContest.endsAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Prize Description & CTA */}
            <div className="p-5 sm:p-6">
              {currentContest.description && (
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  {currentContest.description}
                </p>
              )}

              {/* Share / Invite CTA Button */}
              <button
                type="button"
                onClick={handleShareClick}
                disabled={isLinkLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:opacity-95 text-white font-bold text-sm sm:text-base rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLinkLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Preparing your referral link...</span>
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    <span>Invite Friends & Participate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Referral Counts Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/80 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-orange-600" />
            <h3 className="font-bold text-base text-gray-900">Your Referral Stats</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Contest Referral Count */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200/60 text-center">
              <span className="text-xs font-semibold text-orange-700 block mb-1">
                This Contest
              </span>
              <span className="text-3xl font-extrabold text-[#DE4B12]">
                {referralCounts?.contest || 0}
              </span>
              <span className="text-[11px] text-gray-500 block mt-1">
                Successful sign-ups
              </span>
            </div>

            {/* Lifetime Referral Count */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/70 text-center">
              <span className="text-xs font-semibold text-gray-600 block mb-1">
                Lifetime Referrals
              </span>
              <span className="text-3xl font-extrabold text-gray-800">
                {referralCounts?.lifetime || 0}
              </span>
              <span className="text-[11px] text-gray-500 block mt-1">
                All-time successful
              </span>
            </div>
          </div>

          {/* Required Product Copy */}
          <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed border border-gray-100">
            <p>
              Invite new users to TopX. Successful sign-ups increase your referral count.
              The winner is selected by the TopX team after reviewing this contest.
            </p>
          </div>
        </div>

        {/* Prize Delivery Address Status & Action Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  hasPrizeDeliveryAddress
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {hasPrizeDeliveryAddress ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <MapPin size={20} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {hasPrizeDeliveryAddress
                    ? "Prize Delivery Address Saved"
                    : "Delivery Address Required"}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {hasPrizeDeliveryAddress
                    ? prizeDeliveryDetails?.address
                      ? `${prizeDeliveryDetails.address}${
                          prizeDeliveryDetails.city ? `, ${prizeDeliveryDetails.city}` : ""
                        }`
                      : "Your shipping information is ready for prize distribution."
                    : "A delivery address is required before you can share your referral link."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsShareTriggeredModal(false);
                setDeliveryModalOpen(true);
              }}
              className="shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:border-orange-500 hover:text-orange-600 text-gray-700 transition cursor-pointer"
            >
              {hasPrizeDeliveryAddress ? "Edit Details" : "Add Address"}
            </button>
          </div>
        </div>

        {/* Successful Referral History Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-gray-900">Successful Referrals</h3>
            <span className="text-xs text-gray-500 font-medium">
              Total: {pagination?.totalItems ?? referrals.length}
            </span>
          </div>

          <div className="space-y-3">
            {isReferralsLoading && referrals.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ReferralRowSkeleton key={i} />
              ))
            ) : referrals && referrals.length > 0 ? (
              referrals.map((item, idx) => {
                const userObj = item?.referredUser;
                const displayName = userObj?.name || "TopX Member";
                const username = userObj?.username ? `@${userObj.username}` : null;
                const avatar = userObj?.profilePicture;
                const firstLetter = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={item?._id || idx}
                    className="flex items-center justify-between bg-gray-50/70 hover:bg-gray-50 rounded-xl p-3.5 border border-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover border border-orange-100 shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {firstLetter || <User size={16} />}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {displayName}
                        </p>
                        {username && (
                          <p className="text-xs text-gray-400 truncate">
                            {username}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-gray-400 font-medium block">
                        {formatDate(item?.referredAt)}
                      </span>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty History State */
              <div className="text-center py-8 px-4 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                <Users size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No Successful Referrals Yet
                </p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  This list updates once invited users complete their registration and
                  email verification. Share your link to get your first referral!
                </p>
              </div>
            )}
          </div>

          {/* Pagination / Load More Button */}
          {pagination?.currentPage < pagination?.totalPages && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMoreReferrals}
                disabled={isReferralsLoading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                {isReferralsLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronDown size={14} />
                )}
                <span>Load More Referrals</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto overflow-x-hidden border-gray-200 hidden lg:block">
        <div className="p-0">
          <TrendingPagesGlobal />
          <SuggestionsPagesGlobal />
        </div>
      </div>

      {/* Prize Delivery Details Modal */}
      <PrizeDeliveryModal
        isOpen={deliveryModalOpen}
        onClose={handleDeliveryModalClose}
        onSuccess={handleDeliveryModalSuccess}
        isShareTriggered={isShareTriggeredModal}
      />
    </div>
  );
}
