import React from "react";
import { Link } from "react-router-dom";

const LAST_DRAW_WINNERS = [
  { img: "/images/winner1.png", name: "James Anderson", prize: "$1,000,000" },
  { img: "/images/winner2.png", name: "Luke Mars", prize: "Rolex Watch" },
  { img: "/images/winner-ps5.png", name: "Ahmad Marian", prize: "PS5 Winner" },
  { img: "/images/winner-ava.png", name: "Ava M", prize: "$25,000" },
  { img: "/images/winner-matthieu.png", name: "Mathieu", prize: "Luxury Watch" },
  { img: "/images/winner-fatima.png", name: "Fatima", prize: "iPhone 15" },
];

export default function WinnersPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "url('/images/hero-bg.png') center/cover no-repeat fixed",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(135deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.9) 100%)", 
        zIndex: 0 
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: 120, paddingBottom: 60 }}>
        <h1 className="text-4xl md:text-5xl font-black text-center text-white mb-4 italic tracking-tighter">Lucky Winners</h1>
        <p style={{ textAlign: "center", color: "#FFFFFF", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }} className="font-bold">
          Celebrate our latest champions. Every ticket is a story, and yours could be next.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {LAST_DRAW_WINNERS.map((winner, i) => (
            <div key={i} style={{ 
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,215,0,0.15)", 
              borderRadius: 20, 
              padding: 24,
              display: "flex",
              alignItems: "center",
              gap: 20,
              transition: "all 0.3s ease",
              cursor: "default"
            }} className="hover:scale-105 hover:bg-white/5 transition-all">
              <div style={{ position: "relative" }}>
                <img src={winner.img} alt={winner.name} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #FFD700" }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, background: "#FFD700", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🏆</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{winner.name}</div>
                <div style={{ 
                  background: "linear-gradient(135deg, #FFD700, #fff8e7)", 
                  WebkitBackgroundClip: "text", 
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                  fontSize: 16,
                  marginTop: 4
                }}>
                  Won: {winner.prize}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: 64, 
          textAlign: "center", 
          backgroundImage: "linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/images/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "80px 24px", 
          borderRadius: 40, 
          border: "1px solid rgba(255,215,0,0.3)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: "white" }}>Will you be the next millionaire?</h2>
          <p style={{ color: "#FFFFFF", marginBottom: 32 }}>Your dream is just one ticket away. Join the next draw now.</p>
          <Link to="/store" className="btn-primary" style={{ padding: "16px 48px", fontSize: 16 }}>
            Get Your Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
