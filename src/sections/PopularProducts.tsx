import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

export default function PopularProducts() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isAuthenticated, setModalOpen } = useAuth();
  const { products } = useStore();

  const hotProducts = products.filter(p => p.isHot).slice(0, 3);
  const popularProducts =
    hotProducts.length >= 3
      ? hotProducts
      : [...hotProducts, ...products.filter(p => !p.isHot).slice(0, 3 - hotProducts.length)];

  return (
    <section className="py-24 relative bg-[#050505]">
      <style>{`
        @keyframes floatUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
        .animate-floatUp { animation: floatUp 0.6s cubic-bezier(0.34,1.56,0.64,1) }
      `}</style>

      <div className="container relative z-10 px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            {/* Use --text-xs via inline var for the eyebrow label */}
            <span style={{ fontSize: "var(--text-xs)" }} className="font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">
              {t("trendingNow")}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white">{t("popularProducts")}</h2>
          </div>
          <Link
            to="/store"
            className="hidden md:flex items-center gap-2 text-[#FFD700] font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm"
          >
            {t("viewAll")} <ArrowRight size={18} />
          </Link>
        </div>

        {/* SMALLER CARDS: max-w on container + smaller gap */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularProducts.map((p, i) => (
              <div
                key={p.id}
                className="animate-floatUp"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
              >
                <ProductCard
                  p={p}
                  formatPrice={formatPrice}
                  t={t}
                  lang={lang}
                  variant="popular"
                  isAuthenticated={isAuthenticated}
                  setModalOpen={setModalOpen}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-[#FFD700] font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm"
          >
            {t("viewAll")} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}