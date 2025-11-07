import React, { useState } from "react";
import { useFormik } from "formik";
import { NavLink, useNavigate } from "react-router";
import { FiLoader } from "react-icons/fi";
import { IoLogoApple } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { auth } from "../../assets/export";
import { signupSchema } from "../../schema/onboarding/signupSchema";
import { signupValues } from "../../init/onboarding/signupValues";
import CountrySelector from "../common/Flag";
import Button from "../common/Button";
import Input from "../common/Input";

const CreateAccount = ({ handleNext, setEmail, setPhone }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    values,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    errors,
    touched,
  } = useFormik({
    initialValues: signupValues,
    validationSchema: signupSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      // fake loading (optional UX)
      setLoading(true);
      setTimeout(() => {
        setEmail(values.email);
        setPhone(values.phone);
        handleNext(); // go to next step
        setLoading(false);
      }, 1000);
    },
  });
  console.log(errors);
  console.log(values);
  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6">
      <div className="flex flex-col w-full items-center justify-center">
        <img src={auth} alt="orange_logo" className="w-[100px]" />
        <div className="flex flex-col mt-4 justify-center items-center">
          <h2 className="text-[32px] font-bold leading-[48px]">Sign Up</h2>
          <p className="text-[18px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
            Please enter your details to sign up.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full md:w-[500px] mt-5 flex flex-col justify-start items-start gap-4"
        >
          {/* Name */}
          <div className="w-full flex flex-col">
            <Input
              label="Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Name"
              touched={touched.name}
              error={errors.name}
              size="md"
            />
          </div>

          {/* Email */}
          <div className="w-full flex flex-col">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Email Address"
              touched={touched.email}
              error={errors.email}
              size="md"
            />
          </div>

          {/* Contact No. */}
          <div className="w-full flex flex-col">
            <Input
              label="Contact No."
              type="tel"
              name="phone"
              value={values.phone}
              onChange={(e) => {
                let nums = e.target.value.replace(/\D/g, ""); // sirf numbers
                if (nums.length > 10) nums = nums.slice(0, 10); // max 10 digits for US
                // format as (123) 456-7890
                let formatted = nums;
                if (nums.length > 6) {
                  formatted = `(${nums.slice(0, 3)}) ${nums.slice(
                    3,
                    6
                  )}-${nums.slice(6)}`;
                } else if (nums.length > 3) {
                  formatted = `(${nums.slice(0, 3)}) ${nums.slice(3)}`;
                } else if (nums.length > 0) {
                  formatted = `(${nums}`;
                }
                setFieldValue("phone", formatted);
              }}
              onBlur={handleBlur}
              placeholder="(123) 456-7890"
              touched={touched.phone}
              error={errors.phone}
              showCountrySelector={true}
              size="md"
            />
          </div>

          {/* Password */}
          <div className="w-full flex flex-col">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
              touched={touched.password}
              error={errors.password}
              size="md"
              iconRight={
                showPassword ? (
                  <HiEye
                    onClick={() => setShowPassword(false)}
                    className="cursor-pointer "
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setShowPassword(true)}
                    className="cursor-pointer "
                  />
                )
              }
            />
          </div>

          {/* Confirm Password */}
          <div className="w-full flex flex-col">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="cPassword"
              value={values.cPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm Password"
              touched={touched.cPassword}
              error={errors.cPassword}
              size="md"
              iconRight={
                showConfirmPassword ? (
                  <HiEye
                    onClick={() => setShowConfirmPassword(false)}
                    className="cursor-pointer "
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setShowConfirmPassword(true)}
                    className="cursor-pointer "
                  />
                )
              }
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            variant="orange"
            size="full"
            className="w-full flex items-center justify-center"
          >
            <span>Sign Up</span>
            {loading && <FiLoader className="animate-spin text-lg" />}
          </Button>

          {/* Already have account */}
          <div className="w-full h-[43px] flex justify-center items-center">
            <span className="text-[14px] flex gap-1 font-[500] text-[#181818]">
              Already have an account?
              <NavLink
                className="font-semibold hover:no-underline hover:text-[#F85E00] text-[#F85E00] text-[14px]"
                to={"/auth/login"}
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
