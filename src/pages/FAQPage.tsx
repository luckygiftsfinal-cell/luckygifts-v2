import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Mail } from "lucide-react";
import SEO from "../components/SEO";

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
    <div className="space-y-0">
      <SEO
        title="FAQ — Frequently Asked Questions"
        description="Find answers to all your questions about LuckyGifts. Learn about draws, tickets, shipping, payments and more."
        url="/faq"
        keywords="LuckyGifts FAQ, prize draw questions, how to enter draw UAE"
      />
      {items.map((item, i) => (
        <div 
          key={i} 
          className="border-b border-white/10"
        >
          <button 
            onClick={() => setOpen(open === i ? null : i)} 
            className="w-full py-6 flex items-center justify-between gap-4 text-left group"
          >
            <span className="font-bold text-white text-xl md:text-2xl">{item.q}</span>
            <ChevronDown 
              size={20} 
              className={`text-[#FFD700] shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} 
            />
          </button>
          <motion.div
            initial={false}
            animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-white/70 text-base md:text-lg leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function GiftBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.width;
    const H = () => canvas.height;
    const fov = 500;

    // Particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * 800,
      z: Math.random() * 600 + 50,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 3 + 1,
      gold: Math.random() > 0.4,
    }));

    // Ribbons
    class Ribbon {
      pts: { x: number; y: number }[] = [];
      x = Math.random() * 1400;
      y = -50;
      z = Math.random() * 400 + 100;
      vx = (Math.random() - 0.5) * 1.5;
      vy = Math.random() * 1.5 + 0.5;
      wave = Math.random() * Math.PI * 2;
      len = 18 + Math.floor(Math.random() * 12);
      gold = Math.random() > 0.3;

      reset() {
        this.pts = [];
        this.x = Math.random() * 1400;
        this.y = -50;
        this.z = Math.random() * 400 + 100;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * 1.5 + 0.5;
        this.wave = Math.random() * Math.PI * 2;
        this.len = 18 + Math.floor(Math.random() * 12);
        this.gold = Math.random() > 0.3;
      }

      update() {
        this.wave += 0.06;
        this.x += this.vx + Math.sin(this.wave) * 1.2;
        this.y += this.vy;
        this.pts.unshift({ x: this.x, y: this.y });
        if (this.pts.length > this.len) this.pts.pop();
        if (this.y > H() + 60) this.reset();
      }

      draw() {
        if (this.pts.length < 2) return;
        const scale = fov / (fov + this.z);
        const cx = W() / 2, cy = H() / 2;
        ctx.beginPath();
        this.pts.forEach((p, i) => {
          const sx = cx + (p.x - cx) * scale;
          const sy = cy + (p.y - cy) * scale;
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        });
        const alpha = scale * 0.85 * (1 - this.pts.length / (this.len * 1.5));
        ctx.strokeStyle = this.gold
          ? `rgba(255,210,0,${alpha + 0.1})`
          : `rgba(220,220,255,${alpha * 0.7})`;
        ctx.lineWidth = scale * 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    const ribbons = Array.from({ length: 14 }, () => {
      const r = new Ribbon();
      r.y = Math.random() * H();
      return r;
    });

    // Gift boxes
    class GiftBox {
      x = (Math.random() - 0.5) * 1200;
      y = (Math.random() - 0.5) * 800;
      z = Math.random() * 500 + 80;
      vx = (Math.random() - 0.5) * 0.6;
      vy = (Math.random() - 0.5) * 0.4;
      vz = (Math.random() - 0.5) * 0.5;
      rot = Math.random() * Math.PI * 2;
      vrot = (Math.random() - 0.5) * 0.018;
      size = 28 + Math.random() * 40;
      gold = Math.random() > 0.4;

      update() {
        this.x += this.vx; this.y += this.vy; this.z += this.vz;
        this.rot += this.vrot;
        if (this.z < 50 || this.z > 700) this.vz *= -1;
        if (Math.abs(this.x) > 900) this.vx *= -1;
        if (Math.abs(this.y) > 600) this.vy *= -1;
      }

      draw() {
        const cx = W() / 2, cy = H() / 2;
        const scale = fov / (fov + this.z);
        const sx = cx + this.x * scale;
        const sy = cy + this.y * scale;
        const s = this.size * scale;
        const alpha = Math.min(1, scale * 1.2);
        if (alpha < 0.05) return;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.rot);

        if (this.gold) {
          ctx.fillStyle = `rgba(200,140,0,${alpha})`;
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.fillStyle = `rgba(255,200,50,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(-s / 2, -s / 2);
          ctx.lineTo(-s / 2 + s * 0.25, -s / 2 - s * 0.2);
          ctx.lineTo(s / 2 + s * 0.25, -s / 2 - s * 0.2);
          ctx.lineTo(s / 2, -s / 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = `rgba(160,100,0,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(s / 2, -s / 2);
          ctx.lineTo(s / 2 + s * 0.25, -s / 2 - s * 0.2);
          ctx.lineTo(s / 2 + s * 0.25, s / 2 - s * 0.2);
          ctx.lineTo(s / 2, s / 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
          ctx.fillRect(-s / 2, -s * 0.08, s, s * 0.16);
          ctx.fillRect(-s * 0.08, -s / 2, s * 0.16, s);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.beginPath(); ctx.ellipse(-s * 0.18, -s * 0.18, s * 0.15, s * 0.09, -0.7, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(s * 0.18, -s * 0.18, s * 0.15, s * 0.09, 0.7, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(0, -s * 0.08, s * 0.08, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = `rgba(220,225,240,${alpha})`;
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.fillStyle = `rgba(240,245,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(-s / 2, -s / 2);
          ctx.lineTo(-s / 2 + s * 0.25, -s / 2 - s * 0.2);
          ctx.lineTo(s / 2 + s * 0.25, -s / 2 - s * 0.2);
          ctx.lineTo(s / 2, -s / 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = `rgba(180,185,205,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(s / 2, -s / 2);
          ctx.lineTo(s / 2 + s * 0.25, -s / 2 - s * 0.2);
          ctx.lineTo(s / 2 + s * 0.25, s / 2 - s * 0.2);
          ctx.lineTo(s / 2, s / 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = `rgba(220,170,0,${alpha * 0.9})`;
          ctx.fillRect(-s / 2, -s * 0.08, s, s * 0.16);
          ctx.fillRect(-s * 0.08, -s / 2, s * 0.16, s);
          ctx.fillStyle = `rgba(220,170,0,${alpha})`;
          ctx.beginPath(); ctx.ellipse(-s * 0.18, -s * 0.18, s * 0.15, s * 0.09, -0.7, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(s * 0.18, -s * 0.18, s * 0.15, s * 0.09, 0.7, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(0, -s * 0.08, s * 0.08, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    }

    const boxes = Array.from({ length: 12 }, () => new GiftBox());

    const frame = () => {
      const w = W(), h = H(), cx = w / 2, cy = h / 2;

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.8);
      bg.addColorStop(0, "#0d1530");
      bg.addColorStop(0.5, "#08102a");
      bg.addColorStop(1, "#040810");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      boxes.sort((a, b) => b.z - a.z);
      boxes.forEach(b => { b.update(); b.draw(); });
      ribbons.forEach(r => { r.update(); r.draw(); });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1400; if (p.x > 1400) p.x = 0;
        if (p.y < 0) p.y = 800; if (p.y > 800) p.y = 0;
        const scale = fov / (fov + p.z);
        const sx = cx + (p.x - cx) * scale;
        const sy = cy + (p.y - cy) * scale;
        const sr = p.r * scale;
        const alpha = scale * 0.9;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? `rgba(255,210,0,${alpha})` : `rgba(200,210,255,${alpha * 0.6})`;
        ctx.fill();
      });

      // Vignette
      const vig = ctx.createRadialGradient(cx, cy, h * 0.3, cx, cy, h * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,10,0.7)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block", zIndex: 0 }}
    />
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen text-[#f0ece4] font-['Outfit'] pb-20 relative overflow-hidden" style={{ paddingTop: "200px" }}>
      {/* Animated 3D Background */}
      <GiftBackground />

      <div className="w-full px-4 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <HelpCircle size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Help Center</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic mb-6 text-center">
            FAQ
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed text-center">
            Find answers to the most common questions about LuckyGifts.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#12121a] border border-white/10 rounded-3xl p-8 md:p-10"
            >
              <FAQAccordion items={FAQ_ITEMS} />
            </motion.div>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-3xl p-8 md:p-10">
                <p className="text-white font-bold text-xl mb-4">Still have questions?</p>
                <p className="text-white/50 text-base mb-6">
                  Our support team is ready to help you with any inquiries.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD700] text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-[#f0d060] transition-colors"
                >
                  <Mail size={18} />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
