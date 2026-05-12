import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Package, Ticket, Calendar, CheckCircle, Clock } from "lucide-react";

const mockOrders = [
  {
    id: "ORD-2026-8921",
    date: "12 May 2026",
    product: "Luxury Pen Set",
    campaign: "Win a Tesla Model S",
    tickets: 5,
    amount: "$50.00",
    status: "completed"
  },
  {
    id: "ORD-2026-8922",
    date: "10 May 2026",
    product: "LuckyGifts Hoodie",
    campaign: "Win $10,000 Cash",
    tickets: 2,
    amount: "$20.00",
    status: "completed"
  },
  {
    id: "ORD-2026-8923",
    date: "05 May 2026",
    product: "Signature Keychain",
    campaign: "Win a Rolex Submariner",
    tickets: 1,
    amount: "$10.00",
    status: "processing"
  }
];

export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0ece4] pt-32 pb-24 font-['Outfit']">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        <div className="mb-12">
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter">Order History</h1>
          <p className="text-white/40 font-medium">Track your past purchases and earned tickets.</p>
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
                {mockOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/50 group-hover:text-[#FFD700] transition-colors">
                          <Package size={14} />
                        </div>
                        <span className="font-bold text-white text-sm">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-white/60 text-sm flex items-center gap-2 mt-2">
                      <Calendar size={14} /> {order.date}
                    </td>
                    <td className="py-5 px-4">
                      <p className="font-bold text-white text-sm mb-1">{order.product}</p>
                      <p className="text-xs text-[#FFD700]">{order.campaign}</p>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md px-2 py-1 w-fit">
                        <Ticket size={12} className="text-[#FFD700]" />
                        <span className="text-xs font-black text-[#FFD700]">{order.tickets}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 font-bold text-white text-sm">
                      {order.amount}
                    </td>
                    <td className="py-5 px-4">
                      {order.status === "completed" ? (
                        <div className="flex items-center gap-1.5 text-[#00C853] bg-[#00C853]/10 px-2 py-1 rounded-md w-fit text-xs font-bold uppercase tracking-wider">
                          <CheckCircle size={12} /> Completed
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#FFA000] bg-[#FFA000]/10 px-2 py-1 rounded-md w-fit text-xs font-bold uppercase tracking-wider">
                          <Clock size={12} /> Processing
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
