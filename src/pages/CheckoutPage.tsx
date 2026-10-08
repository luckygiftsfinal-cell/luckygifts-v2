import React, { useState, useEffect } from "react";
import { ShieldCheck, Wallet, ChevronRight, Lock, MapPin, Mail, User, Phone, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CryptoModal, { CryptoAsset } from "../components/CryptoModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { isValidPhone } from "../lib/validation";

export default function CheckoutPage() {
  const { formatPrice } = useCurrency();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Read cart from CartContext (populated by addItem in ProductDetailPage)
  const { items: cartItems, totalPrice, clearCart } = useCart();

  const items = cartItems.map(item => ({
    ...item,
    title: item.title || (item as any).name,
    price: item.price?.toString(),
    tickets: item.tickets?.toString(),
    mainImage: item.mainImage || (item as any).img_src,
  }));
  const { user, isAuthenticated, setModalOpen } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // Order created on the server for the current cart + details (re-used if the customer re-opens the modal)
  const [cryptoSession, setCryptoSession] = useState<{
    key: string;
    orderId: string;
    expectedAmount: string;
    wallets: { usdt: string; usdc: string };
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
  const { validatePromoCode } = useStore();


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

  const MIN_CHECKOUT_AMOUNT = 5;

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const sessionKey = JSON.stringify({
    items: items.map((i) => [i.id, i.quantity]),
    promo: appliedPromo?.code || null,
    formData,
  });

  // Step 1: validate the form, ask the SERVER to create the order (prices/promo are computed there),
  // then show the payment modal with the exact amount to send.
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setModalOpen(true);
      toast.info(lang === 'AR' ? "يرجى تسجيل الدخول لإتمام عملية الشراء" : "Please sign in to complete your purchase");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(lang === 'AR' ? "يرجى إكمال جميع البيانات المطلوبة" : "Please complete all required fields", {
        description: lang === 'AR' ? "البيانات الشخصية إلزامية" : "Personal details are mandatory."
      });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error(lang === 'AR' ? "رقم الهاتف غير صالح" : "Invalid phone number", {
        description: lang === 'AR' ? "يرجى إدخال رقم هاتف صحيح (7-15 رقم)" : "Please enter a valid phone number (7-15 digits)."
      });
      return;
    }

    if (totalPrice < MIN_CHECKOUT_AMOUNT) {
      toast.error(lang === 'AR' ? `الحد الأدنى للطلب $${MIN_CHECKOUT_AMOUNT}` : `Minimum order amount is $${MIN_CHECKOUT_AMOUNT}`);
      return;
    }

    // Nothing changed since the order was created → just re-open the modal
    if (cryptoSession && cryptoSession.key === sessionKey) {
      setIsCryptoOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error(lang === 'AR' ? "انتهت الجلسة، سجّل الدخول من جديد" : "Session expired, please sign in again");

      const res = await fetch("/.netlify/functions/create-crypto-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          promoCode: appliedPromo?.code || undefined,
          customer: formData,
          referrerId: localStorage.getItem('luckygifts_ref') || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order");

      setCryptoSession({ key: sessionKey, orderId: data.orderId, expectedAmount: data.expectedAmount, wallets: data.wallets });
      setIsCryptoOpen(true);
    } catch (err: any) {
      toast.error(err?.message || (lang === 'AR' ? "تعذّر إنشاء الطلب" : "Could not create the order"));
    } finally {
      setIsProcessing(false);
    }
  };

  const failureMessage = (reason?: string) => {
    switch (reason) {
      case "amount_mismatch":
        return lang === 'AR' ? "المبلغ المستلم لا يطابق المبلغ المطلوب تماماً" : "The amount received does not match the required amount exactly";
      case "tx_before_order":
        return lang === 'AR' ? "هذه المعاملة أُجريت قبل إنشاء الطلب" : "This transaction was made before the order was created";
      case "tx_failed":
        return lang === 'AR' ? "المعاملة فشلت على الشبكة" : "The transaction failed on the network";
      case "no_usdc_transfer_to_wallet":
        return lang === 'AR' ? "لا توجد حوالة USDC إلى محفظتنا في هذه المعاملة" : "No USDC transfer to our wallet was found in this transaction";
      case "order_expired":
        return lang === 'AR' ? "انتهت صلاحية الطلب (24 ساعة)" : "This order has expired (24 hours)";
      default:
        return lang === 'AR' ? "فشل التحقق من الدفع، تأكد من المبلغ والشبكة" : "Payment could not be verified. Check the amount and network.";
    }
  };

  // Step 2: the customer pasted the TXID → the server verifies it on-chain and finalizes the order.
  const handleSubmitTx = async (txHash: string, asset: CryptoAsset) => {
    if (!cryptoSession) return;
    setIsVerifying(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error(lang === 'AR' ? "انتهت الجلسة، سجّل الدخول من جديد" : "Session expired, please sign in again");

      toast.info(lang === 'AR' ? "جارٍ التحقق من الدفع على البلوكتشين..." : "Verifying your payment on-chain...");

      let status = "pending";
      let reason: string | undefined;
      for (let i = 0; i < 18 && status === "pending"; i++) {
        const res = await fetch("/.netlify/functions/verify-crypto-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId: cryptoSession.orderId, txHash, asset }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        status = data.status;
        reason = data.reason;
        if (status === "pending") await new Promise((r) => setTimeout(r, 10000));
      }

      if (status === "invalid") {
        toast.error(failureMessage(reason));
        return; // keep the modal open so the customer can fix the hash
      }

      if (status === "paid") {
        toast.success(lang === 'AR' ? "تم تأكيد الدفع!" : "Payment confirmed!");
      } else {
        toast.info(lang === 'AR' ? "لم تتأكد المعاملة بعد. سنفعّل طلبك فور تأكيدها." : "Transaction not confirmed yet. Your order will be activated once it is.");
      }

      const orderId = cryptoSession.orderId;
      setIsCryptoOpen(false);
      clearCart();
      navigate(`/payment/success?order=${orderId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process crypto payment");
    } finally {
      setIsVerifying(false);
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
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{lang === 'AR' ? "البيانات الشخصية" : "Personal Details"}</h3>
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
                  { id: "crypto", name: lang === 'AR' ? "كريبتو" : "Crypto", icon: <Wallet size={18} /> }
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
                  <ShieldCheck className="text-[#00C853] shrink-0 mt-1" size={20} />
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
        {cryptoSession && (
          <CryptoModal
            isOpen={isCryptoOpen}
            onClose={() => setIsCryptoOpen(false)}
            onSubmit={handleSubmitTx}
            expectedAmount={cryptoSession.expectedAmount}
            wallets={cryptoSession.wallets}
            isVerifying={isVerifying}
          />
        )}
      </div>
    </div>
  );
}
