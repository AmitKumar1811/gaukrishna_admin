import { FiMenu } from "react-icons/fi";
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
// import { clearSearch, setSearchQuery } from "../store/searchSlice"; // Removed
// import debounce from "lodash.debounce"; // Removed
import { IoNotificationsOutline } from "react-icons/io5";

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [localSearch, setLocalSearch] = useState("");
  // const searchQuery = useSelector((state) => state.search.query); // Removed
  const dispatch = useDispatch();

  const location = useLocation();

  useEffect(() => {
    setLocalSearch("");        // instant UI clear
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

  const title = useSelector((state) => state.auth.user);

  console.log("heas", title)
  return (
    <>
      {/* ===== HEADER BAR ===== */}
      <header className="w-full flex items-center justify-between px-5 py-4 bg-[#FFFFFF] shadow-md z-10 relative">
        {/* Left: Menu + Search */}
        <div className="flex items-center  gap-6">
          <button
            onClick={onMenuClick}
            className="text-white cursor-pointer bg-[#9900FF] p-2 rounded-[6px] text-2xl"
          >
            <FiMenu />
          </button>

          {/* 👇 Search bar hidden on small screens */}
          <div className="relative w-full hidden md:block">
            <input
              type="text"

              placeholder="Search here..."
              className="w-full py-2 pr-10 pl-4 text-[14px] text-[#5F5F5F] font-normal border border-[#E5E5E5] rounded-[50px] bg-[#FAF9F9] focus:outline-none"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
              }}
            />
            <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-[#5F5F5F]"></i>
          </div>
        </div>

        {/* Right: Icons + Profile */}
        <div className="flex items-center gap-3 relative">


          {/* <IoNotificationsOutline onClick={()=>navigate("/notifications")} className="cursor-pointer" size={22} /> */}


          {/* Profile Button */}
          <div
            className="pl-5 flex items-center gap-2 bg-[#9900FF] text-[#FFFFFF] rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[50px] rounded-br-[50px] cursor-pointer relative"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            ref={menuRef}
          >
            <span className="text-[16px] font-regular">{title?.name ? title?.name : "Admin"}</span>
            <img
              src={"profile.svg"}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div ref={menuRef}
                className="absolute right-0 md:right-[20px] top-[58px] bg-white rounded-[8px] shadow-lg z-50"
                style={{
                  width: "250px",
                  minWidth: "250px",
                  padding: "16px",
                }}
              >    <ul className="flex flex-col text-[16px] font-regular text-[#1E1E1E]">
                  {[
                    // { label: "Edit Profile", link: "/edit-profile" },
                    { label: "Change Password", link: "/change-password" },
                    // { label: "Bank Account Details", link: "/bank-details" },
                    // { label: "Contact Us", link: "/contact" },
                    // { label: "About Us", link: "/about" },
                    // { label: "Term & Condition", link: "/terms" },
                    // { label: "Privacy Policy", link: "/privacy" },
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="py-4 px-4 hover:bg-[#F3EBDE] cursor-pointer border-[#E5E5E5] border-b last:border-b-0"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate(item.link);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
