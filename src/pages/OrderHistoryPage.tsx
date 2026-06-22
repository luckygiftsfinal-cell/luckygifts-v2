import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { Package, Ticket, Calendar, CheckCircle, Clock, Share2, Copy, Check, Gift, Coins, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";

export default function OrderHistoryPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { orders, tickets } = useStore();
  const [viewingTickets, setViewingTickets] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const referralLink = user?.referralCode 
    ? `${window.location.origin}?ref=${user.referralCode}`
    : '';

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(lang === 'AR' ? "تم نسخ رابط الإحالة!" : "Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const userOrders = orders.filter(o => o.user_id === user?.id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ece4] pt-32 pb-24 font-['Outfit']">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Dashboard</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter">Order History</h1>
            <p className="text-white/40 font-medium">Track your past purchases and earned tickets.</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex items-center gap-6 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.1)]">
              <Share2 size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Your Referral Link</p>
              <p className="text-xs font-mono text-[#FFD700] truncate max-w-[200px]">
                {referralLink || 'Loading...'}
              </p>
              {user?.referralCode && (
                <p className="text-[10px] text-white/30 mt-1">Code: {user.referralCode}</p>
              )}
            </div>
            <button 
              onClick={copyReferral}
              className="p-3 hover:bg-white/5 rounded-xl transition-all text-[#FFD700] hover:scale-110 active:scale-95"
              title="Copy Link"
              disabled={!referralLink}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}>
              <Ticket size={22} />
            </div>
            <div className="stat-value">{user?.ticketBalance || 0}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
              <Gift size={22} />
            </div>
            <div className="stat-value">{user?.totalReferrals || 0}</div>
            <div className="stat-label">Referrals</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#3B82F6' }}>
              <Coins size={22} />
            </div>
            <div className="stat-value">{user?.referralPoints || 0}</div>
            <div className="stat-label">Points</div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Product / Campaign</th>
                  <th className="py-4 px-4">Tickets</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userOrders.length > 0 ? userOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/50 group-hover:text-[#FFD700] transition-colors">
                          <Package size={14} />
                        </div>
                        <span className="font-bold text-white text-[10px] font-mono">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-white/60 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="font-bold text-white text-sm mb-1">{order.items?.[0]?.title || "Items"}</p>
                      {order.items?.length > 1 && <p className="text-[10px] text-white/40">+{order.items.length - 1} more items</p>}
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md px-2 py-1 w-fit">
                        <Ticket size={12} className="text-[#FFD700]" />
                        <span className="text-xs font-black text-[#FFD700]">{order.tickets_earned}</span>
                      </div>
                      <button 
                        onClick={() => setViewingTickets(order.id)}
                        className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2 hover:text-[#FFD700] transition-colors"
                      >
                        View Codes
                      </button>
                    </td>
                    <td className="py-5 px-4 font-bold text-white text-sm">
                      ${order.total_amount?.toLocaleString()}
                    </td>
                    <td className="py-5 px-4">
                      {order.status === "paid" || order.status === "Delivered" ? (
                        <div className="flex items-center gap-1.5 text-[#00C853] bg-[#00C853]/10 px-2 py-1 rounded-md w-fit text-xs font-bold uppercase tracking-wider">
                          <CheckCircle size={12} /> Paid
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#FFA000] bg-[#FFA000]/10 px-2 py-1 rounded-md w-fit text-xs font-bold uppercase tracking-wider">
                          <Clock size={12} /> {order.status}
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-white/20 font-bold uppercase tracking-widest">
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-[#FFD700]/10 to-transparent border border-[#FFD700]/20 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Invite Friends & Earn Points</h3>
            <p className="text-sm text-white/40 mt-1">Earn 1 point for every $35 your friends spend</p>
          </div>
          <Link 
            to="/referral" 
            className="btn-primary px-6 py-3 text-sm"
          >
            <TrendingUp size={16} />
            View Referrals
          </Link>
        </div>

        {viewingTickets && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setViewingTickets(null)} />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Your Tickets</h3>
              <p className="text-white/40 text-xs font-mono mb-6">Order: {viewingTickets}</p>

              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tickets.filter(t => t.order_id === viewingTickets).map((ticket, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-xs font-black text-[#FFD700] font-mono">{ticket.ticket_code}</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{ticket.status}</span>
                  </div>
                ))}
                {tickets.filter(t => t.order_id === viewingTickets).length === 0 && (
                  <p className="text-center py-10 text-white/20 text-xs font-bold uppercase tracking-widest">Generating tickets...</p>
                )}
              </div>

              <button 
                onClick={() => setViewingTickets(null)}
                className="w-full py-4 mt-8 bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
