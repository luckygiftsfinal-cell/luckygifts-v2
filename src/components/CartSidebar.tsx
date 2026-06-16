import React, { useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();
  const { isAuthenticated, setModalOpen } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    // ✅ Check if user is authenticated
    if (!isAuthenticated) {
      setIsCartOpen(false);
      setModalOpen(true);
      toast.info(lang === "AR" ? "يرجى تسجيل الدخول لإتمام عملية الشراء" : "Please sign in to complete your purchase");
      return;
    }

    // ✅ User is authenticated → proceed to payment gateway
    setIsLoading(true);
    setError(null);
    try {
      // Build order name from cart items
      const packageName = items.map(i => `${i.title} x${i.quantity}`).join(", ");

      const res = await fetch("/.netlify/functions/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice.toFixed(2),
          packageName,
          packageId: items.map(i => i.id).join(","),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_url) {
        throw new Error(data.error || "Failed to create payment");
      }

      // Redirect directly to payment gateway
      window.location.href = data.payment_url;
    } catch (err: any) {
      setError(lang === "AR" ? "فشل في إنشاء الدفع، حاول مرة أخرى" : "Payment failed, please try again");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[2001] shadow-2xl flex flex-col font-['Outfit']"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {lang === 'AR' ? 'سلة التسوق' : 'Your Cart'}
                  </h3>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                    {totalItems} {lang === 'AR' ? 'منتجات' : 'Items Added'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-sm">
                    {lang === 'AR' ? 'سلتك فارغة حالياً' : 'Your cart is empty'}
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[#FFD700] text-xs font-black uppercase tracking-widest hover:underline"
                  >
                    {lang === 'AR' ? 'ابدأ التسوق الآن' : 'Start Shopping'}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/5 overflow-hidden shrink-0">
                      <img src={item.mainImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-bold text-sm italic line-clamp-1">{item.title}</h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-white/20 hover:text-red-500 transition-colors ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#FFD700] font-black uppercase tracking-widest mt-1">
                          {item.tickets} {lang === 'AR' ? 'تذاكر' : 'Tickets'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-black text-white w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-black text-white">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-white/[0.02] space-y-4">
                <div className="flex justify-between items-center text-white/40 text-xs font-black uppercase tracking-widest">
                  <span>{lang === 'AR' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="text-white text-lg">{formatPrice(totalPrice)}</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 bg-[#FFD700] text-black font-black uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#f0d060] transition-all group shadow-xl shadow-[#FFD700]/10 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> {lang === 'AR' ? 'جاري التحويل...' : 'Redirecting...'}</>
                  ) : (
                    <>{lang === 'AR' ? 'إتمام الشراء' : 'Checkout Now'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>

                {error && (
                  <p className="text-red-400 text-xs text-center font-bold">{error}</p>
                )}
                
                <p className="text-[10px] text-white/20 text-center font-bold uppercase tracking-widest">
                  {lang === 'AR' ? 'الأسعار تشمل ضريبة القيمة المضافة' : 'Taxes and shipping calculated at checkout'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
