import { useState, useMemo, useEffect } from "react";
import {
  Trophy, Calendar, Gift, TrendingUp, Award, Star, Plus, Edit, Trash2,
  Save, X, Loader2, RefreshCw, Upload, Crown, Check
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface Winner {
  id: string;
  name: string;
  prize: string;
  draw_name: string;
  img_url: string;
  featured: boolean;
  created_at: string;
}

export default function AdminWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Winner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<Winner>>({
    name: "",
    prize: "",
    draw_name: "",
    img_url: "",
    featured: false,
  });

  // Fetch winners
  const fetchWinners = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("winners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWinners(data || []);
    } catch (error: any) {
      toast.error("Failed to load winners");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  // Filter winners
  const filteredWinners = useMemo(() => {
    if (filter === "all") return winners;
    if (filter === "featured") return winners.filter((w) => w.featured);
    return winners.filter((w) =>
      w.prize.toLowerCase().includes(filter.toLowerCase())
    );
  }, [winners, filter]);

  // Stats
  const stats = useMemo(() => {
    const total = winners.length;
    const featured = winners.filter((w) => w.featured).length;
    const thisMonth = winners.filter((w) => {
      const d = new Date(w.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return [
      { label: "Total Winners", value: total.toLocaleString(), icon: Trophy, color: "#FFD700" },
      { label: "Featured", value: featured.toLocaleString(), icon: Crown, color: "#10B981" },
      { label: "This Month", value: thisMonth.toLocaleString(), icon: Calendar, color: "#3B82F6" },
      { label: "Avg Prize", value: "$12,500", icon: TrendingUp, color: "#8B5CF6" },
    ];
  }, [winners]);

  // Open modal
  const openModal = (winner?: Winner) => {
    if (winner) {
      setEditingWinner(winner);
      setForm({ ...winner });
    } else {
      setEditingWinner(null);
      setForm({ name: "", prize: "", draw_name: "", img_url: "", featured: false });
    }
    setModalOpen(true);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `winners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, img_url: publicUrl }));
      toast.success("Image uploaded");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Save winner
  const handleSave = async () => {
    if (!form.name?.trim() || !form.prize?.trim()) {
      toast.error("Name and prize are required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingWinner) {
        const { error } = await supabase
          .from("winners")
          .update({
            name: form.name,
            prize: form.prize,
            draw_name: form.draw_name,
            img_url: form.img_url,
            featured: form.featured,
          })
          .eq("id", editingWinner.id);

        if (error) throw error;
        toast.success("Winner updated");
      } else {
        const { error } = await supabase
          .from("winners")
          .insert({
            name: form.name,
            prize: form.prize,
            draw_name: form.draw_name,
            img_url: form.img_url,
            featured: form.featured || false,
          });

        if (error) throw error;
        toast.success("Winner added");
      }

      setModalOpen(false);
      fetchWinners();
    } catch (error: any) {
      toast.error(error.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete winner
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("winners")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;
      toast.success("Winner deleted");
      setDeleteTarget(null);
      fetchWinners();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle featured
  const toggleFeatured = async (winner: Winner) => {
    try {
      const { error } = await supabase
        .from("winners")
        .update({ featured: !winner.featured })
        .eq("id", winner.id);

      if (error) throw error;
      fetchWinners();
      toast.success(winner.featured ? "Removed from featured" : "Added to featured");
    } catch (error) {
      toast.error("Update failed");
    }
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
          <h1 className="text-2xl font-bold text-white">Winners</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {winners.length} winners · {winners.filter((w) => w.featured).length} featured
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchWinners()} disabled={isRefreshing} className="btn-secondary">
            {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} />
            Add Winner
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

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {["all", "featured", "cash", "car", "watch", "tech"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  filter === f
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

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWinners.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Trophy size={48} className="mx-auto text-[#475569] mb-4" />
            <p className="text-[#64748b]">
              {winners.length === 0 ? "No winners yet" : "No winners match your filters"}
            </p>
          </div>
        ) : (
          filteredWinners.map((winner) => (
            <div
              key={winner.id}
              className="admin-card relative overflow-hidden group"
              style={{
                borderColor: winner.featured ? "rgba(255, 215, 0, 0.3)" : undefined,
              }}
            >
              {winner.featured && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-[#0a0a0f] text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
                    <Crown size={12} />
                    FEATURED
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                  {winner.img_url ? (
                    <img src={winner.img_url} alt={winner.name} className="w-full h-full object-cover" />
                  ) : (
                    <Trophy size={28} className="text-[#FFD700]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{winner.name}</h3>
                  <p className="text-sm text-[#FFD700] font-medium">{winner.prize}</p>
                  {winner.draw_name && (
                    <p className="text-xs text-[#64748b] mt-0.5">{winner.draw_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-[#64748b]">
                  {new Date(winner.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFeatured(winner)}
                    className={`p-2 rounded-lg transition-colors ${
                      winner.featured
                        ? "bg-[#FFD700]/20 text-[#FFD700]"
                        : "bg-white/5 text-[#64748b] hover:bg-white/10"
                    }`}
                    title={winner.featured ? "Remove featured" : "Make featured"}
                  >
                    <Crown size={16} />
                  </button>
                  <button
                    onClick={() => openModal(winner)}
                    className="p-2 rounded-lg bg-white/5 text-[#94a3b8] hover:bg-white/10"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(winner)}
                    className="p-2 rounded-lg bg-white/5 text-[#EF4444] hover:bg-[#EF4444]/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#12121a]">
              <h2 className="text-base font-bold text-white">
                {editingWinner ? "Edit Winner" : "Add Winner"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#64748b]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                  {form.img_url ? (
                    <>
                      <img src={form.img_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setForm((prev) => ({ ...prev, img_url: "" }))}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={20} className="text-red-400" />
                      </button>
                    </>
                  ) : (
                    <Trophy size={28} className="text-[#475569]" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="form-label">Winner Photo</label>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    <div className="form-input flex items-center justify-center gap-2 py-2.5 hover:bg-white/10 transition-colors">
                      {uploading ? <Loader2 size={16} className="animate-spin text-[#FFD700]" /> : <Upload size={16} className="text-[#FFD700]" />}
                      <span className="text-sm text-[#94a3b8]">{uploading ? "Uploading..." : "Upload Photo"}</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="form-label">Winner Name <span className="text-red-400">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Ahmed Al-Maktoum"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Prize */}
              <div>
                <label className="form-label">Prize <span className="text-red-400">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. $1,000,000 Cash"
                  value={form.prize || ""}
                  onChange={(e) => setForm({ ...form, prize: e.target.value })}
                />
              </div>

              {/* Draw Name */}
              <div>
                <label className="form-label">Draw Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Mega Draw #245"
                  value={form.draw_name || ""}
                  onChange={(e) => setForm({ ...form, draw_name: e.target.value })}
                />
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    form.featured ? "bg-[#FFD700]" : "bg-white/10"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? "left-6" : "left-1"}`} />
                </div>
                <span className="text-sm text-white">Featured Winner</span>
              </label>
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
                {editingWinner ? "Save Changes" : "Add Winner"}
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
            <h3 className="text-base font-bold text-white mb-2">Delete Winner?</h3>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.name}"</span>?
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
