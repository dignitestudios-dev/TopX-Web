
import { accountCreated, authBg } from "../../assets/export";
export default function AccountCreated() {
    return (
        
 <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-6 overflow-hidden">
            <div className="hidden md:block">
                <img src={authBg} alt="" className="w-[710px] h-[710px] object-cover rounded-[19px]" />
            </div>
        <div className="flex flex-col items-center justify-center  gap-2">
         <img src={accountCreated} alt={accountCreated} className="w-[100px]"/>
         <h2 className="text-[20px] font-bold leading-[32px]">Password Updated</h2>
         <p className="text-[14px] font-normal leading-[24px] text-[#565656]">Your password has been updated successfully.</p>
         
        </div>
        </div>
    )
}