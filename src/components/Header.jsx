import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiSearch, FiBell, FiChevronDown, FiSettings, FiLogOut } from "react-icons/fi";
import { logout } from "../store/authSlice";
import { toast } from "react-toastify";

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [localSearch, setLocalSearch] = useState("");
  
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    setLocalSearch("");
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to logout.");
    }
  };

  return (
    <>
      <header className="w-full h-20 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20">
        {/* Left: Menu Toggle + Search */}
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={onMenuClick}
            className="text-slate-500 hover:text-brand-900 hover:bg-brand-50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <FiMenu className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Search bar */}
          <div className="relative w-full max-w-md hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full py-2.5 pl-10 pr-4 text-[13px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 shadow-inner"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-4 relative">
          
          <button className="relative p-2 text-slate-500 hover:text-brand-900 hover:bg-brand-50 rounded-full transition-colors cursor-pointer">
            <FiBell className="w-5 h-5 stroke-[2.5]" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Profile Dropdown */}
          <div
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            ref={menuRef}
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[13px] font-bold text-slate-700 leading-none">{user?.name || "Admin"}</span>
              <span className="text-[11px] font-medium text-slate-500 mt-1">Super Admin</span>
            </div>
            
            <div className="relative w-10 h-10 rounded-full bg-brand-100 border-2 border-white shadow-sm overflow-hidden">
              <img
                src={user?.avatar || user?.photo || "/admin-avatar.png"}
                alt={user?.name || "Admin"}
                className="w-full h-full object-cover"
              />
            </div>
            <FiChevronDown className="w-4 h-4 text-slate-400" />

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-[60px] w-56 bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 sm:hidden">
                  <p className="text-sm font-bold text-slate-800">{user?.name || "Admin"}</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate("/change-password");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <FiSettings className="w-4 h-4" />
                    Change Password
                  </button>
                  
                  <div className="h-px bg-slate-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
