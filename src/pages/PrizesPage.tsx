import React, { useEffect, useState } from "react";
import SEO from "../components/SEO";

const DEFAULT_PRIZES = [
  { 
    id: '1',
    title: "Cash Prizes", 
    img: "/images/prize_cash.png", 
    items: ["$1,000,000 Grand Prize", "$100,000 Second Prize"],
    color: "#22c55e",
    tag: "CASH"
  },
  { 
    id: '2',
    title: "Luxury Prizes", 
    img: "/images/prize_luxury.png", 
    items: ["Range Rover Defender", "Rolex Datejust 41"],
    color: "#FFD700",
    tag: "LUXURY"
  },
  { 
    id: '3',
    title: "Tech Dream", 
    img: "/images/prize_tech.png", 
    items: ["Tech Pack (MacBook + iPhone + PS5)"],
    color: "#38bdf8",
    tag: "ELECTRONICS"
  },
  { 
    id: '4',
    title: "Prestige Prizes", 
    img: "/images/prize_prestige.png", 
    items: ["$500 Reward Coupon", "6 Months Red Bull Subscription", "Free Tickets for Next Draw"],
    color: "#ef4444",
    tag: "PRESTIGE",
    sponsor: "REDBULL"
  }
];

export default function PrizesPage() {
  const [prizeCards] = useState<any[]>(DEFAULT_PRIZES);

  // Countdown Logic
  const targetDate = new Date("2026-12-31T00:00:00").getTime();
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "url('/images/hero-bg.png') center/cover no-repeat fixed",
      position: "relative"
    }}>
      <SEO
        title="Current Prizes — Win Rolex, Cars, Cash and More"
        description="View all current prizes at LuckyGifts. From $1M cash to luxury watches, cars, and tech gadgets. Enter now."
        url="/prizes"
        keywords="win Rolex UAE, win Range Rover Dubai, cash prizes online, luxury prize draw"
      />
      {/* Dark overlay for contrast */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,5,0.85)", zIndex: 0 }} />

      <div className="container-custom" style={{ position: "relative", zIndex: 1, paddingTop: 140, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="tag" style={{ marginBottom: 16 }}>Unlimited Dreams</div>
          <h1 className="text-4xl md:text-6xl font-black text-center text-white mb-6 italic tracking-tighter" style={{ fontSize: "clamp(42px, 7vw, 64px)", marginBottom: 20 }}>World-Class Prizes</h1>
          <p style={{ color: "#FFFFFF", fontSize: 17, maxWidth: 700, margin: "0 auto" }}>
            Explore our curated selection of ultra-luxury rewards. From life-changing cash to the finest engineering, every prize is a masterpiece.
          </p>
        </div>

        {/* Featured Grand Prize */}
        <div className="glass card-hover" style={{ 
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(255,215,0,0.4)",
          borderRadius: 32,
          padding: "80px 40px",
          textAlign: "center",
          marginBottom: 60,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)"
        }}>
          {/* Immersive Overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.9) 100%)", zIndex: 0 }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ position: "absolute", top: -80, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />
          <span style={{ color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", fontSize: 13, textTransform: "uppercase", marginBottom: 16, display: "block" }}>GRAND PRIZE</span>
          <h2 style={{ fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 950, background: "linear-gradient(135deg, #fff 0%, #FFD700 50%, #8B6914 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 16px 0" }}>$1,000,000</h2>
          <p style={{ fontSize: 20, color: "#f0ece4", fontWeight: 600, marginBottom: 40 }}>Win life-changing cash instantly.</p>
          
          {/* Promotional Stats Bar */}
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 48, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>250,000</div>
              <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em", marginTop: 8 }}>TOTAL TICKETS</div>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,215,0,0.3)", display: "block" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>50,000</div>
              <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em", marginTop: 8 }}>TOTAL WINNERS</div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ v: countdown.days, l: "DAYS" }, { v: countdown.hours, l: "HOURS" }, { v: countdown.minutes, l: "MINS" }, { v: countdown.seconds, l: "SECS" }].map(({ v, l }, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 16, padding: "16px 20px", minWidth: 90 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700" }}>{String(v).padStart(2, "0")}</div>
                <div style={{ fontSize: 10, color: "#FFFFFF", fontWeight: 800, letterSpacing: "0.1em" }}>{l}</div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* Detailed Categories Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, paddingBottom: 100 }}>
          {prizeCards.map((card, i) => (
            <div key={i} className="glass card-hover" style={{ borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ height: 240, position: "relative", overflow: "hidden" }}>
                <img src={card.img} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #050505 0%, transparent 60%)" }} />
                
                {card.sponsor && (
                  <div style={{ 
                    position: "absolute", 
                    top: 16, 
                    right: 16, 
                    background: "rgba(255,255,255,0.9)", 
                    color: "#000", 
                    fontSize: 9, 
                    fontWeight: 900, 
                    padding: "4px 8px", 
                    borderRadius: 4,
                    letterSpacing: "0.05em"
                  }}>
                    Sponsored By {card.sponsor}
                  </div>
                )}

                <div style={{ position: "absolute", bottom: 20, left: 24 }}>
                  <span style={{ background: card.color, color: "#000", fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 4, letterSpacing: "0.05em", marginRight: 10 }}>{card.tag}</span>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginTop: 8 }}>{card.title}</h3>
                </div>
              </div>
              <div style={{ padding: "28px 24px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {card.items.map((item: string, j: number) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#FFFFFF", fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: card.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
