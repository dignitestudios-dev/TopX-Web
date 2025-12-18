import React, { useState } from "react";
import { IoMailOutline } from "react-icons/io5";
import { LiaIdCard } from "react-icons/lia";
import { MdOutlinePayment } from "react-icons/md";
import { PiCertificateBold, PiClipboardText } from "react-icons/pi";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";
import { auth } from "../../assets/export";
import { TbCheckbox } from "react-icons/tb";
import CreateAccount from "../../components/onboarding/CreateAccount";
import VerifyAccount from "../../components/onboarding/VerifyAccount";

import AddStore from "../../components/onboarding/AddStore";
import PersonalDetails from "../../components/onboarding/PersonalDetails";
import Interests from "../../components/onboarding/Interests";
import AccountCreated from "../../components/onboarding/AccountCreated";
import { useLocation, useSearchParams } from "react-router";
export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  const providerSteps = [
    { icon: LiaIdCard, title: "Your Details" },
    { icon: TbCheckbox, title: "Verification" },
    { icon: LiaIdCard, title: "Personal details" },
    { icon: PiClipboardText, title: "Interests" },
    { icon: PiClipboardText, title: "Recommendation" },
  ];

  const steps = providerSteps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    active: index === currentStep,
  }));

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-screen w-full">
      <div className="bg-[#F8F8F8] col-span-12 lg:col-span-4">
        <OnboardingStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="col-span-12 lg:col-span-8 px-5 md:px-10 h-full flex justify-center items-center">
        <div className="bg-white w-full relative flex justify-center flex-col items-center h-full backdrop-blur-[34px] rounded-[28px]">
          {currentStep === 0 ? (
            <CreateAccount
              setEmail={setEmail}
              setPhone={setPhone}
              handleNext={handleNext}
            />
          ) : currentStep === 1 ? (
            <VerifyAccount
              referalCode={ref}
              email={email}
              phone={phone}
              handleNext={handleNext} 
              handlePrevious={handlePrevious}
            />
          ) : currentStep === 2 ? (
            <PersonalDetails email={email} handleNext={handleNext} handlePrevious={handlePrevious}/>
          ) : currentStep === 3 ? (
            <Interests handleNext={handleNext} handlePrevious={handlePrevious}/>
          ) : currentStep === 4 ? (
            <AddStore handleNext={handleNext} handlePrevious={handlePrevious}/>
          ) : currentStep === 5 ? (
            <AccountCreated/>
          ) : null}
        </div>
      </div>
    </div>
  );
}
