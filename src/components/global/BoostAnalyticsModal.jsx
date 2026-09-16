import React, { useEffect, useState } from "react";
import {
  X,
  Zap,
  Eye,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBoostAnalytics,
  cancelBoost,
  clearAnalytics,
  fetchMyBoosts,
} from "../../redux/slices/boost.slice";

export default function BoostAnalyticsModal({
  isOpen,
  onClose,
  boostId,
  postId,
  post,
}) {
  const dispatch = useDispatch();
  const {
    analytics,
    analyticsBoost,
    analyticsLoading,
    myBoosts,
  } = useSelector((state) => state.boost);

  const [resolvedBoostId, setResolvedBoostId] = useState(boostId);
  const [resolvingId, setResolvingId] = useState(false);

  // Sync resolvedBoostId if boostId prop changes
  useEffect(() => {
    if (boostId) {
      setResolvedBoostId(boostId);
    }
  }, [boostId]);

  // Resolve boost ID from myBoosts if not passed directly
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearAnalytics());
      return;
    }

    const resolveAndFetch = async () => {
      let targetId = boostId || resolvedBoostId;
      const effectivePostId = postId || post?._id;

      // If we don't have a valid boostId yet, look it up in myBoosts
      if (!targetId && effectivePostId) {
        setResolvingId(true);
        try {
          const res = await dispatch(fetchMyBoosts({ page: 1, limit: 50 })).unwrap();
          const list = res?.boosts || myBoosts || [];
          const match = list.find(
            (b) =>
              b._id === effectivePostId ||
              b.post === effectivePostId ||
              b.post?._id === effectivePostId
          );
          if (match?._id) {
            targetId = match._id;
            setResolvedBoostId(match._id);
          }
        } catch (e) {
          console.error("Could not resolve boost from myBoosts:", e);
        } finally {
          setResolvingId(false);
        }
      }

      if (targetId) {
        dispatch(fetchBoostAnalytics(targetId));
      }
    };

    resolveAndFetch();
  }, [isOpen, boostId, postId, post?._id, dispatch]);

  if (!isOpen) return null;

  // Find matching boost from Redux myBoosts list (if available) for extra meta
  const matchedBoost = myBoosts?.find(
    (b) =>
      b._id === resolvedBoostId ||
      b._id === boostId ||
      b.post === (postId || post?._id) ||
      b.post?._id === (postId || post?._id)
  );

  // Post preview info
  const postData = analytics?.post || analyticsBoost || post;
  const authorName =
    postData?.page?.name ||
    postData?.author?.name ||
    postData?.author?.username ||
    "Post Boost";
  const authorAvatar =
    postData?.page?.image ||
    postData?.author?.profilePicture ||
    null;
  const postSnippet = postData?.bodyText || "";

  // Performance data (from new API structure: overallPerformance + boostDetails)
  const perf = analytics?.overallPerformance || {};
  const boostDetails = analytics?.boostDetails || {};

  // Status
  const currentStatus =
    perf?.status ||
    analytics?.status ||
    analyticsBoost?.status ||
    matchedBoost?.status ||
    "active";

  // Views / delivered
  const delivered =
    perf?.postViews ??
    analytics?.deliveredImpressions ??
    analytics?.deliveredViews ??
    0;

  // Comments
  const comments =
    perf?.postComments ??
    postData?.commentsCount ??
    0;

  // Total target impressions (from plan or boost)
  const total =
    analytics?.totalImpressions ??
    analytics?.targetImpressions ??
    matchedBoost?.impressions ??
    matchedBoost?.targetImpressions ??
    matchedBoost?.plan?.impressions ??
    0;

  const remaining =
    analytics?.remainingImpressions ??
    (total > 0 ? Math.max(0, total - delivered) : 0);

  const percent =
    analytics?.completionPercentage ??
    (total > 0 ? Math.min(100, Math.round((delivered / total) * 100)) : 0);

  // Dates
  const startDate =
    boostDetails?.boostStarted ||
    perf?.dateRange?.from ||
    matchedBoost?.createdAt;

  const endDate =
    boostDetails?.endsOn ||
    perf?.dateRange?.to;

  const daysRemaining =
    boostDetails?.daysRemaining ??
    analytics?.daysRemaining ??
    (endDate
      ? Math.max(0, Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)))
      : 0);

  const daysElapsed =
    analytics?.daysElapsed ??
    (startDate
      ? Math.max(0, Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      : 0);

  // Pacing
  const dailyActual =
    analytics?.actualDailyAverage ??
    (daysElapsed > 0 ? Math.round(delivered / daysElapsed) : delivered);

  // Daily breakdown / viewsOverTime
  const rawBreakdown =
    (Array.isArray(analytics?.viewsOverTime) && analytics.viewsOverTime.length > 0)
      ? analytics.viewsOverTime
      : (analytics?.dailyBreakdown || []);

  const dailyBreakdown = rawBreakdown.map((item, idx) => ({
    key: idx,
    date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"),
    impressions: item.views ?? item.impressions ?? item.count ?? 0,
  }));

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isLoading = analyticsLoading || resolvingId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-slideUp z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-[#DE4B12] flex items-center justify-center">
              <Zap className="w-4 h-4 fill-[#DE4B12]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Boost Campaign Analytics
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Live delivery and impression accounting
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-orange-scrollbar space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
              <div className="w-8 h-8 border-3 border-[#DE4B12] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">
                Loading live analytics...
              </span>
            </div>
          ) : (
            <>
              {/* Post Header Card (if post details exist) */}
              {postData && (
                <div className="flex items-center gap-3 p-3 bg-orange-50/40 rounded-2xl border border-orange-100">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-10 h-10 rounded-full object-cover border border-orange-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-200 text-orange-800 font-bold flex items-center justify-center text-xs">
                      {authorName?.[0]?.toUpperCase() || "P"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {authorName}
                    </p>
                    {postSnippet && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {postSnippet}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold capitalize ${
                      currentStatus === "active"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : currentStatus === "completed"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-200 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {currentStatus === "active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    )}
                    {currentStatus}
                  </span>
                </div>
              )}

              {/* Status & Overview Bar (if no post preview) */}
              {!postData && (
                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">
                      Campaign Status
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                      currentStatus === "active"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : currentStatus === "completed"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-200 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {currentStatus === "active" && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    )}
                    {currentStatus}
                  </span>
                </div>
              )}

              {/* Progress Bar (Shown when total impressions is known) */}
              {total > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">
                      Impressions Progress
                    </span>
                    <span className="font-extrabold text-[#DE4B12]">
                      {percent}% Completed
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-[#DE4B12] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-500 font-medium pt-1">
                    <span>{delivered} Delivered</span>
                    <span>{remaining} Remaining</span>
                    <span>{total} Total</span>
                  </div>
                </div>
              )}

              {/* Key Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Delivered Views */}
                <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#DE4B12] font-semibold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Post Views</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {delivered}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Delivered impressions
                  </div>
                </div>

                {/* Post Comments */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Comments</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {comments}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Audience engagement
                  </div>
                </div>

                {/* Days Left */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Days Left</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {daysRemaining}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {daysElapsed} days elapsed
                  </div>
                </div>

                {/* Duration / Schedule */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ends On</span>
                  </div>
                  <div className="text-xs font-black text-gray-900 truncate">
                    {formatDate(endDate)}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    From {formatDate(startDate)}
                  </div>
                </div>
              </div>

              {/* Daily Breakdown / Views Over Time */}
              {dailyBreakdown.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <BarChart3 className="w-4 h-4 text-[#DE4B12]" />
                    <span>Views History</span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {dailyBreakdown.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between text-xs py-1.5 px-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <span className="font-semibold text-gray-700">
                          {item.date}
                        </span>
                        <span className="font-extrabold text-[#DE4B12]">
                          +{item.impressions} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    Daily breakdown will update automatically as views are recorded in the feed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/40">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition text-xs cursor-pointer shadow-sm"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
