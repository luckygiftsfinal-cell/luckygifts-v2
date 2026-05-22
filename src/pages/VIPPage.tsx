import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star, Crown, Gem, Zap } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SEO from "../components/SEO";

const ICON_MAP: Record<string, any> = {
  Star,
  Crown,
  Gem
};

const VIPCard = ({ pkg }: { pkg: any }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setModalOpen } = useAuth();
  const { addItem, items } = useCart();
  const isAdded = items.some(item => item.id === pkg.id);

  const entriesCount = pkg.features?.find((f: string) => f.includes('entries'))?.match(/\d+/)?.[0] || '0';
  const eventTicketsLabel = pkg.features?.find((f: string) => 
    f.toLowerCase().includes('event') || f.toLowerCase().includes('dubai')
  ) || 'VIP Event Access';

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
        mainImage: "/images/prize_luxury.png",
        tickets: entriesCount,
        stock: "100",
        prize: eventTicketsLabel,
        isHot: pkg.popular
      });
    }
    setTimeout(() => navigate("/checkout"), 300);
  };

  const Icon = ICON_MAP[pkg.icon] || Star;

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
        transform: isHovered ? "translateY(-8px)" : (pkg.popular ? "translateY(-4px)" : "translateY(0)"),
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
          <span style={{ fontSize: 16, color: "#FFFFFF", fontWeight: 600 }}>/{pkg.period || 'one-time'}</span>
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
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{entriesCount} TICKETS</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700" }}>+ {eventTicketsLabel}</div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", flex: 1 }}>
          {(pkg.features || []).map((feature: string, index: number) => (
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
          }}
        >
          <Zap size={20} />
          BUY NOW
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
      <SEO
        title="VIP Membership — Exclusive Benefits & More Tickets"
        description="Join LuckyGifts VIP and unlock exclusive benefits: bonus tickets, priority draws, special discounts and more."
        url="/vip"
        keywords="VIP membership UAE, luxury club Dubai, win more prizes, VIP draw"
      />
      <section className="relative w-full py-32 bg-transparent overflow-hidden">
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.06)_0%,transparent_50%)]" />
        </div>

        {/* CENTERED CONTENT */}
        <div className="relative z-10 container flex flex-col items-center">

          {/* VIP Cards — CENTERED */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 lg:gap-8 max-w-5xl mt-16 w-full px-4">
            {vipPackages.map((pkg) => (
              <div key={pkg.id} className="flex-1 min-w-0 md:max-w-sm">
                <VIPCard pkg={pkg} />
              </div>
            ))}
          </div>

          {/* VIP Description — CENTERED */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20 mb-10 flex flex-col items-center"
          >
            <span className="text-[#FFD700] font-black text-xs uppercase tracking-widest mb-4 block">VIP MEMBER PRIVILEGE</span>
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-5">
              The VIP Member Experience
            </h2>
            <p className="text-white/60 max-w-3xl text-center" style={{ fontSize: 18, lineHeight: 1.6, fontWeight: "bold" }}>
              Elevate your chances and unlock access to high-stakes draws. As a VIP member, you'll enjoy exclusive luxury experiences, premium access, and VIP tickets to join us for the ultimate New Year's Eve event in Dubai on 31.12.2026. Step into a night of elegance, celebration, and unforgettable moments.
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