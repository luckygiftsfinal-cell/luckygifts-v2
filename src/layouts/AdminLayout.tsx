import React, { useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Layout, Package, Users, ShoppingCart, Settings, LogOut, Search, Bell, Crown } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Dream Store", path: "/admin/dream-store", icon: <Layout size={20} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: "VIP Users", path: "/admin/users", icon: <Users size={20} /> },
    { name: "VIP Packages", path: "/admin/vip-packages", icon: <Crown size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-[#f0ece4] font-['Outfit'] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col hidden md:flex z-20">
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link to="/" className="text-xl font-black italic tracking-tighter leading-none">
            <span className="text-white">LUCKY</span>
            <span className="text-[#FFD700]">GIFTS</span>
            <span className="ml-2 text-[10px] text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded uppercase tracking-widest">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold ${isActive
                    ? "bg-[#FFD700]/10 text-[#FFD700] shadow-[inset_4px_0_0_#FFD700]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-[#FF4500] hover:bg-[#FF4500]/10 font-bold transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Background glow for the content area */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Header */}
        <header className="h-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="text"
                placeholder="Search orders, users, products..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFD700]/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-white/60 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700]" />
            </button>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
