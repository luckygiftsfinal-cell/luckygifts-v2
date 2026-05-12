import React, { useState } from "react";
import { Link } from "react-router-dom";

const FAQ_ITEMS = [
  { q: "How do I enter a draw?", a: "Simply purchase any product from our Dream Store and you'll automatically receive complimentary tickets for the associated prize draw." },
  { q: "When are the winners announced?", a: "Winners are announced during our Live Draws, which are broadcasted on our social channels. The date for each draw is shown on the prize card." },
  { q: "Is the payment secure?", a: "Yes, we use bank-level 256-bit encryption and are fully PCI-DSS compliant. Your payment information is 100% secure." },
  { q: "How will I know if I won?", a: "If your ticket is drawn, we will contact you immediately via phone and email using the details provided during checkout." },
  { q: "Can I enter from outside the UAE?", a: "Yes! LuckyGifts is a global platform and we ship luxury prizes worldwide." }
];

function FAQAccordion({ items }: { items: typeof FAQ_ITEMS }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="faq-item" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "20px 0" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", background: "none", border: "none", color: "#f0ece4", textAlign: "left", padding: "0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{item.q}</span>
            <span style={{ color: "#FFD700", fontSize: 24, flexShrink: 0, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
          </button>
          {open === i && (
            <div style={{ marginTop: 16, color: "#FFFFFF", lineHeight: 1.7, fontSize: 15, animation: "fadeUp 0.25s ease" }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "url('/images/hero-bg.png') center/cover no-repeat fixed",
      position: "relative",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(135deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.85) 50%, rgba(5,5,5,0.95) 100%)", 
        zIndex: 0 
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: 140, paddingBottom: 80, maxWidth: 800 }}>
        <h1 className="text-4xl md:text-6xl font-black text-center text-white mb-6 italic tracking-tighter">FAQ</h1>
        <p style={{ color: "#FFFFFF", fontSize: 16, marginBottom: 48, textAlign: "center", opacity: 0.8 }}>
          Find answers to the most common questions about LuckyGifts.
        </p>
        
        <FAQAccordion items={FAQ_ITEMS} />
        
        <div style={{ textAlign: "center", marginTop: 64, padding: "40px", background: "rgba(255,255,255,0.03)", borderRadius: 24, border: "1px solid rgba(255,215,0,0.2)" }}>
          <p style={{ color: "#FFFFFF", marginBottom: 20, fontSize: 18, fontWeight: "bold" }}>Still have questions?</p>
          <a href="mailto:support@luckygifts.com" className="btn-primary" style={{ display: "inline-block" }}>
            Contact Support ✉️
          </a>
        </div>
      </div>
    </div>
  );
}
