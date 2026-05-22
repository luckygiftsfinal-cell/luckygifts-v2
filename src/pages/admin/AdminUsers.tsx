import { useState, useMemo, useEffect } from "react";
import { Search, Crown, UserCheck, UserX, Mail, Calendar, DollarSign, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  vip_level: string | null;
  status: string | null;
  ticket_balance: number;
  updated_at: string;
  total_spent: number;
  total_tickets: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real users from Supabase
  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Get profiles with correct columns
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, vip_level, status, ticket_balance, updated_at");

      if (profilesError) throw profilesError;

      // Get orders to calculate spent
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount, status");

      if (ordersError) throw ordersError;

      // Calculate stats per user
      const userStats: Record<string, { spent: number; tickets: number }> = {};

      orders?.forEach((order: any) => {
        if (!userStats[order.user_id]) {
          userStats[order.user_id] = { spent: 0, tickets: 0 };
        }
        if (order.status === "paid" || order.status === "delivered") {
          userStats[order.user_id].spent += order.total_amount || 0;
        }
      });

      // Combine data
      const combinedUsers: User[] = (profiles || []).map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        vip_level: profile.vip_level,
        status: profile.status || 'active',
        ticket_balance: profile.ticket_balance || 0,
        updated_at: profile.updated_at,
        total_spent: userStats[profile.id]?.spent || 0,
        total_tickets: profile.ticket_balance || 0,
      }));

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "vip" && user.vip_level !== 'None' && user.vip_level !== null) ||
        (typeFilter === "regular" && (user.vip_level === 'None' || user.vip_level === null));

      return matchesSearch && matchesType;
    });
  }, [users, searchQuery, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = users.length;
    const vip = users.filter((u) => u.vip_level !== 'None' && u.vip_level !== null).length;
    const regular = users.filter((u) => u.vip_level === 'None' || u.vip_level === null).length;
    const active = users.filter((u) => u.status === 'active').length;
    const totalSpent = users.reduce((sum, u) => sum + u.total_spent, 0);

    return [
      { label: "Total Users", value: total.toLocaleString(), icon: UserCheck, color: "#3B82F6" },
      { label: "VIP Members", value: vip.toLocaleString(), icon: Crown, color: "#FFD700" },
      { label: "Active Now", value: active.toLocaleString(), icon: UserCheck, color: "#10B981" },
      { label: "Total Spent", value: `$${(totalSpent / 1000).toFixed(1)}k`, icon: DollarSign, color: "#8B5CF6" },
    ];
  }, [users]);

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
    toast.success("Users refreshed");
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Avatar initials
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">VIP Users</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {users.length} total users · {filteredUsers.length} shown
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary"
        >
          {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
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
              placeholder="Search users by name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full"
            />
          </div>
          <div className="flex gap-2">
            {["all", "vip", "regular"].map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  typeFilter === f
                    ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
                }`}
              >
                {f === "vip" && <Crown size={14} className="inline mr-1" />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <UserX size={48} className="mx-auto text-[#475569] mb-4" />
            <p className="text-[#64748b]">
              {users.length === 0 ? "No users yet" : "No users match your filters"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className="admin-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFC107] flex items-center justify-center text-[#0a0a0f] font-bold text-lg">
                    {getInitials(user.full_name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.full_name || "Unknown"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={12} className="text-[#64748b]" />
                      <span className="text-xs text-[#64748b] truncate max-w-[150px]">
                        {user.phone || "No phone"}
                      </span>
                    </div>
                  </div>
                </div>
                {user.vip_level !== 'None' && user.vip_level !== null && (
                  <div className="p-2 rounded-lg bg-[#FFD700]/10">
                    <Crown size={16} className="text-[#FFD700]" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
                    <DollarSign size={12} />
                    Spent
                  </div>
                  <p className="text-lg font-bold text-white">${user.total_spent.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-[#64748b] text-xs mb-1">
                    <Calendar size={12} />
                    Tickets
                  </div>
                  <p className="text-lg font-bold text-white">{user.total_tickets.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#64748b]" />
                  <span className="text-xs text-[#64748b]">{formatDate(user.updated_at)}</span>
                </div>
                <span className={`status-badge ${user.status === 'active' ? 'paid' : 'cancelled'}`}>
                  {user.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
