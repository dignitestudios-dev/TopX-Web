import { useFormik } from "formik";
import Input from "../../common/Input";
import Button from "../../common/Button";
import VerificationModal from "../../authentication/VerificationModal";
import { useState, useEffect } from "react";
import { changeEmailSchema } from "../../../schema/authentication/dummyLoginSchema";
import SuccessModal from "../../common/Modal";
import { useSelector, useDispatch } from "react-redux";
import {
  sendOtpToOldEmail,
  verifyOldEmailOtp,
  sendOtpToNewEmail,
  verifyNewEmailOtp,
  resetChangeEmail,
} from "../../../redux/slices/changeemail.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";

export default function ChangeEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((s) => s.changeEmail || {});
  const { user } = useSelector((state) => state.auth);

  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [step, setStep] = useState("old"); // old | new
  const [newEmail, setNewEmail] = useState("");

  // 🔴 Error Toast
  useEffect(() => {
    if (error) {
      ErrorToast(error?.message || "Something went wrong");
      dispatch(resetChangeEmail());
    }
  }, [error, dispatch]);

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    initialValues: { email: "" },
    validationSchema: changeEmailSchema,
    onSubmit: (values) => {
      if (step === "old") {
        dispatch(sendOtpToOldEmail({ email: user?.email }))
          .unwrap()
          .then(() => {
            SuccessToast("OTP sent to your current email");
            setOpenModal(true);
          });
      }

      if (step === "new") {
        setNewEmail(values.email);
        dispatch(sendOtpToNewEmail({ email: values.email }))
          .unwrap()
          .then(() => {
            SuccessToast("OTP sent to your new email");
            setOpenModal(true);
          });
      }
    },
  });

  // 🔁 Update input field
  useEffect(() => {
    if (step === "old") {
      setFieldValue("email", user?.email || "");
    } else {
      setFieldValue("email", "");
    }
  }, [step, setFieldValue, user?.email]);

  // 🔐 OTP Verify
  const handleVerify = (otp) => {
    if (step === "old") {
      dispatch(verifyOldEmailOtp({ otp }))
        .unwrap()
        .then(() => {
          SuccessToast("Current email verified");
          setOpenModal(false);
          setStep("new");
        });
    }

    if (step === "new") {
      dispatch(verifyNewEmailOtp({ email: newEmail, otp }))
        .unwrap()
        .then(() => {
          SuccessToast("Email updated successfully");
          setOpenModal(false);
          setOpenSuccessModal(true);

          // ✅ LOGOUT + REDIRECT
          setTimeout(() => {
            Cookies.remove("access_token"); // 🔥 remove token
            dispatch(resetChangeEmail());
            navigate("/auth/login"); // 🔥 redirect to login
          }, 2000);
        });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Change Email
      </h1>

      <form onSubmit={handleSubmit} className="w-[500px] flex flex-col gap-2">
        <Input
          label={step === "old" ? "Verify Current Email" : "New Email Address"}
          type="email"
          placeholder={
            step === "old" ? "Your current email" : "Enter your new email"
          }
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          disabled={step === "old"}
          className="rounded-0 p-3"
        />

        <Button
          type="submit"
          size="full"
          variant="orange"
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : step === "old"
            ? "Send OTP to Current Email"
            : "Send OTP to New Email"}
        </Button>
      </form>

      <VerificationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onVerify={handleVerify}
        loading={isLoading}
      />

      <SuccessModal
        isOpen={openSuccessModal}
        heading="Email Changed"
        message="Please login again with your new email."
        autoCloseDuration={2000}
      />
    </div>
  );
}
