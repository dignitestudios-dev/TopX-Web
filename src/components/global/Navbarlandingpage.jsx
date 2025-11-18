import { useState } from "react";
import { Link, useLocation } from "react-router";
import { topxlogout } from "../../assets/export";

const Navbarlandingpage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveClass = (path) =>
    currentPath === path
      ? "text-orange-600 font-bold"
      : "text-gray-700 hover:text-orange-600";

  const toggle = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="px-5 sm:px-7 lg:px-24 relative z-20 uppercase">

      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between py-4">

        {/* Logo */}
        <div>
          <img src={topxlogout} alt="logo" className="w-[42px] h-[42px]" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex justify-center">
          <ul className="flex items-center space-x-10 font-medium">

            <li className={`text-[14px] font-[600] tracking-[2px] ${getActiveClass("/referrals")}`}>
              <Link to="/referrals">Home</Link>
            </li>

            <li className={`text-[14px] font-[600] tracking-[2px] ${getActiveClass("/privacy-policy")}`}>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>

            <li className={`text-[14px] font-[600] tracking-[2px] ${getActiveClass("/terms-conditons")}`}>
              <Link to="/terms-conditons">Terms & Conditions</Link>
            </li>

          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggle}
          className="lg:hidden text-black bg-orange-200 p-2 rounded-md"
        >
          ☰
        </button>

      </nav>

      {/* MOBILE MENU OVERLAY (Click outside to close) */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* MOBILE SLIDE-IN MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-60 bg-white shadow-xl z-50 
        transition-transform duration-300 ease-in-out lg:hidden 
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6">

          {/* Close Button */}
          <button
            onClick={closeMenu}
            className="text-gray-600 mb-6 text-lg"
          >
            ✕
          </button>

          {/* Menu List */}
          <ul className="flex flex-col space-y-5 uppercase">

            <li onClick={closeMenu} className={`${getActiveClass("/referrals")} text-[14px] font-[600]`}>
              <Link to="/referrals">Home</Link>
            </li>

            <li onClick={closeMenu} className={`${getActiveClass("/privacy-policy")} text-[14px] font-[600]`}>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>

            <li onClick={closeMenu} className={`${getActiveClass("/terms-conditons")} text-[14px] font-[600]`}>
              <Link to="/terms-conditons">Terms & Conditions</Link>
            </li>

          </ul>
        </div>
      </div>

    </div>
  );
};

export default Navbarlandingpage;
