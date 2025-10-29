import { useState } from "react";
import VerificationModal from "../../authentication/VerificationModal";
import Button from "../../common/Button";

export default function DeleteAccount() {
    const [openModal, setOpenModal] = useState(false);
    console.log(openModal);
    
    return (
        <div className="space-y-6">
            <h1 className=" text-[28px] font-bold tracking-[-0.018em]">Delete Account</h1>
            <div className="w-[400px] space-y-2">
                <p>We will send a 5-digit code to ******yk@outlook.com</p>
                <p>Your data will be removed from our database permanently.</p>
            <Button
                    type="button"
                    size="lg"
                    variant="orange"
                    className="w-[300px] flex justify-center items-center"
                    onClick={() => setOpenModal(true)}
                >
                    Send Code
                </Button>
                <VerificationModal openModal={openModal} setOpenModal={() => setOpenModal(!openModal)} isVerifying={false} length={5} email="******yk@outlook.com" mode="delete"/>
            </div>
        </div>
    )
}