import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";

const MOCK_POPULAR_PRODUCTS = [
  { id: 1, name: "Premium Pencil Set", price: 50, old_price: 75, tickets: 1, draw_name: "$1,000,000", img_src: "/images/prize_cash.png", category: "Cash", stock: 18420, total_stock: 25000, is_hot: true },
  { id: 3, name: "Gold Keychain", price: 150, old_price: 200, tickets: 3, draw_name: "Range Rover Defender", img_src: "/images/prize_luxury.png", category: "Luxury", stock: 800, total_stock: 5000, is_hot: true },
  { id: 5, name: "Tech Pouch", price: 25, old_price: 0, tickets: 1, draw_name: "Tech Pack", img_src: "/images/prize_tech.png", category: "Tech", stock: 4800, total_stock: 5000, is_hot: false },
];

function PopularProductCard({ p, formatPrice, t, lang, addItem, items, isAuthenticated, setModalOpen }: any) {
  const [hovered, setHovered] = useState(false);
  const isAdded = items.some((item: any) => item.id === p.id);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }

    if (!isAdded) {
      addItem({
        ...p,
        title: p.name,
        mainImage: p.img_src,
        price: p.price.toString(),
        stock: p.stock.toString(),
        prize: p.draw_name,
        isHot: p.is_hot
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: 24, overflow: "hidden", display: "block",
        background: hovered
          ? "linear-gradient(160deg, rgba(30,25,10,0.98), rgba(15,12,3,0.98))"
          : "linear-gradient(160deg, rgba(22,18,8,0.95), rgba(10,8,2,0.95))",
        border: `1px solid ${hovered ? "rgba(255,215,0,0.5)" : "rgba(255,215,0,0.12)"}`,
        boxShadow: hovered
          ? "0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,215,0,0.15)"
          : "0 8px 32px rgba(0,0,0,0.5)",
        transform: hovered ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {p.is_hot && (
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 10,
          background: "linear-gradient(135deg, #FFD700, #B8860B)",
          color: "#000", fontSize: 10, fontWeight: 900, padding: "5px 12px",
          borderRadius: 20, letterSpacing: "0.1em", textTransform: "uppercase",
          boxShadow: "0 4px 20px rgba(255,215,0,0.4)",
          display: "flex", alignItems: "center", gap: 6
        }}>
          <span style={{ fontSize: 12 }}>🔥</span> {t("hotProduct")}
        </div>
      )}

      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 10,
        background: "#FFD700", color: "#000", width: 44, height: 44, borderRadius: "50%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: "0 10px 30px rgba(255,215,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6)",
        border: "2px solid #FFFFFF", fontWeight: 900, lineHeight: 1,
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <div style={{ fontSize: 16 }}>{p.tickets}</div>
        <div style={{ fontSize: 6, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{t("tickets")}</div>
      </div>

      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, transparent 40%, rgba(10,8,2,0.95) 100%)" }} />
        <img
          src={p.img_src}
          alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)" }}
        />
        {hovered && (
          <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.06) 50%, transparent 60%)", animation: "shimmer 1.5s infinite" }} />
        )}
      </div>

      <div style={{ padding: "20px 22px 22px" }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.3, marginBottom: 6, letterSpacing: "-0.01em", fontFamily: "'Outfit', sans-serif" }}>{p.name}</h3>
          <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FFD700" }} />
            {p.draw_name}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {p.old_price > 0 && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "line-through", marginBottom: 2 }}>{formatPrice(p.old_price)}</span>
            )}
            <div style={{ fontSize: 32, fontVariationSettings: '"wght" 900', color: "#FFD700", lineHeight: 1, letterSpacing: "-0.02em" }}>{formatPrice(p.price)}</div>
          </div>
          {p.old_price > 0 && (
            <div style={{ background: "linear-gradient(to right, rgba(255,215,0,0.15), rgba(255,215,0,0.05))", border: "1px solid rgba(255,215,0,0.2)", color: "#FFD700", fontSize: 10, fontVariationSettings: '"wght" 900', padding: "6px 12px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              -{Math.round((1 - p.price / p.old_price) * 100)}% {lang === 'AR' ? 'خصم' : 'OFF'}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, fontWeight: 700 }}>
            <span style={{ color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>🔥</span> {t("dreamIndicator")}
            </span>
            <span style={{ color: p.stock < 10 || ((p.total_stock - p.stock) / p.total_stock) >= 0.8 ? "#ef4444" : "#4ade80" }}>
              {Math.round(((p.total_stock - p.stock) / p.total_stock) * 100)}% {t("sold")}
            </span>
          </div>
          <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
            <div style={{ 
              width: `${Math.min(100, Math.max(0, ((p.total_stock - p.stock) / p.total_stock) * 100))}%`, 
              height: "100%", 
              background: "linear-gradient(90deg, #4ade80, #16a34a)",
              boxShadow: "0 0 15px rgba(74,222,128,0.5)",
              transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }} />
          </div>
        </div>

        <button
          onClick={handleCart}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 16,
            background: isAdded
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : hovered
                ? `linear-gradient(135deg, #FFD700, #B8960C)`
                : `rgba(255,215,0,0.05)`,
            border: isAdded ? "none" : hovered ? "none" : "1px solid rgba(255,215,0,0.2)",
            color: (isAdded || hovered) ? "#000" : "#FFD700",
            fontWeight: 900, fontSize: 14, cursor: "pointer", letterSpacing: "0.1em",
            textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: hovered ? `0 15px 40px rgba(255,215,0,0.25)` : "none"
          }}
        >
          {isAdded ? <>✓ {t("inCart")}</> : <><ShoppingCart size={18} /> {t("addToCart")}</>}
        </button>
      </div>
    </div>
  );
}

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function PopularProducts() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isAuthenticated, setModalOpen } = useAuth();
  const { addItem, items } = useCart();

  return (
    <section className="py-24 relative bg-[#050505]">
      <style>{`
        @keyframes floatUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
        .animate-floatUp { animation: floatUp 0.6s cubic-bezier(0.34,1.56,0.64,1) }
      `}</style>
      <div className="container relative z-10 px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">{t("trendingNow")}</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">{t("popularProducts")}</h2>
          </div>
          <Link to="/store" className="hidden md:flex items-center gap-2 text-[#FFD700] font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm">
            {t("viewAll")} <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_POPULAR_PRODUCTS.map((p, i) => (
            <div key={p.id} className="animate-floatUp" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
              <PopularProductCard 
                p={p} 
                formatPrice={formatPrice} 
                t={t} 
                lang={lang} 
                addItem={addItem}
                items={items}
                isAuthenticated={isAuthenticated}
                setModalOpen={setModalOpen}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link to="/store" className="inline-flex items-center gap-2 text-[#FFD700] font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm">
            {t("viewAll")} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
