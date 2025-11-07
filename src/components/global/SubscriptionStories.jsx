import React, { useState, useEffect } from "react";
import { Heart, Share2, X } from "lucide-react";

const SubscriptionStories = () => {
    const stories = [
        {
            id: 1,
            title: "Justin's Basketball",
            user: "@justin_hoops",
            time: "5 mins ago",
            image: "https://media.istockphoto.com/id/1558726582/photo/adult-football-competition-soccer-football-player-dribbling-a-ball-and-kick-a-ball-during.jpg?s=612x612&w=0&k=20&c=aRFpVrLzK777wMGL8O_pFvxuNSdBAWmFTsLjlGhms9c=",
            avatar: "https://randomuser.me/api/portraits/men/10.jpg",
        },
        {
            id: 2,
            title: "Eva's BasketBall",
            user: "@evanolan545",
            time: "5 mins ago",
            image: "https://thumbs.dreamstime.com/b/children-playing-soccer-football-match-running-players-kick-kicking-ball-sport-school-tournament-youth-teams-73439356.jpg",
            avatar: "https://randomuser.me/api/portraits/women/12.jpg",
        },
        {
            id: 3,
            title: "Sophie's Basketball",
            user: "@sophielove",
            time: "6 mins ago",
            image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500",
            avatar: "https://randomuser.me/api/portraits/women/14.jpg",
        },
        {
            id: 4,
            title: "Rose's Basketball",
            user: "@roselyn21",
            time: "7 mins ago",
            image: "https://images.newscientist.com/wp-content/uploads/2021/12/14103104/PRI_214947217.jpg",
            avatar: "https://randomuser.me/api/portraits/women/16.jpg",
        },
        {
            id: 5,
            title: "Olivia's Basketball",
            user: "@oliviahoopz",
            time: "9 mins ago",
            image: "https://images.pexels.com/photos/16248871/pexels-photo-16248871/free-photo-of-girl-with-football-ball-on-match.jpeg",
            avatar: "https://randomuser.me/api/portraits/women/18.jpg",
        },
          {
            id: 6,
            title: "Olivia's Basketball",
            user: "@oliviahoopz",
            time: "9 mins ago",
            image: "https://marketplace.canva.com/EAGl0vDkPbU/1/0/1131w/canva-red-and-white-bold-football-match-poster-Gq2WnSzwsks.jpg",
            avatar: "https://randomuser.me/api/portraits/women/18.jpg",
        },
    ];

    const [activeStory, setActiveStory] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [liked, setLiked] = useState(false);

    // Progress animation with pause functionality
    useEffect(() => {
        if (activeStory && !isPaused) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setActiveStory(null);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [activeStory, isPaused]);

    const handleMouseDown = (e) => {
        e.stopPropagation();
        setIsPaused(true);
    };
    const handleMouseUp = (e) => {
        e.stopPropagation();
        setIsPaused(false);
    };
    const handleTouchStart = (e) => {
        e.stopPropagation();
        setIsPaused(true);
    };
    const handleTouchEnd = (e) => {
        e.stopPropagation();
        setIsPaused(false);
    };

    const closeStory = (e) => {
        e.stopPropagation();
        setActiveStory(null);
        setProgress(0);
        setLiked(false);
    };

    return (
        <div className="w-full p-4 md:p-0">
            <h2 className="text-base font-bold text-gray-900 mb-3 py-0 px-4">My Basketball</h2>
            <div className="bg-white py-4 px-4 rounded-2xl shadow-sm">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-0">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            onClick={() => {
                                setActiveStory(story);
                                setProgress(0);
                                setLiked(false);
                            }}
                            className="flex flex-col items-center cursor-pointer flex-shrink-0"
                        >
                            <div
                                className={`w-24 h-32 rounded-2xl overflow-hidden relative flex items-end justify-center transition-all duration-300 ${
                                    activeStory?.id === story.id
                                        ? "ring-3 ring-orange-500 shadow-lg"
                                        : "hover:ring-2 hover:ring-orange-300 shadow"
                                }`}
                            >
                                <img
                                    src={story.image}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <div className="absolute top-2 left-2">
                                    <img
                                        src={story.avatar}
                                        alt={story.title}
                                        className="w-7 h-7 rounded-full border-2 border-white"
                                    />
                                </div>
                                <div className="absolute bottom-2 text-white text-xs font-semibold px-2 text-left line-clamp-1 w-full">
                                    {story.title.split("'s")[0]}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Story Modal - Full Screen Mobile Optimized */}
            {activeStory && (
                <div
                    className="fixed inset-0 bg-black w-screen h-screen flex items-center justify-center z-50 overflow-hidden"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Close Button - Fixed Position */}
                    <button
                        onClick={closeStory}
                        className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 z-50 flex items-center justify-center"
                    >
                        <X size={32} strokeWidth={2.5} />
                    </button>

                    {/* Story Header */}
                    <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent pt-6 px-4 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={activeStory.avatar}
                                alt={activeStory.title}
                                className="w-10 h-10 rounded-full border-2 border-white flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate">{activeStory.title}</p>
                                <p className="text-gray-300 text-xs truncate">{activeStory.user} • {activeStory.time}</p>
                            </div>
                        </div>

                        {/* Progress Bar - Single Bar */}
                        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100"
                                style={{
                                    width: `${progress}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Story Image - Centered */}
                    <div className="w-full h-full flex items-center justify-center relative">
                        <img
                            src={activeStory.image}
                            alt={activeStory.title}
                            className="w-full h-full object-contain"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        />
                    </div>

                    {/* Bottom Actions */}
                    <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-8 px-4">
                        <div className="max-w-full mx-auto flex justify-between items-end gap-3">
                            <input
                                type="text"
                                placeholder="Send a message..."
                                className="flex-1 bg-white/15 border border-white/30 text-white text-sm px-4 py-3 rounded-full placeholder-gray-400 focus:outline-none focus:border-white/50 backdrop-blur-sm transition-all"
                            />
                            <div className="flex gap-2">
                                <button
                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm flex-shrink-0"
                                    onClick={() => {}}
                                >
                                    <Share2 size={20} />
                                </button>
                                <button
                                    className={`rounded-full p-3 transition-all duration-200 backdrop-blur-sm flex-shrink-0 ${
                                        liked
                                            ? "bg-red-500/80 hover:bg-red-600 text-white"
                                            : "bg-white/20 hover:bg-white/30 text-white"
                                    }`}
                                    onClick={() => setLiked(!liked)}
                                >
                                    <Heart size={20} fill={liked ? "currentColor" : "none"} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pause Indicator */}
                    {isPaused && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 text-lg font-medium z-30 pointer-events-none">
                            ⏸ Paused
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubscriptionStories;