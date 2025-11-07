import { HiMail } from "react-icons/hi";
import { auth, emailimag, mobile } from "../../assets/export";
import { IoIosArrowForward } from "react-icons/io";
import VerificationModal from "./VerificationModal";
import { useState } from "react";
import { useLocation } from "react-router";
import Card from "../common/Card";
import Button from "../common/Button";
import { BiArrowBack } from "react-icons/bi";

export default function VerifyAccount({ email, phone, handleNext, handlePrevious }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isType, setIsType] = useState("");
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const locationState = location.state?.data;
   console.log(email,"email");
   console.log(phone,"phone");

    return (
        <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6 ">
            <div className="absolute left-4 top-8 transform -translate-y-1/2">
            <BiArrowBack onClick={handlePrevious} />
            </div>
             <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-8">
               <img src={auth} alt="orange_logo" className="w-[100px]" />
               <div className=" flex flex-col  justify-center items-center text-center">
                 <h2 className="text-[24px] md:text-[32px] font-bold ">Verify Your Account</h2>
                 <p className="text-[14px] font-normal text-center leading-[27px] text-[#565656]">
                  To secure your account, please verify your identity. <br /> Choose one of the options below:
                 </p>
               </div>
               <div className="w-full md:w-[700px] flex flex-col md:flex-row  justify-center items-center gap-4">

               <Card onClick={() => setIsModalOpen(true) && setIsType(locationState?.email)} className="w-full flex cursor-pointer   justify-between items-center bg-[#F9FAFA] rounded-[12px]  h-[80px]">
                <div className="flex items-center  gap-4">
               <img src={emailimag} alt="" className="w-[34px] h-[34px]" />
                 <p className="flex flex-col text-[15px] font-[500] text-wrap">Email address<span className="text-[12px] text-wrap font-[400] text-[#717171CC]">{email}</span></p>
               </div>
               <button className="bg-[#F85E00] text-white px-2 py-2 rounded-full"><IoIosArrowForward /></button>
               </Card>
               <Card onClick={() => setIsModalOpen(true) && setIsType(locationState?.phone)} className="w-full flex cursor-pointer justify-between items-center bg-[#F9FAFA] rounded-[12px]  h-[80px] p-4  ">
                <div className="flex  items-center gap-4">
                <img src={mobile} alt="" className="w-[34px] h-[34px]" />
                <p className="flex flex-col text-[15px] font-[500] text-wrap">Phone number<span className="text-[12px] text-wrap w-[100px] font-[400] text-[#717171CC]">{phone}</span></p>
                </div>
                <button className="bg-[#F85E00] text-white px-2 py-2 rounded-full"><IoIosArrowForward /></button>
               </Card>
               </div>
               <Button onClick={handleNext} variant="orange" size="full" loading={loading} className="w-full flex items-center justify-center">
                Next
               </Button>
       
        </div>
        <VerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false) }  onVerify={() => setIsModalOpen(false)} isType={isType} />
        </div>
    );
}   