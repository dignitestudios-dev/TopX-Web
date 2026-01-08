import { changeDOBGenderSchema } from "../../../schema/authentication/dummyLoginSchema";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormik } from "formik";
import { useState } from "react";
import SuccessModal from "../../common/Modal";
import { changeDOBGenderValues } from "../../../init/authentication/dummyLoginValues";
import { completeProfile } from "../../../redux/slices/onboarding.slice";
import { useDispatch, useSelector } from "react-redux";

export default function DOBGender() {
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  // ✅ Extract date from ISO string (2026-01-13T00:00:00.000Z -> 2026-01-13)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        dob: formatDate(user?.dob) || "",
        gender: user?.gender || "",
      },
      validationSchema: changeDOBGenderSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: (values) => {
        if (values.dob && values.gender) {
          const data = {
            username: user?.username,
            dob: values.dob,
            gender: values.gender,
          };
          dispatch(completeProfile(data));
          setOpenModal(!openModal);
          console.log(values);
        }
      },
    });

  console.log(user, "usersusersusers");

  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        DOB & Gender
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="w-[500px] flex flex-col gap-4">
          <Input
            label="Date of Birth"
            type="date"
            placeholder="Enter your date of birth"
            variant="default"
            size="md"
            id="dob"
            name="dob"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.dob}
            error={errors.dob}
            touched={touched.dob}
          />
          <Input
            label="Gender"
            type="radio"
            placeholder="Enter your gender"
            variant="default"
            size="md"
            id="gender"
            name="gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.gender}
            error={errors.gender}
            touched={touched.gender}
          />
        </div>
        <Button
          type="submit"
          size="full"
          variant="orange"
          className="!w-[32em] flex justify-center items-center"
        >
          Save
        </Button>
      </form>
      <SuccessModal
        isOpen={openModal}
        onClose={() => setOpenModal(!openModal)}
        heading="Personal Details updated!"
        message="Your personal details has been updated successfully."
        autoCloseDuration={2000}
      />
    </div>
  );
}