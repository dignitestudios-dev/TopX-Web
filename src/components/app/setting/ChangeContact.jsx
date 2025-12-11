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
  sendOtp,
  updateNewPhone,
  verifyNew,
  verifyOld,
} from "../../../redux/slices/profileSetting.slice";

export default function ChangeContact() {
  const dispatch = useDispatch();
  const { loading, error, stage } = useSelector((s) => s.changePhone || {});

  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const [step, setStep] = useState("old");

  const formik = useFormik({
    initialValues: {
      phone: "",
    },
    validationSchema: changeNumberSchema,
    onSubmit: (vals) => {
      if (step === "old") {
        dispatch(sendOtp({ phone: vals.phone }))
          .unwrap()
          .then(() => {
            setOpenModal(true);
          });
      } else if (step === "new") {
        dispatch(updateNewPhone({ phone: vals.phone }))
          .unwrap()
          .then(() => {
            dispatch(sendOtp({ phone: vals.phone })) // send OTP to new phone
              .unwrap()
              .then(() => {
                setStep("new-otp");
                setOpenModal(true);
              });
          });
      }
    },
  });

  const handleVerify = (otp) => {
    if (step === "old") {
      dispatch(verifyOld({ otp }))
        .unwrap()
        .then(() => {
          setOpenModal(false);
          setStep("new");
          formik.setFieldValue("phone", ""); // clear old phone input
        });
    } else if (step === "new-otp") {
      dispatch(verifyNew({ otp }))
        .unwrap()
        .then(() => {
          setOpenModal(false);
          setOpenSuccessModal(true);

          setTimeout(() => {
            setOpenSuccessModal(false);
            dispatch(resetChangePhone());
            setStep("old"); // reset flow
            formik.resetForm();
          }, 1500);
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
          label={step === "old" ? "Current Phone Number" : "New Phone Number"}
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
        />

        <Button
          type="submit"
          size="full"
          variant="orange"
          className="w-full flex justify-center items-center"
          disabled={loading}
        >
          {loading
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
