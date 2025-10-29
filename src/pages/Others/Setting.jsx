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


export default function Setting() {

  const buttons = [
    { name: "Privacy Setting", component: <PrivacySettings />, icon: MdOutlinePrivacyTip },
    { name: "Privacy Policy", component: <PrivacyPolicy />, icon: PiCloudWarning },
    { name: "Terms & Conditions", component: <TermsConditions />, icon: PiCloudWarning },
    { name: "Notifications", component: <Notifications /> , icon: FaRegBell },
    { name: "Change Password", component: <ChangePassword />, icon: MdOutlineLock },
    { name: "Change Number", icon: LuPhone },
    { name: "Change Email", component: <ChangeEmail />, icon: IoMailOutline },
    { name: "DOB / Gender", component: <DOBGender />, icon: BsGenderAmbiguous },
    { name: "Blocked Users", component: <BlockedUsers />, icon: LuUserRoundX },
  ];

  const [selected, setSelected] = useState(buttons[0]); // default first

  return (
    <div className="bg-[#F2F2F2] w-full h-screen">
      <Header />

      <div className="w-full grid grid-cols-12 px-32 py-6 gap-6">

        {/* Left Menu */}
        <div className="col-span-3 bg-white p-4 rounded-[15px] h-[500px]">
          <h1 className="text-[16px] font-[500]">Setting</h1>

          <div className="flex flex-col gap-6 py-6">
            {buttons.map((item, index) => (
              <Button
                key={index}
                onClick={() => setSelected(item)}
                leftIcon={item.icon ? <item.icon className="w-[18px] h-[22px] text-[#F85E00]" /> : null}
                className={`gap-1 text-[14px] font-[500] ${selected.name === item.name ? "text-[#F85E00]" : ""}`}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Right Dynamic Content */}
        <div className="col-span-9 bg-white p-3 rounded-[15px] h-full">
          {selected?.component ? selected.component : <h1 className="text-[16px] font-[500]">Select a setting</h1>}
        </div>

      </div>
    </div>
  );
}
