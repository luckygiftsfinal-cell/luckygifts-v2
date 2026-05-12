import React, { useState } from "react";
import { ShieldCheck, CreditCard, Apple, Wallet, ChevronRight, Lock, MapPin, Mail, User, Phone, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PayPalModal from "../components/PayPalModal";
import { useAuth } from "../context/AuthContext";

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart, totalTickets } = useCart();
  const { formatPrice } = useCurrency();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, setModalOpen, logout, earnedTickets, addTickets } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPayPalOpen, setIsPayPalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: ""
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      toast.error(lang === 'AR' ? "يرجى إكمال جميع البيانات المطلوبة" : "Please complete all required fields", {
        description: lang === 'AR' ? "عنوان الشحن والبيانات الشخصية إلزامية" : "Shipping address and personal details are mandatory."
      });
      return;
    }

    setIsProcessing(true);
    
    if (paymentMethod === 'card') {
      // Lemon Squeezy Flow
      setTimeout(() => {
        setIsProcessing(false);
        toast.info(lang === 'AR' ? "يتم توجيهك إلى Lemon Squeezy..." : "Redirecting to Lemon Squeezy...", {
          icon: "💳"
        });
        setTimeout(() => {
          toast.success(lang === 'AR' ? "تم فتح بوابة الدفع!" : "Checkout opened!");
        }, 1500);
      }, 1000);
    } else if (paymentMethod === 'paypal') {
      // PayPal Flow - Open Modal
      setIsProcessing(false);
      setIsPayPalOpen(true);
    } else {
      // Crypto Flow
      setTimeout(() => {
        toast.info(lang === 'AR' ? "جاري توليد عنوان المحفظة..." : "Generating wallet address...", { icon: "₿" });
        setTimeout(() => {
          setIsProcessing(false);
          toast.success(lang === 'AR' ? "تم إنشاء طلب الدفع بالكريبتو." : "Crypto payment request created.");
        }, 2000);
      }, 1000);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Your cart is empty</h2>
        <p className="text-white/40 mb-8 max-w-sm">Add some premium gifts to your cart to participate in our exclusive draws.</p>
        <Link to="/store" className="btn-primary px-8">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0ece4] font-['Outfit'] pt-32 pb-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/store" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Secure Checkout</h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mt-1">Complete your order and win big</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Shipping Details</h3>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name <span className="text-[#FFD700]">*</span></label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address <span className="text-[#FFD700]">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors" 
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Shipping Address <span className="text-[#FFD700]">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="123 Luxury Ave, Dubai, UAE" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Phone Number <span className="text-[#FFD700]">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="+971 50 000 0000" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FFD700] transition-colors" 
                    />
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: "card", name: "Credit Card", icon: <CreditCard size={18} /> },
                  { id: "paypal", name: "PayPal", icon: <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-3 grayscale brightness-200" /> },
                  { id: "crypto", name: "Crypto", icon: <Wallet size={18} /> }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all text-center ${
                      paymentMethod === method.id 
                        ? "bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]" 
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {method.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest block">{method.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  {paymentMethod === 'card' ? <Lock className="text-[#FFD700] shrink-0 mt-1" size={20} /> : <ShieldCheck className="text-[#00C853] shrink-0 mt-1" size={20} />}
                  <div className="space-y-1">
                    <p className="text-xs text-white/80 font-bold uppercase tracking-wide">Secure Transaction</p>
                    <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                      {lang === 'AR' 
                        ? "سيتم إتمام عملية الدفع بشكل آمن. نحن لا نقوم بتخزين بيانات بطاقتك الائتمانية." 
                        : "Payment will be processed securely. We do not store your credit card"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-white/5">
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 text-white/20">
                    <ShieldCheck size={14} />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">SSL Encrypted Connection</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-3xl rounded-full" />
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Order Summary</h3>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 overflow-hidden shrink-0">
                        <img src={item.mainImage} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-sm italic">{item.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Qty: {item.quantity}</p>
                          <p className="text-sm font-black text-white">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center text-white/40 text-xs font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/40 text-xs font-black uppercase tracking-widest">
                    <span>Shipping</span>
                    <span className="text-[#00C853]">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-3 text-[#FFD700] mb-2">
                      <ShieldCheck size={24} />
                      <span className="text-xs font-black uppercase tracking-widest">LuckyGifts Guarantee</span>
                    </div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-relaxed">
                      Your purchase is protected. All draws are certified and results are published transparently.
                    </p>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-5 bg-[#FFD700] text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-[#f0d060] transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(255,215,0,0.15)]"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Complete Payment
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      <PayPalModal 
        isOpen={isPayPalOpen} 
        onClose={() => setIsPayPalOpen(false)} 
        amount={formatPrice(totalPrice)}
        onSuccess={() => {
          setIsPayPalOpen(false);
          toast.success(lang === 'AR' ? "تم الدفع بنجاح!" : "Payment successful!");
          addTickets(totalTickets);
          clearCart();
          navigate("/");
        }}
      />
      </div>
    </div>
  );
}
