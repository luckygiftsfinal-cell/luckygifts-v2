import { ShoppingBag, Gift, Trophy, Star } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: ShoppingBag,
      title: "Buy Any Product",
      desc: "Shop from our curated collection of premium gadgets and gifts.",
    },
    {
      icon: Gift,
      title: "Get a Chance",
      desc: "Every purchase automatically enters you into the big prize draw.",
    },
    {
      icon: Trophy,
      title: "Win Amazing Prizes",
      desc: "From 1M $ to 1 Kg gold bare — incredible prizes this year.",
    },
    {
      icon: Star,
      title: "Everyone Wins",
      desc: "Even if you don't win the grand prize, you keep your purchase and more free gifts.",
    }
  ];

  return (
    <section className="bg-[#050505] py-4 border-y border-white/5 relative overflow-hidden">
      {/* Subtle Gold Dust Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{ backgroundImage: "radial-gradient(circle at center, #FFD700 1px, transparent 1px)", backgroundSize: "40px 40px", backgroundPosition: "0 0" }} 
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-0 pointer-events-none" />

      <div className="container relative z-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-3 lg:px-6 lg:py-1 group">
              <div className="w-8 h-8 flex-shrink-0 border border-[#FFD700]/30 rounded-full flex items-center justify-center bg-black/40 group-hover:border-[#FFD700] transition-colors shadow-[0_0_15px_rgba(255,215,0,0.1)] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <step.icon size={14} className="text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-[13px] mb-0.5 tracking-wide leading-tight">{step.title}</h3>
                <p className="text-white/60 text-[11px] leading-tight">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
