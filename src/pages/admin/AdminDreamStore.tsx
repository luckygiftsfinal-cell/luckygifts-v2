import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, Layout, Award, Tag, Palette } from "lucide-react";
import { toast } from "sonner";

const mockCategories = [
  { id: "1", name: "Cash Dream", key: "Cash", color: "#22c55e", icon: "DollarSign", active: true },
  { id: "2", name: "Luxury Dream", key: "Luxury", color: "#FFD700", icon: "Gem", active: true },
  { id: "3", name: "Tech Dream", key: "Tech", color: "#38bdf8", icon: "Zap", active: true },
];

const mockDraws = [
  { id: "1", name: "$1,000,000 Cash", category: "Cash", status: "Active", entries: 18420 },
  { id: "2", name: "Range Rover Defender", category: "Luxury", status: "Active", entries: 800 },
  { id: "3", name: "Rolex Datejust 41", category: "Luxury", status: "Active", entries: 450 },
  { id: "4", name: "Tech Pack (MacBook + iPhone)", category: "Tech", status: "Closed", entries: 5000 },
];

import { useStore } from "../../context/StoreContext";

export default function AdminDreamStore() {
  const { 
    categories, draws, 
    addCategory, updateCategory, deleteCategory,
    addDraw, updateDraw, deleteDraw 
  } = useStore();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingDraw, setIsAddingDraw] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingDraw, setEditingDraw] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'draw', id: string, name: string } | null>(null);

  const handleAction = (type: 'category' | 'draw', action: string, id: string, name: string = "") => {
    if (action === "delete") {
      setDeleteConfirm({ type, id, name });
    } else if (action === "edit") {
      if (type === 'category') {
        const cat = categories.find(c => c.id === id);
        if (cat) {
          setEditingCategory({ ...cat });
          setIsAddingCategory(true);
        }
      } else {
        const draw = draws.find(d => d.id === id);
        if (draw) {
          setEditingDraw({ ...draw });
          setIsAddingDraw(true);
        }
      }
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    if (type === 'category') {
      deleteCategory(id);
    } else {
      deleteDraw(id);
    }
    setDeleteConfirm(null);
  };

  const handleSave = (type: 'category' | 'draw') => {
    if (type === 'category') {
      if (editingCategory?.id) {
        updateCategory(editingCategory);
        toast.success("Category updated!");
      } else {
        addCategory(editingCategory);
        toast.success("Category added!");
      }
      setIsAddingCategory(false);
      setEditingCategory(null);
    } else {
      if (editingDraw?.id) {
        updateDraw(editingDraw);
        toast.success("Prize draw updated!");
      } else {
        addDraw(editingDraw);
        toast.success("Prize draw added!");
      }
      setIsAddingDraw(false);
      setEditingDraw(null);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Dream Store Config</h1>
        <p className="text-white/40">Manage store categories, tab colors, and linked prize draw campaigns.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Categories Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Layout className="text-[#FFD700]" size={20} /> Store Categories
            </h2>
            <button 
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="p-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#e6c200] transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Theme Color</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white/40">
                          <Tag size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{cat.name}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">Key: {cat.key}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-mono text-white/60 uppercase">{cat.color}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleAction('category', 'edit', cat.id)} className="p-2 text-white/40 hover:text-white transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleAction('category', 'delete', cat.id, cat.name)} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prize Draws Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Award className="text-[#FFD700]" size={20} /> Prize Draws
            </h2>
            <button 
              onClick={() => setIsAddingDraw(!isAddingDraw)}
              className="p-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#e6c200] transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <th className="py-4 px-6">Draw Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {draws.map((draw) => (
                  <tr key={draw.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-white text-sm">{draw.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${draw.status === 'Active' ? 'text-[#00C853]' : 'text-red-500'}`}>{draw.status}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-black bg-white/5 text-white/40 px-2 py-1 rounded uppercase tracking-widest border border-white/10">{draw.category}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleAction('draw', 'edit', draw.id)} className="p-2 text-white/40 hover:text-white transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleAction('draw', 'delete', draw.id, draw.name)} className="p-2 text-white/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Category Modal Placeholder */}
      {(isAddingCategory || isAddingDraw) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setIsAddingCategory(false); setIsAddingDraw(false); }} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">
              {isAddingCategory ? (editingCategory?.id ? "Edit Category" : "Add New Category") : (editingDraw?.id ? "Edit Prize Draw" : "Add New Prize Draw")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Name</label>
                <input 
                  type="text" 
                  value={isAddingCategory ? (editingCategory?.name || "") : (editingDraw?.name || "")}
                  onChange={(e) => isAddingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setEditingDraw({ ...editingDraw, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                  placeholder="e.g. Real Estate Dream" 
                />
              </div>
              {isAddingCategory ? (
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Theme Color (Hex)</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      value={editingCategory?.color || "#FFD700"}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={editingCategory?.color || "#FFD700"}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                      placeholder="#FFD700" 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Assign to Category</label>
                  <select 
                    value={editingDraw?.category || ""}
                    onChange={(e) => setEditingDraw({ ...editingDraw, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.key}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button onClick={() => { setIsAddingCategory(false); setIsAddingDraw(false); setEditingCategory(null); setEditingDraw(null); }} className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 font-bold uppercase tracking-widest text-xs hover:text-white transition-all">Cancel</button>
                <button onClick={() => handleSave(isAddingCategory ? 'category' : 'draw')} className="flex-1 py-3 rounded-xl bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Are you sure?</h3>
            <p className="text-white/40 text-sm mb-8">
              You are about to delete <span className="text-white font-bold">"{deleteConfirm.name}"</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 font-bold uppercase tracking-widest text-xs hover:text-white transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all">Delete Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
