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
import CreateSubscriptionModal from '../../components/global/CreateSubscriptionModal';
import PostCard from '../../components/global/PostCard';
import SubscriptionStories from '../../components/global/SubscriptionStories';


export default function SubscriptionsCategory() {
    const [liked, setLiked] = useState({});
    const [activeTab, setActiveTab] = useState("my");
    const [showCreateModal, setShowCreateModal] = useState(false);


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

    const posts = [
        {
            id: "post1",
            user: "Mike’s Basketball",
            username: "@mikesmith35",
            time: "5mins ago",
            tag: "Cars: Ferrari",
            gradient: "from-pink-500 via-orange-500 to-yellow-500",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            stats: { likes: "10,403", comments: "500", shares: "105" },
            avatar: "https://randomuser.me/api/portraits/men/12.jpg",
            postimage: postone
        },
        {
            id: "post2",
            user: "Peter’s Basketball",
            username: "@petersmith35",
            time: "5mins ago",
            gradient: "from-blue-600 to-blue-400",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            stats: { likes: "8,205", comments: "420", shares: "67" },
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
            id: "post3",
            user: "Mike’s Basketball",
            username: "@mikesmith35",
            time: "5mins ago",
            tag: "Cars: Ferrari",
            gradient: "from-pink-500 via-orange-500 to-yellow-500",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            stats: { likes: "10,403", comments: "500", shares: "105" },
            avatar: "https://randomuser.me/api/portraits/men/12.jpg",
            postimage: postone
        },
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
        <div className="flex h-screen max-w-7xl mx-auto">
            {/* Left Sidebar - 1/4 width */}
            <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide">
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
            <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto px-3 py-4 scrollbar-hide">
                <SubscriptionStories />
                <div className="mt-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            liked={liked}
                            toggleLike={toggleLike}
                        />
                    ))}
                </div>

            </div>


            {/* Right Sidebar - 1/4 width */}
            <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide  border-gray-200">
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