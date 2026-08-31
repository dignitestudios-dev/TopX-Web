import { auth, emailimag, mobile } from "../../assets/export";
import { IoIosArrowForward } from "react-icons/io";
import VerificationModal from "./VerificationModal";
import { useState, useEffect } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import { BiArrowBack } from "react-icons/bi";
import { FiLoader } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  sendPhoneOTP,
  verifyPhoneOTP,
  sendEmailOTP,
  verifyEmailOTP,
} from "../../redux/slices/onboarding.slice";
import { getAllUserData } from "../../redux/slices/auth.slice";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import { formatPhoneNumber } from "../../lib/helpers";

export default function VerifyAccount({
  email,
  phone,
  setPhone,
  handleNext,
  handlePrevious,
  referalCode,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isType, setIsType] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const dispatch = useDispatch();
  const { isLoading, emailOTPLoading, emailVerifyLoading, otpVerified, emailVerified } = useSelector(
    (state) => state.onboarding
  );
  const { user, allUserData } = useSelector((state) => state.auth);
  const currentUser = allUserData || user;
  const displayEmail = email || currentUser?.email || "";

  // Local state for editable phone number
  const initialPhone = formatPhoneNumber(phone || currentUser?.phone || "");
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);

  // Sync phone number if props or currentUser updates
  useEffect(() => {
    const rawVal = phone || currentUser?.phone;
    if (rawVal && !phoneNumber) {
      setPhoneNumber(formatPhoneNumber(rawVal));
    }
  }, [phone, currentUser?.phone]);

  // Check if both email and phone are verified
  const isEmailVerified = Boolean(currentUser?.isEmailVerified || emailVerified);
  const isPhoneVerified = Boolean(currentUser?.isPhoneVerified || otpVerified);
  const bothVerified = isEmailVerified && isPhoneVerified;

  // ⭐ EMAIL CARD CLICK + SEND OTP
  const handleEmailClick = async () => {
    const res = await dispatch(sendEmailOTP());
    if (res.meta.requestStatus === "fulfilled") {
      SuccessToast(res.payload || "OTP sent to email successfully");
      setIsType("email");
      setIsModalOpen(true);
      setResendTimer(30); // Start 30 second timer
    } else {
      ErrorToast(res.payload || "Unable to send email OTP");
    }
  };

  // ⭐ PHONE NUMBER CHANGE HANDLER
  const handlePhoneInputChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (phoneError) setPhoneError("");
    setPhone?.(formatted);
  };

  // ⭐ PHONE SEND OTP
  const handlePhoneSendOTP = async (e) => {
    if (e) e.preventDefault();

    let digitsOnly = phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
      digitsOnly = digitsOnly.slice(1);
    }

    if (!digitsOnly || digitsOnly.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }

    setPhoneError("");
    setIsSendingPhoneOtp(true);

    try {
      const res = await dispatch(sendPhoneOTP({ phone: digitsOnly }));
      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast(res.payload || "OTP sent to your phone successfully");
        setIsType("phone");
        setIsModalOpen(true);
        setResendTimer(30); // Start 30 second timer
      } else {
        ErrorToast(res.payload || "Unable to send OTP. Please check your phone number.");
      }
    } catch (err) {
      ErrorToast("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  // ⭐ RESEND OTP (from modal)
  const handleResend = async () => {
    if (isType === "email") {
      const res = await dispatch(sendEmailOTP());
      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast(res.payload || "Email OTP sent again");
        setResendTimer(30); // Reset timer to 30 seconds
      } else {
        ErrorToast(res.payload || "Unable to send email OTP");
      }
    } else {
      const res = await dispatch(sendPhoneOTP({ phone: phoneNumber }));
      if (res.meta.requestStatus === "fulfilled") {
        SuccessToast(res.payload || "Phone OTP sent again");
        setResendTimer(30); // Reset timer to 30 seconds
      } else {
        ErrorToast(res.payload || "Unable to send OTP");
      }
    }
  };

  // ⭐ TIMER COUNTDOWN EFFECT
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset timer when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setResendTimer(0);
    }
  }, [isModalOpen]);

  // ⭐ VERIFY OTP FUNCTION
  const handleVerifyOTP = async (code) => {
    let res;

    const payload = referalCode
      ? {
          otp: String(code), // ✅ STRING
          referral: Number(referalCode),
        }
      : {
          otp: String(code), // ✅ STRING
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
      dispatch(getAllUserData());
    } else {
      ErrorToast(res.payload || "Invalid OTP");
    }
  };

  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6">
      <div className="absolute left-4 top-8 transform -translate-y-1/2">
        <button
          type="button"
          onClick={handlePrevious}
          className="p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <BiArrowBack className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-6 lg:gap-8 max-w-[760px]">
        <img src={auth} alt="logo" className="w-[100px]" />

        <div className="flex flex-col justify-center items-center text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#181818]">
            Verify Your Account
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#565656] mt-1 max-w-[500px]">
            For your account's security, please verify both your email and phone number.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* EMAIL VERIFICATION */}
          <Card
            onClick={!isEmailVerified ? handleEmailClick : undefined}
            className={`w-full flex justify-between items-center rounded-[16px] min-h-[80px] p-4 transition-all ${
              isEmailVerified
                ? "bg-green-50/80 border border-green-500 cursor-default"
                : "bg-[#F9FAFA] hover:bg-[#f3f4f6] border border-gray-200 cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <img src={emailimag} alt="email icon" className="w-[38px] h-[38px] flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-[600] text-[#181818]">
                  Email address
                </span>
                <span className="text-[13px] font-[400] text-[#717171] truncate max-w-[280px] sm:max-w-[400px]">
                  {displayEmail || "No email address"}
                </span>
                {isEmailVerified && (
                  <span className="text-[12px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            {!isEmailVerified ? (
              <button
                type="button"
                className="bg-[#F85E00] hover:bg-[#e05400] text-white w-9 h-9 flex items-center justify-center rounded-full transition-colors flex-shrink-0"
              >
                <IoIosArrowForward className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            )}
          </Card>

          {/* PHONE VERIFICATION SECTION */}
          {isPhoneVerified ? (
            <Card
              className="w-full flex justify-between items-center rounded-[16px] min-h-[80px] p-4 bg-green-50/80 border border-green-500 cursor-default"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img src={mobile} alt="mobile icon" className="w-[38px] h-[38px] flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[15px] font-[600] text-[#181818]">
                    Phone number
                  </span>
                  <span className="text-[13px] font-[400] text-[#717171]">
                    +1 {formatPhoneNumber(currentUser?.phone || phoneNumber || phone)}
                  </span>
                  <span className="text-[12px] text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                    ✓ Verified
                  </span>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </Card>
          ) : (
            <div className="w-full bg-[#F9FAFA] border border-gray-200 rounded-[16px] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={mobile} alt="mobile icon" className="w-[32px] h-[32px] flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[15px] font-[600] text-[#181818]">
                    Phone number
                  </span>
                  <span className="text-[12px] text-[#717171]">
                    Enter your phone number to receive an SMS verification code
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
                <div className="flex-1 flex gap-2">
                  <div className="flex items-center px-3 gap-2 py-2 border border-gray-300 rounded-xl bg-white min-w-fit select-none shadow-sm">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/de/Flag_of_the_United_States.png"
                      className="w-6 h-4 object-cover rounded-sm shadow-xs"
                      alt="US Flag"
                    />
                    <span className="text-sm font-semibold text-gray-700">+1</span>
                  </div>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phoneNumber}
                    onChange={handlePhoneInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePhoneSendOTP(e);
                      }
                    }}
                    placeholder="(555) 000-0000"
                    maxLength={14}
                    className={`w-full px-3.5 py-2 text-[15px] font-medium bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85E00] shadow-sm transition-all ${
                      phoneError
                        ? "border-red-500 bg-red-50/50 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePhoneSendOTP}
                  disabled={isSendingPhoneOtp || isLoading || emailOTPLoading}
                  className="h-[42px] px-5 bg-[#F85E00] hover:bg-[#e05400] text-white text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm cursor-pointer"
                >
                  <span>{isSendingPhoneOtp ? "Sending..." : "Send Code"}</span>
                  {isSendingPhoneOtp ? (
                    <FiLoader className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <IoIosArrowForward className="w-4 h-4" />
                  )}
                </button>
              </div>

              {phoneError && (
                <p className="text-red-500 text-xs font-medium pl-1">{phoneError}</p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleNext}
          variant="orange"
          size="full"
          loading={isLoading || emailOTPLoading || emailVerifyLoading}
          disabled={!bothVerified} // 🔥 Both Email and Phone must be verified
          className={`!w-full max-w-[420px] h-[50px] text-[16px] font-semibold flex items-center justify-center mt-2 ${
            !bothVerified ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isLoading || emailOTPLoading || emailVerifyLoading
            ? "Verifying..."
            : bothVerified
            ? "Next"
            : !isEmailVerified && !isPhoneVerified
            ? "Please verify both email and phone"
            : !isEmailVerified
            ? "Please verify your email"
            : "Please verify your phone number"}
        </Button>
      </div>

      {/* OTP MODAL */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isType={isType}
        phone={phoneNumber || phone || currentUser?.phone || ""}
        email={displayEmail}
        onVerify={handleVerifyOTP}
        onResend={handleResend}
        isVerifying={isLoading || emailOTPLoading || emailVerifyLoading}
        resendTimer={resendTimer}
        setResendTimer={setResendTimer}
      />
    </div>
  );
}
