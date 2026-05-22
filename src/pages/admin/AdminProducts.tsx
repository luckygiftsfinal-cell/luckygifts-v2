import { useState, useMemo } from "react";
import {
  Search, Plus, Edit, Trash2, Eye, X, Save, Loader2, ImagePlus, Flame, Check, Upload, Trash
} from "lucide-react";
import { useStore, Product } from "../../context/StoreContext";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";


// ── empty form ────────────────────────────────────────────────────────────
const EMPTY: Partial<Product> = {
  title: "", price: "", originalPrice: "", tickets: "1",
  stock: "100", prize: "", category: "", mainImage: "",
  description: "", isHot: false,
};

// ── scroll picker ──────────────────────────────────────────────────────────
function ScrollPicker({
  label, items, value, onChange, emptyText = "None",
}: {
  label: string;
  items: { value: string; label: string; icon?: string; color?: string }[];
  value: string;
  onChange: (v: string) => void;
  emptyText?: string;
}) {
  const all = [{ value: "", label: emptyText }, ...items];
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="mt-1 h-[130px] overflow-y-auto rounded-xl border border-white/10 bg-[#0d0d18] divide-y divide-white/5 scrollbar-thin">
        {all.map(item => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                ${active
                  ? "bg-[#FFD700]/10 text-[#FFD700]"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                }`}
            >
              {item.icon && <span className="text-base leading-none">{item.icon}</span>}
              {item.color && !item.icon && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
              )}
              <span className="flex-1 truncate">{item.label}</span>
              {active && <Check size={13} className="flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── status helper ─────────────────────────────────────────────────────────
function stockStatus(stock: string) {
  const n = parseInt(stock || "0");
  if (n === 0) return { label: "Out of Stock", cls: "cancelled" };
  if (n < 10)  return { label: "Low Stock",    cls: "pending"   };
  return               { label: "Active",       cls: "paid"      };
}

// ── modal ─────────────────────────────────────────────────────────────────
function ProductModal({
  product, onClose, onSave, categoryItems, prizeItems,
}: {
  product: Partial<Product>;
  onClose: () => void;
  onSave: (p: Partial<Product>) => Promise<void>;
  categoryItems: { value: string; label: string; icon?: string; color?: string }[];
  prizeItems: { value: string; label: string }[];
}) {
  const [form, setForm]       = useState<Partial<Product>>(product);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(form.mainImage || "");

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, mainImage: publicUrl }));
      setPreviewUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, mainImage: "" }));
    setPreviewUrl("");
  };


  const set = (key: keyof Product, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.title?.trim()) { setError("Title is required"); return; }
    if (!form.price?.trim()) { setError("Price is required"); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!(product as Product).id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#12121a] z-10">
          <h2 className="text-base font-bold text-white">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-[#64748b]">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* image upload */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
              {previewUrl || form.mainImage ? (
                <>
                  <img 
                    src={previewUrl || form.mainImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={() => setPreviewUrl("")}
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash size={20} className="text-red-400" />
                  </button>
                </>
              ) : (
                <ImagePlus size={28} className="text-[#475569]" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="form-label">Product Image</label>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="form-input flex items-center justify-center gap-2 py-2.5 hover:bg-white/10 transition-colors">
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin text-[#FFD700]" />
                    ) : (
                      <Upload size={16} className="text-[#FFD700]" />
                    )}
                    <span className="text-sm text-[#94a3b8]">
                      {uploading ? "Uploading..." : "Upload Image"}
                    </span>
                  </div>
                </label>
              </div>
              <p className="text-[10px] text-[#475569]">Max 5MB. JPG, PNG, WebP</p>
            </div>
          </div>

          {/* title + category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Title <span className="text-red-400">*</span></label>
              <input className="form-input" placeholder="Product name" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            </div>
            <ScrollPicker
              label="Category"
              items={categoryItems}
              value={form.category || ""}
              onChange={v => set("category", v)}
              emptyText="— No Category —"
            />
          </div>

          {/* price + original price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price ($) <span className="text-red-400">*</span></label>
              <input className="form-input" type="number" min="0" placeholder="0.00" value={form.price || ""} onChange={e => set("price", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Original Price ($) <span className="text-[#475569]">(optional)</span></label>
              <input className="form-input" type="number" min="0" placeholder="0.00" value={form.originalPrice || ""} onChange={e => set("originalPrice", e.target.value)} />
            </div>
          </div>

          {/* tickets + stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tickets per Purchase</label>
              <input className="form-input" type="number" min="1" value={form.tickets || "1"} onChange={e => set("tickets", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Stock</label>
              <input className="form-input" type="number" min="0" value={form.stock || "100"} onChange={e => set("stock", e.target.value)} />
            </div>
          </div>

          {/* prize */}
          <ScrollPicker
            label="Prize Label"
            items={prizeItems}
            value={form.prize || ""}
            onChange={v => set("prize", v)}
            emptyText="— No Prize —"
          />

          {/* description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder="Product description..."
              value={form.description || ""}
              onChange={e => set("description", e.target.value)}
            />
          </div>

          {/* isHot toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("isHot", !form.isHot)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.isHot ? "bg-[#FFD700]" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isHot ? "left-6" : "left-1"}`} />
            </div>
            <span className="text-sm text-white flex items-center gap-1.5">
              <Flame size={14} className={form.isHot ? "text-[#FFD700]" : "text-[#475569]"} />
              Mark as Hot Product
            </span>
          </label>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 sticky bottom-0 bg-[#12121a]">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-5">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-6 flex items-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── delete confirm ────────────────────────────────────────────────────────
function DeleteConfirm({ name, onCancel, onConfirm, loading }: {
  name: string; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
          <Trash2 size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-bold text-white text-center mb-2">Delete Product?</h3>
        <p className="text-sm text-[#64748b] text-center mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">"{name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-sm py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, categories, draws } = useStore();

  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal,     setModal]     = useState<Partial<Product> | null>(null);
  const [delTarget, setDelTarget] = useState<Product | null>(null);
  const [deleting,  setDeleting]  = useState(false);
  const [viewProd,  setViewProd]  = useState<Product | null>(null);

  // scroll picker items
  const categoryItems = useMemo(() =>
    categories.filter(c => c.active).map(c => ({
      value: c.key,
      label: c.name,
      icon: c.icon || undefined,
      color: c.color || undefined,
    })),
  [categories]);

  const prizeItems = useMemo(() =>
    draws.filter(d => d.active).map(d => ({
      value: d.name,
      label: d.name,
    })),
  [draws]);

  // unique categories for filter bar
  const filterCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category || p.prize || "Other").filter(Boolean))];
    return cats.sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCat    = catFilter === "all" || (p.category || p.prize) === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const handleSave = async (form: Partial<Product>) => {
    if ((form as Product).id) {
      await updateProduct(form as Product);
    } else {
      await addProduct(form);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try { await deleteProduct(delTarget.id); }
    finally { setDeleting(false); setDelTarget(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* modals */}
      {modal && (
        <ProductModal
          product={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          categoryItems={categoryItems}
          prizeItems={prizeItems}
        />
      )}
      {delTarget && (
        <DeleteConfirm
          name={delTarget.title}
          onCancel={() => setDelTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-xs text-[#475569] mt-0.5">{products.length} products in store</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(EMPTY)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* filters */}
      <div className="admin-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input w-full"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#94a3b8] focus:outline-none"
        >
          <option value="all">All Categories</option>
          {filterCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* table */}
      <div className="admin-card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#475569]">
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Tickets</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const status = stockStatus(p.stock);
                const discount = p.originalPrice && parseFloat(p.originalPrice) > 0
                  ? Math.round((1 - parseFloat(p.price) / parseFloat(p.originalPrice)) * 100)
                  : 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden border border-white/5">
                          {p.mainImage
                            ? <img src={p.mainImage} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🎁</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate max-w-[160px]">{p.title}</p>
                          {p.isHot && (
                            <span className="text-[10px] text-[#FFD700] flex items-center gap-0.5">
                              <Flame size={10} /> Hot
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-[#94a3b8]">
                        {p.category || p.prize || "—"}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className="font-bold text-white text-sm">${parseFloat(p.price).toLocaleString()}</span>
                        {discount > 0 && (
                          <span className="ml-1.5 text-[10px] text-[#10B981] font-bold">-{discount}%</span>
                        )}
                      </div>
                    </td>
                    <td className="text-[#94a3b8] text-sm">{p.tickets}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFC107]"
                            style={{ width: `${Math.min((parseInt(p.stock) / 200) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#94a3b8]">{p.stock}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewProd(viewProd?.id === p.id ? null : p)}
                          className="p-2 rounded-lg hover:bg-white/5 text-[#94a3b8] transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setModal(p)}
                          className="p-2 rounded-lg hover:bg-[#FFD700]/10 text-[#FFD700] transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDelTarget(p)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* quick view panel */}
      {viewProd && (
        <div className="admin-card border border-[#FFD700]/20">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Quick View — {viewProd.title}</h3>
            <button onClick={() => setViewProd(null)} className="p-1 text-[#475569] hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              { label: "Price",     value: `$${parseFloat(viewProd.price).toLocaleString()}` },
              { label: "Stock",     value: viewProd.stock },
              { label: "Tickets",   value: viewProd.tickets },
              { label: "Category",  value: viewProd.category || viewProd.prize || "—" },
              { label: "Prize",     value: viewProd.prize || "—" },
              { label: "Hot",       value: viewProd.isHot ? "Yes 🔥" : "No" },
              { label: "Orig. Price", value: viewProd.originalPrice ? `$${parseFloat(viewProd.originalPrice).toLocaleString()}` : "—" },
              { label: "ID",        value: viewProd.id.slice(0, 8) + "…" },
            ].map(item => (
              <div key={item.label} className="bg-white/3 rounded-xl p-3">
                <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-1">{item.label}</p>
                <p className="font-semibold text-white truncate">{item.value}</p>
              </div>
            ))}
          </div>
          {viewProd.description && (
            <p className="mt-3 text-xs text-[#64748b] leading-relaxed">{viewProd.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
