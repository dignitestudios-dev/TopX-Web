import { useState } from "react";
import VerificationModal from "../../authentication/VerificationModal";
import Button from "../../common/Button";
import SuccessModal from "../../common/Modal";

export default function DeleteAccount() {
  const [openModal, setOpenModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const handleVerificationClose = () => {
    setOpenModal(false);          
    setOpenSuccessModal(true);     // ✅ Yeh add kar diya
  };

  return (
    <div className="space-y-6">
      <h1 className=" text-[28px] font-bold tracking-[-0.018em]">
        Delete Account
      </h1>

      <div className="w-[400px] space-y-2">
        <p>We will send a 5-digit code to ******yk@outlook.com</p>
        <p>Your data will be removed from our database permanently.</p>

        <Button
          size="lg"
          variant="orange"
          className="w-[300px] flex justify-center items-center"
          onClick={() => setOpenModal(true)}
        >
          Send Code
        </Button>

        <VerificationModal
          isOpen={openModal}
          onClose={handleVerificationClose}
        />

        <SuccessModal 
          isOpen={openSuccessModal} 
          onClose={() => setOpenSuccessModal(false)} 
          heading="Account deleted!" 
          message="Your account has been deleted successfully." 
          autoCloseDuration={2000}
        />
      </div>
    </div>
  );
}
