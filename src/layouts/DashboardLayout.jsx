import { Outlet } from "react-router";
import DummyNavbar from "../components/layout/DummyNavbar";
import DummySidebaar from "../components/layout/DummySidebaar";
import { useEffect, useState } from "react";
import NoInternetModal from "../components/global/NoInternet";
import { NoInternetImage } from "../assets/export";
import Header from "../components/global/Header";

const DashboardLayout = () => {
  const [openNoInternet, setOpenNoInternet] = useState(false);

  useEffect(() => {
    if (!navigator.onLine) {
      // Handle no internet connection
      setOpenNoInternet(true);
    }
  }, []);
  return (
    <div className="w-full  flex flex-col justify-start items-start">
     
        <Header />
      
          <Outlet />
      <img src={NoInternetImage} alt="" className="hidden" />
     
        <div className="w-[calc(100%-15rem)] h-[calc(100%-2.5rem)] p-4 ">
          <NoInternetModal isOpen={openNoInternet} />
        </div>
    </div>
  );
};

export default DashboardLayout;
