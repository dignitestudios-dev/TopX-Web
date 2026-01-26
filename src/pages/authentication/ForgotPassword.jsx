import { useFormik } from "formik";
import { forgotPasswordValues } from "../../init/authentication/dummyLoginValues";
import { forgotPasswordSchema } from "../../schema/authentication/dummyLoginSchema";
import Input from "../../components/common/Input";
import { authBg } from "../../assets/export";
import Button from "../../components/common/Button";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, verifyOTP } from "../../redux/slices/auth.slice";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import VerificationModal from "../../components/authentication/VerificationModal";

export default function ForgotPassword() {
    const [openModal, setOpenModal] = useState(false);
    const [email, setEmail] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    const dispatch = useDispatch();
    const { forgotLoading, forgotError, verifyOtpLoading, verifyOtpError } = useSelector(
        (state) => state.auth
    );

    const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
        useFormik({
            initialValues: forgotPasswordValues,
            validationSchema: forgotPasswordSchema,
            validateOnChange: true,
            validateOnBlur: true,
            onSubmit: async (values) => {
                // 🔥 Dispatch forgot password action
                const res = await dispatch(forgotPassword({
                    email: values.email,
                    role: "user"
                }));

                if (res.meta.requestStatus === "fulfilled") {
                    SuccessToast(res.payload || "OTP sent successfully");
                    setEmail(values.email);
                    setOpenModal(true);
                    setResendTimer(30); // Start 30 second timer
                } else {
                    ErrorToast(res.payload || "Failed to send OTP");
                }
            },
        });

    // ⭐ HANDLE OTP VERIFY
    const handleVerifyOTP = async (code) => {
        console.log("🔥 Verifying OTP:", code); // Debug log
        
        const res = await dispatch(verifyOTP({
            email: email,
            role: "user",
            otp: code
        }));

        console.log("🔥 Verify OTP Response:", res); // Debug log

        if (res.meta.requestStatus === "fulfilled") {
            SuccessToast("OTP verified successfully");
            
            // 🔥 Store token in sessionStorage for UpdatePassword screen
            console.log("🔥 Payload:", res.payload); // Debug log
            
            if (res.payload?.token) {
                console.log("🔥 Storing token:", res.payload.token); // Debug log
                sessionStorage.setItem("resetToken", res.payload.token);
            } else {
                console.warn("🔥 No token in payload!"); // Warning
            }
            
            // WAIT for success, then close modal
            setTimeout(() => {
                setOpenModal(false);
            }, 500);
        } else {
            console.error("🔥 Verification Error:", res.payload); // Debug log
            ErrorToast(res.payload || "Invalid OTP");
        }
    };

    // ⭐ HANDLE RESEND OTP
    const handleResendOTP = async () => {
        const res = await dispatch(forgotPassword({
            email: email,
            role: "user"
        }));

        if (res.meta.requestStatus === "fulfilled") {
            SuccessToast("OTP resent successfully");
            setResendTimer(30); // Reset timer to 30 seconds
        } else {
            ErrorToast(res.payload || "Failed to resend OTP");
        }
    };

    // ⭐ TIMER COUNTDOWN EFFECT
    useEffect(() => {
        if (resendTimer === 0) return;

        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [resendTimer]);

    // Reset timer when modal closes
    useEffect(() => {
        if (!openModal) {
            setResendTimer(0);
        }
    }, [openModal]);

    return (
        <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-10 overflow-hidden">
            <div className="hidden md:block">
                <img src={authBg} alt="" className="w-[710px] h-[710px] object-cover rounded-[19px]" />
            </div>
            <div className="bg-white flex flex-col justify-center items-center rounded-[19px] p-6">
                <h1 className="text-[32px] font-bold leading-[48px]">Forgot Password</h1>
                <p className="text-[16px] font-normal text-center leading-[27px] text-[#3C3C43D9] w-[27em]">
                    Please enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="w-full md:w-[393px] mt-5 flex flex-col justify-start items-start gap-2">

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
                        <div className="w-full">
                            <Button
                                type="submit"
                                variant="orange"
                                size="full"
                                loading={forgotLoading}
                                disabled={forgotLoading}
                            >
                                {forgotLoading ? "Sending OTP..." : "Send OTP"}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* OTP VERIFICATION MODAL */}
                <VerificationModal 
                    isOpen={openModal} 
                    onClose={() => setOpenModal(false)} 
                    email={email} 
                    onVerify={handleVerifyOTP}
                    onResend={handleResendOTP}
                    isVerifying={verifyOtpLoading}
                    mode="forget"
                    resendTimer={resendTimer}
                    setResendTimer={setResendTimer}
                />
            </div>
        </div>
    );
}