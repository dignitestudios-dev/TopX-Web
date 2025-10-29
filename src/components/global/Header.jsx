import React, { useState } from 'react';
import { Search, Home, BookOpen, TrendingUp, Users, Radio, DollarSign, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from "../../assets/export";
import { profile } from "../../assets/export";
import { Link } from 'react-router';


const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Home', active: true },
        { icon: BookOpen, label: 'Subscriptions' },
        { icon: TrendingUp, label: 'Trending' },
        { icon: Users, label: 'Knowledge' },
        { icon: Radio, label: 'Go Live' },
        { icon: DollarSign, label: 'Affiliates' },
        { icon: Bell, label: 'Notifications' },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-0 pb-3 gap-4 max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex-shrink-0 pt-3">
                    <img src={Logo} loading="lazy" alt="logo-organization" className="h-[2.9em]" />
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:flex flex-1 max-w-md pt-3">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-[22em] pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:bg-white focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Navigation Items - Desktop */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className={`flex flex-col items-center cursor-pointer group ${item.active
                                    ? 'border-t-4 border-orange-500 pt-2'
                                    : 'border-t-4 border-transparent pt-2'
                                    }`}
                            >
                                <Icon
                                    size={24}
                                    className={`transition-colors ${item.active
                                        ? 'text-orange-500 '
                                        : 'text-gray-600 group-hover:text-orange-500'
                                        }`}
                                />
                                <span className={`text-xs mt-1 transition-colors ${item.active
                                    ? 'text-orange-500 font-semibold '
                                    : 'text-gray-600 group-hover:text-orange-500'
                                    }`}>
                                    {item.label}
                                </span>
                            </div>
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

                {/* User Profile */}
                <div className="flex-shrink-0 relative pt-3">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                    >

                        <div className="w-8 h-8">
                            <img src={profile} loading="lazy" alt="logo-organization" className="h-8 w-8" />
                        </div>
                        <span className="text-black font-[500] text-sm">Mike Smith</span>


                        <ChevronDown size={16} className="text-gray-600 hidden sm:block" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 abg-white border bg-white border-gray-200 rounded-lg shadow-lg">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="font-semibold text-sm">Mike Smith</p>
                                <p className="text-xs text-gray-500">@mikesmith</p>
                            </div>
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Profile</button>
                            <Link to="/setting">
                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Settings</button>
                            </Link>
                            <Link
                                to="/auth/login">

                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Logout

                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    {/* Mobile Search */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
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
                            return (
                                <button
                                    key={index}
                                    className={`flex items-center gap-4 px-4 py-3 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${item.active
                                        ? 'text-orange-500 bg-orange-50 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;