import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChevronBackOutline } from "react-icons/io5";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { getKnowledgePostDetail, deleteKnowledgePost, resetKnowledge } from "../../../redux/slices/knowledgepost.slice";
import { SuccessToast } from "../../global/Toaster";

export default function KnowledgePostPageDetail({ pageId, setIsKnowledgePageOpen }) {
    const dispatch = useDispatch();
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [showDeleteMenu, setShowDeleteMenu] = useState(null);
    
const {
    knowledgePageDetail,
    knowledgePagePosts,
    knowledgePageLoading,
    deleteLoading,
    deleteSuccess
} = useSelector((state) => state.knowledgepost);


    useEffect(() => {
        if (pageId) {
            dispatch(getKnowledgePostDetail({ pageId, page: 1, limit: 10 }));
        }
    }, [pageId]);

  if (deleteSuccess) {
    SuccessToast("Post deleted successfully");

    setTimeout(() => {
        dispatch(resetKnowledge());
    }, 1500);
}


    const handleLike = (postId) => {
        setLikedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const handleDelete = (postId) => {
        dispatch(deleteKnowledgePost(postId));
        setShowDeleteMenu(null);
    };

    const getFontClass = (fontFamily) => {
        const fontMap = {
            "Classic": "font-sans",
            "Signature": "font-serif",
            "Editor": "font-mono",
            "Poster": "font-black",
            "Bubble": "font-serif"
        };
        return fontMap[fontFamily] || "font-sans";
    };

    if (knowledgePageLoading || !knowledgePageDetail) {
        return (
            <div className="p-6 text-center text-gray-500 font-semibold">
                Loading page...
            </div>
        );
    }

    return (
        <div className="bg-transparent min-h-screen max-w-2xl">
            {/* Header Card */}
            <div className=" pb-3">
                {/* Back Button */}
                <button
                    onClick={() => setIsKnowledgePageOpen(false)}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold"
                >
                    <IoChevronBackOutline size={24} /> Back
                </button>

                {/* Page Header */}

            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
                {knowledgePagePosts && knowledgePagePosts.map((post) => (
                    <div key={post._id} className="rounded-3xl overflow-hidden bg-white">
                        {/* Post Header */}
                        <div className="px-6 py-4 flex items-center justify-between bg-white relative">
                            <div className="flex items-center gap-3 flex-1">
                                <img
                                    src={post.author.profilePicture}
                                    alt={post.author.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                                />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-base">{post.author.name}</h3>
                                    <p className="text-gray-500 text-sm">@{post.author.username} • 5mins ago</p>
                                </div>
                            </div>
                            
                            {/* More Options Button */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDeleteMenu(showDeleteMenu === post._id ? null : post._id)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <MoreHorizontal size={20} className="text-gray-600" />
                                </button>

                                {/* Delete Menu */}
                                {showDeleteMenu === post._id && (
                                    <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-44">
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            disabled={deleteLoading}
                                            className={`w-full px-4 py-3 flex items-center gap-2 transition-colors rounded-lg text-sm font-semibold ${
                                                deleteLoading 
                                                    ? "text-gray-400 cursor-not-allowed" 
                                                    : "text-red-600 hover:bg-red-50"
                                            }`}
                                        >
                                            <Trash2 size={18} />
                                            {deleteLoading ? "Deleting..." : "Delete Post"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Post Card with Background */}
                     {/* Post Card with Background */}
<div className="px-6 py-4">
  <div
    className="rounded-3xl overflow-hidden flex items-center justify-center p-12 min-h-[320px] relative shadow-xl"
    style={
      post.background
        ? {
            backgroundImage: `url(${post.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }
        : post.backgroundCode
        ? { background: post.backgroundCode }
        : {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }
    }
  >
    {/* Overlay for better text readability */}
    <div className="absolute inset-0 bg-black/5 rounded-3xl"></div>
    
    {/* Category Badge - Top Left */}
    {post.subTopic && (
      <div className="absolute top-4 left-4 z-20 inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30">
        {post.subTopic.split(",")[0].trim()}
      </div>
    )}

    <div className="text-center w-full space-y-3 relative z-10">
      {/* Post Text */}
      <p
        className={`leading-relaxed drop-shadow-2xl mx-auto max-w-2xl ${getFontClass(post.fontFamily)}`}
        style={{
          fontSize: `${post.fontSize}px`,
          color: post.color,
          fontWeight: post.isBold ? "700" : "500",
          fontStyle: post.isItalic ? "italic" : "normal",
          textDecoration: post.isUnderline ? "underline" : "none",
          textAlign: post.textAlignment,
        }}
      >
        {post.text}
      </p>
    </div>
  </div>
</div>

                        {/* Post Footer - Interaction Buttons */}
                        <div className="px-6 py-5 bg-white flex items-center gap-8">
                            <button
                                onClick={() => handleLike(post._id)}
                                className="flex items-center gap-2 group transition-colors"
                            >
                                <Heart
                                    size={22}
                                    className={`${likedPosts.has(post._id)
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-500 group-hover:text-red-500"
                                        } transition-colors`}
                                />
                                <span className={`text-sm font-semibold transition-colors ${likedPosts.has(post._id)
                                        ? "text-red-500"
                                        : "text-gray-600"
                                    }`}>
                                    {likedPosts.has(post._id)
                                        ? (post.likesCount + 1)
                                        : post.likesCount}
                                </span>
                            </button>

                            <button className="flex items-center gap-2 group transition-colors">
                                <MessageCircle
                                    size={22}
                                    className="text-gray-500 group-hover:text-orange-500 transition-colors"
                                />
                                <span className="text-sm font-semibold text-gray-600">
                                    {post.commentsCount}
                                </span>
                            </button>

                            <button className="flex items-center gap-2 group transition-colors">
                                <Share2
                                    size={22}
                                    className="text-gray-500 group-hover:text-orange-500 transition-colors"
                                />
                                <span className="text-sm font-semibold text-gray-600">
                                    {post.sharesCount}
                                </span>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {knowledgePagePosts && knowledgePagePosts.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                        <p className="text-gray-500 font-semibold">No posts yet</p>
                        <p className="text-gray-400 text-sm mt-1">Be the first to create a post!</p>
                    </div>
                )}
            </div>
        </div>
    );
}