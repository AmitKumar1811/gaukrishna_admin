import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { FiGrid, FiPackage, FiLayers, FiShoppingCart, FiCreditCard, FiUsers, FiFileText, FiLifeBuoy, FiLogOut } from "react-icons/fi";

const menuItems = [
  { name: "Dashboard", icon: FiGrid, key: "dashboard", path: "/" },
  { name: "Products", icon: FiPackage, key: "products", path: "/products" },
  { name: "Categories", icon: FiLayers, key: "categories", path: "/categories" },
  { name: "Orders", icon: FiShoppingCart, key: "orders", path: "/orders" },
  { name: "Transactions", icon: FiCreditCard, key: "transactions", path: "/transactions" },
  { name: "Users", icon: FiUsers, key: "users", path: "/users" },
  { name: "Blogs", icon: FiFileText, key: "blogs", path: "/blogs" },
  { name: "Support", icon: FiLifeBuoy, key: "contacts", path: "/contact-us" },
];

export default function SideBar({ collapsed, mobileOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const getActiveKey = () => {
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

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = getActiveKey() === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.path);
                    onClose && onClose();
                  }}
                  title={collapsed ? item.name : ""}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 group relative
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
              )
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
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-sm group ${collapsed ? "justify-center" : ""}`}
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
