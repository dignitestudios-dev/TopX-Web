import { useFormik } from "formik";
import { authBg } from "../../assets/export";
import Input from "../../components/common/Input";
import { updatePasswordSchema } from "../../schema/authentication/dummyLoginSchema";
import { updatePasswordValues } from "../../init/authentication/dummyLoginValues";
import Button from "../../components/common/Button";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword } from "../../redux/slices/auth.slice";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const { updatePassLoading, updatePassError } = useSelector(
    (state) => state.auth
  );

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: updatePasswordValues,
      validationSchema: updatePasswordSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        // 🔥 Get token from sessionStorage (set during OTP verification)
        const resetToken = sessionStorage.getItem("resetToken");

        console.log("🔥 Reset Token:", resetToken); // Debug log
        console.log("🔥 Password:", values.password); // Debug log

        if (!resetToken) {
          ErrorToast("Session expired. Please verify OTP again.");
          return;
        }

        const res = await dispatch(updatePassword({
          password: values.password,
          token: resetToken // Pass token from OTP verification
        }));

        console.log("🔥 Update Password Response:", res); // Debug log

        if (res.meta.requestStatus === "fulfilled") {
          SuccessToast("Password updated successfully");
          // Navigate to success page
          setTimeout(() => {
            navigate("/auth/account-created");
          }, 1000);
        } else {
          console.error("🔥 Update Password Error:", res.payload); // Debug log
          ErrorToast(res.payload || "Failed to update password");
        }
      },
    });

  return (
    <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-10 overflow-hidden">
      <div className="hidden md:block">
        <img src={authBg} alt="" className="w-[710px] h-[710px] object-cover rounded-[19px]" />
      </div>
      <div className="bg-white flex flex-col justify-center items-center rounded-[19px] p-6">
        <h1 className="text-[32px] font-bold leading-[48px]">
          Update Password
        </h1>
        <p className="text-[18px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
          Please enter your new password to reset your account
        </p>
        <form onSubmit={handleSubmit}>
          <div className="w-full md:w-[393px] mt-5 flex flex-col justify-start items-start gap-4">
            <Input
              label="Password"
              type={isPasswordVisible ? "text" : "password"}
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={errors.password}
              placeholder="Enter new password"
              size="full"
              iconRight={
                isPasswordVisible ? (
                  <HiEye
                    onClick={() => setIsPasswordVisible(false)}
                    className="cursor-pointer"
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setIsPasswordVisible(true)}
                    className="cursor-pointer"
                  />
                )
              }
            />
            <Input
              label="Confirm Password"
              type={isConfirmPasswordVisible ? "text" : "password"}
              id="confirm_password"
              name="confirm_password"
              value={values.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.confirm_password}
              error={errors.confirm_password}
              placeholder="Confirm password"
              size="full"
              iconRight={
                isConfirmPasswordVisible ? (
                  <HiEye
                    onClick={() => setIsConfirmPasswordVisible(false)}
                    className="cursor-pointer"
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setIsConfirmPasswordVisible(true)}
                    className="cursor-pointer"
                  />
                )
              }
            />
            <div className="w-full">
              <Button 
                type="submit" 
                size="full" 
                variant="orange"
                loading={updatePassLoading}
                disabled={updatePassLoading}
              >
                {updatePassLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}