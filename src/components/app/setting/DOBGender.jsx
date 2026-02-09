import { changeDOBGenderSchema } from "../../../schema/authentication/dummyLoginSchema";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormik } from "formik";
import { useState } from "react";
import SuccessModal from "../../common/Modal";
import { changeDOBGenderValues } from "../../../init/authentication/dummyLoginValues";
import { completeProfile } from "../../../redux/slices/onboarding.slice";
import { updateUserLocally } from "../../../redux/slices/auth.slice";
import { useDispatch, useSelector } from "react-redux";

export default function DOBGender() {
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  // ✅ Extract date from ISO string (2026-01-13T00:00:00.000Z -> 2026-01-13)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      enableReinitialize: true,
      initialValues: (() => {
        const rawGender = user?.gender || "";
        const isStandardGender =
          rawGender.toLowerCase() === "male" ||
          rawGender.toLowerCase() === "female";

        return {
          dob: formatDate(user?.dob) || "",
          // If gender is not strictly "male" or "female", map it to "other"
          // and pre-fill the customGender field with the actual value
          gender: isStandardGender ? rawGender.toLowerCase() : rawGender ? "other" : "",
          customGender: !isStandardGender && rawGender ? rawGender : "",
        };
      })(),
      validationSchema: changeDOBGenderSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        if (values.dob && values.gender) {
          // If user selected "Other" and typed a custom gender, send that to API
          let finalGender = values.gender;
          if (
            values.gender === "other" &&
            values.customGender &&
            values.customGender.trim()
          ) {
            finalGender = values.customGender.trim();
          }

          const data = {
            username: user?.username,
            dob: values.dob,
            gender: finalGender,
          };

          try {
            setSaving(true);

            // ✅ Update DOB & gender in backend (if API is working)
            await dispatch(completeProfile(data)).unwrap();

            // ✅ Locally update Redux auth.user so UI reflects changes immediately
            dispatch(
              updateUserLocally({
                dob: values.dob,
                gender: finalGender,
              })
            );

            setOpenModal(true);
          } catch (error) {
            console.error("Failed to update DOB/Gender:", error);
          } finally {
            setSaving(false);
          }
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
          {/* Custom gender input when "Other" is selected */}
          {values.gender === "other" && (
            <Input
              
              type="text"
              placeholder="Specify here"
              variant="default"
              size="md"
              id="customGender"
              name="customGender"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.customGender}
              error={errors.customGender}
              touched={touched.customGender}
            />
          )}
        </div>
        <Button
          type="submit"
          size="full"
          variant="orange"
          loading={saving}
          disabled={saving}
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