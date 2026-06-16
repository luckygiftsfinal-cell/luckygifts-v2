import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  ShoppingCart, 
  Users, 
  Crown, 
  Trophy, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronRight,
  Tag,
  Briefcase,
  Calendar
} from "lucide-react";
import { supabase } from "../lib/supabase";

const sidebarItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { path: "/admin/products", icon: Package, label: "Products" },
  { path: "/admin/dream-store", icon: Store, label: "Dream Store" },
  { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { path: "/admin/users", icon: Users, label: "VIP Users" },
  { path: "/admin/vip-packages", icon: Crown, label: "VIP Packages" },
  { path: "/admin/events", icon: Calendar, label: "Events" },
  { path: "/admin/winners", icon: Trophy, label: "Winners" },
  { path: "/admin/promo-codes", icon: Tag, label: "Promo & Referrals" },
  { path: "/admin/applications", icon: Briefcase, label: "Applications", badge: true },
  { path: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchPending = async () => {
      const { count } = await supabase
        .from("work_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingCount(count || 0);
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`sidebar fixed lg:static inset-y-0 left-0 z-50 w-[250px] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="sidebar-logo">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFC107] flex items-center justify-center">
              <span className="text-[#0a0a0f] font-bold text-base">L</span>
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-tight">LUCKYGIFTS</h1>
              <p className="text-[10px] text-[#FFD700] font-bold tracking-widest uppercase leading-tight">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="sidebar-section-title">Main Menu</p>
          {sidebarItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="ml-auto bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
                {isActive && !item.badge && (
                  <ChevronRight size={14} className="ml-auto text-[#FFD700] opacity-60" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">Admin User</p>
              <p className="sidebar-user-role">Super Admin</p>
            </div>
          </div>
          <button className="logout-btn">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="admin-header sticky top-0 z-30 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-[#64748b]"
              >
                <Menu size={18} />
              </button>
              <div className="relative hidden sm:block">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input 
                  type="text" 
                  placeholder="Search orders, users, products..."
                  className="search-input w-[300px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-white/5 text-[#64748b] transition-colors">
                <Bell size={18} />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
