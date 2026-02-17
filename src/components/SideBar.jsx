import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const menuItems = [
  { name: "Dashboard", icon: "/dashboard.svg", key: "dashboard", path: "/" },
  { name: "Products", icon: "/pacakge.svg", key: "products", path: "/products" },
  { name: "Categories", icon: "/coupons.svg", key: "categories", path: "/categories" },
  { name: "Orders", icon: "/program.svg", key: "orders", path: "/orders" },
  { name: "Transactions", icon: "/transactions.svg", key: "transactions", path: "/transactions" },
  { name: "Users", icon: "/user.svg", key: "users", path: "/users" },
  { name: "Blogs", icon: "/aboutUs.svg", key: "blogs", path: "/blogs" },
];

export default function SideBar({ collapsed, mobileOpen, onClose }) {

  const navigate = useNavigate();
  const dispatch = useDispatch()
  const location = useLocation();

  const getActiveKey = () => {
    // Basic matching, could be improved for nested routes
    const current = menuItems.find(item => {
      if (item.path === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.path);
    });
    return current?.key;
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed md:static top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col justify-between transition-all duration-300 ease-in-out z-30
        ${collapsed ? "w-[80px]" : "w-[260px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className={`h-[88px] flex items-center ${collapsed ? "justify-center px-2" : "px-6"}`}>
            {!collapsed ? (
              <h1 className="text-2xl font-bold text-[#9900FF]">GauKrishna</h1>
            ) : (
              <h1 className="text-xl font-bold text-[#9900FF]">GK</h1>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto py-8 px-3 space-y-1 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = getActiveKey() === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    onClose && onClose();
                  }}
                  title={collapsed ? item.name : ""}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-4 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                      ? "bg-[#9900FF] text-white shadow-md shadow-purple-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#9900FF]"
                    }`}
                >
                  <div className={`flex items-center justify-center w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                    {/* Placeholder icons if svgs are missing, using text/emoji or keeping img tag but it might break if file missing. Keeping img tag assuming files exist or will be replaced. */}
                    <img
                      src={item.icon}
                      alt={item.name}
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = item.name[0] }}
                      className={`w-full h-full object-contain ${isActive ? "brightness-0 invert" : ""}`}
                      style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
                    />
                  </div>

                  {!collapsed && (
                    <span className="whitespace-nowrap truncate tracking-wide">
                      {item.name}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full"></div>
                  )}

                </button>
              )
            })}
          </nav>

          <div className="p-3 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={async () => {
                try {
                  dispatch(logout())
                  toast.success("Logged out successfully");
                  navigate("/login");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to logout.");
                }
              }}
              title={collapsed ? "Log Out" : ""}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 group ${collapsed ? "justify-center" : ""}`}
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
                <img src="/logOut.svg" alt="logout" className="w-5 h-5 opacity-80 group-hover:opacity-100" />
              </div>

              {!collapsed && (
                <span>Log Out</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
