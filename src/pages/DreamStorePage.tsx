import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Gem, DollarSign, Zap, Tag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

const CATEGORY_ICONS: any = {
  Cash: DollarSign, Luxury: Gem, Tech: Zap, VIP: Crown,
};

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (1200 / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
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
    <div style={{ display: "flex", gap: 8 }}>
      <SEO
        title="Dream Store — Premium Products & Prize Draws"
        description="Browse our curated collection of premium products. Every purchase enters you into exclusive luxury prize draws. Win Rolex, Range Rover, Cash & more."
        url="/store"
        keywords="buy prizes UAE, luxury products Dubai, prize draw store, win luxury gifts"
      />
      {([["d", time.d], ["h", time.h], ["m", time.m], ["s", time.s]] as [string, number][]).map(([label, val]) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, padding: "6px 10px", fontSize: 18, fontWeight: 900, color: "#FFD700", minWidth: 40 }}>{pad(val)}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginTop: 3, letterSpacing: "0.1em" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}



export default function DreamStorePage() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { categories: dbCategories, draws, products } = useStore();
  const { isAuthenticated, setModalOpen } = useAuth();

  const DEFAULT_CATEGORIES = [
    { id: "1", name: "Cash", key: "Cash", color: "#FFD700", icon: "DollarSign", active: true, sort_order: 0 },
    { id: "2", name: "Luxury", key: "Luxury", color: "#C0A060", icon: "Gem", active: true, sort_order: 1 },
    { id: "3", name: "Tech", key: "Tech", color: "#00BFFF", icon: "Zap", active: true, sort_order: 2 },
  ];

  const categories = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;
  const [activeTab, setActiveTab] = useState(categories[0]?.key || "Cash");

  // Update activeTab when categories load
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.key === activeTab)) {
      setActiveTab(categories[0].key);
    }
  }, [categories]);

  const currentCat = categories.find(c => c.key === activeTab);

  // Prize draws for this category (already sorted by sort_order from Supabase)
  const categoryDraws = draws.filter(d => d.category_key === activeTab);

  // Products for this category sorted by price asc
  const categoryProducts = products
    .filter(p => p.category === activeTab)
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  // Group products under their prize draw (p.prize matches draw.name)
  // If no draws defined, show all products in one group
  const renderGroups = () => {
    if (categoryDraws.length === 0) {
      // No draws configured — show all products flat
      if (categoryProducts.length === 0) {
        return (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.3)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>No products yet in this category</p>
          </div>
        );
      }
      return (
        <div className="dream-product-grid">
          {categoryProducts.map((p, i) => (
            <div key={p.id} className="dream-card-enter" style={{ animationDelay: `${i * 0.08}s` }}>
              <ProductCard p={p} formatPrice={formatPrice} t={t} lang={lang} isAuthenticated={isAuthenticated} setModalOpen={setModalOpen} />
            </div>
          ))}
        </div>
      );
    }

    return categoryDraws.map((draw, idx) => {
      // Products that belong to this draw (matched by prize field)
      const drawProducts = categoryProducts.filter(p => p.prize === draw.name);

      return (
        <div key={draw.id} style={{ marginBottom: 80 }}>
          {/* Draw Header */}
          <div style={{
            position: "relative", marginBottom: 30, padding: "24px 30px",
            background: "linear-gradient(135deg,rgba(20,16,4,.9),rgba(10,8,2,.95))",
            border: `1px solid ${currentCat?.color || "#FFD700"}33`,
            borderRadius: 24, overflow: "hidden"
          }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at left, ${currentCat?.color || "#FFD700"}08 0%, transparent 70%)` }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: currentCat?.color || "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8, opacity: 0.7 }}>
                ✦ PRIZE DRAW ✦
              </div>
              <h3 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", color: currentCat?.color || "#FFD700", lineHeight: 1.15, margin: 0, textShadow: `0 0 40px ${currentCat?.color || "#FFD700"}44` }}>
                {draw.name}
              </h3>
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>
                {drawProducts.length} product{drawProducts.length !== 1 ? "s" : ""} · sorted by price
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 40, right: 40, height: 1, background: `linear-gradient(90deg,transparent,${currentCat?.color || "#FFD700"}44,transparent)` }} />
          </div>

          {drawProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.2)", border: "1px dashed rgba(255,255,255,.07)", borderRadius: 16 }}>
              <p style={{ fontSize: 14 }}>No products assigned to this draw yet</p>
            </div>
          ) : (
            <div className="dream-product-grid">
              {drawProducts.map((p, pi) => (
                <div key={p.id} className="dream-card-enter" style={{ animationDelay: `${pi * 0.08}s` }}>
                  <ProductCard p={p} formatPrice={formatPrice} t={t} lang={lang} isAuthenticated={isAuthenticated} setModalOpen={setModalOpen} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "url('/images/hero-bg.png') center/cover no-repeat fixed", position: "relative", fontFamily: "'Outfit', sans-serif", color: "#f0ece4" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(5,5,5,.95) 0%,rgba(5,5,5,.85) 50%,rgba(5,5,5,.95) 100%)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, paddingTop: 100 }}>
        <style>{`
          @keyframes floatUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
          .dream-card-enter { animation: floatUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
          .dream-product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:24px; }
          .tab-pill:hover { transform:scale(1.05) !important; }
        `}</style>

        {/* HERO */}
        <section style={{ padding: "40px 24px 30px" }}>
          <div className="container-custom" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 480px", animation: "floatUp 0.7s ease both" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>✦ {t("premiumStore")} ✦</div>
              <h1 style={{ fontSize: "clamp(44px,7vw,80px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.04em", marginBottom: 20 }}>
                <span className="text-gold italic tracking-tighter">{t("dreamStore")}</span>
              </h1>
              <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "#fff", lineHeight: 1.7, marginBottom: 40, maxWidth: 520, fontWeight: "bold" }}>{t("storeDesc")}</p>
              <Link to="/vip" className="btn-primary" style={{ padding: "16px 36px", fontSize: 15 }}>
                <Crown size={18} /> {t("exploreVip")}
              </Link>
            </div>
            <div style={{ flex: "0 1 300px", minWidth: 260, background: "linear-gradient(145deg,rgba(22,18,6,.9),rgba(8,6,1,.97))", border: "1px solid rgba(255,215,0,.3)", borderRadius: 28, padding: "36px 30px", boxShadow: "0 30px 80px rgba(0,0,0,.6)", animation: "floatUp 0.9s ease both" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>🌍 {t("globalStats")}</div>
              <div style={{ fontSize: "var(--text-4xl)", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 4 }}><AnimatedCounter value={250000} /></div>
              <div style={{ fontSize: "var(--text-sm)", color: "#fff", marginBottom: 24, fontWeight: "bold" }}>{t("totalTicketsSold")}</div>
              <div style={{ padding: "14px 16px", background: "rgba(34,197,94,.08)", borderRadius: 14, border: "1px solid rgba(34,197,94,.18)", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>⚡ {t("yourOdds")}</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,215,0,.12)", paddingTop: 20 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "bold" }}>{t("nextDrawIn")}</div>
                <Countdown targetDate={new Date("2026-12-31T00:00:00")} />
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY TABS */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,.04)", background: "rgba(4,4,4,.9)", backdropFilter: "blur(24px)", position: "sticky", top: 72, zIndex: 90, padding: "14px 0" }}>
          <div className="container-custom" style={{ overflowX: "auto", display: "flex", gap: 10, alignItems: "center", scrollbarWidth: "none" }}>
            {categories.map(tab => {
              const isActive = activeTab === tab.key;
              const TabIcon = CATEGORY_ICONS[tab.key] || Tag;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.key)} className="tab-pill"
                  style={{ color: isActive ? "#000" : "#fff", background: isActive ? `linear-gradient(135deg,${tab.color},${tab.color}cc)` : "rgba(255,255,255,.03)", border: isActive ? `1px solid ${tab.color}` : "1px solid rgba(255,255,255,.07)", whiteSpace: "nowrap", padding: "9px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", transition: "all 0.25s ease", boxShadow: isActive ? `0 4px 20px ${tab.color}44` : "none" }}>
                  <TabIcon size={15} /> {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="container-custom" style={{ padding: "40px 24px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 className="text-gold" style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
              {currentCat?.name}
            </h2>
            <p style={{ color: "#fff", fontSize: 16, maxWidth: 480, margin: "0 auto", fontWeight: "bold", opacity: 0.8 }}>
              {categoryProducts.length} products · sorted by price
            </p>
          </div>

          {renderGroups()}
        </div>
      </div>
    </div>
  );
}
