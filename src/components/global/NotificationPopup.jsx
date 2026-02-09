import React, { useEffect, useState } from "react";
import { X, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationAsRead, notificationfollowrequest, notificationpostrequest } from "../../redux/slices/notifications.slice";

const NotificationPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const { notifications, unreadCount, notificationsLoading, error } = useSelector(
    (state) => state.notifications
  );

  // Fetch notifications when the component mounts
  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Format time ago
  const getTimeAgo = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Handle Accept Button
  const handleAccept = async (notification, requestType) => {
    setAcceptingId(notification._id);
    try {
      // Dispatch the corresponding action based on the request type (follow or post)
      if (requestType === "followRequest") {
        await dispatch(notificationfollowrequest({ status: "accepted", followRequestId: notification.metaData.followRequest, notificationId: notification.contentId }));
      } else if (requestType === "postRequest") {
        await dispatch(notificationpostrequest({ status: "accepted", postRequestId: notification.metaData.postRequest, notificationId: notification.contentId }));
      }
      // Refresh notifications after acceptance
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setAcceptingId(null);
    }
  };

  // Handle Reject Button
  const handleReject = async (notification, requestType) => {
    setRejectingId(notification._id);
    try {
      // Dispatch the corresponding action based on the request type (follow or post)
      if (requestType === "followRequest") {
        await dispatch(notificationfollowrequest({ status: "rejected", followRequestId: notification.metaData.followRequest, notificationId: notification.contentId }));
      } else if (requestType === "postRequest") {
        await dispatch(notificationpostrequest({ status: "rejected", postRequestId: notification.metaData.postRequest, notificationId: notification.contentId }));
      }
      // Refresh notifications after rejection
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setRejectingId(null);
    }
  };


  const handleMarkAsRead = (notificationId) => {
    // Dispatch action to mark the notification as read
    dispatch(markNotificationAsRead(notificationId));
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  };

  if (notificationsLoading) {
    return (
      <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={22} />
          </button>
        </div>
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
          <div className="flex justify-center items-center py-12">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={22} />
          </button>
        </div>
        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
          <p className="text-center text-red-500 py-8 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
          {/* {unreadCount > 0 && (
            <p className="text-xs text-orange-500 mt-0.5">{unreadCount} unread</p>
          )} */}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
          <X size={22} />
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const hasFollowRequest = n.metaData?.followRequest;
            const hasPostRequest = n.metaData?.postRequest;
            const isRequestType = hasFollowRequest || hasPostRequest;
            const requestType = hasFollowRequest ? "followRequest" : "postRequest";

            return (
              <div
                key={n._id}
                className={`flex items-start gap-3 px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition cursor-pointer ${!n.isRead ? "bg-orange-50/30" : ""
                  }`}
                onClick={() => handleMarkAsRead(n._id)} // Mark as read on click
              >
                <div className="flex-shrink-0">


                  {n.metaData?.user?.profilePicture ? (
                    <img
                      src={n.metaData?.user?.profilePicture}
                      alt={n.metaData?.user?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      {n.metaData?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {n.metaData?.user ? (
                    <>
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-semibold text-gray-900">{n.metaData.user.name}</span>
                        <span className="text-gray-600"> {n.description}</span>
                      </p>

                      {isRequestType && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAccept(n, requestType)}
                            disabled={acceptingId === n._id}
                            className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-[#F6822F] text-white hover:bg-[#e67318] disabled:bg-[#F6822F] disabled:opacity-60 disabled:cursor-not-allowed transition active:scale-95"
                          >
                            {acceptingId === n._id ? (
                              <span className="flex items-center justify-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Accepting
                              </span>
                            ) : (
                              "Accept"
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(n, requestType)}
                            disabled={rejectingId === n._id}
                            className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition active:scale-95"
                          >
                            {rejectingId === n._id ? (
                              <span className="flex items-center justify-center gap-1.5">
                                <span className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></span>
                                Rejecting
                              </span>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.detail}</p>
                    </>
                  )}

                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    {getTimeAgo(n.createdAt)}
                  </p>
                </div>

                {!n.isRead && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-1"></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
