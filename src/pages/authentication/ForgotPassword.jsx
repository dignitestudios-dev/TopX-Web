
import { useFormik } from "formik";
import { forgotPasswordValues } from "../../init/authentication/dummyLoginValues";
import { forgotPasswordSchema } from "../../schema/authentication/dummyLoginSchema";
import Input from "../../components/common/Input";
import { authBg } from "../../assets/export";
import Button from "../../components/common/Button";

import { useState } from "react";
import VerificationModal from "../../components/authentication/VerificationModal";

export default function ForgotPassword() {
    const [openModal, setOpenModal] = useState(false);
    const [email, setEmail] = useState("");
    const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
        useFormik({
            initialValues: forgotPasswordValues,
            validationSchema: forgotPasswordSchema,
            validateOnChange: true,
            validateOnBlur: true,
            onSubmit: async (values) => {
                setEmail(values.email);
                
            },
        });
    return (
        <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-10 overflow-hidden">
            <div className="hidden md:block">
                <img src={authBg} alt="" className="w-[710px] h-[710px] object-cover rounded-[19px]" />
            </div>
        <div className="bg-white flex flex-col justify-center items-center rounded-[19px] p-6">
            <h1 className="text-[32px] font-bold leading-[48px]">Forgot Password</h1>
            <p className="text-[18px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
                Please enter your email address and we'll send you a link to reset your <br /> password.
            </p>
            <form onSubmit={handleSubmit}  >
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
                    
                <div className="w-full flex justify-center items-center " >
                <Button
                type="submit"
              variant="orange"
                size="full"
                onClick={() => setOpenModal(true)}
                >
                    Send OTP</Button>
                </div>
                </div>
                <VerificationModal isOpen={openModal}  onClose={() => setOpenModal(false)} email={email}/>
            </form>
        </div>
        </div>
    );
}