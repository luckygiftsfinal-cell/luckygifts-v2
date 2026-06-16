import { motion } from "framer-motion";

const SPONSORS = [
  { name: "Red Bull", logo: "/uploads/Red-Bull-Logo.jpg", invert: false },
  { name: "MasterCard", logo: "/uploads/MasterCard_Logo.png", invert: false },
  { name: "RBC", logo: "/uploads/rbc-logo.jpg", invert: false },
  { name: "Nestlé", logo: "/uploads/neslte_logo.png", invert: false },
];

export default function Sponsors() {
  return (
    <section className="bg-[#0a0a0f] py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <p style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
            ✦ OUR PARTNERS ✦
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Trusted by the World's Best Brands
          </h2>
        </div>

        {/* Logos Row */}
        <div className="overflow-hidden relative">
          {/* Fade edges */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(to right, #0a0a0f, transparent)", zIndex: 1 }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(to left, #0a0a0f, transparent)", zIndex: 1 }} />

          <div className="flex animate-ticker" style={{ gap: 64 }}>
            {[...SPONSORS, ...SPONSORS].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 32px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  height: 72,
                  minWidth: 140,
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,215,0,0.3)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  style={{ height: 36, objectFit: "contain", opacity: 0.75, transition: "opacity 0.3s" }}
                  onMouseEnter={e => ((e.target as HTMLImageElement).style.opacity = "1")}
                  onMouseLeave={e => ((e.target as HTMLImageElement).style.opacity = "0.75")}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
