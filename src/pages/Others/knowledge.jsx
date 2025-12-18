import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, TrendingUp, Plus } from 'lucide-react';
import { nofound, notes, postone, profile, profilehigh, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';
import CreateKnowledgePostModal from '../../components/global/CreateKnowledgePostModal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKnowledgeFeed } from '../../redux/slices/knowledgepost.slice';
import TrendingPagesGlobal from '../../components/global/TrendingPagesGlobal';
import SuggestionsPagesGlobal from '../../components/global/SuggestionsPagesGlobal';

export default function Knowledge() {
    const [liked, setLiked] = useState({});
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const observerTarget = useRef(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchKnowledgeFeed({ page: page, limit: 10 }));
    }, [dispatch, page]);

    const {
        knowledgeFeed,
        knowledgeFeedPagination,
        knowledgeFeedLoading,
        error
    } = useSelector((state) => state.knowledgepost);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !knowledgeFeedLoading && knowledgeFeedPagination?.hasNextPage) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [knowledgeFeedLoading, knowledgeFeedPagination]);

    const toggleLike = (postId) => {
        setLiked(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const getGradient = (index) => {
        const gradients = [
            "from-pink-500 via-orange-500 to-yellow-500",
            "from-blue-600 to-blue-400",
            "from-purple-500 to-pink-400",
            "from-green-400 to-blue-500",
            "from-orange-400 to-red-500"
        ];
        return gradients[index % gradients.length];
    };

    const timeAgo = (createdAt) => {
        const now = new Date();
        const then = new Date(createdAt);
        const seconds = Math.floor((now - then) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    };

    const trending = [
        {
            title: "Justin's Basketball",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
            hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
        },
        {
            title: "Justin's Basketball",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
            hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
        },
        {
            title: "Justin's Basketball",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
            hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
        },
    ];

    return (
        <div className="flex  min-h-screen max-w-7xl mx-auto">
            {/* Left Sidebar - 1/4 width */}
            <div className="w-1/4  !bg-[#F2F2F2] overflow-y-auto pt-3">
                {/* Profile Card */}
                <Profilecard smallcard={true} />

                {/* My Subscription */}
                <div className='pt-4'>
                    <MySubscription />
                </div>
            </div>

            {/* Middle Feed */}
            <div className="w-1/2 bg-[#F2F2F2] overflow-y-auto h-[40em] scrollbar-hide">
                <div className="max-w-2xl mx-auto p-4 space-y-5 overflow-y-auto h-[70em] scrollbar-hide">

                    {knowledgeFeed && knowledgeFeed.length > 0 && knowledgeFeed.map((post, index) => (
                        <div
                            key={post._id}
                            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                        >
                            {/* Header */}
                            <div className="p-4 flex items-start justify-between border-b border-gray-100">
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={post.author.profilePicture}
                                        alt="User"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">
                                            {post.author.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            @{post.author.username} • {timeAgo(post.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />
                            </div>

                            {/* Post Content */}
                            <div
                                className={`bg-gradient-to-br ${getGradient(index)} rounded-2xl m-3 p-[10em] min-h-[200px] flex items-center justify-center relative`}
                                style={post.background ? {
                                    backgroundImage: `url(${post.background})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                } : {}}
                            >
                                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full absolute top-6 left-6">
                                    {post.page.topic}
                                </span>
                                <p className="text-white text-lg font-semibold text-center leading-snug">
                                    {post.text}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-10 text-sm text-orange-500 p-4 border-t border-gray-100">
                                <button
                                    onClick={() => toggleLike(post._id)}
                                    className="flex items-center gap-2 hover:text-orange-600"
                                >
                                    <Heart
                                        className={`w-5 h-5 ${liked[post._id] ? "fill-orange-500" : ""}`}
                                    />
                                    <span>{post.likesCount}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{post.commentsCount}</span>
                                </button>

                                <button className="flex items-center gap-2 hover:text-orange-600">
                                    <Share2 className="w-5 h-5" />
                                    <span>{post.sharesCount}</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {knowledgeFeedLoading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={observerTarget} className="h-0 -mt-[1.4em]" />

                    {!knowledgeFeedLoading && knowledgeFeed?.length === 0 && (
                        <p className="text-gray-500 text-sm pl-1 border-2 flex justify-center rounded-3xl">
                            <img src={nofound} alt="" />
                        </p>
                    )}
                </div>
            </div>

            {/* Right Sidebar - 1/4 width */}
            <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto  border-gray-200">
               <div className="p-0">
        {/* Trending Pages Section */}
        <TrendingPagesGlobal/>

        {/* Suggestions Section */}
        <SuggestionsPagesGlobal/>
                   

                    {open && <ChatWidget />}
                    <FloatingChatButton onClick={() => setOpen(!open)} />
                </div>
            </div>
        </div>
    );
}