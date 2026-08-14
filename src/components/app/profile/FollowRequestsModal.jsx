import { X, UserCheck, Check, UserX } from "lucide-react";
import axios from "../../../axios";
import { ErrorToast, SuccessToast } from "../../global/Toaster";
import { nofound } from "../../../assets/export";
import Avatar from "../../common/Avatar";

export default function FollowRequestsModal({ isOpen, onClose, pageId, onActionComplete }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchFollowRequests = async () => {
    try {
      setLoading(true);
      const url = pageId
        ? `/requests/follow?pageId=${pageId}&page=1&limit=50`
        : `/requests/follow?page=1&limit=50`;
      const res = await axios.get(url);
      const allFollowReqs = res.data?.data || [];
      setRequests(allFollowReqs);
    } catch (err) {
      console.error("Error fetching follow requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFollowRequests();
    }
  }, [isOpen, pageId]);

  const handleFollowAction = async (requestId, status) => {
    try {
      setActionLoadingId(requestId);
      const res = await axios.post(`/requests/${requestId}/follow`, { status });
      
      SuccessToast(
        status === "accepted"
          ? "Follow request accepted!"
          : "Follow request rejected"
      );

      // Remove acted request from local state
      setRequests((prev) => prev.filter((r) => r._id !== requestId));

      if (typeof onActionComplete === "function") {
        onActionComplete();
      }
    } catch (err) {
      console.error("Error processing follow request action:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update request status";
      ErrorToast(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 cursor-pointer"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Follow Requests
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="flex justify-center mb-3">
                  <img src={nofound} height={180} width={180} alt="No requests" />
                </div>
                <p className="font-bold text-gray-800 text-base">
                  No Pending Follow Requests
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Requests from users wanting to follow this private page will show here.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3 bg-gray-50/50 hover:bg-white transition-all shadow-sm"
                >
                  {/* Author Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={req.author?.profilePicture}
                      alt={req.author?.name || req.author?.username || "User"}
                      size="lg"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {req.author?.name || "Anonymous User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{req.author?.username || "user"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {timeAgo(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleFollowAction(req._id, "accepted")}
                      disabled={actionLoadingId === req._id}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                      {actionLoadingId === req._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleFollowAction(req._id, "rejected")}
                      disabled={actionLoadingId === req._id}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
