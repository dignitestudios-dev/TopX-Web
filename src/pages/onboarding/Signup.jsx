import React, { useState, useEffect } from "react";
import { LiaIdCard } from "react-icons/lia";
import { TbCheckbox } from "react-icons/tb";
import { PiClipboardText } from "react-icons/pi";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";
import CreateAccount from "../../components/onboarding/CreateAccount";
import VerifyAccount from "../../components/onboarding/VerifyAccount";
import AddStore from "../../components/onboarding/AddStore";
import PersonalDetails from "../../components/onboarding/PersonalDetails";
import Interests from "../../components/onboarding/Interests";
import AccountCreated from "../../components/onboarding/AccountCreated";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserData } from "../../redux/slices/auth.slice";
import { getOnboardingStatus } from "../../lib/helpers";
import Cookies from "js-cookie";
import { FiLoader } from "react-icons/fi";

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  const { allUserData, user } = useSelector((state) => state.auth);
  const currentUser = allUserData || user;

  const [currentStep, setCurrentStep] = useState(location.state?.step ?? 0);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      dispatch(getAllUserData())
        .unwrap()
        .then((userData) => {
          if (userData) {
            setName(userData.name || "");
            setEmail(userData.email || "");
            setPhone(userData.phone || "");

            const status = getOnboardingStatus(userData);
            if (status.isCompleted) {
              navigate("/home", { replace: true });
            } else {
              const targetStep = location.state?.step !== undefined ? location.state.step : status.step;
              setCurrentStep(targetStep);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user data in Signup:", err);
        })
        .finally(() => {
          setIsChecking(false);
        });
    } else {
      setIsChecking(false);
    }
  }, [dispatch, navigate]);

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

  if (isChecking && Cookies.get("access_token")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F8F8]">
        <FiLoader className="w-8 h-8 animate-spin text-[#F85E00]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-screen w-full">
      <div className="bg-[#F8F8F8] col-span-12 lg:col-span-4">
        <OnboardingStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="col-span-12 lg:col-span-8 px-5 md:px-10 h-full flex justify-center items-center">
        <div className="bg-white w-full relative flex justify-center flex-col items-center h-full backdrop-blur-[34px] rounded-[28px]">
          {currentStep === 0 ? (
            <CreateAccount
              setName={setName}
              setEmail={setEmail}
              setPhone={setPhone}
              handleNext={handleNext}
            />
          ) : currentStep === 1 ? (
            <VerifyAccount
              referalCode={ref}
              email={email || currentUser?.email}
              phone={phone || currentUser?.phone}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
            />
          ) : currentStep === 2 ? (
            <PersonalDetails
              name={name || currentUser?.name}
              email={email || currentUser?.email}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
            />
          ) : currentStep === 3 ? (
            <Interests handleNext={handleNext} handlePrevious={handlePrevious} />
          ) : currentStep === 4 ? (
            <AddStore handleNext={handleNext} handlePrevious={handlePrevious} />
          ) : currentStep === 5 ? (
            <AccountCreated />
          ) : null}
        </div>
      </div>
    </div>
  );
}

