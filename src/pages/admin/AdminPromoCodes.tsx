import { useState, useMemo, useEffect } from "react";
import {
  Tag, Link, Plus, Edit, Trash2, Copy, Check, Loader2, RefreshCw,
  Percent, DollarSign, Calendar, Users, TrendingUp
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  name: string;
  price: number;
  email: string;
  type: "percentage" | "fixed";
  value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

interface ReferralLink {
  id: string;
  code: string;
  user_id: string | null;
  user_name: string | null;
  commission: number;
  clicks: number;
  conversions: number;
  earnings: number;
  active: boolean;
  created_at: string;
}

export default function AdminPromoCodes() {
  const [activeTab, setActiveTab] = useState<"promo" | "referral">("promo");
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"promo" | "referral">("promo");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [promoForm, setPromoForm] = useState({
    code: "",
    name: "",
    price: 0,
    email: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    min_order: 0,
    max_uses: 100,
    expires_at: "",
  });

  const [referralForm, setReferralForm] = useState({
    code: "",
    commission: 10,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch promo codes
      const { data: promoData, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (promoError) throw promoError;
      setPromoCodes(promoData || []);

      // Fetch referral links
      const { data: refData, error: refError } = await supabase
        .from("referral_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (refError) throw refError;
      setReferralLinks(refData || []);
    } catch (error: any) {
      toast.error("Failed to load data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generate random code
  const generateCode = (prefix: string = "") => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix;
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Create promo code
  const createPromoCode = async () => {
    if (!promoForm.code.trim()) {
      toast.error("Code is required");
      return;
    }
    if (!promoForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (promoForm.value <= 0) {
      toast.error("Value must be greater than 0");
      return;
    }

    try {
      const { error } = await supabase.from("promo_codes").insert({
        code: promoForm.code.toUpperCase(),
        name: promoForm.name,
        price: promoForm.price || 0,
        email: promoForm.email || null,
        type: promoForm.type,
        value: promoForm.value,
        min_order: promoForm.min_order || 0,
        max_uses: promoForm.max_uses || 100,
        expires_at: promoForm.expires_at || null,
        active: true,
      });

      if (error) throw error;

      toast.success("Promo code created!");
      setModalOpen(false);
      setPromoForm({ code: "", name: "", price: 0, email: "", type: "percentage", value: 0, min_order: 0, max_uses: 100, expires_at: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create promo code");
    }
  };

  // Create referral link
  const createReferralLink = async () => {
    if (!referralForm.code.trim()) {
      toast.error("Code is required");
      return;
    }

    try {
      const { error } = await supabase.from("referral_links").insert({
        code: referralForm.code.toUpperCase(),
        commission: referralForm.commission || 10,
        clicks: 0,
        conversions: 0,
        earnings: 0,
        active: true,
      });

      if (error) throw error;

      toast.success("Referral link created!");
      setModalOpen(false);
      setReferralForm({ code: "", commission: 10 });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create referral link");
    }
  };

  // Toggle active status
  const togglePromo = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({ active: !current })
        .eq("id", id);

      if (error) throw error;
      fetchData();
      toast.success(!current ? "Activated" : "Deactivated");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Delete promo code
  const deletePromo = async (id: string) => {
    try {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
      fetchData();
      toast.success("Deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Stats
  const stats = useMemo(() => {
    if (activeTab === "promo") {
      const total = promoCodes.length;
      const active = promoCodes.filter((p) => p.active).length;
      const totalUses = promoCodes.reduce((sum, p) => sum + p.used_count, 0);
      return [
        { label: "Total Codes", value: total, icon: Tag, color: "#FFD700" },
        { label: "Active", value: active, icon: Check, color: "#10B981" },
        { label: "Total Uses", value: totalUses, icon: Users, color: "#3B82F6" },
      ];
    } else {
      const total = referralLinks.length;
      const totalClicks = referralLinks.reduce((sum, r) => sum + r.clicks, 0);
      const totalEarnings = referralLinks.reduce((sum, r) => sum + r.earnings, 0);
      return [
        { label: "Total Links", value: total, icon: Link, color: "#FFD700" },
        { label: "Total Clicks", value: totalClicks, icon: TrendingUp, color: "#3B82F6" },
        { label: "Earnings", value: `$${totalEarnings}`, icon: DollarSign, color: "#10B981" },
      ];
    }
  }, [promoCodes, referralLinks, activeTab]);

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
          <h1 className="text-2xl font-bold text-white">Promo & Referrals</h1>
          <p className="text-sm text-[#64748b] mt-1">Manage promo codes and referral links</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchData()} className="btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["promo", "referral"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab
                ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                : "bg-white/5 text-[#94a3b8] hover:bg-white/10"
            }`}
          >
            {tab === "promo" ? (
              <><Tag size={16} className="inline mr-2" /> Promo Codes</>
            ) : (
              <><Link size={16} className="inline mr-2" /> Referral Links</>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setModalType(activeTab);
            setModalOpen(true);
            if (activeTab === "promo") {
              setPromoForm((prev) => ({ ...prev, code: generateCode("LUCKY") }));
            } else {
              setReferralForm((prev) => ({ ...prev, code: generateCode("REF") }));
            }
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          Create {activeTab === "promo" ? "Promo Code" : "Referral Link"}
        </button>
      </div>

      {/* Promo Codes List */}
      {activeTab === "promo" && (
        <div className="space-y-3">
          {promoCodes.length === 0 ? (
            <div className="py-16 text-center">
              <Tag size={48} className="mx-auto text-[#475569] mb-4" />
              <p className="text-[#64748b]">No promo codes yet</p>
            </div>
          ) : (
            promoCodes.map((promo) => (
              <div key={promo.id} className="admin-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
                    <Tag size={20} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{promo.code}</span>
                      <button
                        onClick={() => copyToClipboard(promo.code)}
                        className="p-1 rounded hover:bg-white/5"
                      >
                        {copiedCode === promo.code ? (
                          <Check size={14} className="text-[#10B981]" />
                        ) : (
                          <Copy size={14} className="text-[#64748b]" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-white/90 font-medium mt-0.5">{promo.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#64748b]">
                      <span className="text-[#FFD700]">
                        {promo.type === "percentage" ? `${promo.value}% OFF` : `$${promo.value} OFF`}
                      </span>
                      <span>•</span>
                      <span>Price: ${promo.price}</span>
                      <span>•</span>
                      <span>Min: ${promo.min_order}</span>
                      <span>•</span>
                      <span>Used: {promo.used_count}/{promo.max_uses}</span>
                      {promo.email && (
                        <>
                          <span>•</span>
                          <span>{promo.email}</span>
                        </>
                      )}
                      {promo.expires_at && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(promo.expires_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-[#475569] mt-1">
                      Created: {new Date(promo.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePromo(promo.id, promo.active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      promo.active
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : "bg-white/5 text-[#64748b]"
                    }`}
                  >
                    {promo.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => deletePromo(promo.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#EF4444]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Referral Links List */}
      {activeTab === "referral" && (
        <div className="space-y-3">
          {referralLinks.length === 0 ? (
            <div className="py-16 text-center">
              <Link size={48} className="mx-auto text-[#475569] mb-4" />
              <p className="text-[#64748b]">No referral links yet</p>
            </div>
          ) : (
            referralLinks.map((ref) => (
              <div key={ref.id} className="admin-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                    <Link size={20} className="text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{ref.code}</span>
                      <button
                        onClick={() => copyToClipboard(`https://getluckygifts.shop/ref/${ref.code}`)}
                        className="p-1 rounded hover:bg-white/5"
                      >
                        {copiedCode === `https://getluckygifts.shop/ref/${ref.code}` ? (
                          <Check size={14} className="text-[#10B981]" />
                        ) : (
                          <Copy size={14} className="text-[#64748b]" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#64748b]">
                      <span className="text-[#8B5CF6]">{ref.commission}% Commission</span>
                      <span>•</span>
                      <span>{ref.clicks} Clicks</span>
                      <span>•</span>
                      <span>{ref.conversions} Conversions</span>
                      <span>•</span>
                      <span className="text-[#10B981]">${ref.earnings} Earned</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    ref.active
                      ? "bg-[#10B981]/20 text-[#10B981]"
                      : "bg-white/5 text-[#64748b]"
                  }`}>
                    {ref.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Create {modalType === "promo" ? "Promo Code" : "Referral Link"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#64748b]">
                <XIcon />
              </button>
            </div>

            {modalType === "promo" ? (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                      className="form-input flex-1"
                      placeholder="LUCKY2024"
                    />
                    <button
                      onClick={() => setPromoForm({ ...promoForm, code: generateCode("LUCKY") })}
                      className="btn-secondary text-xs px-3"
                    >
                      Random
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={promoForm.name}
                    onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Summer Sale 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      value={promoForm.price}
                      onChange={(e) => setPromoForm({ ...promoForm, price: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={promoForm.email}
                      onChange={(e) => setPromoForm({ ...promoForm, email: e.target.value })}
                      className="form-input"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Type</label>
                    <select
                      value={promoForm.type}
                      onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value as "percentage" | "fixed" })}
                      className="form-input"
                    >
                      <option value="percentage">Percentage %</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Value</label>
                    <input
                      type="number"
                      value={promoForm.value}
                      onChange={(e) => setPromoForm({ ...promoForm, value: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Min Order ($)</label>
                    <input
                      type="number"
                      value={promoForm.min_order}
                      onChange={(e) => setPromoForm({ ...promoForm, min_order: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">Max Uses</label>
                    <input
                      type="number"
                      value={promoForm.max_uses}
                      onChange={(e) => setPromoForm({ ...promoForm, max_uses: parseInt(e.target.value) || 100 })}
                      className="form-input"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={promoForm.expires_at}
                    onChange={(e) => setPromoForm({ ...promoForm, expires_at: e.target.value })}
                    className="form-input"
                  />
                </div>

                <button onClick={createPromoCode} className="btn-primary w-full">
                  <Plus size={16} />
                  Create Promo Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Referral Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralForm.code}
                      onChange={(e) => setReferralForm({ ...referralForm, code: e.target.value.toUpperCase() })}
                      className="form-input flex-1"
                      placeholder="REF2024"
                    />
                    <button
                      onClick={() => setReferralForm({ ...referralForm, code: generateCode("REF") })}
                      className="btn-secondary text-xs px-3"
                    >
                      Random
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Commission %</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={referralForm.commission}
                    onChange={(e) => setReferralForm({ ...referralForm, commission: parseInt(e.target.value) || 10 })}
                    className="form-input"
                  />
                </div>

                <button onClick={createReferralLink} className="btn-primary w-full">
                  <Plus size={16} />
                  Create Referral Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
