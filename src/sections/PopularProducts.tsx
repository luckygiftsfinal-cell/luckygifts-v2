import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function PopularProducts() {
  const { t } = useLanguage();

  const targetDate = new Date("2026-12-31T00:00:00").getTime();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) { clearInterval(timer); return; }
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
    <section className="py-24 relative bg-[#050505]">
      <div className="container relative z-10 px-4">

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block text-xs">
            Grand Prize
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white">Win $1,000,000</h2>
        </div>

        {/* Featured Grand Prize Card */}
        <div style={{
          backgroundImage: "url('/images/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(255,215,0,0.4)",
          borderRadius: 32,
          padding: "80px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
          maxWidth: 900,
          margin: "0 auto"
        }}>
          {/* Overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.9) 100%)", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ position: "absolute", top: -80, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />

            <span style={{ color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", fontSize: 13, textTransform: "uppercase", marginBottom: 16, display: "block" }}>
              GRAND PRIZE
            </span>

            <h2 style={{ fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 950, background: "linear-gradient(135deg, #fff 0%, #FFD700 50%, #8B6914 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 16px 0" }}>
              $1,000,000
            </h2>

            <p style={{ fontSize: 20, color: "#f0ece4", fontWeight: 600, marginBottom: 40 }}>
              Win life-changing cash instantly.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 48, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>250,000</div>
                <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em", marginTop: 8 }}>TOTAL TICKETS</div>
              </div>
              <div style={{ width: 1, height: 40, background: "rgba(255,215,0,0.3)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>50,000</div>
                <div style={{ fontSize: 12, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em", marginTop: 8 }}>TOTAL WINNERS</div>
              </div>
            </div>

            {/* Countdown */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { v: countdown.days, l: "DAYS" },
                { v: countdown.hours, l: "HOURS" },
                { v: countdown.minutes, l: "MINS" },
                { v: countdown.seconds, l: "SECS" }
              ].map(({ v, l }, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 16, padding: "16px 20px", minWidth: 90 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700" }}>{String(v).padStart(2, "0")}</div>
                  <div style={{ fontSize: 10, color: "#FFFFFF", fontWeight: 800, letterSpacing: "0.1em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
