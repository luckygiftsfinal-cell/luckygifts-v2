import HeroSection from "../sections/HeroSection";
import HowItWorks from "../sections/HowItWorks";
import PopularProducts from "../sections/PopularProducts";
import Testimonials from "../sections/Testimonials";
import ReadyToChange from "../sections/ReadyToChange";
import { Shield, Zap, Award, Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import SEO from "../components/SEO";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <SEO
        title="Shop Now & Win Big — Luxury Prizes"
        description="Buy premium lifestyle products and automatically enter life-changing luxury prize draws — Rolex, iPhone, Cash, Cars & more. 250,000+ tickets sold. Free worldwide shipping."
        url="/"
        keywords="luxury prizes UAE, win prizes Dubai, lucky draw online, win car UAE, win cash prizes, prize draw"
      />
      <HeroSection />

      {/* Animated Trust Bar */}
      <div className="bg-[#FFD700] py-3 overflow-hidden relative border-y border-[#E6B800]">
        <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
          {[1, 2, 3, 4].map((group) => (
            <div key={group} className="flex items-center gap-16 px-8">
              {[
                { icon: Shield, label: t("securePayments") },
                { icon: Award, label: t("verifiedWinnersCount") },
                { icon: Zap, label: t("instantEntry") },
                { icon: Star, label: t("trustScoreLabel") },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon size={16} className="text-black/60" />
                  <span className="text-xs font-black text-black uppercase tracking-[0.25em]">{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <HowItWorks />

      {/* Divider */}
      <div className="bg-[#0a0a0f]">
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <PopularProducts />

      {/* Divider */}
      <div className="bg-[#0a0a0f]">
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <ReadyToChange />

      {/* Divider */}
      <div className="bg-[#0a0a0f]">
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <Testimonials />
    </div>
  );
}