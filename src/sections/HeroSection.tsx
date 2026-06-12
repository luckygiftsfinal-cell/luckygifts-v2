import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Zap, Calendar } from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

export default function HeroSection() {
  const { t, isRTL } = useLanguage();

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

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.png" 
          alt="Luxury Background" 
          className="w-full h-full object-cover object-center scale-110"
        />
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="container relative z-10 pt-0 pb-16">
        <div className={`flex flex-col lg:flex-row items-center gap-16 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>

          {/* LEFT SIDE — Text Content */}
          <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>

            {/* Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-center ${isRTL ? 'lg:justify-start flex-row-reverse' : 'lg:justify-start'} gap-3 mb-8`}
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-black text-red-500 uppercase tracking-widest">{t("liveDraws")}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs font-black text-white uppercase tracking-widest">250,000 {t("ticketsSold")}</span>
              </div>
            </motion.div>

            {/* Title */}
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

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed font-bold drop-shadow-lg"
            >
              {t("heroDesc")}
            </motion.p>

            {/* Trust Icons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-nowrap items-center justify-center lg:justify-start gap-4 sm:gap-6 opacity-80"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <Lock size={14} className="text-[#FFD700] sm:w-4 sm:h-4" />
                <span className="text-xs font-black text-white uppercase tracking-wider">{t("securePayments")}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <Zap size={14} className="text-[#FFD700] sm:w-4 sm:h-4" />
                <span className="text-xs font-black text-white uppercase tracking-wider">{t("instantEntry")}</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE — Empty space for hero image to show through */}
          <div className="flex-1 hidden lg:block" />
        </div>
      </div>

      {/* ─── BOTTOM BAR: Countdown + Shop Now Button ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-0 right-0 z-20 px-4"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Countdown Box */}
          <div className="flex items-center gap-4 sm:gap-6 bg-black/80 border-2 border-[#FFD700]/40 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(255,215,0,0.2)]">
            <Calendar size={32} className="text-[#FFD700] flex-shrink-0 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-[#FFD700] uppercase tracking-[0.15em] mb-2 text-center">{t("bigDraw")} 31-12-2026</span>
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-white font-black leading-none">
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl sm:text-5xl">{timeLeft.days}</span>
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">{t("days")}</span>
                </div>
                <span className="text-xl sm:text-3xl text-[#FFD700]/60">:</span>
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl sm:text-5xl">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">{t("hours")}</span>
                </div>
                <span className="text-xl sm:text-3xl text-[#FFD700]/60">:</span>
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl sm:text-5xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">{t("minutes")}</span>
                </div>
                <span className="text-xl sm:text-3xl text-[#FFD700]/60">:</span>
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-3xl sm:text-5xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">{t("seconds")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Now Button + Trust Badges */}
          <div className="flex flex-col items-center gap-3">
            <a 
              href="https://storegetlucky.netlify.app/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold text-black py-5 px-10 sm:py-7 sm:px-16 text-xl sm:text-3xl font-black rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_60px_rgba(255,215,0,0.5)] hover:scale-110 transition-transform whitespace-nowrap border-3 border-[#FFD700]"
            >
              {t("startShopping")} <ArrowRight size={28} />
            </a>

            {/* Trust Badges */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-4 opacity-90" />
                <span className="text-[10px] font-black text-white/70 uppercase tracking-wider hidden sm:block">PayPal</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <Lock size={13} className="text-green-400" />
                <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <span className="text-sm">🇦🇪</span>
                <span className="text-[10px] font-black text-white/70 uppercase tracking-wider hidden sm:block">UAE</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}