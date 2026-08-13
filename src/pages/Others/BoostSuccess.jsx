import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import {
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Eye,
  MapPin,
  Calendar,
  Sparkles,
  BarChart2,
} from "lucide-react";
import {
  verifyPurchase,
  createBoost,
} from "../../redux/slices/boost.slice";
import {
  getPendingBoostCampaign,
  clearPendingBoostCampaign,
} from "../../lib/boostHelpers";
import BoostAnalyticsModal from "../../components/global/BoostAnalyticsModal";

export default function BoostSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("verifying"); // "verifying" | "creating" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [boostResult, setBoostResult] = useState(null);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("No checkout session ID provided in the return URL.");
      return;
    }

    processedRef.current = true;

    const processPaymentAndCreateBoost = async () => {
      try {
        setStatus("verifying");

        // 1. Verify Stripe purchase
        const verifyRes = await dispatch(
          verifyPurchase({
            platform: "stripe",
            checkoutSessionId: sessionId,
          })
        ).unwrap();

        if (!verifyRes?.verified) {
          throw new Error("Payment verification was not completed.");
        }

        setStatus("creating");

        // 2. Retrieve pending campaign parameters
        const pendingConfig = getPendingBoostCampaign(sessionId);

        const planId = verifyRes.planId || pendingConfig?.planId;
        const transactionId = verifyRes.transactionId;
        const postId = pendingConfig?.postId;

        if (!postId || !planId) {
          throw new Error("Missing post ID or plan ID for boost creation.");
        }

        // 3. Create active boost record
        const boostPayload = {
          planId: planId,
          postId: postId,
          platform: "stripe",
          transactionId: transactionId,
          keywords: pendingConfig?.keywords || ["trending"],
          selectedInterests: pendingConfig?.selectedInterests || ["Sports"],
          locationEnabled: Boolean(pendingConfig?.locationEnabled),
          locationCity: pendingConfig?.locationCity || "",
          locationState: pendingConfig?.locationState || "",
          locationCoordinates: pendingConfig?.locationCoordinates || [
            -97.7431, 30.2672,
          ],
          locationRadius: Number(pendingConfig?.locationRadius) || 50,
        };

        const createRes = await dispatch(createBoost(boostPayload)).unwrap();

        // 4. Success cleanup
        clearPendingBoostCampaign(sessionId);
        setBoostResult(createRes);
        setStatus("success");
      } catch (err) {
        console.error("Boost fulfillment error:", err);
        setStatus("error");
        setErrorMessage(
          typeof err === "string"
            ? err
            : err?.message || "Failed to finalize boost campaign."
        );
      }
    };

    processPaymentAndCreateBoost();
  }, [sessionId, dispatch]);

  return (
    <div className="min-h-[85vh] bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center animate-fadeIn">
        {/* ================= LOADING / VERIFYING ================= */}
        {status === "verifying" && (
          <div className="py-12 space-y-4">
            <div className="w-16 h-16 border-4 border-[#DE4B12] border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">
              Verifying Stripe Payment...
            </h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Please wait while we confirm your payment with Stripe.
            </p>
          </div>
        )}

        {/* ================= CREATING BOOST ================= */}
        {status === "creating" && (
          <div className="py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-[#DE4B12] flex items-center justify-center mx-auto animate-pulse">
              <Zap className="w-8 h-8 fill-[#DE4B12]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Activating Boost Campaign...
            </h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Configuring your targeting keywords, interests, and impressions.
            </p>
          </div>
        )}

        {/* ================= SUCCESS ================= */}
        {status === "success" && (
          <div className="space-y-6 animate-slideUp">
            {/* Header Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 bg-orange-100 text-[#DE4B12] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Boost Active
              </span>
              <h1 className="text-2xl font-black text-gray-900">
                Post Boosted Successfully!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Your post is now actively entering feeds for targeted viewers.
              </p>
            </div>

            {/* Campaign Summary Card */}
            {boostResult && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <span className="text-xs font-semibold text-gray-500">
                    Total Impressions
                  </span>
                  <span className="text-sm font-black text-[#DE4B12] flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {boostResult.totalImpressions || "Configured"} Views
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <span className="text-xs font-semibold text-gray-500">
                    Duration
                  </span>
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {boostResult.duration || 7} Days
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                  <span className="text-xs font-semibold text-gray-500">
                    Daily Delivery Pacing
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    ~{boostResult.dailyDeliveryTarget || 8} impressions / day
                  </span>
                </div>

                {boostResult.locationEnabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Location Target
                    </span>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#DE4B12]" />
                      {boostResult.locationCity || "Target Radius"} (
                      {boostResult.locationRadius || 50} mi)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {boostResult?._id && (
                <button
                  onClick={() => setAnalyticsModalOpen(true)}
                  className="w-full bg-[#DE4B12] hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>View Live Campaign Analytics</span>
                </button>
              )}

              <button
                onClick={() => navigate("/my-posts")}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold py-3 rounded-2xl transition text-sm cursor-pointer"
              >
                Go to My Posts
              </button>

              <button
                onClick={() => navigate("/home")}
                className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 transition cursor-pointer"
              >
                Return to Home Feed
              </button>
            </div>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {status === "error" && (
          <div className="space-y-6 py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Boost Activation Issue
              </h2>
              <p className="text-sm text-red-600 mt-2 font-medium">
                {errorMessage || "Unable to verify payment or create the boost."}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate("/my-posts")}
                className="w-full bg-[#DE4B12] hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-orange-500/20 cursor-pointer text-sm"
              >
                Return to My Posts
              </button>

              <button
                onClick={() => navigate("/home")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl transition text-sm cursor-pointer"
              >
                Back to Home Feed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {boostResult?._id && (
        <BoostAnalyticsModal
          isOpen={analyticsModalOpen}
          onClose={() => setAnalyticsModalOpen(false)}
          boostId={boostResult._id}
        />
      )}
    </div>
  );
}
