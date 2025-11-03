import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight, TrendingUp, Plus } from 'lucide-react';
import { notes, postone, profile, profilehigh, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';


export default function Knowledge() {
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
            avatar:
                "https://randomuser.me/api/portraits/men/12.jpg",
        },
        {
            id: "post2",
            user: "Peter’s Basketball",
            username: "@mikesmith35",
            time: "5mins ago",
            tag: "Finance",
            gradient: "from-blue-600 to-blue-400",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            stats: { likes: "8,205", comments: "420", shares: "67" },
            avatar:
                "https://randomuser.me/api/portraits/men/32.jpg",
        },
    ];


    return (
        <div className="flex  min-h-screen max-w-7xl mx-auto">
            {/* Left Sidebar - 1/4 width */}
            <div className="w-1/4  !bg-[#F9FAFB] overflow-y-auto pt-3">
                {/* Profile Card */}

                <Profilecard smallcard={true} />

                {/* My Subscription */}
                <div className='pt-4'>
                    <MySubscription />

                </div>

            </div>

            {/* Middle Feed - 1/2 width */}
            <div className="w-1/2 bg-gray-50 overflow-y-auto h-[40em] scrollbar-hide">
                <div className="max-w-2xl mx-auto p-4 space-y-5 overflow-y-auto h-[70em] scrollbar-hide">
                    {/* Create Post Input */}
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-4 py-3">
                        <input
                            type="text"
                            placeholder="Create Knowledge Post"
                            className="flex-1 text-sm text-gray-600 focus:outline-none"
                        />
                        <button className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition">
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Posts */}
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                        >
                            {/* Header */}
                            <div className="p-4 flex items-start justify-between border-b border-gray-100">
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={post.avatar}
                                        alt="User"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">
                                            {post.user}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {post.username} • {post.time}
                                        </p>
                                    </div>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />
                            </div>

                            {/* Post Content */}
                            <div
                                className={`p-[6em] bg-gradient-to-br ${post.gradient} flex items-center justify-center text-center rounded-2xl m-3`}
                            >
                                <div>
                                    <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                                        {post.tag}
                                    </span>
                                    <p className="text-white text-lg font-semibold mt-4 leading-snug">
                                        {post.text}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-10 text-sm text-orange-500 p-4 border-t border-gray-100">
                                <button
                                    onClick={() => toggleLike(post.id)}
                                    className="flex items-center gap-2 hover:text-orange-600"
                                >
                                    <Heart
                                        className={`w-5 h-5 ${liked[post.id] ? "fill-orange-500" : ""
                                            }`}
                                    />
                                    <span>{post.stats.likes}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{post.stats.comments}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <Share2 className="w-5 h-5" />
                                    <span>{post.stats.shares}</span>
                                </button>
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



                    {open && <ChatWidget />} {/* Your actual chat panel */}
                    <FloatingChatButton onClick={() => setOpen(!open)} />



                </div>
            </div>
        </div>
    );
}