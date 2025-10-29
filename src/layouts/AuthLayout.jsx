import React from "react";
import { Outlet } from "react-router";
import { Logo } from "../assets/export";

const AuthLayout = () => {
  return (
    <div className="h-full w-full  bg-[#F8F8F8] p-3 ">



      <Outlet />
    </div>
  );
};

export default AuthLayout;
