import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Gem, DollarSign, Zap, Sparkles, ShoppingCart, Search, Tag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";

const CATEGORY_ICONS: any = {
  "Cash": DollarSign,
  "Luxury": Gem,
  "Tech": Zap,
  "VIP": Crown,
};

const MOCK_PRODUCTS = [
  { id: 1, name: "Premium Pencil Set", price: 50, old_price: 75, tickets: 1, draw_name: "$1,000,000", img_src: "/images/prize_cash.png", category: "Cash", stock: 18420, total_stock: 25000, is_hot: true },
  { id: 2, name: "Luxury Pen", price: 100, old_price: 0, tickets: 2, draw_name: "$250,000", img_src: "/images/prize_cash.png", category: "Cash", stock: 12300, total_stock: 20000, is_hot: false },
  { id: 3, name: "Gold Keychain", price: 150, old_price: 200, tickets: 3, draw_name: "Range Rover Defender", img_src: "/images/prize_luxury.png", category: "Luxury", stock: 800, total_stock: 5000, is_hot: true },
  { id: 4, name: "Leather Wallet", price: 250, old_price: 300, tickets: 5, draw_name: "Rolex Datejust 41", img_src: "/images/prize_luxury.png", category: "Luxury", stock: 450, total_stock: 1000, is_hot: false },
  { id: 5, name: "Tech Pouch", price: 25, old_price: 0, tickets: 1, draw_name: "Tech Pack (MacBook + iPhone + PS5)", img_src: "/images/prize_tech.png", category: "Tech", stock: 4800, total_stock: 5000, is_hot: false },
];

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = value; const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => { start += step; if (start >= end) { setDisplay(end); clearInterval(timer); } else setDisplay(start); }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [targetDate]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[["d", time.d], ["h", time.h], ["m", time.m], ["s", time.s]].map(([label, val]) => (
        <div key={label as string} style={{ textAlign: "center" }}>
          <div style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, padding: "6px 10px", fontSize: 18, fontWeight: 900, color: "#FFD700", minWidth: 40, fontVariantNumeric: "tabular-nums" }}>
            {pad(val as number)}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginTop: 3, letterSpacing: "0.1em" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ p, formatPrice, t, lang, addItem, items, isAuthenticated, setModalOpen }: any) {
  const [hovered, setHovered] = useState(false);
  const isAdded = items.some((item: any) => item.id === p.id);

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }

    if (!isAdded) {
      addItem(p);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: 24, overflow: "hidden",
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
          background: "linear-gradient(135deg, #ff4500, #ff6a00)",
          color: "#fff", fontSize: 10, fontWeight: 900, padding: "5px 10px",
          borderRadius: 20, letterSpacing: "0.08em", textTransform: "uppercase",
          boxShadow: "0 4px 15px rgba(255,80,0,0.4)",
          display: "flex", alignItems: "center", gap: 4
        }}>🏆 {t("topSell")}</div>
      )}

      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 10,
        background: "#FFD700", color: "#000", width: 60, height: 60, borderRadius: "50%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: "0 10px 30px rgba(255,215,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6)",
        border: "2.5px solid #FFFFFF", fontWeight: 900, lineHeight: 1,
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}>
        <div style={{ fontSize: 22 }}>{p.tickets}</div>
        <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{t("tickets")}</div>
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700", lineHeight: 1, letterSpacing: "-0.02em" }}>{formatPrice(p.price)}</div>
            {p.old_price > 0 && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "line-through", marginTop: 4 }}>{formatPrice(p.old_price)}</div>
            )}
          </div>
          {p.old_price > 0 && (
            <div style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 900, padding: "5px 10px", borderRadius: 8, textTransform: "uppercase" }}>
              {lang === 'AR' ? 'وفر' : 'SAVE'} {Math.round((1 - p.price / p.old_price) * 100)}%
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

import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function DreamStorePage() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { categories, draws, products } = useStore();
  const { addItem, items } = useCart();
  const { isAuthenticated, setModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState("Cash");

  const filteredProducts = products.filter(p => p.category === activeTab);
  const currentTabInfo = categories.find(c => c.key === activeTab);

  // Group by draw_name (prize in our context)
  const groups: Record<string, any[]> = {};
  filteredProducts.forEach(p => {
    const drawName = p.prize || "Official Draw";
    if (!groups[drawName]) groups[drawName] = [];
    groups[drawName].push({
      ...p,
      name: p.title,
      draw_name: p.prize,
      img_src: p.mainImage || "/images/prize_cash.png",
      // Convert string prices to numbers if needed for math
      price: parseFloat(p.price) || 0,
      old_price: parseFloat(p.originalPrice || "0") || 0,
      stock: parseInt(p.stock) || 0,
      total_stock: 25000, // Hardcoded for demo
      is_hot: p.isHot
    });
  });

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "url('/images/hero-bg.png') center/cover no-repeat fixed",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif",
      color: "#f0ece4"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.85) 50%, rgba(5,5,5,0.95) 100%)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, paddingTop: 100 }}>
        
        <style>{`
          @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
          @keyframes floatUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
          .dream-card-enter { animation: floatUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
          .dream-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
          .tab-pill:hover { transform: scale(1.05) !important; }
        `}</style>

        {/* HERO SECTION */}
        <section style={{ padding: "40px 24px 30px", position: "relative" }}>
          <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 480px", animation: "floatUp 0.7s ease both" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
                ✦ {t("premiumStore")} ✦
              </div>
              <h1 style={{ fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 20 }}>
                <span className="text-gold italic tracking-tighter">{t("dreamStore")}</span>
              </h1>
              <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#FFFFFF", lineHeight: 1.7, marginBottom: 40, maxWidth: 520, fontWeight: "bold" }}>
                {t("storeDesc")}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/vip" className="btn-primary" style={{ padding: "16px 36px", fontSize: 15 }}>
                  <Crown size={18} /> {t("exploreVip")}
                </Link>
              </div>
            </div>

            <div style={{
              flex: "0 1 300px", minWidth: 260,
              background: "linear-gradient(145deg, rgba(22,18,6,0.9), rgba(8,6,1,0.97))",
              border: "1px solid rgba(255,215,0,0.3)", borderRadius: 28, padding: "36px 30px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,215,0,0.1)",
              animation: "floatUp 0.9s ease both"
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>🌍 {t("globalStats")}</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 4 }}>
                <AnimatedCounter value={250000} />
              </div>
              <div style={{ fontSize: 12, color: "#FFFFFF", marginBottom: 24, fontWeight: "bold" }}>{t("totalTicketsSold")}</div>
              <div style={{ padding: "14px 16px", background: "rgba(34,197,94,0.08)", borderRadius: 14, border: "1px solid rgba(34,197,94,0.18)", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>⚡ {t("yourOdds")}</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,215,0,0.12)", paddingTop: 20 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold" }}>{t("nextDrawIn")}</div>
                <Countdown targetDate={new Date("2026-12-31T00:00:00")} />
              </div>
            </div>
          </div>
        </section>

        {/* TABS */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(4,4,4,0.9)", backdropFilter: "blur(24px)", position: "sticky", top: 72, zIndex: 90, padding: "14px 0" }}>
          <div className="container" style={{ overflowX: "auto", display: "flex", gap: 10, alignItems: "center", scrollbarWidth: "none" }}>
            {categories.map(tab => {
              const isActive = activeTab === tab.key;
              const TabIcon = CATEGORY_ICONS[tab.key] || Tag;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.key)} className="tab-pill"
                  style={{
                    color: isActive ? "#000" : "#FFFFFF",
                    background: isActive ? `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` : "rgba(255,255,255,0.03)",
                    border: isActive ? `1px solid ${tab.color}` : "1px solid rgba(255,255,255,0.07)",
                    whiteSpace: "nowrap", padding: "9px 20px", borderRadius: 100, fontSize: 13,
                    fontWeight: 700, display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                    transition: "all 0.25s ease", boxShadow: isActive ? `0 4px 20px ${tab.color}44` : "none"
                  }}>
                  <TabIcon size={15} /> {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN PRODUCTS */}
        <div className="container" style={{ padding: "40px 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 className="text-gold" style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
              {currentTabInfo?.name}
            </h2>
            <p style={{ color: "#FFFFFF", fontSize: 16, maxWidth: 480, margin: "0 auto", fontWeight: "bold", opacity: 0.8 }}>
              {t("storeFooterDesc")}
            </p>
          </div>

          {Object.keys(groups).map((drawName, idx) => {
            const products = groups[drawName];
            return (
              <div key={idx} style={{ marginBottom: 100 }}>
                <div style={{
                  position: "relative", marginBottom: 30, padding: "24px 30px",
                  background: "linear-gradient(135deg, rgba(20,16,4,0.9), rgba(10,8,2,0.95))",
                  border: "1px solid rgba(255,215,0,0.15)", borderRadius: 24, overflow: "hidden"
                }}>
                  <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>
                        ✦ {t("officialPrizeDraw")} ✦
                      </div>
                      <h3 style={{
                        fontSize: "clamp(22px, 4vw, 40px)", fontWeight: 950, textTransform: "uppercase",
                        letterSpacing: "0.04em", color: "#FFD700", lineHeight: 1.15, margin: 0,
                        textShadow: "0 0 40px rgba(255,215,0,0.25)"
                      }}>{drawName}</h3>
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 40, right: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)" }} />
                </div>

                <div className="dream-product-grid">
                  {products.map((p: any, pi: number) => (
                    <div key={p.id} className="dream-card-enter" style={{ animationDelay: `${pi * 0.08}s` }}>
                      <ProductCard 
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
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
