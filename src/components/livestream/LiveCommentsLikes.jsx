import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Send, X, Loader2 } from "lucide-react";

const LiveCommentsLikes = ({
  comments,
  likesCount,
  userLiked,
  onSendComment,
  onToggleLike,
  user,
  isConnected,
}) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(true);
  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      const success = await onSendComment(commentText.trim(), {
        username: user?.username || user?.name || user?.user?.username || "Anonymous",
        profilePicture: user?.profilePicture || user?.avatar || user?.user?.profilePicture || null,
      });

      if (success) {
        setCommentText("");
        inputRef.current?.focus();
      } else {
        console.warn("Comment send may have failed, but allowing retry");
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-sm flex flex-col z-20">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              userLiked
                ? "bg-red-600 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${userLiked ? "fill-current" : ""}`}
            />
            <span className="font-semibold">{likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{comments.length}</span>
          </button>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-white hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!isConnected && comments.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Loader2 className="w-12 h-12 mx-auto mb-2 opacity-50 animate-spin" />
                <p className="text-sm">Connecting to chat...</p>
                <p className="text-xs mt-1">You can still type comments</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-2"
                  style={{
                    animation: "fadeIn 0.3s ease-in",
                  }}
                >
                  {comment.profilePicture ? (
                    <img
                      src={comment.profilePicture}
                      alt={comment.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {comment.username?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="bg-white/10 rounded-lg px-3 py-2">
                      <p className="text-white font-semibold text-sm">
                        {comment.username}
                      </p>
                      <p className="text-white/90 text-sm mt-1 break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected 
                    ? "Type a comment..." 
                    : "Connecting to chat... (you can still type)"
                }
                disabled={false}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveCommentsLikes;

