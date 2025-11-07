import { useFormik } from "formik";
import * as Yup from "yup";
import Input from "../../common/Input";
import Button from "../../common/Button";
import VerificationModal from "../../authentication/VerificationModal";
import { useState } from "react";
import { changeEmailSchema } from "../../../schema/authentication/dummyLoginSchema";
import SuccessModal from "../../common/Modal";
export default function ChangeEmail() {
  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        email: "",
      },
      validationSchema:changeEmailSchema,
      onSubmit: (values) => {
        setOpenModal(true);
        console.log(values);
      },
    });
    const handleVerificationClose = () => {
      setOpenModal(false);
      setOpenSuccessModal(true);
    };
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Change Email
      </h1>
      <form onSubmit={handleSubmit} className="w-[500px] flex flex-col gap-2">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          variant="default"
          size="md"
          id="email"
          name="email"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.email}
          error={errors.email}
          touched={touched.email}
        />
        <Button
          type="submit"
          size="full"
          variant="orange"
          className="w-full flex justify-center items-center"
        >
          Send OTP
        </Button>
      </form>
      <VerificationModal
        mode="delete"
        email={values.email}
        isVerifying={false}
        isOpen={openModal}
        length={4}
        onClose={handleVerificationClose}
      />
      <SuccessModal
        isOpen={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        heading="Email Changed"
        message="Your email has been changed successfully."
        autoCloseDuration={2000}
      />
    </div>
  );
}
