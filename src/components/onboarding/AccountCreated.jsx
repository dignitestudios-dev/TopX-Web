
import { useEffect } from "react";
import { accountCreated } from "../../assets/export";
import { useNavigate } from "react-router";
export default function AccountCreated() {
   const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // cleanup
  }, []);
    
    return (
        <div className="flex flex-col items-center justify-center gap-2">
         <img src={accountCreated} alt="accountCreated" className="w-[100px]"/>
         <h2 className="text-[20px] font-bold leading-[32px]">Account Created</h2>
         <p className="text-[14px] font-normal leading-[24px] text-[#565656]">Your account has been created successfully.</p>
         
        </div>
    )
}