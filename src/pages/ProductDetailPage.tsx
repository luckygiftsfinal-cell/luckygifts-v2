import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Crown, Gem, DollarSign, Tag, ChevronLeft, ChevronRight, Star, Shield, Truck, Trophy, Ticket, ArrowLeft } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";
import SEO from "../components/SEO";

const CATEGORY_ICONS: any = {
  Cash: DollarSign,
  Luxury: Gem,
  Tech: ShoppingCart,
  VIP: Crown,
  Prestige: Trophy,
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useStore();
  const { addItem, items, setIsCartOpen } = useCart();
  const { isAuthenticated, setModalOpen } = useAuth();
  const { formatPrice } = useCurrency();
  const { t, lang } = useLanguage();

  const raw = products.find((p) => p.id === id);

  const product = raw
    ? {
        ...raw,
        name: raw.title,
        draw_name: raw.prize,
        img_src: raw.mainImage || "/images/prize_cash.png",
        price: parseFloat(raw.price) || 0,
        old_price: parseFloat(raw.originalPrice || "0") || 0,
        stock: parseInt(raw.stock) || 0,
        total_stock: 25000,
        is_hot: raw.isHot,
        subImages: raw.subImages || [],
      }
    : null;

  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const allImages = product
    ? [product.img_src, ...(product.subImages || [])].filter(Boolean)
    : [];

  const soldPct = product
    ? Math.min(100, Math.max(0, ((product.total_stock - product.stock) / product.total_stock) * 100))
    : 0;
  const savePct =
    product && product.old_price > 0
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;

  const CategoryIcon = product ? CATEGORY_ICONS[product.draw_name || ""] || Tag : Tag;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { setModalOpen(true); return; }
    if (!product) return;
    addItem({
      id: product.id,
      title: product.name,
      price: String(product.price),
      tickets: String(product.tickets),
      mainImage: product.img_src,
      prize: product.draw_name,
      stock: String(product.stock),
      originalPrice: String(product.old_price),
    } as any);
    setIsCartOpen(true);
    toast.success(lang === "AR" ? "تمت الإضافة إلى السلة" : "Added to cart!");
  };

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ fontSize: 64 }}>🔍</div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: 700 }}>Product not found</p>
        <Link to="/store" style={{ color: "#FFD700", fontWeight: 800, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ← Back to Store
        </Link>
      </div>
    );
  }

  const productUrl = `/store/${product.id}`;
  const productImage = product.mainImage || product.images?.[0] || "";

  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "'Outfit', sans-serif", color: "#f0ece4" }}>
      <SEO
        title={product.name || product.title}
        description={`${product.name || product.title} — Buy now for $${product.price} and automatically enter our luxury prize draw. ${product.tickets} tickets included.`}
        url={productUrl}
        image={productImage}
        type="product"
        price={product.price?.toString()}
        currency="USD"
        keywords={`${product.name || product.title}, buy prizes UAE, luxury prize draw, ${product.category} prizes`}
      />
      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name || product.title,
            "image": productImage,
            "description": `Buy ${product.name || product.title} and enter our exclusive luxury prize draw. ${product.tickets} tickets included.`,
            "sku": product.id,
            "brand": { "@type": "Brand", "name": "LuckyGifts" },
            "offers": {
              "@type": "Offer",
              "url": `https://getluckygifts.shop${productUrl}`,
              "priceCurrency": "USD",
              "price": product.price,
              "availability": "https://schema.org/InStock",
              "seller": { "@type": "Organization", "name": "LuckyGifts" }
            }
          })
        }}
      />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .pd-fadein { animation: fadeUp 0.5s ease both; }
        .pd-img-thumb { transition: all 0.2s ease; cursor: pointer; }
        .pd-img-thumb:hover { border-color: rgba(255,215,0,0.8) !important; transform: scale(1.04); }
        .pd-btn-buy:hover { background: linear-gradient(135deg, #ffe040, #c9a000) !important; transform: translateY(-2px); box-shadow: 0 20px 50px rgba(255,215,0,0.4) !important; }
      `}</style>

      {/* Back bar */}
      <div style={{ position: "sticky", top: 72, zIndex: 80, background: "rgba(5,5,5,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
        <div className="container-custom" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, color: "#FFD700", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>
            <ArrowLeft size={16} /> {lang === "AR" ? "رجوع" : "Back"}
          </button>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <Link to="/store" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            {lang === "AR" ? "المتجر" : "Store"}
          </Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{product.name}</span>
        </div>
      </div>

      <div className="container pd-fadein" style={{ padding: "48px 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 60, alignItems: "start" }}>

          {/* ── LEFT: Image Gallery ── */}
          <div style={{ animationDelay: "0.05s" }} className="pd-fadein">

            {/* Main image */}
            <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", background: "linear-gradient(160deg, rgba(22,18,8,0.95), rgba(10,8,2,0.98))", border: "1px solid rgba(255,215,0,0.15)", marginBottom: 14, aspectRatio: "4/3" }}>
              {product.is_hot && (
                <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, background: "linear-gradient(135deg, #ff4500, #ff6a00)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "5px 12px", borderRadius: 20, letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: "0 4px 15px rgba(255,80,0,0.4)" }}>
                  🏆 {t("topSell")}
                </div>
              )}
              <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10, background: "#FFD700", color: "#000", width: 64, height: 64, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(255,215,0,0.5)", border: "2.5px solid #fff", fontWeight: 900, lineHeight: 1 }}>
                <span style={{ fontSize: 24 }}>{product.tickets}</span>
                <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{t("tickets")}</span>
              </div>

              <img
                key={allImages[activeImg]}
                src={allImages[activeImg] || "/images/prize_cash.png"}
                alt={product.name}
                onLoad={() => setImgLoaded(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s ease" }}
              />

              {/* Arrow navigation */}
              {allImages.length > 1 && (
                <>
                  <button onClick={() => { setImgLoaded(false); setActiveImg((activeImg - 1 + allImages.length) % allImages.length); }} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => { setImgLoaded(false); setActiveImg((activeImg + 1) % allImages.length); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="pd-img-thumb"
                    onClick={() => { setImgLoaded(false); setActiveImg(idx); }}
                    style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", border: `2px solid ${activeImg === idx ? "#FFD700" : "rgba(255,255,255,0.1)"}`, flexShrink: 0 }}
                  >
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
              {[
                { icon: Shield, label: lang === "AR" ? "دفع آمن 100%" : "100% Secure Payment" },
                { icon: Ticket, label: lang === "AR" ? "تذاكر فورية" : "Instant Tickets" },
                { icon: Trophy, label: lang === "AR" ? "سحوبات موثقة" : "Verified Draws" },
                { icon: Star, label: lang === "AR" ? "ضمان الجودة" : "Quality Guaranteed" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 14px" }}>
                  <Icon size={14} style={{ color: "#FFD700", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div style={{ animationDelay: "0.12s" }} className="pd-fadein">

            {/* Category badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 10, fontWeight: 900, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: 6 }}>
                <CategoryIcon size={11} /> {product.draw_name}
              </span>
              {savePct > 0 && (
                <span style={{ background: "rgba(0,200,83,0.12)", border: "1px solid rgba(0,200,83,0.3)", color: "#00C853", fontSize: 10, fontWeight: 900, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {lang === "AR" ? "وفر" : "SAVE"} {savePct}%
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
              {product.name}
            </h1>

            {/* Prize draw */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "14px 18px", background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,215,0,0.02))", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16 }}>
              <Trophy size={16} style={{ color: "#FFD700", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,215,0,0.6)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>{lang === "AR" ? "جائزة السحب" : "Prize Draw"}</div>
                <div style={{ fontSize: 16, color: "#FFD700", fontWeight: 800 }}>{product.draw_name}</div>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 32 }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: "#FFD700", lineHeight: 1, letterSpacing: "-0.02em" }}>{formatPrice(product.price)}</span>
              {product.old_price > 0 && (
                <span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)", textDecoration: "line-through", fontWeight: 600 }}>{formatPrice(product.old_price)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 32, fontWeight: 400 }}>
                {product.description}
              </p>
            )}

            {/* Stock bar */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 700 }}>
                <span style={{ color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                  🔥 {t("dreamIndicator")}
                </span>
                <span style={{ color: soldPct >= 80 ? "#ef4444" : "#4ade80" }}>
                  {Math.round(soldPct)}% {t("sold")}
                </span>
              </div>
              <div style={{ width: "100%", height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ width: `${soldPct}%`, height: "100%", background: soldPct >= 80 ? "linear-gradient(90deg, #ef4444, #dc2626)" : "linear-gradient(90deg, #4ade80, #16a34a)", boxShadow: `0 0 15px ${soldPct >= 80 ? "rgba(239,68,68,0.5)" : "rgba(74,222,128,0.5)"}`, transition: "width 1.5s ease", borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, fontWeight: 600 }}>
                {product.stock.toLocaleString()} {lang === "AR" ? "متبقي" : "remaining"}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              <button
                className="pd-btn-buy"
                onClick={handleAddToCart}
                style={{ width: "100%", padding: "18px 0", borderRadius: 18, background: "linear-gradient(135deg, #FFD700, #B8960C)", border: "none", color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 15px 40px rgba(255,215,0,0.3)", transition: "all 0.3s ease" }}
              >
                <ShoppingCart size={18} /> {lang === "AR" ? "أضف إلى السلة" : "Add to Cart"}
              </button>
            </div>

            {/* Tickets info box */}
            <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,215,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ticket size={20} style={{ color: "#FFD700" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
                  {product.tickets} {lang === "AR" ? "تذكرة لكل وحدة" : "ticket(s) per unit"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  {lang === "AR" ? "كل تذكرة تدخلك في سحب الجائزة الكبرى" : "Each ticket enters you into the prize draw"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
