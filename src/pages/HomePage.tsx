import HeroSection from "../sections/HeroSection";
import HowItWorks from "../sections/HowItWorks";
import PopularProducts from "../sections/PopularProducts";
import Testimonials from "../sections/Testimonials";
import { Shield, Zap, Award, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <HeroSection />
      
      {/* Animated Glassy Yellow Trust Bar Ticker */}
      <div className="bg-[#FFD700]/10 backdrop-blur-md border-y border-[#FFD700]/30 shadow-[0_0_30px_rgba(255,215,0,0.1)] py-4 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
          {[1, 2, 3, 4].map((group) => (
            <div key={group} className="flex items-center gap-16 px-8">
              {[
                { icon: Shield, label: "SSL Secured Payments" },
                { icon: Award, label: "12,400+ Verified Winners" },
                { icon: Zap, label: "Instant Entry System" },
                { icon: Star, label: "4.9/5 Trust Score" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon size={16} className="text-[#FFD700]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.25em] drop-shadow-md">{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <HowItWorks />
      
      <PopularProducts />
      
      <Testimonials />
    </div>
  );
}
