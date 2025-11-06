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
import PostCard from '../../components/global/PostCard';


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

    return (
        <div className="flex h-screen max-w-7xl mx-auto overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-1/4 bg-[#F9FAFB] overflow-y-auto pt-3 scrollbar-hide">
                <Profilecard smallcard={true} />
                <div className="pt-4">
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
                                    <div className="w-10 h-10 rounded-full text-lg flex items-center justify-center flex-shrink-0">
                                        <img src={topics} alt="" />
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="font-[400] text-[14px]">Justin's Basketball</p>
                                        <img src={notes} alt="" />
                                    </div>
                                </div>
                                <p className="text-[14px] text-gray-600 leading-snug">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                </p>
                                <p className="text-[14px] text-gray-700 mt-1">
                                    <span className="text-black font-[600]">50+</span> Follows
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-black cursor-pointer font-semibold text-sm">
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Middle Feed */}
            <div className="w-1/2 bg-gray-50 overflow-y-auto px-3 py-4 scrollbar-hide">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        liked={liked}
                        toggleLike={toggleLike}
                    />
                ))}
            </div>



            {/* Right Sidebar - 1/4 width */}
            <div className="w-1/4 bg-[#F9FAFB] overflow-y-auto border-gray-200 scrollbar-hide">
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

                </div>
            </div>
        </div>
    );
}