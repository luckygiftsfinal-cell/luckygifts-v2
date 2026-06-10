import { useState, useMemo, useEffect } from "react";
import {
  Crown, Star, Zap, Gem, Plus, Edit, Trash2, Users, DollarSign,
  Save, X, Loader2, RefreshCw, Download
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface VIPPackage {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  color: string;
  icon: string;
  popular: boolean;
  active: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  package_id: string;
  user_id: string;
  status: string;
  created_at: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Crown, Star, Zap, Gem,
};

const COLOR_PRESETS = [
  "#94a3b8", "#FFD700", "#8B5CF6", "#10B981",
  "#EF4444", "#3B82F6", "#F59E0B", "#EC4899",
];

const DEFAULT_FEATURES = [
  "Priority support",
  "Exclusive draws",
  "Advanced analytics",
  "Email notifications",
  "Personal manager",
  "Unlimited entries",
];

export default function AdminVIPPackages() {
  const [packages, setPackages] = useState<VIPPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VIPPackage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VIPPackage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<VIPPackage>>({
    name: "",
    price: 0,
    period: "month",
    features: [],
    color: "#FFD700",
    icon: "Crown",
    popular: false,
    active: true,
  });

  // Fetch packages and subscriptions
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from("vip_packages")
        .select("*")
        .order("price", { ascending: true });

      if (packagesError) throw packagesError;

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from("vip_subscriptions")
        .select("*");

      if (subsError) throw subsError;

      setPackages(packagesData || []);
      setSubscriptions(subsData || []);
    } catch (error: any) {
      console.error("Error fetching VIP data:", error);
      toast.error("Failed to load VIP packages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSubscribers = subscriptions.filter((s) => s.status === "active").length;
    const monthlyRevenue = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        const pkg = packages.find((p) => p.id === s.package_id);
        return sum + (pkg?.price || 0);
      }, 0);
    const goldMembers = subscriptions.filter((s) => {
      const pkg = packages.find((p) => p.id === s.package_id);
      return s.status === "active" && pkg?.name?.toLowerCase().includes("gold");
    }).length;

    const retentionRate = totalSubscribers > 0
      ? Math.round((totalSubscribers / subscriptions.length) * 100)
      : 0;

    return [
      { label: "Total Subscribers", value: totalSubscribers.toLocaleString(), icon: Users, color: "#3B82F6" },
      { label: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: "#10B981" },
      { label: "Gold Members", value: goldMembers.toLocaleString(), icon: Crown, color: "#FFD700" },
      { label: "Retention Rate", value: `${retentionRate}%`, icon: Star, color: "#8B5CF6" },
    ];
  }, [packages, subscriptions]);

  // Get subscriber count for a package
  const getSubscriberCount = (packageId: string) => {
    return subscriptions.filter((s) => s.package_id === packageId && s.status === "active").length;
  };

  // Get revenue for a package
  const getPackageRevenue = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    const count = getSubscriberCount(packageId);
    return (pkg?.price || 0) * count;
  };

  // Open modal for add/edit
  const openModal = (pkg?: VIPPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setForm({ ...pkg });
    } else {
      setEditingPackage(null);
      setForm({
        name: "",
        price: 0,
        period: "month",
        features: [],
        color: "#FFD700",
        icon: "Crown",
        popular: false,
        active: true,
      });
    }
    setModalOpen(true);
  };

  // Save package
  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Package name is required");
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.error("Valid price is required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingPackage) {
        // Update
        const { error } = await supabase
          .from("vip_packages")
          .update({
            name: form.name,
            price: form.price,
            period: form.period,
            features: form.features,
            color: form.color,
            icon: form.icon,
            popular: form.popular,
            active: form.active,
          })
          .eq("id", editingPackage.id);

        if (error) throw error;
        toast.success("Package updated successfully");
      } else {
        // Insert
        const { error } = await supabase
          .from("vip_packages")
          .insert({
            name: form.name,
            price: form.price,
            period: form.period,
            features: form.features,
            color: form.color,
            icon: form.icon,
            popular: form.popular,
            active: form.active,
          });

        if (error) throw error;
        toast.success("Package created successfully");
      }

      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete package
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("vip_packages")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      toast.success("Package deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (packages.length === 0) {
      toast.error("No packages to export");
      return;
    }

    const headers = ["Name", "Price", "Period", "Subscribers", "Revenue", "Status", "Popular"];
    const rows = packages.map((pkg) => [
      pkg.name,
      `$${pkg.price}`,
      pkg.period,
      getSubscriberCount(pkg.id).toString(),
      `$${getPackageRevenue(pkg.id)}`,
      pkg.active ? "Active" : "Inactive",
      pkg.popular ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vip_packages_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${packages.length} packages`);
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Crown;
    return <Icon size={24} />;
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
          <h1 className="text-2xl font-bold text-white">VIP Packages</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {packages.length} packages · {subscriptions.filter((s) => s.status === "active").length} active subscribers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="btn-secondary"
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} />
            Export
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} />
            Create Package
          </button>
        </div>
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

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Crown size={48} className="mx-auto text-[#475569] mb-4" />
            <p className="text-[#64748b]">No VIP packages yet</p>
            <button onClick={() => openModal()} className="btn-primary mt-4">
              <Plus size={16} />
              Create First Package
            </button>
          </div>
        ) : (
          packages.map((pkg, index) => {
            const subscriberCount = getSubscriberCount(pkg.id);
            const revenue = getPackageRevenue(pkg.id);
            const IconComponent = ICON_MAP[pkg.icon] || Crown;

            return (
              <div
                key={pkg.id}
                className="admin-card relative overflow-hidden"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  borderColor: pkg.popular ? `${pkg.color}40` : undefined,
                }}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-[#0a0a0f] text-xs font-bold px-4 py-1 rounded-bl-xl">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${pkg.color}20`, color: pkg.color }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-sm text-[#64748b]">VIP Package</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${pkg.price}</span>
                  <span className="text-[#64748b] ml-1">/{pkg.period}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {(pkg.features || []).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${pkg.color}20` }}>
                        <Zap size={12} style={{ color: pkg.color }} />
                      </div>
                      <span className="text-sm text-[#94a3b8]">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{subscriberCount}</p>
                    <p className="text-xs text-[#64748b]">Subscribers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">${revenue.toLocaleString()}</p>
                    <p className="text-xs text-[#64748b]">Revenue</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(pkg)}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(pkg)}
                    className="flex-1 btn-secondary text-sm py-2 text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#12121a]">
              <h2 className="text-base font-bold text-white">
                {editingPackage ? "Edit Package" : "Create Package"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#64748b]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="form-label">Package Name <span className="text-red-400">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Gold"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Price & Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price ($) <span className="text-red-400">*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label">Period</label>
                  <select
                    className="form-input"
                    value={form.period || "month"}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="form-label">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: c,
                        outline: form.color === c ? `2px solid ${c}` : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="form-label">Icon</label>
                <div className="flex gap-2">
                  {Object.keys(ICON_MAP).map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm({ ...form, icon })}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: form.icon === icon ? `${form.color}20` : "rgba(255,255,255,0.04)",
                        color: form.icon === icon ? form.color : "#64748b",
                        border: `1px solid ${form.icon === icon ? `${form.color}40` : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {(() => {
                        const Icon = ICON_MAP[icon];
                        return <Icon size={18} />;
                      })()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="form-label">Features</label>

                {/* Existing features */}
                <div className="space-y-2 mt-2">
                  {(form.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="form-input flex-1 py-2 text-sm"
                        value={feature}
                        onChange={(e) => {
                          const updated = [...(form.features || [])];
                          updated[idx] = e.target.value;
                          setForm({ ...form, features: updated });
                        }}
                      />
                      <button
                        onClick={() => {
                          const updated = (form.features || []).filter((_, i) => i !== idx);
                          setForm({ ...form, features: updated });
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new feature */}
                <button
                  onClick={() => setForm({ ...form, features: [...(form.features || []), ""] })}
                  className="mt-3 flex items-center gap-2 text-sm text-[#FFD700] hover:text-[#f0d060] transition-colors"
                >
                  <Plus size={16} />
                  Add Feature
                </button>

                {/* Quick add from defaults */}
                <div className="mt-3">
                  <p className="text-[10px] text-[#64748b] uppercase tracking-widest mb-2">Quick Add</p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_FEATURES.filter(f => !(form.features || []).includes(f)).map((feature) => (
                      <button
                        key={feature}
                        onClick={() => setForm({ ...form, features: [...(form.features || []), feature] })}
                        className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#94a3b8] hover:border-[#FFD700]/40 hover:text-[#FFD700] transition-all"
                      >
                        + {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular & Active toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, popular: !form.popular })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.popular ? "bg-[#FFD700]" : "bg-white/10"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      form.popular ? "left-6" : "left-1"
                    }`} />
                  </div>
                  <span className="text-sm text-white">Popular</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, active: !form.active })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.active !== false ? "bg-[#10B981]" : "bg-white/10"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      form.active !== false ? "left-6" : "left-1"
                    }`} />
                  </div>
                  <span className="text-sm text-white">Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 sticky bottom-0 bg-[#12121a]">
              <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm py-2 px-5">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary text-sm py-2 px-6 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {editingPackage ? "Save Changes" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Delete Package?</h3>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.name}"</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 text-sm py-2">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 text-sm py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
