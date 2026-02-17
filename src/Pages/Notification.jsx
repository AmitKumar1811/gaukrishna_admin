import React, { useState } from "react";

// static icons (replace with your own paths)
import deleteIcon from "/delete-icon.svg";
 

const staticNotifications = [
  {
    _id: "1",
    title: "Coins Earned",
    message: "You earned 50 coins for completing a course",
    type: "coins_earned",
    createdAt: "2026-01-10T10:30:00",
    read: false,
  },
  {
    _id: "2",
    title: "New Like",
    message: "Someone liked your course",
    type: "like",
    createdAt: "2026-01-09T08:15:00",
    read: false,
  },
  {
    _id: "3",
    title: "Course Purchased",
    message: "Your course was purchased successfully",
    type: "course_purchased",
    createdAt: "2026-01-08T06:45:00",
    read: true,
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(staticNotifications);
  const [activeFilter, setActiveFilter] = useState("all");

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFilteredNotifications = () => {
    if (activeFilter === "unread") return unreadNotifications;
    if (activeFilter === "read") return readNotifications;
    return notifications;
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="container mx-auto px-4 my-20 max-w-[650px] min-h-[80vh]">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-2xl font-medium">Notifications</h4>
        <button
          onClick={() => setNotifications([])}
          className="text-[#0F431F] underline font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "unread", "read"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1 rounded border font-semibold ${
              activeFilter === filter
                ? "bg-[#0F431F] text-white border-[#0F431F]"
                : "border-[#0F431F] text-[#0F431F]"
            }`}
          >
            {filter.toUpperCase()}
            {filter === "unread" && ` (${unreadNotifications.length})`}
            {filter === "read" && ` (${readNotifications.length})`}
          </button>
        ))}
      </div>

      {/* Unread Section */}
      {unreadNotifications.length > 0 && activeFilter !== "read" && (
        <>
          <div className="flex justify-between mb-3">
            <h4 className="font-bold">
              Unread ({unreadNotifications.length})
            </h4>
            <button
              onClick={handleMarkAllAsRead}
              className="underline text-[#0F431F]"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-4">
            {unreadNotifications.map((n) => (
              <div
                key={n._id}
                className="flex justify-between items-center border p-4 rounded-lg bg-blue-50"
              >
                <div>
                  <h6 className="font-semibold">{n.title}</h6>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(n.createdAt)} • {n.type}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(n._id)}
                  className="w-8 h-8 hover:bg-red-200 rounded-full flex items-center justify-center"
                >
                  <img src={deleteIcon} alt="delete" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Read Section */}
      {readNotifications.length > 0 && activeFilter !== "unread" && (
        <>
          <h4 className="font-bold mt-8 mb-3">
            Previous ({readNotifications.length})
          </h4>

          <div className="space-y-4">
            {readNotifications.map((n) => (
              <div
                key={n._id}
                className="flex justify-between items-center border p-4 rounded-lg opacity-70"
              >
                <div>
                  <h6 className="font-semibold">{n.title}</h6>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(n.createdAt)} • {n.type}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(n._id)}
                  className="w-8 h-8 hover:bg-red-200 rounded-full flex items-center justify-center"
                >
                  <img src={deleteIcon} alt="delete" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-6">
          <img src={emptyImage} alt="empty" width="160" />
          <h2 className="text-2xl font-bold text-gray-500">
            No data found
          </h2>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
