import React, { useEffect, useState } from "react";
import {
  X,
  Zap,
  Eye,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3,
  Clock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBoostAnalytics,
  cancelBoost,
  clearAnalytics,
} from "../../redux/slices/boost.slice";

export default function BoostAnalyticsModal({ isOpen, onClose, boostId }) {
  const dispatch = useDispatch();
  const {
    analytics,
    analyticsBoost,
    analyticsLoading,
    cancelLoading,
  } = useSelector((state) => state.boost);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && boostId) {
      dispatch(fetchBoostAnalytics(boostId));
    }
    return () => {
      if (!isOpen) {
        dispatch(clearAnalytics());
        setShowCancelConfirm(false);
      }
    };
  }, [isOpen, boostId, dispatch]);

  if (!isOpen) return null;

  const currentStatus =
    analytics?.status || analyticsBoost?.status || "active";
  const delivered = analytics?.deliveredImpressions ?? 0;
  const total = analytics?.totalImpressions ?? 0;
  const remaining = analytics?.remainingImpressions ?? 0;
  const percent =
    analytics?.completionPercentage ??
    (total > 0 ? Math.round((delivered / total) * 100) : 0);

  const daysElapsed = analytics?.daysElapsed ?? 0;
  const daysRemaining = analytics?.daysRemaining ?? 0;
  const dailyTarget = analytics?.dailyDeliveryTarget ?? 0;
  const dailyActual = analytics?.actualDailyAverage ?? 0;
  const dailyBreakdown = analytics?.dailyBreakdown || [];

  const handleCancelBoost = async () => {
    if (!boostId) return;
    try {
      await dispatch(cancelBoost(boostId)).unwrap();
      setShowCancelConfirm(false);
      // Refresh analytics
      dispatch(fetchBoostAnalytics(boostId));
    } catch (err) {
      console.error("Cancel boost error:", err);
    }
  };

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
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-orange-scrollbar space-y-5">
          {analyticsLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
              <div className="w-8 h-8 border-3 border-[#DE4B12] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">
                Loading live analytics...
              </span>
            </div>
          ) : (
            <>
              {/* Status & Overview Bar */}
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

              {/* Progress Bar */}
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

              {/* Key Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Delivered */}
                <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#DE4B12] font-semibold">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Delivered Views</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {delivered}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Unique session impressions
                  </div>
                </div>

                {/* Remaining */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Remaining</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {remaining}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Views to be delivered
                  </div>
                </div>

                {/* Pacing Target */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Daily Target</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    ~{dailyTarget}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Actual avg: {dailyActual}/day
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Days Left</span>
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {daysRemaining}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {daysElapsed} days elapsed
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              {dailyBreakdown.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <BarChart3 className="w-4 h-4 text-[#DE4B12]" />
                    <span>Daily Impression History</span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {dailyBreakdown.map((item, idx) => (
                      <div
                        key={idx}
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
              )}

              {/* Cancel Section */}
              {currentStatus === "active" && (
                <div className="pt-2">
                  {!showCancelConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cancel Boost Campaign
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3 animate-fadeIn">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800 font-medium leading-relaxed">
                          Are you sure you want to cancel this boost? The post will no longer be served as a sponsored feed post.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCancelConfirm(false)}
                          className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-2 rounded-xl text-xs hover:bg-gray-50 transition cursor-pointer"
                        >
                          Keep Campaign
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelBoost}
                          disabled={cancelLoading}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition disabled:opacity-60 cursor-pointer shadow-xs"
                        >
                          {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
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
