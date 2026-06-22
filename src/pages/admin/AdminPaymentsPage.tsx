import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { 
  Search, RefreshCw, Mail, Eye, CheckCircle, XCircle, Clock, 
  AlertTriangle, Loader2, Ticket, Package, ChevronDown, ChevronUp,
  CreditCard, TrendingUp, AlertOctagon
} from "lucide-react";

interface Order {
  id: string;
  full_name: string;
  email: string;
  total_amount: number;
  status: string;
  tickets_earned: number;
  ebook_delivered: boolean;
  email_sent: boolean;
  created_at: string;
  payment_details: any;
  items: any[];
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    failed: 0,
    pending: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ordersData = data || [];
      setOrders(ordersData);

      setStats({
        total: ordersData.length,
        paid: ordersData.filter((o: Order) => o.status === "paid").length,
        failed: ordersData.filter((o: Order) => o.status === "failed").length,
        pending: ordersData.filter((o: Order) => o.status === "pending").length,
        revenue: ordersData
          .filter((o: Order) => o.status === "paid")
          .reduce((sum: number, o: Order) => sum + (o.total_amount || 0), 0),
      });
    } catch (err: any) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (orderId: string) => {
    try {
      setResendingEmail(orderId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/.netlify/functions/resend-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to resend email");
      }

      alert("Email resent successfully!");
      fetchOrders();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setResendingEmail(null);
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.payment_details?.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc" 
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === "desc" 
        ? (b.total_amount || 0) - (a.total_amount || 0)
        : (a.total_amount || 0) - (b.total_amount || 0);
    });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-20">
      {/* Header */}
      <div className="admin-header py-6 px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Payment <span className="text-gold">Management</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Monitor and manage all payment transactions</p>
          </div>
          <button onClick={fetchOrders} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-icon bg-blue-500/20 text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green-500/20 text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="stat-value text-green-400">{stats.paid}</div>
            <div className="stat-label">Paid</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red-500/20 text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="stat-value text-red-400">{stats.failed}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-yellow-500/20 text-yellow-400">
              <Clock className="w-5 h-5" />
            </div>
            <div className="stat-value text-yellow-400">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-gold/20 text-gold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="stat-value text-gold">${stats.revenue.toFixed(2)}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, email, name, or transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/30"
            >
              <option value="all" className="bg-dark-800">All Status</option>
              <option value="paid" className="bg-dark-800">Paid</option>
              <option value="failed" className="bg-dark-800">Failed</option>
              <option value="pending" className="bg-dark-800">Pending</option>
            </select>
            <button
              onClick={() => {
                setSortBy(sortBy === "date" ? "amount" : "date");
                setSortOrder(sortOrder === "desc" ? "asc" : "desc");
              }}
              className="btn-secondary"
            >
              {sortBy === "date" ? "Date" : "Amount"}
              {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Tickets</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                    <td>
                      <span className="text-white font-mono text-sm font-bold">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="text-white text-sm">{order.full_name || "N/A"}</div>
                      <div className="text-slate-500 text-xs">{order.email || "N/A"}</div>
                    </td>
                    <td>
                      <span className="text-gold font-bold text-sm">${order.total_amount}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-gold" />
                        <span className="text-white text-sm">{order.tickets_earned || 0}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs font-medium ${order.email_sent ? "text-green-400" : "text-red-400"}`}>
                        {order.email_sent ? "Sent" : "Not Sent"}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-400 text-xs">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resendEmail(order.id);
                          }}
                          disabled={resendingEmail === order.id}
                          className="p-2 rounded-lg bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 transition-colors disabled:opacity-50"
                          title="Resend email"
                        >
                          {resendingEmail === order.id ? (
                            <Loader2 className="w-4 h-4 text-gold animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4 text-gold" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No orders found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white">
                  Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span className={`status-badge ${selectedOrder.status}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.toUpperCase()}
                </span>
                <span className={`text-sm font-medium ${selectedOrder.email_sent ? "text-green-400" : "text-red-400"}`}>
                  Email: {selectedOrder.email_sent ? "Sent ✓" : "Not Sent ✗"}
                </span>
              </div>

              {/* Customer */}
              <div className="bg-dark-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Name</span>
                    <p className="text-white font-medium">{selectedOrder.full_name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email</span>
                    <p className="text-white font-medium">{selectedOrder.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-dark-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Amount</span>
                    <p className="text-gold font-black text-lg">${selectedOrder.total_amount}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tickets</span>
                    <p className="text-white font-bold flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-gold" />
                      {selectedOrder.tickets_earned || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">eBook</span>
                    <p className="text-white">{selectedOrder.ebook_delivered ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Method</span>
                    <p className="text-white">{selectedOrder.payment_method || "Crypto"}</p>
                  </div>
                </div>
              </div>

              {/* Transaction */}
              {selectedOrder.payment_details?.transaction_id && (
                <div className="bg-dark-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Transaction</h3>
                  <div className="text-sm">
                    <span className="text-slate-500">Transaction ID</span>
                    <p className="text-white font-mono">{selectedOrder.payment_details.transaction_id}</p>
                  </div>
                  {selectedOrder.payment_details.failure_reason && (
                    <div className="text-sm mt-2">
                      <span className="text-slate-500">Failure Reason</span>
                      <p className="text-red-400">{selectedOrder.payment_details.failure_reason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-dark-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items</h3>
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-slate-500 text-xs">{item.tickets} tickets</p>
                      </div>
                      <span className="text-gold font-bold">${item.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => resendEmail(selectedOrder.id)}
                  disabled={resendingEmail === selectedOrder.id}
                  className="btn-primary flex-1 justify-center disabled:opacity-50"
                >
                  {resendingEmail === selectedOrder.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Resend Email
                </button>
                <a
                  href={`/payment/success?order=${selectedOrder.id}`}
                  target="_blank"
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Page
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
