import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, resetAuth, socialLogin } from "../../redux/slices/auth.slice";
import { useFormik } from "formik";
import { loginValues } from "../../init/authentication/dummyLoginValues";
import { signInSchema } from "../../schema/authentication/dummyLoginSchema";
import { NavLink, useNavigate } from "react-router";
import { FiLoader } from "react-icons/fi";
import { authlogo, authBg } from "../../assets/export";
import { IoLogoApple } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import Input from "../../components/common/Input";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import Cookies from "js-cookie";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebase";

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, success, accessToken, user } = useSelector((state) => state.auth);

  console.log(accessToken, "accessToken")

  console.log(user, "useralldata")

  const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: loginValues,
      validationSchema: signInSchema,
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (values) => {
        const payload = {
          email: values.email,
          password: values.password,
          role: "user",
        };
        const result = await dispatch(login(payload));
        if (result.payload?.accessToken) {
          Cookies.set("access_token", result.payload.accessToken, {
            expires: 7,
            secure: false,   // localhost ke liye false rakhna zaroori
            sameSite: "lax",
          });

          navigate("/Home");
        }
      },
    });

  useEffect(() => {
    if (error) {
      ErrorToast(error);
      dispatch(resetAuth());
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      SuccessToast(success);
      dispatch(resetAuth());
    }
  }, [success]);

  // GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    try {
     const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await dispatch(
        socialLogin({
          idToken,
          role: "user",
        })
      );

      if (response?.payload?.accessToken) {
        Cookies.set("access_token", response.payload.accessToken, {
          expires: 7,
          secure: false,
          sameSite: "lax",
        });

        navigate("/Home");
      }
    } catch (error) {
      ErrorToast("Google Login Failed");
    }
  };



  return (
    <>
      <div className="h-full w-full bg-[#F8F8F8] p-3">
        <div className="grid md:grid-cols-2 grid-cols-1 overflow-hidden h-full w-full bg-[#F8F8F8]">
          <div className="hidden md:block">
            <img
              src={authBg}
              alt=""
              className="w-[710px] h-[710px] object-cover rounded-[19px]"
            />
          </div>

          <div className="bg-white flex items-start rounded-[19px] p-2 w-full">
            <div className="flex flex-col items-center justify-center w-full">
              <img src={authlogo} alt="orange_logo" className="w-[100px]" />

              <div className="flex flex-col mt-4 justify-center items-center">
                <h2 className="text-[32px] font-[600] leading-[48px]">Log In</h2>
                <p className="text-[16px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
                  Please enter your details to continue
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                className="w-full md:w-[393px] mt-5 flex flex-col justify-start items-start gap-4"
              >
                <div className="w-full flex flex-col gap-1">
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
                    placeholder="Enter email address"
                    size="md"
                  />

                  <div className="w-full mt-1 flex items-center justify-end">
                    <NavLink
                      to={"/auth/forgot-password"}
                      className="text-blue-500 hover:text-black hover:no-underline text-[14px]"
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
                    placeholder="Enter your password"
                    size="md"
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
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[49px] rounded-[8px] bg-[#F85E00] text-white flex gap-2 items-center justify-center text-md font-medium disabled:opacity-50"
                >
                  <span>Log In</span>
                  {isLoading && <FiLoader className="animate-spin text-lg" />}
                </button>

                <div className="w-full flex flex-col gap-4 pt-8">
                  <button className="w-full h-[49px] rounded-[8px] hover:bg-[#ffe8d9] text-white flex items-center justify-center text-[14px] font-medium px-3 hover:border border-[#F85E00]"
                    onClick={handleGoogleLogin}>
                    <FcGoogle className="w-[24px] h-[24px]" />
                    <span className="text-[#000] w-full text-center">
                      Continue With Google
                    </span>
                  </button>

                  <button className="w-full h-[49px] rounded-[8px] hover:bg-[#ffe8d9] text-white flex items-center justify-center text-[14px] font-medium px-3 hover:border border-[#F85E00]">
                    <IoLogoApple className="w-[24px] h-[24px]" color="#000" />
                    <span className="text-[#000] w-full text-center">
                      Continue With Apple
                    </span>
                  </button>
                </div>

                <div className="w-full h-[49px] flex justify-center items-center">
                  <span className="text-[14px] md:text-[16px] flex gap-1 font-normal text-[#959393]">
                    Don't have an account?
                    <NavLink
                      to="/auth/signup"
                      className="font-semibold text-[#F85E00] hover:text-[#F85E00] hover:no-underline"
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
