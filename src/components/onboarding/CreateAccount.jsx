import React, { useState } from "react";
import { useFormik } from "formik";
import { NavLink, useNavigate } from "react-router";
import { FiLoader } from "react-icons/fi";
import { HiEye, HiEyeOff } from "react-icons/hi";
// import { auth } from "../../assets/export";
import { signupSchema } from "../../schema/onboarding/signupSchema";
import { signupValues } from "../../init/onboarding/signupValues";
import Button from "../common/Button";
import Input from "../common/Input";
import { useDispatch, useSelector } from "react-redux";
import { signUp } from "../../redux/slices/auth.slice";
import {
  auth,
  createUserWithEmailAndPassword
} from "../../firebase/firebase";
import { authlogo } from "../../assets/export";
import { ErrorToast, SuccessToast } from "../global/Toaster";
import Cookies from "js-cookie";



const CreateAccount = ({ handleNext, setEmail, setPhone }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error: reduxError, success } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(false);


  const {
    values,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    errors,
    touched,
    isValid,
  } = useFormik({
    initialValues: signupValues,
    validationSchema: signupSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      let firebaseUser = null;

      try {
        setLocalError(null);
        setFirebaseLoading(true);

        // Step 1: Firebase user create
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        firebaseUser = userCredential.user;

        const idToken = await firebaseUser.getIdToken();
        setFirebaseLoading(false);

        // Step 2: Prepare form data for backend
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);

        const rawPhone = values.phone.replace(/\D/g, "");
        formData.append("phone", `1${rawPhone}`);

        formData.append("password", values.password);
        formData.append("idToken", idToken);
        formData.append("role", "user");

        // Step 3: Backend signup API hit
        const response = await dispatch(signUp(formData));

        // IF BACKEND FAILED → DELETE FIREBASE USER
        if (response.meta.requestStatus !== "fulfilled") {
          if (firebaseUser) {
            await firebaseUser.delete();
          }

          return ErrorToast(
            typeof response.payload === "string"
              ? response.payload
              : "Signup failed, please try again."
          );
        }

        // SUCCESS
        SuccessToast(response.payload?.message || "Account created successfully");

        if (response.payload?.accessToken) {
          Cookies.set("access_token", response.payload.accessToken, {
            expires: 7,
            secure: false,
            sameSite: "lax",
          });
        }

        setEmail(values.email);
        setPhone(values.phone);
        handleNext();

      } catch (err) {
        setFirebaseLoading(false);

        // If Firebase user was created but error occurred → DELETE USER
        if (firebaseUser) {
          try {
            await firebaseUser.delete();
          } catch (deleteErr) {
            console.log("Failed to delete Firebase user", deleteErr);
          }
        }

        let errorMessage = err.message || "Signup failed";

        if (err.code === "auth/email-already-in-use") {
          errorMessage = "This email is already registered.";
        }

        ErrorToast(errorMessage);
      }
    }


  });

  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6">
      <div className="flex flex-col w-full items-center justify-center">
        <img src={authlogo} alt="logo" className="w-[100px]" />

        <div className="flex flex-col mt-4 justify-center items-center">
          <h2 className="text-[32px] font-bold leading-[48px]">Sign Up</h2>
          <p className="text-[18px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
            Please enter your details to sign up.
          </p>
        </div>

        {/* Error Alert */}
        {/* {(localError || reduxError) && (
          <div className="w-full md:w-[500px] mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm font-medium">
              {localError || reduxError}
            </p>
          </div>
        )} */}

        {/* Success Alert */}
        {/* {success && (
          <div className="w-full md:w-[500px] mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )} */}

        <form
          onSubmit={handleSubmit}
          className="w-full md:w-[500px] mt-5 flex flex-col justify-start items-start gap-4"
        >
          {/* Name */}
          <div className="w-full">
            <Input
              label="Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              touched={touched.name}
              error={errors.name}
              size="md"
            />
          </div>

          {/* Email */}
          <div className="w-full">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              touched={touched.email}
              error={errors.email}
              size="md"
            />
          </div>

          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Contact No.
            </label>
            <div className="flex gap-3">
              <div className="flex items-center px-3 gap-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-w-fit">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/Flag_of_the_United_States.png" className="w-8 h-5" alt="" />
                <span className="text-sm font-medium">+1</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={(e) => {
                  let nums = e.target.value.replace(/\D/g, "");
                  if (nums.length > 10) nums = nums.slice(0, 10);

                  let formatted = nums;
                  if (nums.length > 6) {
                    formatted = `(${nums.slice(0, 3)}) ${nums.slice(3, 6)}-${nums.slice(6)}`;
                  } else if (nums.length > 3) {
                    formatted = `(${nums.slice(0, 3)}) ${nums.slice(3)}`;
                  } else if (nums.length > 0) {
                    formatted = `(${nums}`;
                  }
                  setFieldValue("phone", formatted);
                }}
                onBlur={handleBlur}
                placeholder="(123) 456-7890"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${touched.phone && errors.phone
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                  }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="w-full">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a password"
              touched={touched.password}
              error={errors.password}
              size="md"
              iconRight={
                showPassword ? (
                  <HiEye
                    onClick={() => setShowPassword(false)}
                    className="cursor-pointer"
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setShowPassword(true)}
                    className="cursor-pointer"
                  />
                )
              }
            />
          </div>

          {/* Confirm Password */}
          <div className="w-full">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="cPassword"
              value={values.cPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              touched={touched.cPassword}
              error={errors.cPassword}
              size="md"
              iconRight={
                showConfirmPassword ? (
                  <HiEye
                    onClick={() => setShowConfirmPassword(false)}
                    className="cursor-pointer"
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setShowConfirmPassword(true)}
                    className="cursor-pointer"
                  />
                )
              }
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={firebaseLoading || isLoading || !isValid}
            variant="orange"
            size="full"
            className="w-full flex items-center cursor-pointer justify-center gap-2 mt-2"
          >
            <span>
              {firebaseLoading
                ? "Creating Account..."
                : isLoading
                  ? "Creating Account..."
                  : "Sign Up"}
            </span>

            {(firebaseLoading || isLoading) && (
              <FiLoader className="animate-spin text-white" />
            )}
          </Button>

          {/* Login Link */}
          <div className="w-full flex justify-center items-center mt-2">
            <span className="text-[14px] font-[500] text-[#181818] flex gap-1">
              Already have an account?
              <NavLink
                to="/auth/login"
                className="font-semibold text-[#F85E00] hover:text-[#F85E00] hover:underline"
              >
                Log In
              </NavLink>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;