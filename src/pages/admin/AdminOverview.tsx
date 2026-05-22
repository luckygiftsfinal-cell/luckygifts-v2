import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Gift,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, CreditCard, Wallet, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useStore } from "../../context/StoreContext";
import { supabase } from "../../lib/supabase";

// ── helpers ────────────────────────────────────────────────────────────────
function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round(((a - b) / b) * 100);
}

function fmtMoney(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function avatarInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#10B981","#3B82F6","#FFC107","#8B5CF6","#EF4444","#06B6D4","#F59E0B"];

// ── component ──────────────────────────────────────────────────────────────
export default function AdminOverview() {
  const { orders, products, refreshData } = useStore();
  const [userCount, setUserCount]   = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod]         = useState<"7"|"30"|"all">("30");

  // fetch user count from profiles table
  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true })
      .then(({ count }) => setUserCount(count ?? 0));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // ── date filter ───────────────────────────────────────────────────────────
  const now = Date.now();
  const msInDay = 86400000;

  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;
    const cutoff = now - parseInt(period) * msInDay;
    return orders.filter(o => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, period]);

  const prevOrders = useMemo(() => {
    if (period === "all") return [];
    const days = parseInt(period);
    const start = now - days * 2 * msInDay;
    const end   = now - days * msInDay;
    return orders.filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= start && t < end;
    });
  }, [orders, period]);

  // ── stats ─────────────────────────────────────────────────────────────────
  const totalRevenue  = filteredOrders.filter(o => o.status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0);
  const prevRevenue   = prevOrders.filter(o => o.status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalOrders   = filteredOrders.length;
  const prevOrdersCnt = prevOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.status === "pending" || o.status === "processing").length;
  const activeProducts = products.length;

  const revChange = pct(totalRevenue, prevRevenue);
  const ordChange = pct(totalOrders, prevOrdersCnt);

  const statsData = [
    {
      title: "Total Revenue",     value: fmtMoney(totalRevenue),
      change: `${revChange >= 0 ? "+" : ""}${revChange}%`,
      trend: revChange >= 0 ? "up" : "down",
      icon: DollarSign, color: "#3B82F6", bgColor: "rgba(59,130,246,0.15)",
      subtitle: `${filteredOrders.filter(o => o.status === "paid").length} paid orders`
    },
    {
      title: "Total Users",       value: userCount !== null ? userCount.toLocaleString() : "…",
      change: "+", trend: "up",
      icon: Users, color: "#10B981", bgColor: "rgba(16,185,129,0.15)",
      subtitle: "registered accounts"
    },
    {
      title: "Total Orders",      value: totalOrders.toLocaleString(),
      change: `${ordChange >= 0 ? "+" : ""}${ordChange}%`,
      trend: ordChange >= 0 ? "up" : "down",
      icon: ShoppingBag, color: "#8B5CF6", bgColor: "rgba(139,92,246,0.15)",
      subtitle: `${pendingOrders} pending`
    },
    {
      title: "Active Products",   value: activeProducts.toString(),
      change: "+0", trend: "up",
      icon: Gift, color: "#FFD700", bgColor: "rgba(255,215,0,0.15)",
      subtitle: `${products.filter(p => p.isHot).length} marked as hot`
    },
  ];

  // ── payment breakdown ─────────────────────────────────────────────────────
  const paymentGroups = filteredOrders.reduce<Record<string, { amount: number; count: number }>>((acc, o) => {
    const method = o.payment_method || "Other";
    if (!acc[method]) acc[method] = { amount: 0, count: 0 };
    if (o.status === "paid") acc[method].amount += o.total_amount || 0;
    acc[method].count++;
    return acc;
  }, {});

  const totalPaidRevenue = Object.values(paymentGroups).reduce((s, g) => s + g.amount, 0) || 1;
  const paymentMethods = Object.entries(paymentGroups)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 4)
    .map(([name, g], i) => ({
      name, amount: fmtMoney(g.amount), orders: g.count,
      percentage: Math.round((g.amount / totalPaidRevenue) * 100),
      color: ["#3B82F6","#10B981","#FFD700","#8B5CF6"][i] ?? "#64748B",
    }));

  // ── recent orders ─────────────────────────────────────────────────────────
  const recentOrders = orders.slice(0, 5);

  // ── top products by revenue ───────────────────────────────────────────────
  const productRevMap: Record<string, { revenue: number; sales: number }> = {};
  filteredOrders.forEach(o => {
    if (o.status !== "paid") return;
    const items: any[] = Array.isArray(o.items) ? o.items : [];
    items.forEach((item: any) => {
      const key = item.title || item.id || "Unknown";
      if (!productRevMap[key]) productRevMap[key] = { revenue: 0, sales: 0 };
      productRevMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      productRevMap[key].sales   += item.quantity || 1;
    });
  });

  const topProducts = Object.entries(productRevMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, d]) => ({ name, ...d }));

  const maxRev = topProducts[0]?.revenue || 1;

  // ── monthly bar chart ──────────────────────────────────────────────────────
  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    orders.filter(o => o.status === "paid").forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (o.total_amount || 0);
    });
    const sorted = Object.entries(map).sort().slice(-7);
    const maxVal = Math.max(...sorted.map(s => s[1]), 1);
    return sorted.map(([key, val]) => ({
      month: new Date(key + "-01").toLocaleDateString("en", { month: "short" }),
      value: val,
      pct: Math.round((val / maxVal) * 100),
    }));
  }, [orders]);

  // ── paid / pending / cancelled counts ─────────────────────────────────────
  const paidCount      = filteredOrders.filter(o => o.status === "paid").length;
  const pendingCount   = filteredOrders.filter(o => o.status === "pending" || o.status === "processing").length;
  const cancelledCount = filteredOrders.filter(o => o.status === "cancelled").length;

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-[#475569] mt-0.5">Live data from Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#94a3b8] focus:outline-none focus:border-[#FFD700]/30"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={handleRefresh}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={stat.title}
            className="stat-card"
            style={{ "--accent-color": stat.color } as React.CSSProperties}
          >
            <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
            <div className={`stat-change ${stat.trend}`}>
              {stat.trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {stat.change}
            </div>
            <p className="text-[10px] text-[#475569] mt-1.5">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart */}
        <div className="lg:col-span-2 admin-card" style={{ minHeight: "400px" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">Revenue Overview</h3>
              <p className="section-subtitle">Monthly paid revenue</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-white/5 text-[#475569]">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {monthlyRevenue.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-[#475569] text-sm">No paid orders yet</div>
          ) : (
            <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FFD700" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtMoney(v)}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,215,0,0.2)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#fff",
                    }}
                    formatter={(value: number) => [fmtMoney(value), "Revenue"]}
                    cursor={{ stroke: "rgba(255,215,0,0.2)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FFD700"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ fill: "#FFD700", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#FFD700", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="admin-card">
          <div className="mb-5">
            <h3 className="section-title">Payment Methods</h3>
            <p className="section-subtitle">Revenue by source</p>
          </div>

          {paymentMethods.length === 0 ? (
            <p className="text-xs text-[#475569]">No paid orders yet</p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${method.color}15`, color: method.color }}
                      >
                        <CreditCard size={13} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white capitalize">{method.name}</p>
                        <p className="text-[10px] text-[#475569]">{method.orders} orders</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white">{method.amount}</p>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${method.percentage}%`, background: `linear-gradient(90deg,${method.color},${method.color}80)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-base font-bold text-[#10B981]">{paidCount}</p>
                <p className="text-[10px] text-[#475569]">Paid</p>
              </div>
              <div>
                <p className="text-base font-bold text-[#FFC107]">{pendingCount}</p>
                <p className="text-[10px] text-[#475569]">Pending</p>
              </div>
              <div>
                <p className="text-base font-bold text-[#EF4444]">{cancelledCount}</p>
                <p className="text-[10px] text-[#475569]">Cancelled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Orders */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">Recent Orders</h3>
              <p className="section-subtitle">Latest transactions</p>
            </div>
            <a href="/admin/orders" className="view-all-link">View All →</a>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-[#475569]">No orders yet</p>
          ) : (
            <div className="space-y-0">
              {recentOrders.map((order, i) => {
                const initials = avatarInitials(order.full_name || "?");
                const color    = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <div key={order.id} className="activity-item">
                    <div
                      className="avatar"
                      style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-white truncate">{order.full_name}</p>
                        <p className="text-xs font-bold text-white ml-2">${order.total_amount?.toFixed(0)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-[#475569] truncate">{timeAgo(order.created_at)}</p>
                        <span className={`status-badge ${order.status}`}>{order.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">Top Products</h3>
              <p className="section-subtitle">By revenue from paid orders</p>
            </div>
            <a href="/admin/products" className="view-all-link">View All →</a>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-[#475569]">No sales data yet</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div key={product.name} className="top-product-item">
                  <div className="top-product-rank">{index + 1}</div>
                  <div className="top-product-info">
                    <p className="top-product-name">{product.name}</p>
                    <div className="top-product-bar">
                      <div
                        className="top-product-bar-fill"
                        style={{ width: `${Math.round((product.revenue / maxRev) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="top-product-stats">
                    <p className="top-product-price">{fmtMoney(product.revenue)}</p>
                    <div className="top-product-trend text-[#10B981] flex items-center gap-1">
                      <TrendingUp size={10} />
                      {product.sales} sales
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
