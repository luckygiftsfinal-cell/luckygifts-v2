import React from "react";
import { Diamond, Ticket, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

export default function HowItWorksPage() {
  const steps = [
    { 
      step: "01", 
      title: "Buy Any Product", 
      desc: "Shop from our curated collection of premium gadgets and gifts. Each product is a masterpiece delivered to your door.", 
      icon: <Diamond size={24} />,
      img: "/images/step1-gift.png",
      color: "#FFD700"
    },
    { 
      step: "02", 
      title: "Get a Chance", 
      desc: "Every purchase automatically enters you into our high-stakes draws. The more you shop, the higher your status.", 
      icon: <Ticket size={24} />,
      img: "/images/step2-ticket.png",
      color: "#FFFFFF"
    },
    { 
      step: "03", 
      title: "Win Amazing Prizes", 
      desc: "From $1,000,000 cash to luxury cars and gold bars. Join our live events to see your dreams come true.", 
      icon: <Trophy size={24} />,
      img: "/images/step3-win.png",
      color: "#FFD700"
    },
    { 
      step: "04", 
      title: "Everyone Wins", 
      desc: "Even if you don't win the grand prize, you keep your premium purchase and receive exclusive digital rewards.", 
      icon: <Sparkles size={24} />,
      img: "/images/step4-win.png",
      color: "#FFFFFF"
    },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "url('/images/hero-bg.png') center/cover no-repeat fixed",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <SEO
        title="How It Works — Buy, Enter and Win"
        description="Learn how LuckyGifts works. Buy any product, get automatic entry tickets, and win life-changing luxury prizes."
        url="/how-it-works"
        keywords="how to win prizes UAE, lucky draw explained, prize draw rules Dubai"
      />
      {/* Dark Overlay for depth and text legibility */}
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(135deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.9) 100%)", 
        zIndex: 0 
      }} />

      <div className="container-custom" style={{ position: "relative", zIndex: 1, paddingTop: 140 }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div className="tag" style={{ marginBottom: 20, color: "#FFD700", borderColor: "rgba(255,215,0,0.4)" }}>✦ THE GOLDEN PATH ✦</div>
          <h1 className="text-4xl md:text-6xl font-black text-center text-white mb-6 italic tracking-tighter" style={{ fontSize: "clamp(42px, 8vw, 72px)", marginBottom: 24 }}>How to Win</h1>
          <p style={{ color: "#FFFFFF", fontSize: 18, maxWidth: 650, margin: "0 auto", fontWeight: 400, opacity: 0.9, lineHeight: 1.8 }}>
            Experience the simplest journey from shopping to winning. Three steps are all that stand between you and your dream life.
          </p>
        </div>

        <div style={{ 
          maxWidth: 1000, 
          margin: "0 auto", 
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 80
        }}>
          {/* Vertical Connecting Line */}
          <div className="hidden md:block" style={{ position: "absolute", left: "50%", top: 40, bottom: 40, width: 2, background: "linear-gradient(to bottom, transparent, rgba(255,215,0,0.5), transparent)" }} />

          {steps.map((s, i) => (
            <div key={i} style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
              position: "relative",
              width: "100%"
            }}>
              {/* Step Circle in middle */}
              <div className="hidden md:flex" style={{ 
                position: "absolute", 
                left: "50%", 
                transform: "translateX(-50%)",
                width: 64, 
                height: 64, 
                borderRadius: "50%", 
                background: "#0a0a0a", 
                border: `2px solid ${s.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                boxShadow: `0 0 30px ${s.color}66`
              }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.step}</span>
              </div>

              <div className="card-hover glass" style={{ 
                width: "45%", 
                background: "rgba(20,20,20,0.7)", 
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,215,0,0.15)",
                borderRadius: 28,
                padding: "0",
                textAlign: i % 2 === 0 ? "right" : "left",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 30px 60px rgba(0,0,0,0.4)"
              }}>
                <div style={{ height: 280, width: "100%", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(10,10,10,0.8), transparent)` }} />
                  <img 
                    src={s.img} 
                    alt={s.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s ease" }} 
                    className="step-img"
                  />
                </div>
                <div style={{ padding: "40px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, justifyContent: i % 2 === 0 ? "flex-end" : "flex-start", color: s.color }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: "-0.01em" }}>{s.title}</h3>
                  <p style={{ color: "#FFFFFF", lineHeight: 1.8, fontSize: 17 }}>{s.desc}</p>

                  {/* Mobile Step Indicator */}
                  <div className="md:hidden" style={{ marginTop: 24, fontSize: 14, fontWeight: 900, color: s.color, letterSpacing: "0.1em" }}>
                    STEP {s.step}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SHOP NOW BUTTON - External Link */}
        <div style={{ textAlign: "center", marginTop: 120, paddingBottom: 100 }}>
          <motion.a
            href="https://storegetlucky.netlify.app/shop"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            style={{ 
              padding: "22px 70px", 
              fontSize: 22, 
              borderRadius: 100,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              boxShadow: "0 0 40px rgba(255,215,0,0.3)"
            }}
          >
            Start Your Journey Now <ArrowRight size={24} />
          </motion.a>
        </div>
      </div>
    </div>
  );
}