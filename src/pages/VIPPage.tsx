import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Crown, Gem, ShoppingCart } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const ICON_MAP: Record<string, any> = {
  Star,
  Crown,
  Gem
};

const VIPCard = ({ pkg }: { pkg: any }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated, setModalOpen } = useAuth();
  const { addItem, items } = useCart();
  const isAdded = items.some(item => item.id === pkg.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }
    
    if (!isAdded) {
      addItem({
        id: pkg.id,
        title: pkg.name,
        price: pkg.price.toString(),
        mainImage: "/images/prize_luxury.png", // Fallback for VIP
        tickets: pkg.entries,
        stock: "100",
        prize: pkg.eventTicketsLabel,
        isHot: pkg.popular
      });
    }
  };

  const Icon = ICON_MAP[pkg.iconName] || Star;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        borderRadius: 32,
        padding: "48px 32px",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "transparent",
        border: isHovered || pkg.popular 
          ? "2px solid #FFD700" 
          : "1px solid rgba(255,255,255,0.05)",
        transform: isHovered ? (pkg.popular ? "scale(1.08) translateY(-10px)" : "scale(1.05) translateY(-10px)") : (pkg.popular ? "scale(1.05)" : "scale(1)"),
        zIndex: isHovered ? 10 : (pkg.popular ? 2 : 1),
        display: "flex",
        flexDirection: "column",
        boxShadow: isHovered 
          ? "0 30px 60px rgba(255,215,0,0.25)" 
          : (pkg.popular ? "0 20px 50px rgba(255,215,0,0.15)" : "0 10px 30px rgba(0,0,0,0.3)"),
        height: "100%"
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: 30,
        overflow: "hidden",
        zIndex: 0,
        background: pkg.popular 
          ? "linear-gradient(145deg, rgba(255,215,0,0.15) 0%, rgba(10,10,10,0.8) 100%)" 
          : "rgba(10,10,10,0.4)",
      }}>
        {isHovered && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,215,0,0.15), transparent 40%)`,
            pointerEvents: "none",
            zIndex: 1
          }} />
        )}
      </div>

      {pkg.popular && (
        <div style={{
          position: "absolute",
          top: -16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(90deg, #FFD700, #f0d060)",
          color: "#000",
          fontSize: 12,
          fontWeight: 900,
          padding: "6px 20px",
          borderRadius: 100,
          boxShadow: "0 4px 15px rgba(255,215,0,0.4)",
          letterSpacing: "0.1em",
          zIndex: 3
        }}>
          MOST POPULAR
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          background: pkg.popular ? "#FFD700" : "rgba(255,215,0,0.1)",
          boxShadow: pkg.popular ? "0 10px 25px rgba(255,215,0,0.3)" : "none",
          transition: "transform 0.3s ease"
        }}>
          <Icon size={32} color={pkg.popular ? "#000" : "#FFD700"} />
        </div>

        <h3 style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#fff",
          marginBottom: 12,
          letterSpacing: "-0.02em"
        }}>
          {pkg.name}
        </h3>

        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: "#FFD700" }}>${pkg.price}</span>
          <span style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 600 }}>/one-time</span>
        </div>

        <div style={{
          background: "rgba(255,215,0,0.1)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{pkg.entries} TICKETS</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700" }}>+ {pkg.eventTicketsLabel}</div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1 }}>
          {pkg.features.map((feature: string, index: number) => (
            <li key={index} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 15,
              color: "#FFFFFF",
              marginBottom: 16,
              fontWeight: 500
            }}>
              <Check size={18} color="#FFD700" strokeWidth={3} />
              {feature}
            </li>
          ))}
        </ul>

        <button 
          onClick={handleSelect}
          className="btn-primary" 
          style={{ 
            width: "100%", 
            justifyContent: "center",
            background: isAdded ? "linear-gradient(135deg, #22c55e, #16a34a)" : undefined,
            color: isAdded ? "#fff" : undefined
          }}
        >
          {isAdded ? "✓ IN CART" : (
            <>
              <ShoppingCart size={20} />
              CHOOSE {pkg.name.toUpperCase()}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default function VIPPage() {
  const { vipPackages } = useStore();

  return (
    <div style={{ 
      backgroundImage: "linear-gradient(to bottom, rgba(5,5,5,0.4), rgba(5,5,5,0.8)), url('/images/hero-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh", 
      color: "#f0ece4",
      position: "relative",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <section className="relative w-full py-32 bg-transparent overflow-hidden">
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.06)_0%,transparent_50%)]" />
        </div>

        <div className="relative z-10 container">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mt-16">
            {vipPackages.map((pkg) => (
              <VIPCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20 mb-10"
          >
            <span className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-4 block">VIP MEMBER PRIVILEGE</span>
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter" style={{ marginBottom: 20 }}>
              The VIP Member Experience
            </h2>
            <p className="text-white/60 mt-4 max-w-3xl mx-auto" style={{ fontSize: 18, lineHeight: 1.6, fontWeight: "bold" }}>
              Elevate your chances and unlock access to high-stakes draws. As a VIP member, you’ll enjoy exclusive luxury experiences, premium access, and VIP tickets to join us for the ultimate New Year’s Eve event in Dubai on 31.12.2026. Step into a night of elegance, celebration, and unforgettable moments.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Luxury Footer Note */}
      <div style={{ padding: "60px 24px", textAlign: "center", background: "linear-gradient(to top, rgba(255,215,0,0.05), transparent)" }}>
        <p style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
          Membership is subject to terms and conditions. VIP draws are held monthly.
        </p>
      </div>
    </div>
  );
}
