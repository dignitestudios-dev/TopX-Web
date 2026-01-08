import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import VerificationModal from "../../authentication/VerificationModal";
import Button from "../../common/Button";
import SuccessModal from "../../common/Modal";

import { sendEmailOTP } from "../../../redux/slices/onboarding.slice";
import { deleteAccount } from "../../../redux/slices/profileSetting.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";

export default function DeleteAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openOTPModal, setOpenOTPModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(0); // 🔥 cooldown timer

  const { emailOTPLoading, emailOTPSuccess, emailOTPError } = useSelector(
    (state) => state.onboarding
  );

  const { user } = useSelector((state) => state.auth);

  /* =========================
     TIMER COUNTDOWN (20s)
     ========================= */
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  /* =========================
     SEND OTP (INITIAL)
     ========================= */
  const handleSendOTP = () => {
    dispatch(sendEmailOTP());
    setResendTimer(20); // 🔥 start cooldown on first send
  };

  /* =========================
     RESEND OTP (WRAPPER)
     ========================= */
  const handleResendOTP = () => {
    if (resendTimer > 0) {
      ErrorToast(`Please wait ${resendTimer}s before resending OTP`);
      return;
    }

    dispatch(sendEmailOTP());
    setResendTimer(20); // 🔥 restart cooldown
  };

  /* =========================
     OPEN OTP MODAL ON SUCCESS
     ========================= */
  useEffect(() => {
    if (emailOTPSuccess) {
      setOpenOTPModal(true);
    }
  }, [emailOTPSuccess]);

  /* =========================
     VERIFY OTP & DELETE ACCOUNT
     ========================= */
const handleVerifyOTP = async (otp) => {
  const res = await dispatch(
    deleteAccount({ otp: Number(otp) }) // 🔥 CONVERT TO NUMBER
  );

  if (res.meta.requestStatus === "fulfilled") {
    SuccessToast("Account deleted successfully");
    setOpenOTPModal(false);
    setOpenSuccessModal(true);
  } else {
    ErrorToast(res.payload || "Invalid OTP");
  }
};


  /* =========================
     CLOSE SUCCESS MODAL
     ========================= */
  const handleSuccessClose = () => {
    setOpenSuccessModal(false);
    navigate("/auth/login");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Delete Account
      </h1>

      <div className="w-[400px] space-y-3">
        <p>
          We will send a 5-digit verification code to{" "}
          <span className="font-semibold">{user?.email}</span>
        </p>
        <p className="text-sm text-gray-600">
          Your account and all related data will be permanently deleted.
        </p>

        {/* SEND CODE */}
        <Button
          size="lg"
          variant="orange"
          className="w-[300px] flex justify-center items-center"
          onClick={handleSendOTP}
          disabled={emailOTPLoading}
        >
          {emailOTPLoading ? "Sending..." : "Send Code"}
        </Button>

        {/* OTP MODAL */}
        <VerificationModal
          isOpen={openOTPModal}
          onClose={() => setOpenOTPModal(false)}
          email={user?.email}
          isType="email"
          onVerify={handleVerifyOTP}     // ✅ verify & delete
          onResend={handleResendOTP}     // ✅ wrapped resend with timer
        />

        {/* SUCCESS MODAL */}
        <SuccessModal
          isOpen={openSuccessModal}
          onClose={handleSuccessClose}
          heading="Account Deleted"
          message="Your account has been deleted successfully."
          autoCloseDuration={2000}
        />

        {/* ERROR */}
        {emailOTPError && (
          <p className="text-red-500 text-sm mt-2">
            Failed to send OTP. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
