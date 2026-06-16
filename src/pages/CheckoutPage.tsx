import React, { useState, useEffect } from "react";
import { ShieldCheck, Wallet, ChevronRight, Lock, MapPin, Mail, User, Phone, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PayPalModal, { type PayPalCaptureDetails } from "../components/PayPalModal";
import CryptoModal from "../components/CryptoModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { sendOrderConfirmationEmail } from "../lib/emailService";
import { isValidPhone } from "../lib/validation";

export default function CheckoutPage() {
  const { formatPrice } = useCurrency();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Read cart from CartContext (populated by addItem in ProductDetailPage)
  const { items: cartItems, totalPrice, totalItems, totalTickets, clearCart } = useCart();

  const items = cartItems.map(item => ({
    ...item,
    title: item.title || (item as any).name,
    price: item.price?.toString(),
    tickets: item.tickets?.toString(),
    mainImage: item.mainImage || (item as any).img_src,
  }));
  const { user, isAuthenticated, isAdmin, setModalOpen, logout, earnedTickets, addTickets } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPayPalOpen, setIsPayPalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    paypal_enabled: true,
    stripe_enabled: false,
    btc_enabled: false,
    eth_enabled: false,
    usdt_trc20_enabled: false,
    usdt_erc20_enabled: false,
  });

  // Fetch payment settings from Supabase
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("key, value")
          .in("key", [
            "paypal_enabled", "stripe_enabled", 
            "btc_enabled", "eth_enabled", 
            "usdt_trc20_enabled", "usdt_erc20_enabled"
          ]);

        if (error) throw error;

        if (data) {
          const settings: any = {};
          data.forEach((row: any) => {
            settings[row.key] = row.value === "true";
          });
          setPaymentSettings(prev => ({ ...prev, ...settings }));
        }
      } catch (err) {
        console.error("Failed to fetch payment settings:", err);
      }
    };

    fetchPaymentSettings();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: ""
  });

  // ✅ Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const { addOrder, updateOrder, issueTickets, validatePromoCode } = useStore();

  React.useEffect(() => {
    // Refresh Lemon Squeezy to listen for new DOM elements if necessary
    if ((window as any).createLemonSqueezy) {
      (window as any).createLemonSqueezy();
    }
  }, []);

  const handleLemonSqueezyCheckout = async () => {
    setIsProcessing(true);

    try {
      // Save order to Supabase BEFORE redirecting to payment
      const orderId = await addOrder({
        user_id: user?.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        total_amount: finalTotal,
        discount_amount: calculateDiscount(),
        payment_method: 'credit_card',
        status: 'pending',
        items: items,
        tickets_earned: totalTickets,
        payment_details: { provider: 'lemonsqueezy' },
        referrer_id: localStorage.getItem('luckygifts_ref') || undefined
      } as any);

      const response = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          userName: formData.name,
          userEmail: formData.email,
          totalPrice: finalTotal,
          orderId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.checkoutUrl) {
        clearCart();
        if ((window as any).LemonSqueezy) {
          (window as any).LemonSqueezy.Url.Open(data.checkoutUrl);
        } else {
          window.location.href = data.checkoutUrl;
        }
      }
    } catch (error: any) {
      console.error("Lemon Squeezy Error:", error);
      toast.error(lang === 'AR' ? "فشل إنشاء رابط الدفع" : "Failed to create checkout link", {
        description: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    const promo = await validatePromoCode(promoInput);
    if (promo) {
      setAppliedPromo(promo);
      toast.success(lang === 'AR' ? "تم تطبيق كود الخصم!" : "Promo code applied!");
    } else {
      toast.error(lang === 'AR' ? "كود خصم غير صالح" : "Invalid promo code");
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    return (totalPrice * appliedPromo.discount_percent) / 100;
  };

  const finalTotal = totalPrice - calculateDiscount();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Check if user is authenticated
    if (!isAuthenticated) {
      setModalOpen(true);
      toast.info(lang === 'AR' ? "يرجى تسجيل الدخول لإتمام عملية الشراء" : "Please sign in to complete your purchase");
      return;
    }

    // Validation
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      toast.error(lang === 'AR' ? "يرجى إكمال جميع البيانات المطلوبة" : "Please complete all required fields", {
        description: lang === 'AR' ? "عنوان الشحن والبيانات الشخصية إلزامية" : "Shipping address and personal details are mandatory."
      });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error(lang === 'AR' ? "رقم الهاتف غير صالح" : "Invalid phone number", {
        description: lang === 'AR' ? "يرجى إدخال رقم هاتف صحيح (7-15 رقم)" : "Please enter a valid phone number (7-15 digits)."
      });
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'paypal') {
      // PayPal Flow - Save order as 'pending' BEFORE opening modal
      // This ensures the order is recorded even if DB fails after payment
      try {
        const orderId = await addOrder({
          user_id: user?.id,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          total_amount: finalTotal,
          discount_amount: calculateDiscount(),
          payment_method: 'paypal',
          status: 'pending',
          items: items,
          tickets_earned: totalTickets,
          referrer_id: localStorage.getItem('luckygifts_ref') || undefined
        } as any);
        setPendingOrderId(orderId);
        setIsProcessing(false);
        setIsPayPalOpen(true);
      } catch (err) {
        setIsProcessing(false);
        toast.error(lang === 'AR' ? 'فشل تجهيز الطلب، يرجى المحاولة مجدداً' : 'Failed to prepare order, please try again.');
      }
    } else {
      // Crypto Flow - Open Modal
      setIsProcessing(false);
      setIsCryptoOpen(true);
    }
  };

  const handleCryptoSuccess = async (txHash: string) => {
    setIsCryptoOpen(false);
    setIsProcessing(true);
    try {
      const orderId = await addOrder({
        user_id: user?.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        total_amount: finalTotal,
        discount_amount: calculateDiscount(),
        payment_method: 'crypto',
        status: 'pending_verification', // New status for crypto
        items: items,
        tickets_earned: totalTickets,
        payment_details: { txHash },
        referrer_id: localStorage.getItem('luckygifts_ref') || undefined
      } as any);

      if (user?.id && orderId) {
        const ticketCodes = await issueTickets(orderId, user.id, totalTickets);

        await sendOrderConfirmationEmail({
          toEmail: formData.email,
          userName: formData.name,
          orderId: orderId,
          totalAmount: totalPrice.toString(),
          items: items,
          tickets: ticketCodes
        });
      }

      await addTickets(totalTickets);
      setIsProcessing(false);
      toast.success(lang === 'AR' ? "تم إرسال طلب الدفع. بانتظار التأكيد." : "Payment submitted. Waiting for verification.");
      clearCart();
      navigate("/");
    } catch (err) {
      setIsProcessing(false);
      toast.error("Failed to save order");
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

      <div className="container-custom relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/store" className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">{t("secureCheckout")}</h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mt-1">{t("completeOrderDesc")}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: "3rem" }} id="checkout-grid">
          {/* Main Form */}
          <div style={{ minWidth: 0 }} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-white/15 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{t("shippingDetails")}</h3>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t("fullName")} <span className="text-[#FFD700]">*</span></label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111111] border border-white/25 rounded-xl py-4 px-4 text-base text-white focus:outline-none focus:border-[#FFD700] focus:bg-[#1a1a1a] transition-all placeholder:text-white/30 placeholder:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t("emailAddress")} <span className="text-[#FFD700]">*</span></label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#111111] border border-white/25 rounded-xl py-4 px-4 text-base text-white focus:outline-none focus:border-[#FFD700] focus:bg-[#1a1a1a] transition-all placeholder:text-white/30 placeholder:text-base"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t("shippingAddress")} <span className="text-[#FFD700]">*</span></label>
                  <input
                    type="text"
                    placeholder="123 Luxury Ave, Dubai, UAE"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#111111] border border-white/25 rounded-xl py-4 px-4 text-base text-white focus:outline-none focus:border-[#FFD700] focus:bg-[#1a1a1a] transition-all placeholder:text-white/30 placeholder:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{t("phoneNumber")} <span className="text-[#FFD700]">*</span></label>
                  <input
                    type="text"
                    placeholder="+971 50 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#111111] border border-white/25 rounded-xl py-4 px-4 text-base text-white focus:outline-none focus:border-[#FFD700] focus:bg-[#1a1a1a] transition-all placeholder:text-white/30 placeholder:text-base"
                  />
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111111] border border-white/15 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                  <Wallet size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{t("paymentMethod")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  ...(paymentSettings.paypal_enabled ? [{ id: "paypal", name: "PayPal", icon: <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-3 grayscale brightness-200" /> }] : []),
                  ...(paymentSettings.stripe_enabled ? [{ id: "stripe", name: "Credit Card", icon: <CreditCard size={18} /> }] : []),
                  ...((paymentSettings.btc_enabled || paymentSettings.eth_enabled || paymentSettings.usdt_trc20_enabled || paymentSettings.usdt_erc20_enabled) 
                    ? [{ id: "crypto", name: "Crypto", icon: <Wallet size={18} /> }] : [])
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all text-center ${paymentMethod === method.id
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
                  {paymentMethod === 'paypal' ? <ShieldCheck className="text-[#00C853] shrink-0 mt-1" size={20} /> : <ShieldCheck className="text-[#00C853] shrink-0 mt-1" size={20} />}
                  <div className="space-y-1">
                    <p className="text-xs text-white/80 font-bold uppercase tracking-wide">{t("secureTransaction")}</p>
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
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t("sslEncrypted")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div style={{ minWidth: 0 }}>
            <div className="sticky top-32 space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 blur-3xl rounded-full" />

                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">{t("orderSummary")}</h3>

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
                    <span>{t("subtotal")}</span>
                    <span className="text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between items-center text-[#00C853] text-xs font-black uppercase tracking-widest mt-2">
                      <span>Discount ({appliedPromo.discount_percent}%)</span>
                      <span>-{formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-white/40 text-xs font-black uppercase tracking-widest mt-2">
                    <span>{t("shipping")}</span>
                    <span className="text-[#00C853]">{t("free")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                    <span className="text-sm font-black text-white uppercase tracking-widest">{t("total")}</span>
                    <span className="text-2xl font-black text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("promoCode")}
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-[#111111] border border-white/25 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#FFD700] transition-all placeholder:text-white/30 uppercase font-black tracking-widest"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      {t("apply")}
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-3 text-[#FFD700] mb-2">
                      <ShieldCheck size={24} />
                      <span className="text-xs font-black uppercase tracking-widest">{t("guaranteeTitle")}</span>
                    </div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-relaxed">
                      {t("guaranteeDesc")}
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
                        {t("processing")}
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        {t("completePayment")}
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
          onSuccess={async (captureDetails: PayPalCaptureDetails) => {
            setIsPayPalOpen(false);
            toast.success(lang === 'AR' ? "تم الدفع بنجاح!" : "Payment successful!");
            try {
              // Order was saved as 'pending' before modal opened.
              // Now update it to 'paid' and store verified capture details.
              const orderId = pendingOrderId;
              if (!orderId) throw new Error("Missing pending order ID");

              await updateOrder({
                id: orderId,
                status: 'paid',
                payment_details: {
                  provider:        'paypal',
                  capture_id:      captureDetails.captureID,
                  paypal_order_id: captureDetails.paypalOrderID,
                  payer_email:     captureDetails.payerEmail,
                  payer_name:      captureDetails.payerName,
                  captured_amount: captureDetails.capturedAmount,
                  currency:        captureDetails.capturedCurrency,
                  verified_server: true,
                },
              } as any);

              if (user?.id) {
                const ticketCodes = await issueTickets(orderId, user.id, totalTickets);

                await sendOrderConfirmationEmail({
                  toEmail:     formData.email,
                  userName:    formData.name,
                  orderId:     orderId,
                  totalAmount: totalPrice.toString(),
                  items:       items,
                  tickets:     ticketCodes,
                });
              }

              await addTickets(totalTickets);
              setPendingOrderId(null);
              clearCart();
              navigate("/");
            } catch (err) {
              toast.error(
                lang === 'AR'
                  ? "تم الدفع لكن فشل تحديث الطلب، تواصل مع الدعم"
                  : "Payment received but order update failed. Please contact support."
              );
            }
          }}
        />
        <CryptoModal
          isOpen={isCryptoOpen}
          onClose={() => setIsCryptoOpen(false)}
          onSuccess={handleCryptoSuccess}
          amount={formatPrice(totalPrice)}
        />
      </div>
    </div>
  );
}
