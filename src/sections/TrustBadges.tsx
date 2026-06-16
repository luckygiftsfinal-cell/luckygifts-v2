import { Shield, Lock, Award, CheckCircle, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

const BADGES = [
  {
    icon: <Shield size={28} className="text-[#FFD700]" />,
    title: "CANADA Licensed",
    desc: "Fully licensed and regulated under ONTARIO commercial law",
    tag: "CPO Registered",
  },
  {
    icon: <Lock size={28} className="text-[#FFD700]" />,
    title: "SSL Secured",
    desc: "256-bit encryption protecting every transaction you make",
    tag: "256-bit SSL",
  },
  {
    icon: <CheckCircle size={28} className="text-[#FFD700]" />,
    title: "Verified Winners",
    desc: "All prize draws are independently audited and verified",
    tag: "Third-Party Audited",
  },
  {
    icon: <Globe size={28} className="text-[#FFD700]" />,
    title: "Worldwide Shipping",
    desc: "We can reach you anywhere",
    tag: "50+ Countries",
  },
  {
    icon: <Award size={28} className="text-[#FFD700]" />,
    title: "Fair Draw Guarantee",
    desc: "Random number generation certified by independent bodies",
    tag: "RNG Certified",
  },
  {
    icon: <Star size={28} className="text-[#FFD700]" fill="#FFD700" />,
    title: "4.9★ Rated",
    desc: "Trusted by over 5M happy customers across the world",
    tag: "200,000+ Customers",
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-[#0a0a0f] py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14">
          <p style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
            ✦ TRUST & COMPLIANCE ✦
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
            Your Safety is Our Priority
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
            Every aspect of LuckyGifts is built on transparency, security, and fairness.
          </p>
        </div>

        {/* Badges Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
          {BADGES.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "24px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,215,0,0.12)",
                borderRadius: 20,
                transition: "border-color 0.3s, box-shadow 0.3s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,215,0,0.35)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(255,215,0,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,215,0,0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 14, background: "rgba(255,215,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {badge.icon}
              </div>

              {/* Text */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{badge.title}</h3>
                  <span style={{ fontSize: 9, fontWeight: 900, color: "#000", background: "#FFD700", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {badge.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom License Bar */}
        <div style={{ marginTop: 48, padding: "20px 32px", background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16, textAlign: "center", maxWidth: 700, margin: "48px auto 0" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>LuckyGifts LLC</span> is a registered company in Canada (License No. 002260253). All prize draws comply with the Alcohol and Gaming Commission of Ontario. Prize draws are conducted transparently with independent oversight.
          </p>
        </div>
      </div>
    </section>
  );
}
