import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiLayers,
  FiShoppingCart,
  FiCreditCard,
  FiUsers,
  FiFileText,
  FiLifeBuoy,
  FiTag,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";

const menuGroups = [
  {
    id: "overview",
    label: "Overview",
    items: [{ name: "Dashboard", icon: FiGrid, key: "dashboard", path: "/" }],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { name: "Products", icon: FiPackage, key: "products", path: "/products" },
      { name: "Categories", icon: FiLayers, key: "categories", path: "/categories" },
      { name: "Coupons", icon: FiTag, key: "coupons", path: "/coupons" },
    ],
  },
  {
    id: "logistics",
    label: "Orders & Logistics",
    items: [
      { name: "Orders", icon: FiShoppingCart, key: "orders", path: "/orders" },
      { name: "Transactions", icon: FiCreditCard, key: "transactions", path: "/transactions" },
    ],
  },
  {
    id: "community",
    label: "Customers & Content",
    items: [
      { name: "Users", icon: FiUsers, key: "users", path: "/users" },
      { name: "Blogs", icon: FiFileText, key: "blogs", path: "/blogs" },
      { name: "Support", icon: FiLifeBuoy, key: "contacts", path: "/contact-us" },
    ],
  },
];

const allItems = menuGroups.flatMap((group) => group.items);

export default function SideBar({ collapsed, mobileOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({
    overview: true,
    catalog: true,
    logistics: true,
    community: true,
  });

  const activeKey = useMemo(() => {
    const current = allItems.find((item) => {
      if (item.path === "/") return location.pathname === "/" || location.pathname === "/dashboard";
      return location.pathname.startsWith(item.path);
    });
    return current?.key;
  }, [location.pathname]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed md:static top-0 left-0 h-screen bg-brand-950 border-r border-brand-900 flex flex-col justify-between transition-all duration-300 ease-in-out z-30
        ${collapsed ? "w-[80px]" : "w-[260px]"}
        ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className={`h-20 flex items-center border-b border-brand-900 ${collapsed ? "justify-center px-2" : "px-6"}`}>
            {!collapsed ? (
              <img src="/sidebar.png" className="h-30 object-contain drop-shadow-sm" alt="GauKrishna" />
            ) : (
              <img src="/logo1.png" className="h-30 object-contain drop-shadow-sm" alt="GK" />
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-5 px-4 custom-scrollbar">
            {menuGroups.map((group) => {
              const isOpen = collapsed || openGroups[group.id];
              return (
                <div key={group.id} className="mb-5 last:mb-0">
                  {!collapsed && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-3 mb-2"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-100/45">
                        {group.label}
                      </span>
                      <FiChevronDown
                        className={`w-3.5 h-3.5 text-brand-100/35 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
                      />
                    </button>
                  )}

                  {isOpen && (
                    <div className="space-y-1.5">
                      {group.items.map((item) => {
                        const isActive = activeKey === item.key;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              navigate(item.path);
                              onClose && onClose();
                            }}
                            title={collapsed ? item.name : ""}
                            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-[14px] font-bold transition-all duration-200 group relative
                            ${collapsed ? "justify-center px-0" : ""}
                            ${isActive
                                ? "bg-brand-900 text-gold-400 shadow-sm shadow-brand-950/50"
                                : "text-brand-100/70 hover:bg-brand-900/50 hover:text-gold-300"
                              }`}
                          >
                            <div className={`flex items-center justify-center transition-transform group-hover:scale-110 
                              ${isActive ? "text-gold-400" : "text-brand-100/50 group-hover:text-gold-300"}`}>
                              <Icon className="w-5 h-5 stroke-[2.5]" />
                            </div>

                            {!collapsed && (
                              <span className="whitespace-nowrap truncate tracking-wide">
                                {item.name}
                              </span>
                            )}
                            {isActive && !collapsed && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold-400 rounded-r-full shadow-[0_0_8px_rgba(197,160,48,0.5)]"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-brand-900 bg-brand-950">
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
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-[14px] font-bold transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-sm group ${collapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
                <FiLogOut className="w-5 h-5 stroke-[2.5] opacity-80 group-hover:opacity-100" />
              </div>
              {!collapsed && <span>Log Out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
