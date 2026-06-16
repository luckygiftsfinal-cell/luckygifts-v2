import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export interface ProductCardProduct {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  tickets: string;
  stock: string;
  prize: string;
  mainImage?: string;
  isHot?: boolean;
  category?: string;
}

interface ProductCardProps {
  p: ProductCardProduct;
  formatPrice: (n: number) => string;
  t: (key: string) => string;
  lang: string;
  /** "popular" uses a smaller ticket badge (44px); "store" uses larger (60px). Default: "store" */
  variant?: "popular" | "store";
  isAuthenticated?: boolean;
  setModalOpen?: (open: boolean) => void;
}

export default function ProductCard({
  p,
  formatPrice,
  t,
  lang,
  variant = "store",
  isAuthenticated,
  setModalOpen,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const price    = parseFloat(p.price || "0");
  const oldPrice = parseFloat(p.originalPrice || "0");
  const stock    = parseInt(p.stock || "0");
  const soldPct  = Math.min(100, Math.max(0, ((25000 - stock) / 25000) * 100));
  const discount = oldPrice > 0 ? Math.round((1 - price / oldPrice) * 100) : 0;
  const isHot    = soldPct >= 80;
  const badgeSize = variant === "popular" ? "pc__ticket-badge--sm" : "pc__ticket-badge--lg";
  const countClass = variant === "popular" ? "pc__ticket-count-sm" : "pc__ticket-count-lg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated && setModalOpen) {
      setModalOpen(true);
      return;
    }
    addItem(p as any);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const offLabel = lang === "AR" ? "خصم" : "OFF";
  const cartLabel = lang === "AR" ? "أضف للسلة" : "Add to Cart";
  const addedLabel = lang === "AR" ? "تمت الإضافة!" : "Added!";

  return (
    <Link to={`/store/product/${p.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="pc"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Hot badge — inset-inline-start is RTL-safe */}
        {p.isHot && (
          <div className="pc__hot-badge">
            🔥 {t("hotProduct")}
          </div>
        )}

        {/* Ticket badge — inset-inline-end is RTL-safe */}
        <div className={`pc__ticket-badge ${badgeSize}`}>
          <span className={countClass}>{p.tickets}</span>
          <span className="pc__ticket-label">{t("tickets")}</span>
        </div>

        {/* Image */}
        <div className="pc__image-wrap">
          <img
            className="pc__image"
            src={p.mainImage || "/images/prize_cash.png"}
            alt={p.title}
          />
        </div>

        {/* Body */}
        <div className="pc__body">
          <h3 className="pc__title">{p.title}</h3>

          {p.prize && (
            <div className="pc__prize-label">
              <span className="pc__prize-dot" />
              {p.prize}
            </div>
          )}

          {/* Price row */}
          <div className="pc__price-row">
            <div>
              {oldPrice > 0 && (
                <div className="pc__old-price">{formatPrice(oldPrice)}</div>
              )}
              <div className="pc__price">{formatPrice(price)}</div>
            </div>
            {discount > 0 && (
              <div className="pc__discount-badge">
                -{discount}% {offLabel}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="pc__progress-wrap">
            <div className="pc__progress-header">
              <span style={{ color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                {t("dreamIndicator")}
              </span>
              <span style={{ color: isHot ? "#ef4444" : "#4ade80" }}>
                {Math.round(soldPct)}% {t("sold")}
              </span>
            </div>
            <div className="pc__progress-bar-bg">
              <div
                className={`pc__progress-bar-fill ${isHot ? "pc__progress-bar-fill--hot" : "pc__progress-bar-fill--cool"}`}
                style={{ width: `${soldPct}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <button
            className="pc__btn"
            onClick={handleAddToCart}
            style={added ? { background: "linear-gradient(135deg,#22c55e,#16a34a)", transition: "background 0.3s" } : {}}
          >
            {added
              ? <><Check size={16} /> {addedLabel}</>
              : <><ShoppingCart size={16} /> {cartLabel}</>
            }
          </button>
        </div>
      </div>
    </Link>
  );
}
