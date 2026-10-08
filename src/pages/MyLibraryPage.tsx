import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Ticket, BookOpen, Package, AlertCircle, Loader2, ExternalLink, Copy, CheckCircle, ChevronRight } from "lucide-react";

interface TicketData {
  id: string;
  ticket_number: string;
  owner_name: string;
  package_name: string;
  draw_date: string;
  status: string;
  created_at: string;
  order_id: string;
}

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: any[];
}

export default function MyLibraryPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"tickets" | "orders">("tickets");
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserLibrary();
    }
  }, [user]);

  const fetchUserLibrary = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch directly from Supabase (no API needed)
      const [ticketsRes, ordersRes] = await Promise.all([
        supabase.from("tickets").select("*").eq("user_id", user?.id).eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("user_id", user?.id).order("created_at", { ascending: false }),
      ]);

      if (ticketsRes.error) console.error("Tickets error:", ticketsRes.error);
      if (ordersRes.error) console.error("Orders error:", ordersRes.error);

      const ticketsData = ticketsRes.data || [];
      const ordersData = ordersRes.data || [];

      console.log("Fetched tickets:", ticketsData.length, ticketsData);
      console.log("Fetched orders:", ordersData.length);

      setTickets(ticketsData);
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message || "Failed to load your library");
      console.error("Library fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyTicketNumber = (ticketNumber: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedTicket(ticketNumber);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-slate-400 mb-6">Please sign in to view your tickets and library.</p>
          <a href="/login" className="inline-block bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-black font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0A0A0A] to-[#12121a] border-b border-[#FFD700]/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-[#FFD700]" />
            <h1 className="text-3xl font-black text-white tracking-tight">
              My <span className="text-[#FFD700]">Library</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Manage your tickets and orders in one place.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#FFD700]">{tickets.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Active Tickets</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#FFD700]">{orders.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Orders</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#12121a] border border-white/10 rounded-xl p-1.5 mb-8">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "tickets"
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-black"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Tickets</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-black"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div>
            {tickets.length === 0 ? (
              <div className="text-center py-20">
                <Ticket className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Tickets Yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Purchase a package to get your draw tickets.
                </p>
                <a href="/store" className="inline-block bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  Browse Packages
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] border border-white/10 rounded-2xl p-6 hover:border-[#FFD700]/30 transition-all"
                  >
                    {/* Ticket Header */}
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] -mx-6 -mt-6 px-5 py-3 rounded-t-2xl flex justify-between items-center mb-4">
                      <span className="text-black font-black text-xs tracking-widest uppercase">
                        🎟 LuckyGifts Draw
                      </span>
                      <span className="bg-black/20 text-black font-bold text-xs px-2 py-1 rounded">
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-[#FFD700]/60 uppercase tracking-wider mb-1">
                      Ticket Number
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-black text-[#FFD700] tracking-wider font-mono">
                        {ticket.ticket_number}
                      </span>
                      <button
                        onClick={() => copyTicketNumber(ticket.ticket_number)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Copy ticket number"
                      >
                        {copiedTicket === ticket.ticket_number ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-t border-white/5">
                        <span className="text-slate-400">Owner</span>
                        <span className="text-white font-medium">{ticket.owner_name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-white/5">
                        <span className="text-slate-400">Package</span>
                        <span className="text-white font-medium">{ticket.package_name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-white/5">
                        <span className="text-slate-400">Draw Date</span>
                        <span className="text-[#FFD700] font-medium">{formatDate(ticket.draw_date)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-white/5">
                        <span className="text-slate-400">Purchased</span>
                        <span className="text-slate-300">{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>

                    <a
                      href={`/verify/${ticket.ticket_number}`}
                      target="_blank"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#FFD700]/20 text-[#FFD700] text-sm font-bold hover:bg-[#FFD700]/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Verify Ticket
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Your order history will appear here.
                </p>
                <a href="/store" className="inline-block bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gradient-to-br from-[#12121a] to-[#1a1a2e] border border-white/10 rounded-2xl p-5 hover:border-[#FFD700]/20 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/payment/success?order=${order.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white font-bold">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            order.status === "paid" ? "bg-green-500/20 text-green-400" :
                            order.status === "failed" ? "bg-red-500/20 text-red-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {order.items?.[0]?.name || "Package"} · {order.items?.[0]?.tickets || 1} tickets
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[#FFD700] font-black text-lg">
                            ${order.total_amount}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
