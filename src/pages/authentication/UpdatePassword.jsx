import { useFormik } from "formik";
import { authBg } from "../../assets/export";
import Input from "../../components/common/Input";
import { updatePasswordSchema } from "../../schema/authentication/dummyLoginSchema";
import { updatePasswordValues } from "../../init/authentication/dummyLoginValues";
import Button from "../../components/common/Button";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: updatePasswordValues,
      validationSchema: updatePasswordSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        console.log(values);
        navigate("/auth/account-created");
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
          Please enter your email address and we'll send you a link to reset
          your <br /> password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="w-full md:w-[3s93px] mt-5 flex flex-col justify-start items-start gap-2">
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
              placeholder="Password"
              size="full"
         
              iconRight={
                isPasswordVisible ? (
                  <HiEye
                    onClick={() => setIsPasswordVisible(false)}
                    className="cursor-pointer "
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setIsPasswordVisible(true)}
                    className="cursor-pointer "
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
              placeholder="Confirm Password"
              size="md"
              iconRight={
                isConfirmPasswordVisible ? (
                  <HiEye
                    onClick={() => setIsConfirmPasswordVisible(false)}
                    className="cursor-pointer "
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setIsConfirmPasswordVisible(true)}
                    className="cursor-pointer "
                  />
                )
              }
            />
            <div className="w-full flex justify-center items-center">
              <Button type="submit" size="full" variant="orange">
                Update Password
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
