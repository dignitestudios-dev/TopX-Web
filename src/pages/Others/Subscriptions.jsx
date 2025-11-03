import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight, TrendingUp, Plus, Search, MoreVertical, Bookmark, Layers } from 'lucide-react';
import { notes, postone, profile, profilehigh, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';


export default function Subscriptions() {
    const [liked, setLiked] = useState({});
  const [activeTab, setActiveTab] = useState("my");

  const mySubscriptions = [
    { title: "My Basketball", pages: "50+" },
    { title: "My Fitness", pages: "50+" },
    { title: "My Cooking", pages: "50+" },
    { title: "My Makeup", pages: "50+" },
    { title: "My Opinions", pages: "50+" },
    { title: "My Politics", pages: "50+" },
  ];

  const savedSubscriptions = [
    { title: "Peter’s Basketball", pages: "50+" },
    { title: "Justin’s Fitness", pages: "50+" },
    { title: "Rose’s Cooking", pages: "50+" },
    { title: "Sophie’s Makeup", pages: "50+" },
    { title: "Olivia’s Opinions", pages: "50+" },
    { title: "Adam’s Politics", pages: "50+" },
  ];

  const subscriptions =
    activeTab === "my" ? mySubscriptions : savedSubscriptions;

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
        <div className="flex  min-h-screen max-w-7xl mx-auto">
            {/* Left Sidebar - 1/4 width */}
            <div className="w-1/4  !bg-[#F9FAFB] overflow-y-auto pt-3">
                {/* Profile Card */}

                <Profilecard smallcard={true} />

                <h3 className="font-[500] text-lg mb-4 flex items-center gap-2 pt-4">
                    <TbNotes className="w-5 h-5 text-orange-500" />
                    Topic Pages
                </h3>
                {/* Topic Pages */}
                <div className="px-0 py-0  mt-4  mb-4">

                    <div className="space-y-4">
                        {[1, 2, 3].map((item, idx) => (
                            <div key={idx} className="pb-4 border-b bg-white border p-3 rounded-xl border-gray-200 last:border-0">
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
                                <p className="text-[14px] text-gray-400 leading-snug gap-3 pt-2">#Lorem ipsum #Lorem ipsum <br></br> #Lorem ipsum</p>
                                <div className='flex gap-2 pt-2'>
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
                                    <p className="text-[14px] text-gray-700 mt-1"><span className="text-black font-[600]">50+</span> Follows</p>

                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center pl-3 gap-2 mt-4 text-black cursor-pointer font-semibold text-sm">
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Middle Feed - 1/2 width */}
           <div className="w-1/2 bg-gray-50 min-h-screen p-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {activeTab === "my" ? "My Subscription" : "Saved Subscription"}
        </h2>
        <div className="flex items-center gap-3">
         {activeTab === "my" && (
  <button
    className="bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
    onClick={() => setActiveTab("my")}
  >
    <Plus size={20} />
  </button>
)}

          <div className="flex bg-white p-1 rounded-full overflow-hidden">
            <button
              className={`px-4 py-2 rounded-l-full text-sm font-medium ${
                activeTab === "my"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("my")}
            >
              My Subscriptions
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-r-full font-medium ${
                activeTab === "saved"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              Saved Subscriptions
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-2.5 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 rounded-[10px] border border-gray-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
        />
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {subscriptions.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                {item.title} <span className="text-gray-400 pl-1"><Layers size={16}/></span>
              </h3>
              {activeTab === "my" ? (
                <MoreVertical
                  size={18}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                />
              ) : (
                <Bookmark
                  size={18}
                  className="text-orange-500 cursor-pointer"
                  fill="#F97316"
                />
              )}
            </div>
            <div className="flex items-center mt-2 gap-2">
              <div className="flex -space-x-2">
                <img
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt=""
                  className="w-5 h-5 rounded-full border border-white"
                />
                <img
                  src="https://randomuser.me/api/portraits/women/2.jpg"
                  alt=""
                  className="w-5 h-5 rounded-full border border-white"
                />
                <img
                  src="https://randomuser.me/api/portraits/men/3.jpg"
                  alt=""
                  className="w-5 h-5 rounded-full border border-white"
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">
              <span className='text-bold text-black'>{item.pages}</span>  Pages
              </p>
            </div>
          </div>
        ))}
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
                                        <div className='flex items-center gap-1 text-black'>
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
                                            <p className="text-[13px] text-black font-bold">
                                                50+ <span className='text-slate-600 font-normal'>Follows</span>
                                                
                                            </p>
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