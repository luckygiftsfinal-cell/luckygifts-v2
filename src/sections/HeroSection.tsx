import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Lock, Zap, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";

export default function HeroSection() {
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();

  // Countdown Logic
  const targetDate = new Date("2026-12-31T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);
  
  const prizes = [
    { name: "Range Rover", price: formatPrice(180000), img: "🚗", color: "from-red-500/20" },
    { name: "Rolex Watch", price: formatPrice(25000), img: "⌚", color: "from-blue-500/20" },
    { name: "iPhone 17 Pro", price: formatPrice(1299), img: "📱", color: "from-purple-500/20" },
    { name: "Cash Prize", price: formatPrice(100000), img: "💰", color: "from-green-500/20" },
  ];

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.png" 
          alt="Luxury Background" 
          className="w-full h-full object-cover object-center scale-110"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black via-black/20 to-transparent" />
      </div>

      <div className="container relative z-10 py-20">
        <div className={`flex flex-col lg:flex-row items-center gap-16 mb-20 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-center ${isRTL ? 'lg:justify-start flex-row-reverse' : 'lg:justify-start'} gap-3 mb-8`}
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{t("liveDraws")}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">250,000 {t("ticketsSold")}</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-white mb-4 leading-[0.9] tracking-tighter drop-shadow-2xl"
            >
              {isRTL ? (
                <>تسوق الآن <br /> <span className="text-gold">واربح الكثير</span></>
              ) : (
                <>Shop Now & <br /> <span className="text-gold">Win Big</span></>
              )}
            </motion.h1>



            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed font-bold drop-shadow-lg"
            >
              {t("heroDesc")}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className={`flex flex-col lg:flex-row items-center ${isRTL ? 'lg:items-start' : 'lg:items-start'} gap-8 mt-4`}
            >
              <div className="flex flex-col items-center lg:items-start gap-6">
                <div className="flex flex-nowrap justify-center lg:justify-start gap-3 w-full">
                  <Link to="/store" className="bg-gold text-black py-3 px-4 sm:py-4 sm:px-10 text-sm sm:text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform whitespace-nowrap flex-1 sm:flex-none">
                    {t("startShopping")} <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                  </Link>
                  <Link to="/how-it-works" className="bg-[#111111] text-white border border-white/10 py-3 px-4 sm:py-4 sm:px-10 text-sm sm:text-lg font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-1 sm:flex-none">
                    {t("howItWorks")}
                  </Link>
                </div>

                <div className="flex flex-nowrap justify-center lg:justify-start items-center gap-4 sm:gap-6 opacity-70 w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                    <Lock size={12} className="text-white sm:w-3.5 sm:h-3.5" />
                    <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">{t("securePayments")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                    <Zap size={12} className="text-white sm:w-3.5 sm:h-3.5" />
                    <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">{t("instantEntry")}</span>
                  </div>
                </div>
              </div>

              {/* Countdown Box */}
              <div className="flex items-center gap-4 bg-black/60 border border-white/20 rounded-xl p-4 pr-6 backdrop-blur-md">
                <Calendar size={28} className="text-white" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.1em] mb-1">{t("bigDraw")} 31-12-2026</span>
                  <div className="flex items-center gap-3 text-white font-black leading-none">
                    <div className="flex items-end">
                      <span className="text-2xl">{timeLeft.days}</span>
                      <span className="text-[9px] text-white/60 ml-0.5 mb-1">{t("days")}</span>
                    </div>
                    <div className="flex items-end">
                      <span className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-[9px] text-white/60 ml-0.5 mb-1">{t("hours")}</span>
                    </div>
                    <div className="flex items-end">
                      <span className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="text-[9px] text-white/60 ml-0.5 mb-1">{t("minutes")}</span>
                    </div>
                    <div className="flex items-end">
                      <span className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="text-[9px] text-white/60 ml-0.5 mb-1">{t("seconds")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </section>
  );
}
