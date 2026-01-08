import { useEffect, useState } from "react";
import { X, Eye, Heart } from "lucide-react";
import axios from "../../../axios";
import { ErrorToast } from "../../global/Toaster";

export default function StoryViewersModal({ storyId, isOpen, onClose }) {
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && storyId) {
      fetchViewers();
    } else {
      // Reset when modal closes
      setViewers([]);
    }
  }, [isOpen, storyId]);

  const fetchViewers = async () => {
    setLoading(true);
    try {
      // Fetch viewers (which includes liked status)
      const viewersRes = await axios.get(`/stories/${storyId}/viewers`);
      if (viewersRes.data?.success) {
        setViewers(viewersRes.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching viewers:", error);
      ErrorToast(error.response?.data?.message || "Failed to fetch viewers");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Viewers ({viewers.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : viewers.length > 0 ? (
            <div className="divide-y">
              {viewers.map((viewer, index) => (
                <div
                  key={viewer._id || viewer.user?._id || index}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={
                      viewer.user?.profilePicture ||
                      viewer.profilePicture ||
                      viewer.avatar ||
                      "/default-avatar.png"
                    }
                    alt={
                      viewer.user?.name ||
                      viewer.name ||
                      viewer.user?.username ||
                      viewer.username ||
                      "User"
                    }
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {viewer.user?.name ||
                        viewer.name ||
                        viewer.user?.username ||
                        viewer.username ||
                        "Unknown User"}
                    </p>
                    {viewer.user?.username || viewer.username ? (
                      <p className="text-sm text-gray-500 truncate">
                        @{viewer.user?.username || viewer.username}
                      </p>
                    ) : null}
                  </div>
                  {viewer.liked && (
                    <Heart size={18} className="text-red-500 fill-red-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <Eye size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500 font-semibold">No viewers yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your story hasn't been viewed by anyone yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

