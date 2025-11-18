import React, { useEffect, useState } from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { nofound, notes, topics } from '../../assets/export';
import Profilecard from '../../components/homepage/Profilecard';
import MySubscription from '../../components/homepage/MySubscription';
import { TbNotes } from "react-icons/tb";
import { FaChevronRight } from "react-icons/fa6";
import ChatWidget from '../../components/global/ChatWidget';
import FloatingChatWidget from '../../components/global/ChatWidget';
import FloatingChatButton from '../../components/global/ChatWidget';
import PostCard from '../../components/global/PostCard';
import { getMyPosts } from '../../redux/slices/posts.slice';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonPost from '../../components/global/SkeletonPost';

export default function Mypost() {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;

    const dispatch = useDispatch();
    const { postsLoading, posts } = useSelector((state) => state.posts);

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
    ];

    // API call
    useEffect(() => {
        dispatch(getMyPosts({ page, limit }));
    }, [dispatch, page]);


    console.log(posts,"posts")

    // API -> UI mapping
    const mapApiPostToUiPost = (p) => {
        const firstMedia = p.media && p.media.length > 0 ? p.media : [];

        let postImages = [];
        let videoUrl = null;

        firstMedia.forEach((media) => {
            if (media.type === 'image') {
                postImages.push(media.fileUrl);
            } else if (media.type === 'video') {
                videoUrl = media.fileUrl;
            }
        });

        return {
            _id: p._id, // ✅ Important: use _id for Redux
            id: p._id, // Also keep id for backward compatibility
            user: p.page?.name || p.author?.name || '',
            username: p.author?.username ? `@${p.author.username}` : '',
            avatar: p.author?.profilePicture,
            time: new Date(p.createdAt).toLocaleString(),
            postImages,
            videoUrl,
            tag: p.page?.topic || '',
            gradient: 'from-orange-400 to-orange-600',
            text: p.bodyText,
            stats: {
                likes: p.likesCount,
                comments: p.commentsCount,
                shares: p.sharesCount,
            },
            isLiked: p.isLiked,
        };
    };

    const toggleLike = (postId) => {
        setLiked(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    return (
        <div className="flex h-screen max-w-7xl mx-auto overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto pt-3 scrollbar-hide">
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
            <div className="w-1/2 overflow-y-auto px-3 py-4 scrollbar-hide">
                <h1 className="text-3xl font-semibold pb-4 pl-1">My Posts</h1>

                {postsLoading && (!posts || posts.length === 0) ? (
                    <>
                        <SkeletonPost />
                        <SkeletonPost />
                        <SkeletonPost />
                    </>
                ) : (
                    <>
                        {Array.isArray(posts) && posts.length > 0 ? (
                            posts.map((p) => {
                                const mappedPost = mapApiPostToUiPost(p);
                                return (
                                    <div key={mappedPost._id} className="mb-4">
                                        <PostCard
                                            post={mappedPost}
                                            activeTab="feed"
                                        />

                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-sm pl-1 border-2 flex justify-center rounded-3xl">
                                <img src={nofound} alt="" />
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="w-1/4 bg-[#F2F2F2] overflow-y-auto border-gray-200 scrollbar-hide">
                <div className="p-0">
                    {/* Trending Pages */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-900">Trending Pages</span>
                        </h3>

                        <div className="space-y-6">
                            {trending.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={topics}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex gap-2">
                                            <p className="font-[400] text-[14px]">{item.title}</p>
                                            <img src={notes} alt="" />
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2 leading-snug">
                                        {item.desc}
                                    </p>

                                    <p className="text-xs text-gray-700 mb-3">
                                        {item.hashtags.map((tag, i) => (
                                            <span key={i} className="mr-1 text-gray-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </p>

                                    <div className="flex justify-between items-center">
                                        <div>
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

                        <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
                            <span>View All</span>
                            <FaChevronRight color="orange" />
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm mt-3">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-900">
                                Suggestions based on your Interests/Activity
                            </span>
                        </h3>

                        <div className="space-y-6">
                            {trending.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={topics}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex gap-2">
                                            <p className="font-[400] text-[14px]">{item.title}</p>
                                            <img src={notes} alt="" />
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2 leading-snug">
                                        {item.desc}
                                    </p>

                                    <p className="text-xs text-gray-700 mb-3">
                                        {item.hashtags.map((tag, i) => (
                                            <span key={i} className="mr-1 text-gray-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </p>

                                    <div className="flex justify-between items-center">
                                        <div>
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

                        <div className="flex justify-between items-center gap-1 text-black border-t pt-4 pb-1 font-semibold text-sm mt-5 cursor-pointer">
                            <span>View All</span>
                            <FaChevronRight color="orange" />
                        </div>
                    </div>

                    {open && <ChatWidget />}
                    <FloatingChatButton onClick={() => setOpen(!open)} />
                </div>
            </div>
        </div>
    );
}