import { useEffect, useState } from "react";
import VerificationModal from "../../authentication/VerificationModal";
import Button from "../../common/Button";
import SuccessModal from "../../common/Modal";
import { useDispatch, useSelector } from "react-redux";
import { sendEmailOTP } from "../../../redux/slices/onboarding.slice";
import { useNavigate } from "react-router";
import { deleteAccount } from "../../../redux/slices/profileSetting.slice";

export default function DeleteAccount() {
  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { emailOTPError, emailOTPLoading, emailOTPSuccess } = useSelector((state) => state.onboarding);

  const { user } = useSelector((state) => state.auth);

  const handleVerificationClose = () => {
    setOpenModal(false);
    setOpenSuccessModal(true);
  };

  // Dispatch the OTP API call when "Send Code" is clicked
  const handleSendCode = () => {
    dispatch(sendEmailOTP()); // Send OTP to the user's email
  };

  // Effect to show modal once OTP is successfully sent
  useEffect(() => {
    if (emailOTPSuccess) {
      setOpenModal(true); // Open verification modal once OTP is successfully sent
    }
  }, [emailOTPSuccess]);

  // Handle OTP verification
  const handleVerifyOTP = async (otp) => {
    try {
      await dispatch(deleteAccount(otp)); // Dispatch verification action
      setOpenSuccessModal(true); // Show success modal if OTP is verified
    } catch (error) {
      console.log("OTP verification failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">Delete Account</h1>

      <div className="w-[400px] space-y-2">
        <p>We will send a 5-digit code to {user?.email}</p>
        <p>Your data will be removed from our database permanently.</p>

        <Button
          size="lg"
          variant="orange"
          className="w-[300px] flex justify-center items-center"
          onClick={handleSendCode}
          disabled={emailOTPLoading} // Disable the button while OTP is loading
        >
          {emailOTPLoading ? "Sending..." : "Send Code"}
        </Button>

        {/* Show the verification modal only if the OTP has been sent successfully */}
        <VerificationModal
          isOpen={openModal}
          onClose={handleVerificationClose}
          email={user?.email}
          onVerify={handleVerifyOTP} // Pass the OTP verification handler
        />

        <SuccessModal
          isOpen={openSuccessModal}
          onClose={() => setOpenSuccessModal(false)}
          heading="Account deleted!"
          message="Your account has been deleted successfully."
          autoCloseDuration={2000}
        />

        {/* Show error message if there's an error in sending OTP */}
        {emailOTPError && (
          <p className="text-red-500 text-sm mt-2">
            Failed to send OTP. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
