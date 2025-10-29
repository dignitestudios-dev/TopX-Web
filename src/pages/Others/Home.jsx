import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight, TrendingUp } from 'lucide-react';
import { notes, postone, profile, profilehigh, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';




export default function Home() {
    const [liked, setLiked] = useState({});

    const toggleLike = (postId) => {
        setLiked(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

      const [open, setOpen] = useState(false);

    const trending = [
        {
            title: "Justin’s Basketball",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
            hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
        },
        {
            title: "Justin’s Basketball",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
            hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
        },
    ];

    return (
        <div className="flex !bg-gray-300 min-h-screen max-w-7xl mx-auto">
            {/* Left Sidebar - 1/4 width */}
            <div className="w-1/4  !bg-[#F9FAFB] overflow-y-auto pt-3">
                {/* Profile Card */}

                <Profilecard />

                {/* My Subscription */}
                <div className='pt-4'>
                    <MySubscription />

                </div>

                {/* Topic Pages */}
                <div className="px-4 py-4 bg-white rounded-xl mt-4 border border-gray-200 mb-4">
                    <h3 className="font-[500] text-lg mb-4 flex items-center gap-2">
                        <TbNotes className="w-5 h-5 text-orange-500" />
                        Topic Pages
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item, idx) => (
                            <div key={idx} className="pb-4 border-b border-gray-200 last:border-0">
                                <div className="flex items-center gap-1 mb-1">
                                    <div className="w-10 h-10  rounded-full  text-lg flex items-center justify-center flex-shrink-0">
                                        <img src={topics} alt="" />
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="font-[400] text-[14px]">Justin's Basketball</p>
                                        <img src={notes} alt="" />
                                    </div>
                                </div>
                                <p className="text-[14px] text-gray-600 leading-snug">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                                <p className="text-[14px] text-gray-700 mt-1"><span className="text-black font-[600]">50+</span> Follows</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-black cursor-pointer font-semibold text-sm">
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Middle Feed - 1/2 width */}
            <div className="w-1/2 bg-gray-50 ">
                <div className="max-w-2xl mx-auto p-4 space-y-4 overflow-y-auto h-[70em] scrollbar-hide">
                    {/* Post 1 - With Image */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 flex items-start justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                    {/* Background / Topic Image */}
                                    <img
                                        src={topics}
                                        alt="Topic"
                                        className="w-[3em] h-[3em] rounded-full object-cover"
                                    />

                                    {/* Profile Image Overlay */}
                                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full  overflow-hidden">
                                        <img
                                            src={profile}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-sm">Mike's Basketball</p>
                                    <p className="text-xs text-gray-600">@mikesmith35 • 5mins ago</p>
                                </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="bg-gradient-to-b p-3 h-80 flex items-center justify-center">
                            <img src={postone} alt="Basketball" className="w-full h-full object-cover rounded-2xl" />
                        </div>

                        <div className="p-4">
                            <p className="text-sm text-gray-700 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

                            <div className="flex items-center gap-8 text-sm text-orange-500 mb-4 pb-4 border-b border-gray-200">
                                <button onClick={() => toggleLike('post1')} className="flex items-center gap-2 hover:text-orange-600">
                                    <Heart className={`w-5 h-5 ${liked['post1'] ? 'fill-orange-500' : ''}`} />
                                    <span>10,403</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>500</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <Share2 className="w-5 h-5" />
                                    <span>105</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Post 2 - No Image */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 flex items-start justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                    {/* Background / Topic Image */}
                                    <img
                                        src={topics}
                                        alt="Topic"
                                        className="w-[3em] h-[3em] rounded-full object-cover"
                                    />

                                    {/* Profile Image Overlay */}
                                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full  overflow-hidden">
                                        <img
                                            src={profile}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Mike's Basketball</p>
                                    <p className="text-xs text-gray-600">@mikesmith35 • 5mins ago</p>
                                </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="p-4">
                            <p className="text-sm text-gray-700 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

                            <div className="flex items-center gap-8 text-sm text-orange-500">
                                <button onClick={() => toggleLike('post2')} className="flex items-center gap-2 hover:text-orange-600">
                                    <Heart className={`w-5 h-5 ${liked['post2'] ? 'fill-orange-500' : ''}`} />
                                    <span>10,403</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>500</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <Share2 className="w-5 h-5" />
                                    <span>105</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Post 3 */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 flex items-start justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                    {/* Background / Topic Image */}
                                    <img
                                        src={topics}
                                        alt="Topic"
                                        className="w-[3em] h-[3em] rounded-full object-cover"
                                    />

                                    {/* Profile Image Overlay */}
                                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full  overflow-hidden">
                                        <img
                                            src={profile}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Peter's Basketball</p>
                                    <p className="text-xs text-gray-600">@petersmith35 • 5mins ago</p>
                                </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="bg-gradient-to-b p-3 h-80 flex items-center justify-center">
                            <img src={postone} alt="Basketball" className="w-full h-full object-cover rounded-2xl" />
                        </div>
                    </div>
                    {/* Post 4 */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 flex items-start justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                    {/* Background / Topic Image */}
                                    <img
                                        src={topics}
                                        alt="Topic"
                                        className="w-[3em] h-[3em] rounded-full object-cover"
                                    />

                                    {/* Profile Image Overlay */}
                                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full  overflow-hidden">
                                        <img
                                            src={profile}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Peter's Basketball</p>
                                    <p className="text-xs text-gray-600">@petersmith35 • 5mins ago</p>
                                </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="bg-gradient-to-b p-3 h-80 flex items-center justify-center">
                            <img src={postone} alt="Basketball" className="w-full h-full object-cover rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - 1/4 width */}
            <div className="w-1/4 bg-[#F9FAFB] overflow-y-auto  border-gray-200">
                <div className="p-0">


                    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                        {/* Header */}
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-900">Trending Pages</span>
                        </h3>

                        {/* Trending List */}
                        <div className="space-y-6">
                            {trending.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">

                                        <img src={topics} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        <div>


                                            <div className="flex gap-2">
                                                <p className="font-[400] text-[14px]"> {item.title}</p>
                                                <img src={notes} alt="" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-2 leading-snug">
                                        {item.desc}
                                    </p>

                                    {/* Hashtags */}
                                    <p className="text-xs text-gray-700 mb-3">
                                        {item.hashtags.map((tag, i) => (
                                            <span key={i} className="mr-1 text-gray-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </p>

                                    <div className='flex justify-between items-center'>
                                        <div>
                                            {/* Followers + Subscribe */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        <img
                                                            src="https://randomuser.me/api/portraits/women/1.jpg"
                                                            alt=""
                                                            className="w-6 h-6 rounded-full border-2 border-white"
                                                        />
                                                        <img
                                                            src="https://randomuser.me/api/portraits/men/2.jpg"
                                                            alt=""
                                                            className="w-6 h-6 rounded-full border-2 border-white"
                                                        />
                                                        <img
                                                            src="https://randomuser.me/api/portraits/women/3.jpg"
                                                            alt=""
                                                            className="w-6 h-6 rounded-full border-2 border-white"
                                                        />
                                                    </div>

                                                </div>

                                            </div>
                                            <p className="text-xs text-gray-600 font-medium">
                                                50+ Follows
                                            </p>
                                        </div>

                                        <div>
                                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-16 py-1.5 rounded-[10px] text-sm font-semibold">
                                                Subscribe
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {/* Footer */}
                        <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
                            <span>View All</span>
                            <FaChevronRight color='orange' />

                        </div>
                    </div>


                    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                        {/* Header */}
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-900">Suggestions based on your Interests/Activity</span>
                        </h3>

                        {/* Trending List */}
                        <div className="space-y-6">
                            {trending.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">

                                        <img src={topics} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        <div>


                                            <div className="flex gap-2">
                                                <p className="font-[400] text-[14px]"> {item.title}</p>
                                                <img src={notes} alt="" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-2 leading-snug">
                                        {item.desc}
                                    </p>

                                    {/* Hashtags */}
                                    <p className="text-xs text-gray-700 mb-3">
                                        {item.hashtags.map((tag, i) => (
                                            <span key={i} className="mr-1 text-gray-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </p>

                                    <div className='flex justify-between items-center'>
                                        <div>
                                            {/* Followers + Subscribe */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        <img
                                                            src="https://randomuser.me/api/portraits/women/1.jpg"
                                                            alt=""
                                                            className="w-6 h-6 rounded-full border-2 border-white"
                                                        />
                                                        <img
                                                            src="https://randomuser.me/api/portraits/men/2.jpg"
                                                            alt=""
                                                            className="w-6 h-6 rounded-full border-2 border-white"
                                                        />
                                                        <img
                                                            src="https://randomuser.me/api/portraits/women/3.jpg"
                                                            alt=""
                                                            className="w-6 h-6 rounded-full border-2 border-white"
                                                        />
                                                    </div>

                                                </div>

                                            </div>
                                            <p className="text-xs text-gray-600 font-medium">
                                                50+ Follows
                                            </p>
                                        </div>

                                        <div>
                                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-16 py-1.5 rounded-[10px] text-sm font-semibold">
                                                Subscribe
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {/* Footer */}
                        <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
                            <span>View All</span>
                            <FaChevronRight color='orange' />

                        </div>
                    </div>

                    {open && <ChatWidget />} {/* Your actual chat panel */}
                    <FloatingChatButton onClick={() => setOpen(!open)} />



                </div>
            </div>
        </div>
    );
}