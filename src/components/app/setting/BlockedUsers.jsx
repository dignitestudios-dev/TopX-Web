import { user } from "../../../assets/export";
import Button from "../../common/Button";
import { useState } from "react";
import ErrorModal from "../../common/ErrorModal";

export default function BlockedUsers() {
    const [openModal, setOpenModal] = useState(false);
    console.log(openModal);
    return (
        <div className="space-y-6">
            <h1 className="text-[28px] font-bold tracking-[-0.018em]">Blocked Users</h1>
            <div className="space-y-3 overflow-y-auto">
            {[1,2,3,4,5].map((item) => (
                <div key={item} className="w-full flex justify-between items-center gap-4 ">
                <div className="flex items-center gap-2">
                <img src={user} alt=""  className="w-[50px] h-[50px] rounded-full"/>
                <p className="text-[14px] font-[500] text-gray-800">Peter Parker</p>

                </div>

                <Button 
                type="button"
                size="md"
                variant="orange"
                 onClick={() => setOpenModal(!openModal)}
                className="px-14 flex justify-center items-center"
                >Unblock</Button>
                
            </div>
            ))}
            </div>
            <ErrorModal 
            isOpen={openModal}
            onClose={() => setOpenModal(false)}
            heading="Unblock User"
            message="Are you sure you want to unblock this user?"
            confirmText="Unblock"
            confirmBgColor="bg-orange-600"
            confirmHoverColor="hover:bg-orange-700"
            autoCloseDuration={2000}
            />
        </div>
    )
}