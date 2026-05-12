import React, { useState } from "react";
import { Crown, Star, Gem, Edit2, CheckCircle, Plus, Trash2, XCircle } from "lucide-react";
import { useStore, VIPPackage } from "../../context/StoreContext";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  Star,
  Crown,
  Gem
};

export default function AdminVIPPackages() {
  const { vipPackages, updateVIPPackage } = useStore();
  const [editingPackage, setEditingPackage] = useState<VIPPackage | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackage) {
      updateVIPPackage(editingPackage);
      toast.success(`${editingPackage.name} Package updated!`);
      setEditingPackage(null);
    }
  };

  const addFeature = () => {
    if (editingPackage) {
      setEditingPackage({
        ...editingPackage,
        features: [...editingPackage.features, "New Feature"]
      });
    }
  };

  const removeFeature = (index: number) => {
    if (editingPackage) {
      const newFeatures = [...editingPackage.features];
      newFeatures.splice(index, 1);
      setEditingPackage({
        ...editingPackage,
        features: newFeatures
      });
    }
  };

  const updateFeature = (index: number, val: string) => {
    if (editingPackage) {
      const newFeatures = [...editingPackage.features];
      newFeatures[index] = val;
      setEditingPackage({
        ...editingPackage,
        features: newFeatures
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">VIP Packages Management</h1>
        <p className="text-white/40">Customize membership tiers, pricing, and exclusive benefits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {vipPackages.map((pkg) => {
          const Icon = ICON_MAP[pkg.iconName] || Star;
          return (
            <div 
              key={pkg.id} 
              className={`bg-[#0a0a0a] border ${pkg.popular ? 'border-[#FFD700]' : 'border-white/10'} rounded-3xl p-8 relative group transition-all hover:scale-[1.02] shadow-2xl`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pkg.popular ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-[#FFD700]'}`}>
                  <Icon size={28} />
                </div>
                <button 
                  onClick={() => setEditingPackage({ ...pkg })}
                  className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-[#FFD700]">${pkg.price}</span>
                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">One-time</span>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Benefits ({pkg.features.length})</p>
                <div className="space-y-3">
                  {pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle size={14} className="text-[#FFD700] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{pkg.entries} Tickets</span>
                <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">{pkg.eventTicketsLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setEditingPackage(null)} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Edit {editingPackage.name} Package</h3>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Update price, tickets and features</p>
              </div>
              <button onClick={() => setEditingPackage(null)} className="p-2 text-white/20 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Package Name</label>
                  <input 
                    type="text" 
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Price ($)</label>
                  <input 
                    type="number" 
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Standard Tickets</label>
                  <input 
                    type="number" 
                    value={editingPackage.entries}
                    onChange={(e) => setEditingPackage({ ...editingPackage, entries: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Event Tickets Label</label>
                  <input 
                    type="text" 
                    value={editingPackage.eventTicketsLabel}
                    onChange={(e) => setEditingPackage({ ...editingPackage, eventTicketsLabel: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Package Features</label>
                  <button 
                    type="button"
                    onClick={addFeature}
                    className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-1 hover:brightness-125 transition-all"
                  >
                    <Plus size={12} /> Add Feature
                  </button>
                </div>
                <div className="space-y-3">
                  {editingPackage.features.map((feature, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="text" 
                        value={feature}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#FFD700] focus:outline-none transition-colors"
                      />
                      <button 
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <input 
                  type="checkbox" 
                  id="popular"
                  checked={editingPackage.popular}
                  onChange={(e) => setEditingPackage({ ...editingPackage, popular: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-black text-[#FFD700] focus:ring-[#FFD700]"
                />
                <label htmlFor="popular" className="text-sm font-bold text-white uppercase tracking-widest cursor-pointer">Mark as Most Popular</label>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="flex-1 py-4 rounded-xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-xs hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-xl bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs hover:bg-[#e6c200] transition-all shadow-xl shadow-[#FFD700]/10"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
