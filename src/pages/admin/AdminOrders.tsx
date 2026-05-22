import { useState, useMemo } from "react";
import { Search, Filter, Download, Eye, Package, Truck, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

// Status configuration
const statusConfig = {
  delivered: { icon: CheckCircle, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", label: "Delivered" },
  processing: { icon: Clock, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", label: "Processing" },
  shipped: { icon: Truck, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)", label: "Shipped" },
  pending: { icon: Package, color: "#FFC107", bg: "rgba(255, 193, 7, 0.15)", label: "Pending" },
  cancelled: { icon: XCircle, color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", label: "Cancelled" },
  paid: { icon: CheckCircle, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", label: "Paid" },
};

export default function AdminOrders() {
  const { orders: storeOrders, refreshData } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use real orders from store, fallback to empty array
  const orders = storeOrders || [];

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(order.items) && order.items.some((item: any) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const totalRevenue = orders
      .filter((o) => o.status === "paid" || o.status === "delivered")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return [
      { label: "Total Orders", value: total.toLocaleString(), color: "#3B82F6" },
      { label: "Delivered", value: delivered.toLocaleString(), color: "#10B981" },
      { label: "Pending", value: pending.toLocaleString(), color: "#FFC107" },
      { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}k`, color: "#8B5CF6" },
    ];
  }, [orders]);

  // Export to CSV
  const handleExport = async () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    setIsExporting(true);
    try {
      // Prepare CSV data
      const headers = ["Order ID", "Customer", "Email", "Items", "Amount", "Status", "Payment", "Date"];
      const rows = filteredOrders.map((order) => [
        order.id,
        order.full_name || "N/A",
        order.email || "N/A",
        Array.isArray(order.items)
          ? order.items.map((item: any) => item.title).join("; ")
          : "N/A",
        `$${order.total_amount?.toFixed(2) || "0.00"}`,
        order.status,
        order.payment_method || "N/A",
        new Date(order.created_at).toLocaleDateString(),
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filteredOrders.length} orders successfully`);
    } catch (error) {
      toast.error("Export failed");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshData();
      toast.success("Orders refreshed");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {orders.length} total orders · {filteredOrders.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-secondary"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredOrders.length === 0}
            className="btn-primary"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card text-center">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[#64748b] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search orders, customers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  statusFilter === f
                    ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={48} className="mx-auto text-[#475569] mb-4" />
            <p className="text-[#64748b]">
              {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusKey = order.status as keyof typeof statusConfig;
                const config = statusConfig[statusKey] || statusConfig.pending;
                const StatusIcon = config.icon;

                // Format items
                const itemsText = Array.isArray(order.items)
                  ? order.items.map((item: any) => item.title).join(", ")
                  : "N/A";

                return (
                  <tr key={order.id}>
                    <td className="font-mono text-sm text-[#FFD700]">
                      #{order.id?.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-semibold text-white">{order.full_name || "N/A"}</p>
                        <p className="text-xs text-[#64748b]">{order.email || "N/A"}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-[#94a3b8] max-w-[200px] truncate" title={itemsText}>
                        {itemsText}
                      </p>
                    </td>
                    <td className="font-bold text-white">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: config.bg, color: config.color }}
                      >
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="text-[#94a3b8] capitalize">{order.payment_method || "N/A"}</td>
                    <td className="text-[#94a3b8]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-[#94a3b8]">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
