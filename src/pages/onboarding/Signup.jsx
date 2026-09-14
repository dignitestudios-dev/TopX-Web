import React, { useState, useEffect } from "react";
import { LiaIdCard } from "react-icons/lia";
import { TbCheckbox } from "react-icons/tb";
import { PiClipboardText } from "react-icons/pi";
import { LogOut } from "lucide-react";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";
import CreateAccount from "../../components/onboarding/CreateAccount";
import VerifyAccount from "../../components/onboarding/VerifyAccount";
import AddStore from "../../components/onboarding/AddStore";
import PersonalDetails from "../../components/onboarding/PersonalDetails";
import Interests from "../../components/onboarding/Interests";
import AccountCreated from "../../components/onboarding/AccountCreated";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserData, logout } from "../../redux/slices/auth.slice";
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = Cookies.get("access_token");
    try {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      if (token) {
        await dispatch(logout(token)).unwrap();
      }
    } catch (err) {
      console.error("Logout error in Signup:", err);
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate("/auth/login", { replace: true });
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
    <div className="grid grid-cols-12 gap-6 h-screen w-full relative">
      <div className="bg-[#F8F8F8] col-span-12 lg:col-span-4">
        <OnboardingStepper
          steps={steps}
          currentStep={currentStep}
          onLogout={() => setShowLogoutModal(true)}
        />
      </div>

      <div className="col-span-12 lg:col-span-8 px-5 md:px-10 h-full flex justify-center items-center relative">
        {/* Clearly accessible Logout option during signup/profile completion */}
        {currentStep !== 5 && (
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="absolute top-4 right-6 md:top-6 md:right-12 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all z-20 cursor-pointer shadow-xs bg-white/90 backdrop-blur-sm"
            title="Log out"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        )}

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
              setPhone={setPhone}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Log Out?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to log out? Any unsaved profile details will be lost, but you can log back in anytime to complete your profile.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
