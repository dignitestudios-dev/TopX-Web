import { HiMail } from "react-icons/hi";
import { auth, emailimag, mobile } from "../../assets/export";
import { IoIosArrowForward } from "react-icons/io";
import VerificationModal from "./VerificationModal";
import { useState } from "react";
import { useLocation } from "react-router";
import Card from "../common/Card";
import Button from "../common/Button";
import { BiArrowBack } from "react-icons/bi";

import { useDispatch, useSelector } from "react-redux";
import {
  sendPhoneOTP,
  verifyPhoneOTP,
  sendEmailOTP,
  verifyEmailOTP,
} from "../../redux/slices/onboarding.slice";
import { ErrorToast, SuccessToast } from "../global/Toaster";

export default function VerifyAccount({
  email,
  phone,
  handleNext,
  handlePrevious,
  referalCode,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isType, setIsType] = useState("");
  const dispatch = useDispatch();
  const { isLoading, emailOTPLoading, emailVerifyLoading, otpVerified, emailVerified } = useSelector(
    (state) => state.onboarding
  );
  const { user } = useSelector((state) => state.auth);

  console.log(user, "userdata");

  // Check if both email and phone are verified
  const isEmailVerified = user?.isEmailVerified || emailVerified;
  const isPhoneVerified = user?.isPhoneVerified || otpVerified;
  const bothVerified = isEmailVerified && isPhoneVerified;

  // ⭐ EMAIL CARD CLICK + SEND OTP
  const handleEmailClick = async () => {
    const res = await dispatch(sendEmailOTP());
    if (res.meta.requestStatus === "fulfilled") {
      SuccessToast(res.payload || "OTP sent to email successfully");
      setIsType("email");
      setIsModalOpen(true);
    } else {
      ErrorToast(res.payload || "Unable to send email OTP");
    }
  };

  // ⭐ PHONE CARD CLICK + SEND OTP
  const handlePhoneClick = async () => {
    // Check if email is verified first
    // if (!user?.isEmailVerified) {
    //   ErrorToast("Please verify your email first");
    //   return;
    // }

    const res = await dispatch(sendPhoneOTP());
    if (res.meta.requestStatus === "fulfilled") {
      SuccessToast(res.payload || "OTP sent successfully");
      setIsType("phone");
      setIsModalOpen(true);
    } else {
      ErrorToast(res.payload || "Unable to send OTP");
    }
  };

  // ⭐ RESEND OTP (from modal)
  const handleResend = async () => {
    if (isType === "email") {
      const res = await dispatch(sendEmailOTP());
      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast(res.payload || "Email OTP sent again");
      } else {
        ErrorToast(res.payload || "Unable to send email OTP");
      }
    } else {
      const res = await dispatch(sendPhoneOTP());
      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast(res.payload || "OTP sent again");
      } else {
        ErrorToast(res.payload || "Unable to send OTP");
      }
    }
  };

  // ⭐ VERIFY OTP FUNCTION
  const handleVerifyOTP = async (code) => {
    let res;

    const payload = referalCode
      ? {
        otp: String(code),        // ✅ STRING
        referral: Number(referalCode),
      }
      : {
        otp: String(code),        // ✅ STRING
      };

    if (isType === "email") {
      res = await dispatch(verifyEmailOTP(payload));
    } else {
      res = await dispatch(verifyPhoneOTP(payload));
    }

    if (res.meta.requestStatus === "fulfilled") {
      SuccessToast(
        isType === "email"
          ? "Email Verified Successfully"
          : "Phone Verified Successfully"
      );
      setIsModalOpen(false);
      // Don't call handleNext here, let user verify both first
    } else {
      ErrorToast(res.payload || "Invalid OTP");
    }
  };

  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6 ">
      <div className="absolute left-4 top-8 transform -translate-y-1/2">
        <BiArrowBack onClick={handlePrevious} />
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-8">
        <img src={auth} alt="orange_logo" className="w-[100px]" />

        <div className="flex flex-col justify-center items-center text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold ">
            Verify Your Account
          </h2>
          <p className="text-[14px] text-[#565656]">
            For your account's security, please verify both your email and phone number.
          </p>
        </div>

        <div className="w-full md:w-[700px] flex  justify-between items-center gap-4">
          {/* EMAIL VERIFICATION */}
          <Card
            onClick={!isEmailVerified ? handleEmailClick : undefined}
            className={`w-[24em] flex justify-between items-center rounded-[12px] h-[80px] p-4 ${
              isEmailVerified 
                ? "bg-green-50 border-2 border-green-500 cursor-default" 
                : "bg-[#F9FAFA] cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={emailimag} alt="" className="w-[34px] h-[34px]" />
              <p className="flex flex-col text-[15px] font-[500] text-wrap">
                Email address
                <span className="text-[12px] text-wrap font-[400] text-[#717171CC]">
                  {email}
                </span>
                {isEmailVerified && (
                  <span className="text-[12px] text-green-600 font-medium mt-1">✓ Verified</span>
                )}
              </p>
            </div>
            {!isEmailVerified ? (
              <button className="bg-[#F85E00] text-white px-2 py-2 rounded-full">
                <IoIosArrowForward />
              </button>
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </Card>

          {/* PHONE VERIFICATION */}
          <Card
            onClick={!isPhoneVerified ? handlePhoneClick : undefined}
            className={`w-[24em] flex justify-between items-center rounded-[12px] h-[80px] p-4 ${
              isPhoneVerified 
                ? "bg-green-50 border-2 border-green-500 cursor-default" 
                : "bg-[#F9FAFA] cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={mobile} alt="" className="w-[34px] h-[34px]" />
              <p className="flex flex-col text-[15px] font-[500]">
                Phone number
                <span className="text-[12px] text-[#717171CC]">+1 {phone}</span>
                {isPhoneVerified && (
                  <span className="text-[12px] text-green-600 font-medium mt-1">✓ Verified</span>
                )}
              </p>
            </div>
            {!isPhoneVerified ? (
              <button className="bg-[#F85E00] text-white px-2 py-2 rounded-full">
                <IoIosArrowForward />
              </button>
            ) : (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </Card>
        </div>

        <Button
          onClick={handleNext}
          variant="orange"
          size="full"
          loading={isLoading || emailOTPLoading || emailVerifyLoading}
          disabled={!bothVerified} // 🔥 Both Email and Phone must be verified
          className={`w-full flex items-center justify-center ${!bothVerified ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
          {isLoading || emailOTPLoading || emailVerifyLoading
            ? "Sending OTP..."
            : bothVerified
            ? "Next"
            : "Please verify both email and phone"}
        </Button>
      </div>

      {/* OTP MODAL */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isType={isType}
        phone={phone}
        email={email}
        onVerify={handleVerifyOTP}
        onResend={handleResend}
        isVerifying={isLoading || emailOTPLoading || emailVerifyLoading}
      />
    </div>
  );
}
