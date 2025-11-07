import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import Suggestpage from './Suggestpage';
import { notes, postone, topics } from '../../assets/export';
import PostCard from '../../components/global/PostCard';

// Dummy data for rendering




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
        avatar: "https://randomuser.me/api/portraits/men/34.jpg",
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
        avatar: "https://randomuser.me/api/portraits/men/20.jpg",
        postimage: postone
    },
];

const peopleData = [
    { name: "Peter Parker", avatar: "https://www.w3schools.com/w3images/avatar2.png" },
    { name: "Olivia James", avatar: "https://www.w3schools.com/w3images/avatar2.png" },
    { name: "Elizabeth Olsen", avatar: "https://www.w3schools.com/w3images/avatar2.png" },
    { name: "Martin Guptil", avatar: "https://www.w3schools.com/w3images/avatar2.png" },
    { name: "Joseph Kent", avatar: "https://www.w3schools.com/w3images/avatar2.png" },
];

const SearchItem = () => {
    const [activeTab, setActiveTab] = useState('Pages');


    const [liked, setLiked] = useState({});

    const toggleLike = (postId) => {
        setLiked(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };


    return (
        <div className="container max-w-6xl mx-auto p-5">
            {/* Tabs */}
            <div className="flex items-center justify-center space-x-6 mb-6">
                <button
                    onClick={() => setActiveTab('Pages')}
                    className={`px-4 py-2 rounded-full ${activeTab === 'Pages' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
                >
                    Pages
                </button>
                <button
                    onClick={() => setActiveTab('Keywords')}
                    className={`px-4 py-2 rounded-full ${activeTab === 'Keywords' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
                >
                    Keywords
                </button>
                <button
                    onClick={() => setActiveTab('Post')}
                    className={`px-4 py-2 rounded-full ${activeTab === 'Post' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
                >
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('People')}
                    className={`px-4 py-2 rounded-full ${activeTab === 'People' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
                >
                    People
                </button>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {activeTab === 'Pages' && (
                    <div className="">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {trending.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b rounded-2xl border-gray-200 bg-white m-1 p-4 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={topics}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
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

                                    <div className="flex justify-between items-center">
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
                )}

                     {activeTab === 'Keywords' && (
                    <div className="">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {trending.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b rounded-2xl border-gray-200 bg-white m-1 p-4 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={topics}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
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

                                    <div className="flex justify-between items-center">
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
                )}

                {activeTab === 'People' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {peopleData.map((person, index) => (
                            <div key={index} className="flex items-center w-full space-x-4 border-2 p-3 rounded-lg shadow-lg bg-white">
                                <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full" />
                                <div className='flex items-center w-full justify-between'>
                                    <h3 className="font-semibold text-lg">{person.name}</h3>
                                    <ChevronRight size={30} color='orange' className='cursor-pointer' />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Post' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                liked={liked}
                                toggleLike={toggleLike}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchItem;
