import React, { useState } from "react";
import { Search, Filter, Download, Eye, CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../context/StoreContext";

const mockOrders = [
  { id: "ORD-7742", user: "Ahmed Al-Maktoum", date: "2026-05-10", total: "$150.00", status: "Delivered", items: 3, payment: "Credit Card" },
  { id: "ORD-7743", user: "Sarah Johnson", date: "2026-05-11", total: "$25.00", status: "Pending", items: 1, payment: "PayPal" },
  { id: "ORD-7744", user: "Khalid Mansour", date: "2026-05-11", total: "$500.00", status: "Processing", items: 5, payment: "Bank Transfer" },
  { id: "ORD-7745", user: "Elena Rodriguez", date: "2026-05-12", total: "$100.00", status: "Shipped", items: 2, payment: "Credit Card" },
  { id: "ORD-7746", user: "James Wilson", date: "2026-05-12", total: "$45.00", status: "Cancelled", items: 1, payment: "Credit Card" },
];

export default function AdminOrders() {
  const { orders, updateOrder } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20";
      case "Pending": return "bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20";
      case "Processing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Shipped": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-white/5 text-white/40 border-white/10";
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      updateOrder({ ...order, status: newStatus });
      toast.success(`Order ${id} updated to ${newStatus}`);
    }
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Date", "Total", "Status", "Payment"];
    const rows = orders.map(o => [o.id, o.user, o.date, o.total, o.status, o.payment]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LuckyGifts_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Orders Management</h1>
          <p className="text-white/40">Track and manage customer purchases and delivery status.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all border border-white/10"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-white/40" />
          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <th className="py-5 px-6">Order ID</th>
                <th className="py-5 px-6">Customer</th>
                <th className="py-5 px-6">Date</th>
                <th className="py-5 px-6">Total</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6">Payment</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6 font-mono text-sm text-[#FFD700] font-bold">{order.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-transparent flex items-center justify-center text-xs font-bold text-[#FFD700]">
                        {order.user.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{order.user}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/60 text-sm">{order.date}</td>
                  <td className="py-4 px-6 text-white font-black">{order.total}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">{order.payment}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <div className="w-[1px] h-4 bg-white/10" />
                      <button 
                        onClick={() => updateStatus(order.id, "Delivered")}
                        className="p-2 text-white/40 hover:text-[#00C853] transition-colors"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Order {selectedOrder.id}</h3>
                <p className="text-white/40 text-sm">{selectedOrder.date}</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-white/20 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Customer Details</h4>
                <div className="text-sm">
                  <p className="text-white font-bold">{selectedOrder.user}</p>
                  <p className="text-white/40">customer@example.com</p>
                  <p className="text-white/40">+971 50 123 4567</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Shipping Address</h4>
                <div className="text-sm text-white/40">
                  <p>Downtown Dubai, Burj Khalifa St.</p>
                  <p>Building 4, Apartment 1204</p>
                  <p>Dubai, UAE</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Order Items</h4>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-lg" />
                      <div>
                        <p className="text-sm text-white font-bold italic">Signature Item #{i}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Qty: 1</p>
                      </div>
                    </div>
                    <p className="text-sm text-white font-black">$50.00</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white font-medium">$100.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Shipping</span>
                <span className="text-white font-medium">$10.00</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t border-white/10 pt-3">
                <span className="text-white uppercase tracking-widest">Total</span>
                <span className="text-[#FFD700]">{selectedOrder.total}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
              >
                Close Details
              </button>
              <button 
                onClick={() => {
                  updateStatus(selectedOrder.id, "Shipped");
                  setSelectedOrder(null);
                }}
                className="flex-1 py-3 rounded-xl bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <Truck size={14} /> Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
