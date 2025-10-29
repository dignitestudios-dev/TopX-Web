import Button from "../../common/Button";
import { useState } from "react";

export default function Notifications() {
    const [isOn, setIsOn] = useState(false);
    const [isOn2, setIsOn2] = useState(false);
    const [isOn3, setIsOn3] = useState(false);
    const [isOn4, setIsOn4] = useState(false);
    const [isOn5, setIsOn5] = useState(false);

    return (
        <div className="space-y-6">
            <h1 className="text-[28px] font-bold tracking-[-0.018em]">Notifications</h1>
             <div className="space-y-5 w-[500px]">
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-[500]">Allow anyone to message me</p>
                <Button
                 isToggle={true} isOn={isOn} onClick={() => setIsOn(!isOn)} />
              </div>
            

  <div className="flex items-center justify-between">
                <p className="text-[16px] font-[500]">Notifications</p>
                <Button isToggle={true} isOn={isOn2} onClick={() => setIsOn2(!isOn2)} />
              </div>
                <div className="flex items-center justify-between">
                <p className="text-[16px] font-[500]">Allow anyone to add me to group chats</p>
                <Button isToggle={true} isOn={isOn4} onClick={() => setIsOn4(!isOn4)} />
              </div>
            
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-[500]">Allow anyone to add me to group chats</p>
                <Button isToggle={true} isOn={isOn3} onClick={() => setIsOn3(!isOn3)} />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[16px] font-[500]">Push Notifications</p>
                <Button isToggle={true} isOn={isOn5} onClick={() => setIsOn5(!isOn5)} />
              </div>
            </div>
        </div>
    )
}