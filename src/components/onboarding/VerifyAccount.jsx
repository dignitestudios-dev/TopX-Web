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
  const { isLoading, emailOTPLoading, emailVerifyLoading } = useSelector(
    (state) => state.onboarding
  );
  const { user } = useSelector((state) => state.auth);

  console.log(user, "userdata");

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
    if (!user?.isEmailVerified) {
      ErrorToast("Please verify your email first");
      return;
    }

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

    if (isType === "email") {
      res = await dispatch(
        verifyEmailOTP({
          endPoint: `referral=https://topx.com/referral?code=${referalCode}`,
          otp: code,
        })
      );
    } else {
      res = await dispatch(
        verifyPhoneOTP({
          endPoint: `referral=https://topx.com/referral?code=${referalCode}`,
          otp: code,
        })
      );
    }

    if (res.meta.requestStatus === "fulfilled") {
      const verificationMsg =
        isType === "email"
          ? "Email Verified Successfully"
          : "Phone Verified Successfully";
      SuccessToast(verificationMsg);
      setIsModalOpen(false);
      handleNext(); // NEXT SCREEN
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
            To secure your account, please verify your identity.
          </p>
        </div>

        <div className="w-full md:w-[700px] flex  justify-between items-center gap-4">
          {/* EMAIL VERIFICATION */}
          <Card
            onClick={handleEmailClick}
            className="w-[24em] flex cursor-pointer justify-between items-center bg-[#F9FAFA] rounded-[12px] h-[80px] p-4"
          >
            <div className="flex items-center  gap-4">
              <img src={emailimag} alt="" className="w-[34px] h-[34px]" />
              <p className="flex flex-col text-[15px] font-[500] text-wrap">
                Email address
                <span className="text-[12px] text-wrap font-[400] text-[#717171CC]">
                  {email}
                </span>
              </p>
            </div>
            <button className="bg-[#F85E00] text-white px-2 py-2 rounded-full">
              <IoIosArrowForward />
            </button>
          </Card>

          {/* PHONE VERIFICATION */}
          <Card
            onClick={handlePhoneClick}
            className={`w-[24em] flex cursor-pointer justify-between items-center bg-[#F9FAFA] rounded-[12px] h-[80px] p-4 ${
              !user?.isEmailVerified ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <img src={mobile} alt="" className="w-[34px] h-[34px]" />
              <p className="flex flex-col text-[15px] font-[500]">
                Phone number
                <span className="text-[12px] text-[#717171CC]">{phone}</span>
              </p>
            </div>
            <button className="bg-[#F85E00] text-white px-2 py-2 rounded-full">
              <IoIosArrowForward />
            </button>
          </Card>
        </div>

        <Button
          onClick={handleNext}
          variant="orange"
          size="full"
          loading={isLoading || emailOTPLoading || emailVerifyLoading}
          disabled={!user?.isEmailVerified} // 🔥 Email is compulsory, Phone is optional
          className={`w-full flex items-center justify-center ${
            !user?.isEmailVerified ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isLoading || emailOTPLoading || emailVerifyLoading
            ? "Sending OTP..."
            : "Next"}
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
