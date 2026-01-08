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

  // State to track selected gender and 'Other' input
  const [selectedGender, setSelectedGender] = useState("");

  // State for username checking
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'unavailable', null

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCheckUsername = async () => {
    if (!values.username || values.username.trim() === "") {
      ErrorToast("Please enter a username first");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameSuggestions([]);
    setUsernameStatus(null);

    try {
      const usernameRes = await dispatch(checkUsername(values.username));

      if (usernameRes.meta.requestStatus === "fulfilled") {
        setUsernameStatus("available");
        SuccessToast("Username available");
      } else {
        setUsernameStatus("unavailable");
        // Check if suggestions are available
        if (usernameRes.payload?.suggestions && Array.isArray(usernameRes.payload.suggestions)) {
          setUsernameSuggestions(usernameRes.payload.suggestions);
          ErrorToast(usernameRes.payload.message || "Username not available");
        } else {
          ErrorToast(usernameRes.payload?.message || usernameRes.payload || "Username not available");
        }
      }
    } catch (error) {
      ErrorToast("Failed to check username");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setFieldValue("username", suggestion);
    setUsernameSuggestions([]);
    setUsernameStatus(null);
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
      // Only check if not already checked and available
      if (usernameStatus !== "available") {
        const usernameRes = await dispatch(checkUsername(values.username));

        if (usernameRes.meta.requestStatus !== "fulfilled") {
          // Check if suggestions are available
          if (usernameRes.payload?.suggestions && Array.isArray(usernameRes.payload.suggestions)) {
            setUsernameSuggestions(usernameRes.payload.suggestions);
            ErrorToast(usernameRes.payload.message || "Username not available");
          } else {
            ErrorToast(usernameRes.payload?.message || usernameRes.payload || "Username not available");
          }
          return;
        }

        SuccessToast("Username available");
      }

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
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-[500]">Username</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    name="username"
                    value={values.username}
                    onChange={(e) => {
                      handleChange(e);
                      setUsernameStatus(null);
                      setUsernameSuggestions([]);
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter your username here"
                    touched={touched.username}
                    error={errors.username}
                    size="md"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={isCheckingUsername || !values.username || values.username.trim() === "" || usernameStatus === "available"}
                  className="px-4 py-2 bg-[#f85e00] text-white rounded-[12px] font-medium text-[14px] hover:bg-[#e05600] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isCheckingUsername ? "Checking..." : "Check"}
                </button>
              </div>
              {/* Username Status Indicator */}
              {usernameStatus === "available" && (
                <p className="text-[12px] text-green-600 font-medium">✓ Username is available</p>
              )}
              {usernameStatus === "unavailable" && (
                <p className="text-[12px] text-red-600 font-medium">✗ Username is not available</p>
              )}
              {/* Username Suggestions */}
              {usernameSuggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-[12px] font-medium text-gray-700">Suggested usernames:</p>
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="px-3 py-1.5 bg-[#F8F8F8] hover:bg-[#f85e00] hover:text-white text-[#f85e00] rounded-[8px] text-[12px] font-medium transition-colors border border-[#f85e00]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-[500]">Gender</label>
              <div className="flex flex-col gap-3 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={values.gender === "male"}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedGender("male");
                    }}
                    className="w-4 h-4 text-[#f85e00] border-gray-300 focus:ring-[#f85e00] focus:ring-2 cursor-pointer accent-[#f85e00]"
                  />
                  <span className="text-[14px] font-[400]">Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={values.gender === "female"}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedGender("female");
                    }}
                    className="w-4 h-4 text-[#f85e00] border-gray-300 focus:ring-[#f85e00] focus:ring-2 cursor-pointer accent-[#f85e00]"
                  />
                  <span className="text-[14px] font-[400]">Female</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={values.gender === "other"}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedGender("other");
                    }}
                    className="w-4 h-4 text-[#f85e00] border-gray-300 focus:ring-[#f85e00] focus:ring-2 cursor-pointer accent-[#f85e00]"
                  />
                  <span className="text-[14px] font-[400]">Other</span>
                </label>
              </div>

              {/* Conditionally show input if "Other" is selected */}
              {selectedGender === "other" && (
                <div className="flex flex-col gap-1 mt-2">
                  <Input
                    label="Specify Gender"
                    type="text"
                    name="genderOther"
                    value={values.genderOther}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Specify here"
                    touched={touched.genderOther}
                    error={errors.genderOther}
                    size="md"
                  />
                </div>
              )}
            </div>


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
