import { FiPlus } from "react-icons/fi";
import { auth } from "../../assets/export";
import { useState } from "react";
import { useFormik } from "formik";
import { PersonalValues } from "../../init/onboarding/signupValues";
import Button from "../common/Button";
import { BiArrowBack } from "react-icons/bi";
import Input from "../common/Input";
import { PersonalSchema } from "../../schema/onboarding/PersonalSchema";
import { useDispatch, useSelector } from "react-redux";
import { checkUsername, completeProfile } from "../../redux/slices/onboarding.slice";
import { ErrorToast, SuccessToast } from "../global/Toaster";

export default function PersonalDetails({ handleNext, handlePrevious }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.onboarding);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValue,
  } = useFormik({
    initialValues: PersonalValues,
    validationSchema: PersonalSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      // ---------- STEP 1: Check Username ----------
      const usernameRes = await dispatch(checkUsername(values.username));

      if (usernameRes.meta.requestStatus !== "fulfilled") {
        ErrorToast(usernameRes.payload || "Username not available");
        return;
      }

      SuccessToast("Username available");

      // ---------- STEP 2: Complete Profile ----------
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("name", values.name);
      formData.append("dob", values.dateOfBirth);
      formData.append("gender", values.gender);
      formData.append("bio", values.bio || "");

      if (imageFile) {
        formData.append("profilePicture", imageFile);
      }

      const profileRes = await dispatch(completeProfile(formData));

      if (profileRes.meta.requestStatus !== "fulfilled") {
        ErrorToast(profileRes.payload || "Failed to complete profile");
        return;
      }

      SuccessToast("Profile completed successfully");

      handleNext(); // GO TO NEXT STEP
    },
  });

  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6 ">
      <div className="absolute left-4 top-8 transform -translate-y-1/2">
        <BiArrowBack onClick={handlePrevious} />
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-4">
        <img src={auth} alt="orange_logo" className="w-[100px]" />

        <h2 className="text-[24px] md:text-[32px] font-bold ">
          Add Personal Details
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="flex flex-col justify-center items-center text-center gap-3">
            <Input
              id="file"
              size="md"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleImageChange(e);
                setFieldValue("profileImage", e.target.files[0]); // REQUIRED
              }}
              preview={imagePreview}
              name="profileImage"
              onBlur={handleBlur}
              touched={touched.profileImage}
              error={errors.profileImage}
              fileClassName="w-[120px] h-[120px]"
            />
            <p className="text-[14px] font-[500] text-[#f85e00]">
              Upload Profile Photo
            </p>
          </div>

          <div className="w-full md:w-[500px] flex flex-col gap-3">
            {/* Username */}
            <Input
              label="Username"
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Username"
              touched={touched.username}
              error={errors.username}
              size="md"
            />

            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your name"
              touched={touched.name}
              error={errors.name}
              size="md"
            />


            {/* Date of Birth */}
            <Input
              label="Date Of Birth"
              type="date"
              name="dateOfBirth"
              value={values.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.dateOfBirth}
              error={errors.dateOfBirth}
              size="md"
            />

            {/* Gender */}
            <Input
              label="Gender"
              type="radio"
              name="gender"
              value={values.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.gender}
              error={errors.gender}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              size="md"
            />

            {/* Bio */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-[500]">
                My Bio <span>(optional)</span>
              </label>
              <textarea
                name="bio"
                value={values.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={250}
                placeholder="My Bio"
                className="w-full h-[143px] border bg-[#F8F8F899] outline-none rounded-[12px] p-2 text-[16px] resize-none"
              ></textarea>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="full"
            className="w-full flex items-center justify-center mt-3"
            variant="orange"
          >
            {isLoading ? "Processing..." : "Next"}
          </Button>
        </form>
      </div>
    </div>
  );
}
