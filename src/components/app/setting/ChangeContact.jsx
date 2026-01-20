import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../common/Input";
import Button from "../../common/Button";
import VerificationModal from "../../authentication/VerificationModal";
import SuccessModal from "../../common/Modal";
import { changeNumberSchema } from "../../../schema/authentication/dummyLoginSchema";
import {
  resetChangePhone,
  resetProfileSetting,
  sendOtp,
  updateNewPhone,
  verifyNew,
  verifyOld,
} from "../../../redux/slices/profileSetting.slice";
import { ErrorToast, SuccessToast } from "../../global/Toaster";

export default function ChangeContact() {
  const dispatch = useDispatch();
  const { isLoading, error, stage } = useSelector((s) => s.profileSetting || {});

  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState("old");

  console.log(user, "user");

  // ✅ Show error toast when error occurs
  useEffect(() => {
    if (error && !showError) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Something went wrong!";
      ErrorToast(errorMessage);
      setShowError(true);

      // Reset error state after showing
      setTimeout(() => {
        setShowError(false);
        dispatch(resetProfileSetting()); // ✅ Reset error state
      }, 3000);
    }
  }, [error, showError, dispatch]);

  const formik = useFormik({
    initialValues: {
      // ✅ Show only last 10 digits in input
      phone: step === "old" ? (user?.phone ? user.phone.replace(/\D/g, "").slice(-10) : "") : "",
    },
    validationSchema: changeNumberSchema,
    onSubmit: (vals) => {
      if (step === "old") {
        dispatch(sendOtp({ phone: vals.phone }))
          .unwrap()
          .then(() => {
            SuccessToast("OTP sent to your phone!");
            setOpenModal(true);
          })
          .catch((err) => {
            ErrorToast(err?.message || "Failed to send OTP");
          });
      } else if (step === "new") {
        dispatch(updateNewPhone({ phone: vals.phone }))
          .unwrap()
          .then(() => {
            SuccessToast("New phone number registered!");
            dispatch(sendOtp({ phone: vals.phone }))
              .unwrap()
              .then(() => {
                SuccessToast("OTP sent to new phone!");
                setStep("new-otp");
                setOpenModal(true);
              })
              .catch((err) => {
                ErrorToast(err?.message || "Failed to send OTP");
              });
          })
          .catch((err) => {
            ErrorToast(err?.message || "Failed to update phone number");
          });
      }
    },
  });

  // ✅ Update phone field when step changes
  useEffect(() => {
    if (step === "old") {
      // ✅ Show only last 10 digits (remove first 1 if it's +1)
      const phoneOnly = user?.phone ? user.phone.replace(/\D/g, "").slice(-10) : "";
      formik.setFieldValue("phone", phoneOnly);
    } else if (step === "new") {
      formik.setFieldValue("phone", "");
    }
  }, [step]);

  const handleVerify = (otp) => {
    if (step === "old") {
      dispatch(verifyOld({ otp }))
        .unwrap()
        .then(() => {
          SuccessToast("Old phone verified successfully!");
          setOpenModal(false);
          setStep("new");
        })
        .catch((err) => {
          ErrorToast(err?.message || "OTP verification failed");
        });
    } else if (step === "new-otp") {
      dispatch(verifyNew({ otp }))
        .unwrap()
        .then(() => {
          SuccessToast("New phone verified successfully!");
          setOpenModal(false);
          setOpenSuccessModal(true);

          setTimeout(() => {
            setOpenSuccessModal(false);
            dispatch(resetChangePhone());
            setStep("old"); // reset flow
            formik.resetForm();
          }, 1500);
        })
        .catch((err) => {
          ErrorToast(err?.message || "OTP verification failed");
        });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Change Contact
      </h1>

      

      <form
        onSubmit={formik.handleSubmit}
        className="w-[500px] flex flex-col gap-2"
      >
        <Input
          label={
            step === "old"
              ? "Verify Current Phone Number"
              : "New Phone Number"
          }
          type="tel"
          placeholder={
            step === "old"
              ? "Enter current phone number"
              : "Enter new phone number"
          }
          variant="default"
          size="md"
          id="phone"
          name="phone"
          showCountrySelector={true}
          value={formik.values.phone}
          onBlur={formik.handleBlur}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
            formik.setFieldValue("phone", onlyDigits);
          }}
          error={formik.errors.phone}
          touched={formik.touched.phone}
          disabled={step === "old"} // ✅ Disable input in old step (read-only)
        />

        {/* ✅ Show error message below input if there's an error */}
        {error && (
          <p className="text-red-500 text-sm mt-1">
            {typeof error === "string" ? error : error?.message || "An error occurred"}
          </p>
        )}

        <Button
          type="submit"
          size="full"
          variant="orange"
          className="w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {/* ✅ Show loading state */}
          {isLoading
            ? "Processing..."
            : step === "old"
            ? "Verify Old Phone"
            : "Send OTP to New Phone"}
        </Button>
      </form>

      <VerificationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onVerify={handleVerify}
        loading={isLoading} // ✅ Pass loading state to modal
      />

      <SuccessModal
        isOpen={openSuccessModal}
        heading="Phone Number Updated"
        message="Your phone has been successfully changed."
        onClose={() => setOpenSuccessModal(false)}
        autoCloseDuration={1500}
      />
    </div>
  );
}