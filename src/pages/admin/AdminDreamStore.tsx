import { useState, useMemo } from "react";
import {
  Plus, Edit, Trash2, X, Save, Loader2, ChevronDown, ChevronRight,
  Tag, Crown, Gem, Star, Zap, Gift, DollarSign, Trophy, Sparkles
} from "lucide-react";
import { useStore, Category, PrizeDraw } from "../../context/StoreContext";

// ── icon map ──────────────────────────────────────────────────────────────
const ICON_OPTIONS = ["Tag","Crown","Gem","Star","Zap","Gift","DollarSign","Trophy","Sparkles"];
const ICON_MAP: Record<string, React.ElementType> = {
  Tag, Crown, Gem, Star, Zap, Gift, DollarSign, Trophy, Sparkles
};
function DynIcon({ name, size = 16 }: { name: string; size?: number }) {
  const I = ICON_MAP[name] || Tag;
  return <I size={size} />;
}

// ── colour presets ────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#FFD700","#3B82F6","#10B981","#8B5CF6",
  "#EF4444","#F59E0B","#06B6D4","#EC4899",
];

// ── empty forms ───────────────────────────────────────────────────────────
const EMPTY_CAT: Partial<Category>  = { name:"", key:"", color:"#FFD700", icon:"Tag", active:true };
const EMPTY_DRAW: Partial<PrizeDraw>= { name:"", category_key:"", active:true };

// ── Category Modal ────────────────────────────────────────────────────────
function CategoryModal({
  cat, onClose, onSave,
}: {
  cat: Partial<Category>;
  onClose: () => void;
  onSave: (c: Partial<Category>) => Promise<void>;
}) {
  const [form, setForm]     = useState<Partial<Category>>(cat);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const isEdit = !!(cat as Category).id;

  const set = (k: keyof Category, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">
            {isEdit ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-[#64748b]"><X size={17}/></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}

          {/* preview badge */}
          <div className="flex justify-center">
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{ background: `${form.color}20`, color: form.color, border: `1px solid ${form.color}40` }}
            >
              <DynIcon name={form.icon || "Tag"} size={15} />
              {form.name || "Preview"}
            </div>
          </div>

          <div>
            <label className="form-label">Name <span className="text-red-400">*</span></label>
            <input
              className="form-input"
              placeholder="e.g. Cash Dream"
              value={form.name || ""}
              onChange={e => {
                set("name", e.target.value);
                if (!isEdit) set("key", e.target.value.replace(/\s+/g,"_").toUpperCase());
              }}
            />
          </div>

          <div>
            <label className="form-label">Key</label>
            <input
              className="form-input font-mono text-xs"
              placeholder="CASH_DREAM"
              value={form.key || ""}
              onChange={e => set("key", e.target.value.toUpperCase())}
            />
          </div>

          {/* colour */}
          <div>
            <label className="form-label">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => set("color", c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
              <input
                type="color"
                value={form.color || "#FFD700"}
                onChange={e => set("color", e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                title="Custom color"
              />
            </div>
          </div>

          {/* icon */}
          <div>
            <label className="form-label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => set("icon", icon)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: form.icon === icon ? `${form.color}20` : "rgba(255,255,255,0.04)",
                    color:      form.icon === icon ? form.color : "#64748b",
                    border:     `1px solid ${form.icon === icon ? `${form.color}40` : "rgba(255,255,255,0.08)"}`,
                  }}
                  title={icon}
                >
                  <DynIcon name={icon} size={15}/>
                </button>
              ))}
            </div>
          </div>

          {/* active */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("active", !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active ? "bg-[#10B981]" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active ? "left-5" : "left-0.5"}`}/>
            </div>
            <span className="text-sm text-white">Active</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
            {isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Prize Draw Modal ──────────────────────────────────────────────────────
function DrawModal({
  draw, categories, onClose, onSave,
}: {
  draw: Partial<PrizeDraw>;
  categories: Category[];
  onClose: () => void;
  onSave: (d: Partial<PrizeDraw>) => Promise<void>;
}) {
  const [form, setForm]     = useState<Partial<PrizeDraw>>(draw);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const isEdit = !!(draw as PrizeDraw).id;

  const set = (k: keyof PrizeDraw, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim())         { setError("Name is required"); return; }
    if (!form.category_key?.trim()) { setError("Category is required"); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const parentCat = categories.find(c => c.key === form.category_key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">{isEdit ? "Edit Prize" : "Add Prize"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-[#64748b]"><X size={17}/></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>}

          <div>
            <label className="form-label">Prize Name <span className="text-red-400">*</span></label>
            <input
              className="form-input"
              placeholder="e.g. Cash $1,000,000"
              value={form.name || ""}
              onChange={e => set("name", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Category <span className="text-red-400">*</span></label>
            <select
              className="form-input"
              value={form.category_key || ""}
              onChange={e => set("category_key", e.target.value)}
            >
              <option value="">Select category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>

          {parentCat && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: `${parentCat.color}15`, color: parentCat.color }}
            >
              <DynIcon name={parentCat.icon} size={13}/>
              Under: {parentCat.name}
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("active", !form.active)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.active !== false ? "bg-[#10B981]" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.active !== false ? "left-5" : "left-0.5"}`}/>
            </div>
            <span className="text-sm text-white">Active</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
            {isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────
function DeleteConfirm({ name, onCancel, onConfirm, loading }: {
  name: string; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
          <Trash2 size={22} className="text-red-400"/>
        </div>
        <h3 className="text-base font-bold text-white mb-2">Delete?</h3>
        <p className="text-sm text-[#64748b] mb-6">
          Delete <span className="text-white font-semibold">"{name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
          <button
            onClick={onConfirm} disabled={loading}
            className="flex-1 text-sm py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function AdminDreamStore() {
  const {
    categories, draws,
    addCategory, updateCategory, deleteCategory,
    addDraw, updateDraw, deleteDraw,
  } = useStore();

  const [catModal,  setCatModal]  = useState<Partial<Category>  | null>(null);
  const [drawModal, setDrawModal] = useState<Partial<PrizeDraw> | null>(null);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string; type: "cat"|"draw" } | null>(null);
  const [deleting,  setDeleting]  = useState(false);
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});

  // group draws by category_key
  const drawsByCategory = useMemo(() => {
    const map: Record<string, PrizeDraw[]> = {};
    draws.forEach(d => {
      if (!map[d.category_key]) map[d.category_key] = [];
      map[d.category_key].push(d);
    });
    return map;
  }, [draws]);

  const toggleExpand = (key: string) =>
    setExpanded(p => ({ ...p, [key]: !p[key] }));

  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      if (delTarget.type === "cat") await deleteCategory(delTarget.id);
      else                          await deleteDraw(delTarget.id);
      setDelTarget(null);
    } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* modals */}
      {catModal && (
        <CategoryModal
          cat={catModal}
          onClose={() => setCatModal(null)}
          onSave={async (c) => {
            if ((c as Category).id) await updateCategory(c as Category);
            else                    await addCategory(c);
          }}
        />
      )}
      {drawModal && (
        <DrawModal
          draw={drawModal}
          categories={categories}
          onClose={() => setDrawModal(null)}
          onSave={async (d) => {
            if ((d as PrizeDraw).id) await updateDraw(d as PrizeDraw);
            else                     await addDraw(d);
          }}
        />
      )}
      {delTarget && (
        <DeleteConfirm
          name={delTarget.name}
          onCancel={() => setDelTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dream Store</h1>
          <p className="text-xs text-[#475569] mt-0.5">
            {categories.length} categories · {draws.length} prizes
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCatModal(EMPTY_CAT)}>
          <Plus size={16}/> Add Category
        </button>
      </div>

      {/* empty state */}
      {categories.length === 0 && (
        <div className="admin-card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-[#FFD700]"/>
          </div>
          <p className="text-white font-semibold mb-1">No categories yet</p>
          <p className="text-sm text-[#475569] mb-5">Start by adding your first draw category.</p>
          <button className="btn-primary text-sm py-2 px-5" onClick={() => setCatModal(EMPTY_CAT)}>
            <Plus size={14}/> Add Category
          </button>
        </div>
      )}

      {/* category cards */}
      <div className="space-y-4">
        {categories.map(cat => {
          const catDraws  = drawsByCategory[cat.key] || [];
          const isOpen    = expanded[cat.key] !== false; // default open

          return (
            <div
              key={cat.id}
              className="admin-card overflow-hidden"
              style={{ borderColor: `${cat.color}20` }}
            >
              {/* category row */}
              <div
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => toggleExpand(cat.key)}
              >
                {/* icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}20`, color: cat.color }}
                >
                  <DynIcon name={cat.icon} size={17}/>
                </div>

                {/* name + count */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{cat.name}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${cat.color}20`, color: cat.color }}
                    >
                      {catDraws.length} prizes
                    </span>
                    {!cat.active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#64748b]">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#475569] font-mono">{cat.key}</p>
                </div>

                {/* actions */}
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setDrawModal({ ...EMPTY_DRAW, category_key: cat.key })}
                    className="p-2 rounded-lg hover:bg-white/5 text-[#94a3b8] transition-colors flex items-center gap-1 text-xs"
                    title="Add Prize"
                  >
                    <Plus size={14}/> Prize
                  </button>
                  <button
                    onClick={() => setCatModal(cat)}
                    className="p-2 rounded-lg hover:bg-[#FFD700]/10 text-[#FFD700] transition-colors"
                    title="Edit"
                  >
                    <Edit size={14}/>
                  </button>
                  <button
                    onClick={() => setDelTarget({ id: cat.id, name: cat.name, type: "cat" })}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>

                {/* chevron */}
                <div className="text-[#475569] flex-shrink-0">
                  {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                </div>
              </div>

              {/* draws list */}
              {isOpen && (
                <div className="mt-4 space-y-1 border-t border-white/5 pt-4">
                  {catDraws.length === 0 ? (
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/2">
                      <p className="text-xs text-[#475569]">No prizes yet in this category.</p>
                      <button
                        className="text-xs font-bold flex items-center gap-1 transition-colors"
                        style={{ color: cat.color }}
                        onClick={() => setDrawModal({ ...EMPTY_DRAW, category_key: cat.key })}
                      >
                        <Plus size={12}/> Add first prize
                      </button>
                    </div>
                  ) : (
                    catDraws.map((draw, idx) => (
                      <div
                        key={draw.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/3 transition-colors group"
                      >
                        {/* rank */}
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                          style={{ background: `${cat.color}15`, color: cat.color }}
                        >
                          {idx + 1}
                        </span>

                        {/* name */}
                        <span className="flex-1 text-sm text-white font-medium truncate">{draw.name}</span>

                        {/* badge */}
                        {!draw.active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#64748b]">
                            inactive
                          </span>
                        )}

                        {/* actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDrawModal(draw)}
                            className="p-1.5 rounded-lg hover:bg-[#FFD700]/10 text-[#FFD700] transition-colors"
                            title="Edit"
                          >
                            <Edit size={13}/>
                          </button>
                          <button
                            onClick={() => setDelTarget({ id: draw.id, name: draw.name, type: "draw" })}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* add prize button at bottom */}
                  {catDraws.length > 0 && (
                    <button
                      onClick={() => setDrawModal({ ...EMPTY_DRAW, category_key: cat.key })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 mt-1 rounded-xl border border-dashed transition-all text-xs font-bold"
                      style={{ borderColor: `${cat.color}30`, color: cat.color }}
                    >
                      <Plus size={13}/> Add Prize to {cat.name}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
