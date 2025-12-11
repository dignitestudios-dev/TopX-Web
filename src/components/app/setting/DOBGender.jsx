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
  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        dob:user?.dob || "",
        gender:user?.gender || "",
      },
      validationSchema: changeDOBGenderSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: (values) => {
        if (values.dateOfBirth && values.gender) {
          const data = {
            username: user?.username,
            dob: values.dateOfBirth,
            gender: values.gender,
          };
          dispatch(completeProfile(data));
          setOpenModal(!openModal);
          console.log(values);
        }
      },
    });

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
            id="dateOfBirth"
            name="dateOfBirth"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.dateOfBirth}
            error={errors.dateOfBirth}
            touched={touched.dateOfBirth}
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
          className="w-full flex justify-center items-center"
          // onClick={() => setOpenModal(!openModal)}
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
