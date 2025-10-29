import Button from "../../common/Button";
import { useState } from "react";

export default function PrivacySettings() {
    const [isOn, setIsOn] = useState(false);
    const [isOn2, setIsOn2] = useState(false);
    return (
        <div className="space-y-6">
            <h1 className="text-[28px] font-bold tracking-[-0.018em]">Privacy Settings</h1>
            <div className="space-y-2">
                <p className="text-[16px] font-[500]  text-[#000000]">
              Control Who Can Connect with You
            </p>
            <p className="text-[14px] font-[400]  text-[#181818]">
             Manage your messaging preferences and decide who can reach out to you. <br /> You can update these settings anytime to customize your privacy.
            </p>
            </div>
          <div className="space-y-5 w-[500px]">
  <div className="flex items-center justify-between">
    <p className="text-[16px] font-[500]">Allow anyone to message me</p>
    <Button isToggle={true} isOn={isOn} onClick={() => setIsOn(!isOn)} />
  </div>

  <div className="flex items-center justify-between">
    <p className="text-[16px] font-[500]">Allow anyone to add me to group chats</p>
    <Button isToggle={true} isOn={isOn2} onClick={() => setIsOn2(!isOn2)} />
  </div>
</div>

            
        </div>
    )
}