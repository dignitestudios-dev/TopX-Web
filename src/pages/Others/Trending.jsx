import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ChevronRight, TrendingUp, Plus, ChevronsRight } from 'lucide-react';
import { notes, postone, profile, profilehigh, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { TbNotes } from "react-icons/tb";
import { FaAngleRight, FaChevronRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';
import PostCard from '../../components/global/PostCard';


export default function Trending() {
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
            postimage : postone
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
            postimage : postone
        },
    ];

    return (
        <div className="flex max-w-7xl mx-auto">
            {/* Left Sidebar - 25% width */}
            <div className="w-1/4 bg-[#F9FAFB] overflow-y-auto pt-3">
                <Profilecard smallcard={true} />
                <div className="pt-4">
                    <MySubscription />
                </div>
            </div>
            {/* Main Feed - 65% width */}
            <div className="w-[74%]   p-3 overflow-y-auto h-[40em] scrollbar-hide">
                <div>
                    <div className='flex justify-between p-3'>
                        <h1 className='font-bold text-[18px]'>Suggestions based on your Interests/Activity</h1>
                        <div className='flex items-center gap-2 text-sm'>
                            <button>View all</button>
                            <FaAngleRight color='#F97316' />
                        </div>
                    </div>
                    <div className='flex overflow-x-auto'>
                        {trending.map((item, idx) => (
                            <div
                                key={idx}
                                className="border-b rounded-2xl  border-gray-200 bg-white  m-1 p-4 pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center  gap-3 mb-3">

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
                                            <p className="text-xs text-gray-600 font-medium">
                                                50+ Follows
                                            </p>
                                        </div>

                                    </div>

                                    <div>
                                        <button className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:bg-orange-600 text-white px-6 py-1.5 rounded-[10px] text-sm font-semibold">
                                            Subscribe
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className='flex justify-between p-3'>
                        <h1 className='font-bold text-[18px]'>Trending Pages</h1>
                        <div className='flex items-center gap-2 text-sm'>
                            <button>View all</button>
                            <FaAngleRight color='#F97316' />
                        </div>
                    </div>
                    <div className='flex overflow-x-auto'>
                        {trending.map((item, idx) => (
                            <div
                                key={idx}
                                className="border-b rounded-2xl  border-gray-200 bg-white  m-1 p-4 pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center  gap-3 mb-3">

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
                                            <p className="text-xs text-gray-600 font-medium">
                                                50+ Follows
                                            </p>
                                        </div>

                                    </div>

                                    <div>
                                        <button className="bg-gradient-to-r from-[#E56F41] to-[#DE4B12] hover:bg-orange-600 text-white px-6 py-1.5 rounded-[10px] text-sm font-semibold">
                                            Subscribe
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



                {/*Post*/}
                <div className="mr-[15em] mx-auto p-4 space-y-4">
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
        </div>

    );
}