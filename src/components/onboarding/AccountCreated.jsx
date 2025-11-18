
import { useEffect } from "react";
import { accountCreated } from "../../assets/export";
import { useNavigate } from "react-router";
import Cookies from "js-cookie"

export default function AccountCreated() {
  const navigate = useNavigate();

useEffect(() => {
  const timer = setTimeout(() => {

    // REMOVE TOKEN FROM COOKIES
    Cookies.remove("access_token");
    Cookies.remove("refresh_token"); // if you ever use it
    Cookies.remove("user"); // remove if you stored user info in cookies
    // THEN NAVIGATE
    navigate("/");
    // THEN RELOAD PAGE
    setTimeout(() => {
      window.location.reload();
    }, 100);

  }, 3000);

  return () => clearTimeout(timer);
}, []);


  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <img src={accountCreated} alt="accountCreated" className="w-[100px]" />
      <h2 className="text-[20px] font-bold leading-[32px]">Account Created</h2>
      <p className="text-[14px] font-normal leading-[24px] text-[#565656]">Your account has been created successfully.</p>

    </div>
  )
}