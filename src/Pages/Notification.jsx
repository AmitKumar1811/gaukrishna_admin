import React, { useState } from "react";
import { FiBell, FiTrash2, FiCheckCircle } from "react-icons/fi";

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
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Notifications</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Stay updated with the latest alerts.</p>
          </div>
          <button
            onClick={() => setNotifications([])}
            className="text-[13px] text-slate-500 hover:text-slate-700 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {["all", "unread", "read"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors cursor-pointer ${
                activeFilter === filter
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === "unread" && ` (${unreadNotifications.length})`}
              {filter === "read" && ` (${readNotifications.length})`}
            </button>
          ))}
        </div>

        {/* Unread Section */}
        {unreadNotifications.length > 0 && activeFilter !== "read" && (
          <div>
            <div className="flex justify-between mb-3">
              <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">
                Unread ({unreadNotifications.length})
              </h4>
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 text-[13px] text-brand-600 font-semibold hover:text-brand-700 cursor-pointer"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {unreadNotifications.map((n) => (
                <div
                  key={n._id}
                  className="flex justify-between items-center border border-brand-200 p-4 rounded-xl bg-brand-50/30"
                >
                  <div>
                    <h6 className="text-[14px] font-bold text-slate-800">{n.title}</h6>
                    <p className="text-[13px] text-slate-500 font-medium mt-0.5">{n.message}</p>
                    <div className="text-[11px] text-slate-400 font-semibold mt-1.5 uppercase tracking-wide">
                      {formatDate(n.createdAt)} • {n.type.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="w-8 h-8 hover:bg-rose-50 hover:text-rose-600 rounded-lg flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read Section */}
        {readNotifications.length > 0 && activeFilter !== "unread" && (
          <div>
            <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-3">
              Previous ({readNotifications.length})
            </h4>

            <div className="space-y-3">
              {readNotifications.map((n) => (
                <div
                  key={n._id}
                  className="flex justify-between items-center border border-slate-100 p-4 rounded-xl bg-white opacity-80"
                >
                  <div>
                    <h6 className="text-[14px] font-bold text-slate-700">{n.title}</h6>
                    <p className="text-[13px] text-slate-400 font-medium mt-0.5">{n.message}</p>
                    <div className="text-[11px] text-slate-400 font-semibold mt-1.5 uppercase tracking-wide">
                      {formatDate(n.createdAt)} • {n.type.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(n._id)}
                    className="w-8 h-8 hover:bg-rose-50 hover:text-rose-600 rounded-lg flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="bg-slate-50 p-4 rounded-full">
              <FiBell className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            </div>
            <p className="font-semibold text-slate-600 text-base">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
