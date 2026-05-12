import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../context/StoreContext";

export default function AdminProducts() {
  const { draws, products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleProductAction = async (action: string, productId: string, title: string) => {
    if (action === "edit") {
      const product = products.find(p => p.id === productId);
      if (product) {
        setEditingProduct({ ...product });
        setIsAdding(true);
      }
    }
    if (action === "delete") {
      try {
        await deleteProduct(productId);
        toast.error(`${title} deleted successfully`);
      } catch (e) {
        toast.error("Failed to delete product");
      }
    }
    if (action === "save") {
      try {
        if (editingProduct?.id) {
          await updateProduct(editingProduct);
          toast.success("Product updated successfully!", { icon: "📦" });
        } else {
          // Find category automatically from the selected prize
          const selectedDraw = draws.find(d => d.name === editingProduct.prize);
          const finalProduct = { ...editingProduct, category: selectedDraw?.category || "Cash" };
          await addProduct(finalProduct);
          toast.success("Product created successfully!", { icon: "📦" });
        }
        setIsAdding(false);
        setEditingProduct(null);
      } catch (e) {
        toast.error("Failed to save product");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isMain) {
          setEditingProduct({ ...editingProduct, mainImage: reader.result as string });
        } else {
          const currentSubs = editingProduct?.subImages || [];
          setEditingProduct({ ...editingProduct, subImages: [...currentSubs, reader.result as string] });
        }
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Products Management</h1>
          <p className="text-white/40">Add, edit, or remove store products and their linked prize campaigns.</p>
        </div>
        
        <button 
          onClick={() => {
            if (isAdding) setEditingProduct(null);
            setIsAdding(!isAdding);
          }}
          className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
        >
          {isAdding ? "Cancel" : <><Plus size={20} /> Add Product</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4">
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">{editingProduct ? "Edit Product" : "Create New Product"}</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Product Title</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                  placeholder="e.g. Signature Cap"
                  value={editingProduct?.title || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  rows={3} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors resize-none" 
                  placeholder="Enter product details..."
                  value={editingProduct?.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Sale Price ($)</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                    placeholder="0.00"
                    value={editingProduct?.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Original Price ($)</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 focus:border-[#FFD700] focus:outline-none transition-colors" 
                    placeholder="0.00"
                    value={editingProduct?.originalPrice || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Tickets</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                    placeholder="1"
                    value={editingProduct?.tickets || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tickets: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Quantity (Stock)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors" 
                    placeholder="0"
                    value={editingProduct?.stock || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="hotProduct" 
                    className="w-5 h-5 accent-[#FFD700] rounded"
                    checked={editingProduct?.isHot || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isHot: e.target.checked })}
                  />
                  <label htmlFor="hotProduct" className="text-sm font-bold text-white cursor-pointer">Mark as Hot Product 🔥</label>
                </div>
                <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                  <input 
                    type="checkbox" 
                    id="popularProduct" 
                    className="w-5 h-5 accent-[#FFD700] rounded"
                    checked={editingProduct?.isPopular || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isPopular: e.target.checked })}
                  />
                  <label htmlFor="popularProduct" className="text-sm font-bold text-white cursor-pointer">Show in Popular Products (Home)</label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Linked Prize Campaign</label>
                <select 
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none transition-colors appearance-none cursor-pointer" 
                  value={editingProduct?.prize || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, prize: e.target.value })}
                >
                  <option value="">Select a Campaign</option>
                  {draws.map(draw => (
                    <option key={draw.id} value={draw.name}>{draw.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col h-full space-y-6">
              {/* Main Image */}
              <div>
                <label className="block text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Main Product Image
                </label>
                <label className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-[#FFD700]/50 transition-colors bg-white/5 flex items-center justify-center cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  {editingProduct?.mainImage ? (
                    <>
                      <img src={editingProduct.mainImage} alt="Main" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-white/20 group-hover:text-[#FFD700] transition-colors">
                      <Plus size={32} />
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Upload Main Photo</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Sub-images Gallery */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                   Sub-Images (Gallery)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(editingProduct?.subImages || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/5">
                      <img src={img} alt="Sub" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const newImgs = [...(editingProduct.subImages || [])];
                          newImgs.splice(idx, 1);
                          setEditingProduct({ ...editingProduct, subImages: newImgs });
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border border-dashed border-white/10 hover:border-[#FFD700]/50 rounded-xl flex items-center justify-center text-white/20 hover:text-[#FFD700] cursor-pointer transition-colors bg-white/5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                    <Plus size={20} />
                  </label>
                </div>
              </div>

              <div className="mt-auto pt-6 text-right">
                <button 
                  onClick={() => handleProductAction("save", "", "")}
                  type="button" 
                  className="bg-[#00C853] hover:bg-[#00e65e] text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,200,83,0.3)] w-full"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm text-black focus:outline-none focus:border-[#FFD700] transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Prize Campaign</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Tickets</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-white">{product.title}</td>
                  <td className="py-4 px-6 text-[#FFD700] text-sm">{product.prize}</td>
                  <td className="py-4 px-6 text-white font-bold">{product.price}</td>
                  <td className="py-4 px-6 text-white/60">{product.tickets}</td>
                  <td className="py-4 px-6 text-white/60">{product.stock}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {product.id === "1" || product.id === "2" ? (
                        <span className="text-[9px] font-black bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded uppercase tracking-widest border border-[#FFD700]/20">Popular</span>
                      ) : null}
                      <span className="text-[9px] font-black bg-white/5 text-white/40 px-2 py-1 rounded uppercase tracking-widest border border-white/10">Active</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleProductAction("edit", product.id, product.title)}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleProductAction("delete", product.id, product.title)}
                      className="p-2 text-white/40 hover:text-[#FF4500] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
