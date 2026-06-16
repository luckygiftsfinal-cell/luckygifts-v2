import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

type Tab = "hot" | "popular";

export default function PopularProducts() {
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();
  const { products, loading } = useStore();
  const { isAuthenticated, setModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("hot");

  const hotProducts     = products.filter(p => p.isHot);
  const popularProducts = products.filter(p => p.isPopular);

  const displayed = activeTab === "hot" ? hotProducts : popularProducts;

  // لا نعرض القسم إذا ما في منتجات في كلا القائمتين
  if (!loading && hotProducts.length === 0 && popularProducts.length === 0) return null;

  return (
    <section className="py-20 bg-[#050505] relative overflow-hidden">
      {/* خلفية ديكورية */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFD700]/5 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="text-[#FFD700] font-black uppercase tracking-[0.4em] text-xs block mb-3">
              ✦ {isRTL ? "منتجات مختارة" : "Curated Products"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {isRTL ? "الأكثر طلباً" : "Top Picks"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
            <button
              onClick={() => setActiveTab("hot")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === "hot"
                  ? "bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/30"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Flame size={15} />
              {isRTL ? "الأكثر مبيعاً" : "Hot"}
              {hotProducts.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === "hot" ? "bg-white/20" : "bg-white/10"}`}>
                  {hotProducts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === "popular"
                  ? "bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Star size={15} />
              {isRTL ? "الأكثر شعبية" : "Popular"}
              {popularProducts.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === "popular" ? "bg-black/20" : "bg-white/10"}`}>
                  {popularProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/5 h-80 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-white/20">
            <div className="text-5xl mb-4">{activeTab === "hot" ? "🔥" : "⭐"}</div>
            <p className="font-bold uppercase tracking-widest text-sm">
              {isRTL ? "لا توجد منتجات في هذه الفئة" : "No products in this category yet"}
            </p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayed.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <ProductCard
                  p={p}
                  formatPrice={formatPrice}
                  t={t}
                  lang={isRTL ? "AR" : "EN"}
                  variant="popular"
                  isAuthenticated={isAuthenticated}
                  setModalOpen={setModalOpen}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All */}
        {displayed.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/store"
              className="inline-flex items-center gap-3 border border-white/10 text-white/60 hover:text-white hover:border-white/30 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
            >
              {isRTL ? "تصفح جميع المنتجات" : "Browse All Products"}
              <ArrowRight size={16} className={isRTL ? "rotate-180" : ""} />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
