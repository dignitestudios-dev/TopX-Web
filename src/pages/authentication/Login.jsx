import React, { useState } from "react";
import { useLogin } from "../../hooks/api/Post";
import { processLogin } from "../../lib/utils";
import { useFormik } from "formik";
import { loginValues } from "../../init/authentication/dummyLoginValues";
import { signInSchema } from "../../schema/authentication/dummyLoginSchema";
import { NavLink, useNavigate } from "react-router";
import { FiLoader } from "react-icons/fi";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { auth, authBg, Logo } from "../../assets/export";
import { IoLogoApple } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import Input from "../../components/common/Input";
import { HiEye, HiEyeOff } from "react-icons/hi";

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
const navigate = useNavigate();
  const { loading, postData } = useLogin();

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: loginValues,
      validationSchema: signInSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values, action) => {
        const data = {
          email: values?.email,
          password: values?.password,
        };
        postData("/admin/login", false, null, data, processLogin);

        // Use the loading state to show loading spinner
        // Use the response if you want to perform any specific functionality
        // Otherwise you can just pass a callback that will process everything
      },
    });

  return (
    <>
  <div className="h-full w-full  bg-[#F8F8F8] p-3 ">
   <div className="  grid md:grid-cols-2 grid-cols-1  overflow-hidden h-full w-full  bg-[#F8F8F8]  ">
    <div className="hidden md:block  ">
        <img src={authBg} alt="" className="w-[710px] h-[710px] object-cover rounded-[19px]" />
    </div>
    <div className="bg-white flex items-start rounded-[19px] p-2 w-full">
     <div className="flex flex-col items-center justify-center  w-full">
      <img src={auth} alt="orange_logo" className="w-[100px]" />
      <div className=" flex flex-col mt-4 justify-center items-center">
        <h2 className="text-[32px] font-[600] leading-[48px]">Log In</h2>
        <p className="text-[16px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
          Please enter your details to continue
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
          navigate("/Home");
        }}
        className="w-full md:w-[393px] mt-5 flex flex-col justify-start items-start gap-4"
      >
        <div className="w-full h-auto flex flex-col justify-start items-start gap-1">
          <Input
            label="Email Address"
            type="text"
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.email}
            error={errors.email}
            placeholder="Email Address"
            size="md"
          />
         
        <div className="w-full mt-1  flex items-center justify-end">
          <NavLink
            to={"/auth/forgot-password"}
            className="text-blue-500 hover:no-underline hover:text-black text-[14px] font-normal leading-[20.4px]"
          >
            Forgot Password?
          </NavLink>
        </div>
         
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
              size="md"
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
          
          
          
        </div>

       

        <button
          type="submit"
          className="w-full h-[49px] rounded-[8px] bg-[#F85E00] text-white flex gap-2 items-center justify-center text-md font-medium"
        >
          <span>Log In</span>
          {loading && <FiLoader className="animate-spin text-lg " />}
        </button>

        
       
        
      <div className="w-full flex flex-col gap-4 pt-8">
      

        <button
          type="submit"
          className="w-full h-[49px] rounded-[8px] hover:bg-[#ffe8d9]  text-white flex items-center justify-center  text-[14px] font-medium px-3 hover:border-[1px]  border-[#F85E00]"
        >
          <FcGoogle className="w-[24px] h-[24px] text-left"/>
          <span className="text-[#000] text-center w-full">Continue With Google</span>
          {loading && <FiLoader className="animate-spin text-lg " />}
        </button>


            <button
          type="submit"
          className="w-full h-[49px] rounded-[8px] hover:bg-[#ffe8d9]      text-white flex items-center justify-center  text-[14px] font-medium px-3 hover:border-[1px]  border-[#F85E00] "
        >
          <IoLogoApple  className="w-[24px] h-[24px]  text-left"color="#000"/>
          <span className="text-[#000] text-center w-full">Continue With Apple</span>
          {loading && <FiLoader className="animate-spin text-lg " />}
        </button>
      </div>

        <div className="w-full h-[49px] flex justify-center items-center">
          <span className="text-[14px] md:text-[16px] flex gap-1 font-normal leading-[27px] text-[#959393]">
           Don’t have an account?
            <NavLink
            to="/auth/signup"
              className="font-semibold hover:no-underline hover:text-[#F85E00] text-[#F85E00]"
             
            >
             Create now
            </NavLink>
          </span>
        </div>
      </form>
    </div>
    </div>
   </div>
   </div>
     </>
  );
};

export default Login;
