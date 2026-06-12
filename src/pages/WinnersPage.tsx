import React, { useState, useEffect } from "react";
import { Trophy, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";

interface Winner {
  id: string;
  name: string;
  prize: string;
  draw_name: string;
  img_url: string;
  featured: boolean;
  created_at: string;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('winners').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setWinners(data || []);
        setLoading(false);
      });
  }, []);

  const featured = winners.filter(w => w.featured);
  const rest = winners.filter(w => !w.featured);

  return (
    <div style={{ minHeight: "100vh", background: "url('/images/hero-bg.png') center/cover no-repeat fixed", position: "relative", fontFamily: "'Outfit', sans-serif" }}>
      <SEO
        title="Our Winners — Real People, Real Prizes"
        description="Meet our verified winners. Real people winning Rolex watches, Range Rovers, cash prizes and luxury gifts. Could you be next?"
        url="/winners"
        keywords="lucky draw winners UAE, prize winners Dubai, LuckyGifts winners"
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(5,5,5,.95) 0%,rgba(5,5,5,.85) 50%,rgba(5,5,5,.95) 100%)", zIndex: 0 }} />

      <div className="container-custom" style={{ position: "relative", zIndex: 1, paddingTop: 120, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16, opacity: 0.8 }}>✦ HALL OF FAME ✦</div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4">Lucky Winners</h1>
          <p style={{ color: "#fff", maxWidth: 560, margin: "0 auto", lineHeight: 1.7, fontWeight: "bold", fontSize: 18 }}>
            Celebrate our latest champions. Every ticket is a story — yours could be next.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
            <p>Loading winners...</p>
          </div>
        )}

        {!loading && winners.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.3)", border: "1px dashed rgba(255,255,255,.08)", borderRadius: 24 }}>
            <Trophy size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontSize: 18, fontWeight: 700 }}>No winners announced yet</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Check back soon!</p>
          </div>
        )}

        {/* Featured Winners */}
        {featured.length > 0 && (
          <div style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <Star size={16} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.25em", textTransform: "uppercase" }}>Featured Winners</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
              {featured.map((w, i) => (
                <WinnerCard key={w.id} winner={w} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Winners */}
        {rest.length > 0 && (
          <div>
            {featured.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <Trophy size={16} color="rgba(255,255,255,.4)" />
                <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.4)", letterSpacing: "0.25em", textTransform: "uppercase" }}>All Winners</span>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {rest.map(w => <WinnerCard key={w.id} winner={w} />)}
            </div>
          </div>
        )}

        {/* CTA - External Link */}
        <div style={{ marginTop: 80, textAlign: "center", backgroundImage: "linear-gradient(rgba(10,10,10,.85),rgba(10,10,10,.85)),url('/images/hero-bg.png')", backgroundSize: "cover", padding: "80px 24px", borderRadius: 40, border: "1px solid rgba(255,215,0,.3)", position: "relative", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#FFD700,transparent)" }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: "white" }}>Will you be the next winner?</h2>
          <p style={{ color: "#fff", marginBottom: 32, fontWeight: "bold" }}>Your dream is just one ticket away. Join the next draw now.</p>
          <motion.a
            href="https://storegetlucky.netlify.app/shop"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            style={{ 
              padding: "16px 48px", 
              fontSize: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(255,215,0,0.3)"
            }}
          >
            Get Your Tickets <ArrowRight size={20} />
          </motion.a>
        </div>
      </div>
    </div>
  );
}

function WinnerCard({ winner, featured = false }: { winner: Winner; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: featured
          ? hovered ? "linear-gradient(135deg,rgba(40,32,8,.98),rgba(20,16,4,.98))" : "linear-gradient(135deg,rgba(30,24,6,.95),rgba(15,12,3,.95))"
          : hovered ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.03)",
        border: featured ? `1px solid ${hovered ? "rgba(255,215,0,.6)" : "rgba(255,215,0,.25)"}` : `1px solid rgba(255,255,255,${hovered ? ".1" : ".05"})`,
        borderRadius: 20, padding: featured ? "28px 24px" : "20px 20px",
        display: "flex", alignItems: "center", gap: 20,
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.3s ease",
        boxShadow: featured && hovered ? "0 20px 60px rgba(255,215,0,.1)" : "none",
        cursor: "default",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: featured ? 80 : 64, height: featured ? 80 : 64, borderRadius: "50%", overflow: "hidden", border: `2px solid ${featured ? "#FFD700" : "rgba(255,215,0,.3)"}`, background: "rgba(255,255,255,.05)", flexShrink: 0 }}>
          {winner.img_url
            ? <img src={winner.img_url} alt={winner.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: featured ? 28 : 22, fontWeight: 900, color: "#FFD700" }}>{winner.name.charAt(0)}</div>}
        </div>
        <div style={{ position: "absolute", bottom: 0, right: 0, background: "#FFD700", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #050505" }}>🏆</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: featured ? 20 : 17, fontWeight: 800, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {winner.name}
          {featured && <Star size={12} fill="#FFD700" color="#FFD700" />}
        </div>
        <div style={{ background: "linear-gradient(135deg,#FFD700,#fff8e7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: featured ? 16 : 14 }}>
          Won: {winner.prize}
        </div>
        {winner.draw_name && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4, fontWeight: 600 }}>{winner.draw_name}</div>
        )}
      </div>
    </div>
  );
}