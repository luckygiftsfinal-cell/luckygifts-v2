import { ShoppingBag, Gift, Trophy, Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function HowItWorks() {
  const { isRTL } = useLanguage();

  const steps = [
    {
      icon: ShoppingBag,
      title: isRTL ? "اشترِ أي منتج"         : "Buy Any Product",
      desc:  isRTL ? "تسوّق من مجموعتنا المختارة من الهدايا والأجهزة الفاخرة." : "Shop from our curated collection of premium gadgets and gifts.",
    },
    {
      icon: Gift,
      title: isRTL ? "احصل على فرصة"         : "Get a Chance",
      desc:  isRTL ? "كل عملية شراء تدخلك تلقائياً في السحب الكبير على الجوائز." : "Every purchase automatically enters you into the big prize draw.",
    },
    {
      icon: Trophy,
      title: isRTL ? "اربح جوائز رائعة"      : "Win Amazing Prizes",
      desc:  isRTL ? "من مليون دولار إلى كيلو من الذهب — جوائز استثنائية هذا العام." : "From $1M to 1Kg gold bar — incredible prizes this year.",
    },
    {
      icon: Star,
      title: isRTL ? "الجميع يفوز"           : "Everyone Wins",
      desc:  isRTL ? "حتى لو لم تفز بالجائزة الكبرى، تحتفظ بمشترياتك وتحصل على هدايا إضافية." : "Even if you don't win, you keep your purchase and receive free gifts.",
    },
  ];

  return (
    <section className="bg-[#050505] py-5 border-y border-white/5">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-start gap-4 px-6 py-4 lg:py-2 group ${isRTL ? "flex-row-reverse text-right" : ""}`}>
              <div className="w-9 h-9 flex-shrink-0 mt-0.5 border border-[#FFD700]/30 rounded-full flex items-center justify-center bg-black/40 group-hover:border-[#FFD700] transition-colors shadow-[0_0_15px_rgba(255,215,0,0.1)] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <step.icon size={15} className="text-[#FFD700]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1 tracking-wide leading-tight">{step.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
