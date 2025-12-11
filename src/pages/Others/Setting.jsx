import Button from "../../components/common/Button";
import Header from "../../components/global/Header";

import { MdOutlineLock, MdOutlinePrivacyTip } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";
import { LuPhone, LuUserRoundX } from "react-icons/lu";
import { IoMailOutline } from "react-icons/io5";
import { BsGenderAmbiguous } from "react-icons/bs";
import { PiCloudWarning } from "react-icons/pi";
import { useState } from "react";
import Notifications from "../../components/app/setting/Notifications";
import ChangePassword from "../../components/app/setting/ChangePassword";
import ChangeEmail from "../../components/app/setting/ChangeEmail";
import DOBGender from "../../components/app/setting/DOBGender";
import BlockedUsers from "../../components/app/setting/BlockedUsers";
import PrivacyPolicy from "../../components/app/setting/PrivacyPolicy";
import PrivacySettings from "../../components/app/setting/PrivacySettings";
import TermsConditions from "../../components/app/setting/TermsConditions";
import VerificationModal from "../../components/authentication/VerificationModal";
import ChangeContact from "../../components/app/setting/ChangeContact";
import DeleteAccount from "../../components/app/setting/DeleteAccount";


export default function Setting() {

  const [openModal, setOpenModal] = useState(false);

  const handleVerify = async (code) => {
    console.log("Verifying code:", code);
    return true;
  };

  const handleResend = () => {
    console.log("Resending code");
  };

  const buttons = [
    { name: "Privacy Setting", component: <PrivacySettings />, icon: MdOutlinePrivacyTip },
    { name: "Privacy Policy", component: <PrivacyPolicy />, icon: PiCloudWarning },
    { name: "Terms & Conditions", component: <TermsConditions />, icon: PiCloudWarning },
    { name: "Notifications", component: <Notifications />, icon: FaRegBell },
    { name: "Change Password", component: <ChangePassword />, icon: MdOutlineLock },
    { name: "Change Number", component: <ChangeContact />, icon: LuPhone },
    // { name: "Change Email", component: <ChangeEmail />, icon: IoMailOutline },
    { name: "DOB / Gender", component: <DOBGender />, icon: BsGenderAmbiguous },
    { name: "Blocked Users", component: <BlockedUsers />, icon: LuUserRoundX },
    { name: "Delete Account", component: <DeleteAccount />, icon: LuUserRoundX },
  ];

  const [selected, setSelected] = useState(buttons[0]); // default first

  return (
    <div className="flex  min-h-screen lg:max-w-7xl mx-auto pt-3 w-full px-3 ">


      <div className="w-full grid grid-cols-12  gap-6">

        {/* Left Menu */}
        <div className="md:col-span-3 col-span-12 bg-white p-4 rounded-[15px] md:h-[500px] h-auto"  >


          <div className="flex flex-col md:gap-6 gap-2 py-4 items-start">
            {buttons.map((item, index) => (
              <Button
                key={index}
                onClick={() => {
                  setSelected(item);

                }}
                leftIcon={item.icon ? <item.icon className="w-[18px] h-[22px] text-[#F85E00]" /> : null}
                className={`gap-1 text-[14px] font-[500] ${selected.name === item.name ? "text-[#F85E00]" : ""}`}
              >
                {item.name}
              </Button>
            ))}

          </div>

        </div>

        {/* Right Dynamic Content */}
        <div className="w-full md:col-span-9 col-span-12 bg-white py-6 px-10  rounded-[15px] md:h-[630px] h-auto">
          {selected?.component ? selected.component : <h1 className="text-[16px] font-[500]">Select a setting</h1>}




        </div>

      </div>
    </div>
  );
}
