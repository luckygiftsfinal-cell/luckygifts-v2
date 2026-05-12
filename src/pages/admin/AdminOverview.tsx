import React, { useState } from "react";
import { Users, ShoppingCart, DollarSign, Package, ArrowUpRight, TrendingUp, XCircle, CreditCard, PieChart } from "lucide-react";
import { useStore } from "../../context/StoreContext";

export default function AdminOverview() {
  const { products, orders, draws, categories } = useStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const totalRevenue = orders.reduce((acc, order) => {
    const val = parseFloat(order.total.replace('$', '').replace(',', '')) || 0;
    return acc + val;
  }, 0);

  const deliveredRevenue = orders.filter(o => o.status === "Delivered").reduce((acc, o) => acc + parseFloat(o.total.replace('$', '')), 0);
  const pendingRevenue = orders.filter(o => o.status === "Pending").reduce((acc, o) => acc + parseFloat(o.total.replace('$', '')), 0);

  const stats = [
    { id: 'revenue', title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+20.1%", icon: <DollarSign size={24} />, color: "text-[#00C853]", bg: "bg-[#00C853]/10" },
    { id: 'users', title: "Active Users", value: "2,350", change: "+15.2%", icon: <Users size={24} />, color: "text-[#FFD700]", bg: "bg-[#FFD700]/10" },
    { id: 'orders', title: "Total Orders", value: orders.length.toString(), change: "+8.4%", icon: <ShoppingCart size={24} />, color: "text-[#FF4500]", bg: "bg-[#FF4500]/10" },
    { id: 'campaigns', title: "Active Campaigns", value: draws.length.toString(), change: "Same", icon: <Package size={24} />, color: "text-white", bg: "bg-white/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-white/40">Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setActiveModal(stat.id)}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-[#00C853] text-xs font-bold bg-[#00C853]/10 px-2 py-1 rounded-md">
                <TrendingUp size={12} /> {stat.change}
              </div>
            </div>
            <h3 className="text-white/50 text-sm font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/20 group-hover:text-white uppercase tracking-widest transition-all">
              View Analytics <ArrowUpRight size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setActiveModal(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  activeModal === 'revenue' ? 'bg-[#00C853]/10 text-[#00C853]' : 
                  activeModal === 'users' ? 'bg-[#FFD700]/10 text-[#FFD700]' :
                  activeModal === 'orders' ? 'bg-[#FF4500]/10 text-[#FF4500]' :
                  'bg-white/10 text-white'
                }`}>
                  {activeModal === 'revenue' ? <PieChart size={24} /> : 
                   activeModal === 'users' ? <Users size={24} /> :
                   activeModal === 'orders' ? <ShoppingCart size={24} /> :
                   <Package size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {activeModal === 'revenue' ? 'Revenue Breakdown' : 
                     activeModal === 'users' ? 'User Analytics' :
                     activeModal === 'orders' ? 'Order Insights' :
                     'Campaign Performance'}
                  </h3>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Detailed statistics & logs</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 text-white/20 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content based on activeModal */}
            {activeModal === 'revenue' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Delivered</p>
                    <p className="text-2xl font-black text-[#00C853]">${deliveredRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Pending</p>
                    <p className="text-2xl font-black text-[#FFD700]">${pendingRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Top Transactions</h4>
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-white font-bold">{o.user}</span>
                      <span className="text-[#FFD700] font-black">{o.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'users' && (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">New</p>
                    <p className="text-xl font-black text-white">45</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">VIP</p>
                    <p className="text-xl font-black text-[#FFD700]">128</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Banned</p>
                    <p className="text-xl font-black text-red-500">2</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Recently Joined</h4>
                  {['Ahmed', 'Sarah', 'Khalid'].map((u, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#FFD700] font-bold text-xs">{u[0]}</div>
                      <span className="text-white font-bold">{u} Al-Fulan</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'orders' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Processing</p>
                    <p className="text-2xl font-black text-blue-500">12</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Shipped</p>
                    <p className="text-2xl font-black text-purple-500">8</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Status Log</h4>
                  {orders.map(o => (
                    <div key={o.id} className="flex justify-between items-center p-3 border-b border-white/5">
                      <span className="text-sm text-white/60 font-mono">{o.id}</span>
                      <span className="text-xs font-black uppercase tracking-widest text-white">{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'campaigns' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Draw Participation</h4>
                  {draws.map(d => (
                    <div key={d.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-white font-bold italic">{d.name}</span>
                        <span className="text-xs text-[#FFD700] font-black">{d.entries.toLocaleString()} Entries</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FFD700]" 
                          style={{ width: `${Math.min((d.entries / 20000) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-4 mt-8 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all border border-white/10"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg min-h-[400px] flex flex-col relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 blur-[100px] -z-10" />
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={20} className="text-[#FFD700]" /> Revenue Performance
              </h3>
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Daily sales overview</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="flex-1 relative flex items-end justify-between gap-4 px-4 pb-8 overflow-x-auto custom-scrollbar">
            {/* Simulated Chart Bars */}
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 min-w-[40px] flex flex-col items-center gap-4 group">
                <div className="relative w-full">
                  <div 
                    style={{ height: `${height}%` }} 
                    className="w-full max-w-[40px] mx-auto bg-gradient-to-t from-[#FFD700]/20 to-[#FFD700] rounded-t-lg transition-all duration-1000 group-hover:scale-x-110 group-hover:brightness-125 relative"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ${(height * 45).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg min-h-[400px] flex flex-col relative overflow-hidden">
           {/* Background Glow */}
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/5 blur-[80px] -z-10" />
           
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <ArrowUpRight size={20} className="text-[#00C853]" /> Recent Activity
          </h3>
          <div className="flex-1 space-y-8">
            {[
              { text: "New VIP Order", user: "Ahmed Al-Maktoum", time: "2 min ago", color: "bg-[#FFD700]" },
              { text: "Account Verified", user: "Sarah Johnson", time: "15 min ago", color: "bg-[#00C853]" },
              { text: "Stock Alert", user: "Luxury Pen Set (Low)", time: "1 hour ago", color: "bg-red-500" },
              { text: "Campaign Started", user: "Mega Draw June", time: "3 hours ago", color: "bg-blue-500" },
              { text: "User Banned", user: "BadActor_99", time: "5 hours ago", color: "bg-white/20" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 4 && <div className="absolute left-[7px] top-6 w-[1px] h-8 bg-white/5" />}
                <div className={`w-4 h-4 mt-1 rounded-full ${activity.color} shadow-lg shrink-0 border-4 border-[#0a0a0a] z-10`} />
                <div>
                  <p className="text-sm text-white font-bold leading-tight">{activity.text}</p>
                  <p className="text-xs text-white/40 mt-0.5">{activity.user}</p>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 mt-6 border border-white/5 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}
