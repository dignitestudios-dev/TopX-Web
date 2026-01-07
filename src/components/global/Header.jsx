import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Home,
  BookOpen,
  TrendingUp,
  Users,
  Radio,
  DollarSign,
  Bell,
  ChevronDown,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { dummyprofile, Logo, profile } from "../../assets/export";
import { Link, useLocation, useNavigate } from "react-router";
import NotificationPopup from "./NotificationPopup";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import RecentActivityPopup from "./RecentActivityPopup";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserData, logout } from "../../redux/slices/auth.slice";
import Cookies from "js-cookie";
import useDebounce from "../../lib/useDebounce";
import { getGlobalSearch, resetSearch, setApiTrigger } from "../../redux/slices/Global.Slice";

const Header = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [isRecentOpen, setIsRecentOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { user, accessToken, allUserData, isLoading, success, logoutLoading } =
    useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500); // 500ms debounce
  const { globalSearch, apiTrigger } = useSelector(
    (state) => state.globalSearch
  );

  useEffect(() => {
    dispatch(getAllUserData());
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      dispatch(getGlobalSearch(debouncedSearch));
    } else {
      dispatch(resetSearch());
    }
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    if (apiTrigger) {
      dispatch(getGlobalSearch(debouncedSearch)).finally(() => {
        dispatch(setApiTrigger(false)); // 🔥 reset trigger
      });
    }
  }, [apiTrigger, debouncedSearch, dispatch]);

  const navigate = useNavigate("");
  // const handleLogout = () => {
  //     Cookies.remove("access_token");
  //     dispatch(logout(accessToken));
  //     navigate("/auth/login");
  // }

  const handleLogout = () => {
    Cookies.remove("access_token");
    dispatch(logout(accessToken));
  };

  // ✅ When logout success = true → navigate
  useEffect(() => {
    if (success === "Logout successful") {
      navigate("/auth/login"); // Navigate after successful logout
    }
  }, [success]); // Dependency on success state

  const navItems = [
    { icon: Home, to: "/home", label: "Home" },
    { icon: Layers, to: "/subscriptions", label: "Subscriptions" },
    { icon: TrendingUp, to: "/trending", label: "Trending" },
    { icon: Users, to: "/knowledge", label: "Knowledge" },
    { icon: Radio, to: "/go-live", label: "Go Live" },
    { icon: RiMoneyDollarCircleFill, to: "/affiliates", label: "Affiliates" },
    { icon: Bell, to: "/notifications", label: "Notifications" },
  ];
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Dropdown close kro agar click outside ho
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      // Notification close kro agar click outside ho
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }

      // if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      //     setIsRecentOpen(false);
      // }
    };

    // Jab koi bhi open ho tab listener add kro
    if (isDropdownOpen || isNotificationOpen || isRecentOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationOpen, isRecentOpen]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-0 pb-3 gap-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex-shrink-0 pt-3">
          <img
            src={Logo}
            loading="lazy"
            onClick={() => {
              navigate("/home");
            }}
            alt="logo-organization"
            className="h-[2.9em] cursor-pointer"
          />
        </div>

        {/* ✅ Search Bar - Desktop */}
        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md pt-3">
          <div
            onClick={() => navigate("/search-items")}
            className="relative w-full"
          >
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="w-[22em] pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:bg-white focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Optional: Show search results */}
            {globalSearch?.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-50">
                {globalSearch.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {item.title || item.name || "No Title"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items - Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            // 🟠 Handle Notification Popup
            if (item.label === "Notifications") {
              return (
                <div key={index} className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className={`flex flex-col items-center cursor-pointer group border-t-4 pt-2 ${isNotificationOpen
                        ? "border-orange-500 text-orange-500"
                        : "border-transparent text-gray-600 hover:text-orange-500"
                      }`}
                  >
                    <div className="relative">
                      <Icon size={24} />
                      {/* Show the dot by default, hide when isNotificationOpen is true */}
                      {!isNotificationOpen && (
                        <div className="absolute top-0 right-1 bg-red-500 w-2 h-2 rounded-full"></div>
                      )}
                    </div>

                    <span className="text-xs mt-1">Notifications</span>
                  </button>

                  {/* ✅ Notification Popup */}
                  {isNotificationOpen && (
                    <NotificationPopup
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  )}
                </div>
              );
            }

            // 🧩 All other nav items
            return (
              <Link
                key={index}
                to={item.to}
                className={`flex flex-col items-center cursor-pointer group ${isActive
                    ? "border-t-4 border-orange-500 pt-2"
                    : "border-t-4 border-transparent pt-2"
                  }`}
              >
                <Icon
                  size={24}
                  className={`transition-colors ${isActive
                      ? "text-orange-500"
                      : "text-gray-600 group-hover:text-orange-500"
                    }`}
                />
                <span className="text-xs mt-1 text-black">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* User Profile Dropdown */}
        <div className="flex-shrink-0 relative pt-3" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8">
              {allUserData?.profilePicture ? (
                <img
                  src={allUserData.profilePicture}
                  loading="lazy"
                  alt="profile"
                  className="h-8 w-8 rounded-full"
                />
              ) : dummyprofile ? (
                <img
                  src={dummyprofile}
                  loading="lazy"
                  alt="profile"
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <span>No Data</span>
              )}
            </div>
            <span className="text-black font-[500] text-sm">
              {allUserData?.name?.trim() ? allUserData.name : "Not Available"}
            </span>

            <ChevronDown size={16} className="text-gray-600 hidden sm:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-[10em] bg-white border border-gray-200 rounded-lg shadow-lg">
              <Link to="/profile">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  Profile
                </button>
              </Link>
              <Link to="/my-posts">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  My Posts
                </button>
              </Link>
              <button
                onClick={() => setIsRecentOpen(true)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                Recent Activity
              </button>
              <Link to="/setting">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                  Settings
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                disabled={logoutLoading} // Disable the button while loading
              >
                {logoutLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="spinner-border animate-spin border-t-2 border-b-2 border-orange-500 w-4 h-4 rounded-full"></div>
                    <span className="ml-2">Logging out...</span>
                  </div>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white overflow-hidden w-full">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex flex-col">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex items-center gap-4 px-4 py-3 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${isActive
                      ? "text-orange-500 bg-orange-50 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {isRecentOpen && (
        <RecentActivityPopup onClose={() => setIsRecentOpen(false)} />
      )}
    </header>
  );
};

export default Header;
