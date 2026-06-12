import { Info, ShieldQuestion, Mail, MapPin, Phone, Shield, ChevronRight, Ticket, Trophy, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t, isRTL } = useLanguage();

  const [connectInfo, setConnectInfo] = useState({
    email:    "support@getluckygifts.shop",
    phone:    "+971 50 000 0000",
    location: "Dubai, United Arab Emirates",
  });

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["footer_email", "footer_phone", "footer_location"])
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        setConnectInfo({
          email:    map.footer_email    || "support@getluckygifts.shop",
          phone:    map.footer_phone    || "+971 50 000 0000",
          location: map.footer_location || "Dubai, United Arab Emirates",
        });
      });
  }, []);

  const exploreLinks = [
    { to: "/prizes",      label: t("prizes") },
    { to: "/winners",     label: t("winners") },
    { to: "/how-it-works",label: t("howItWorks") },
    { to: "/vip",         label: t("vipMember") },
  ];

  const supportLinks = [
    { to: "/contact",     label: t("contactUs") },
    { to: "/work-with-us",label: t("workWithUs") },
    { to: "/faq",         label: t("faqCenter") },
    { to: "/terms",       label: t("termsConditions") },
    { to: "/privacy",     label: t("privacyPolicy") },
  ];

  const stats = [
    { icon: Ticket, value: "250K+", label: isRTL ? "تذكرة مباعة" : "Tickets Sold" },
    { icon: Trophy, value: "1,200+", label: isRTL ? "فائز سعيد" : "Happy Winners" },
    { icon: Star,   value: "4.9★",  label: isRTL ? "تقييم العملاء" : "Customer Rating" },
  ];

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="relative bg-[#05050a] overflow-hidden"
    >
      {/* ── decorative top glow line ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent" />

      {/* ── subtle radial glow behind logo col ── */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #FFD700 0%, transparent 70%)" }}
      />

      {/* ── Stats strip ── */}
      <div className="border-b border-white/5">
        <div className="container py-16">
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center group-hover:bg-[#FFD700]/20 transition-colors">
                  <Icon size={28} className="text-[#FFD700]" />
                </div>
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">{value}</span>
                <span className="text-sm font-semibold text-white/40 uppercase tracking-widest text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand col */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center">
                <Trophy size={16} className="text-black" />
              </div>
              <span className="text-xl font-black tracking-tight">
                <span className="text-white">LUCKY</span>
                <span className="text-[#FFD700]">GIFTS</span>
              </span>
            </div>

            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              {t("footerDesc")}
            </p>

            {/* Page links */}
            <div className="flex flex-col gap-2">
              <Link
                to="/about"
                className="group flex items-center gap-2 text-sm text-white/45 hover:text-[#FFD700] transition-colors duration-150"
              >
                <Info size={14} className="text-[#FFD700]/60 group-hover:text-[#FFD700] transition-colors" />
                <span>About Us</span>
              </Link>
              <Link
                to="/trust"
                className="group flex items-center gap-2 text-sm text-white/45 hover:text-[#FFD700] transition-colors duration-150"
              >
                <ShieldQuestion size={14} className="text-[#FFD700]/60 group-hover:text-[#FFD700] transition-colors" />
                <span>Why Trust Us</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                { icon: Shield, label: t("sslSecured") },
                { icon: Star,   label: isRTL ? "موثوق ومعتمد" : "Trusted & Verified" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest"
                >
                  <Icon size={11} className="text-[#FFD700]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Explore links */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700] mb-7">
              {t("explore")}
            </h4>
            <ul className="space-y-3.5">
              {exploreLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors duration-150"
                  >
                    <ChevronRight
                      size={13}
                      className="text-[#FFD700]/0 group-hover:text-[#FFD700] -translate-x-1 group-hover:translate-x-0 transition-all duration-150"
                      style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700] mb-7">
              {t("support")}
            </h4>
            <ul className="space-y-3.5">
              {supportLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors duration-150"
                  >
                    <ChevronRight
                      size={13}
                      className="text-[#FFD700]/0 group-hover:text-[#FFD700] -translate-x-1 group-hover:translate-x-0 transition-all duration-150"
                      style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700] mb-7">
              {t("connect")}
            </h4>
            <ul className="space-y-4">
              {[
                { icon: Mail,   text: connectInfo.email,    href: `mailto:${connectInfo.email}` },
                { icon: Phone,  text: connectInfo.phone,    href: `tel:${connectInfo.phone.replace(/\s/g, "")}` },
                { icon: MapPin, text: connectInfo.location, href: null },
              ].map(({ icon: Icon, text, href }) => {
                const cls = "flex items-start gap-3 group";
                const inner = (
                  <>
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#FFD700]/10 group-hover:border-[#FFD700]/30 transition-colors">
                      <Icon size={13} className="text-white/30 group-hover:text-[#FFD700] transition-colors" />
                    </div>
                    <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors leading-snug pt-0.5">
                      {text}
                    </span>
                  </>
                );
                return href ? (
                  <li key={text}><a href={href} className={cls}>{inner}</a></li>
                ) : (
                  <li key={text}><div className={cls}>{inner}</div></li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/20 tracking-widest uppercase">
            &copy; 2026 LuckyGifts. {isRTL ? "جميع الحقوق محفوظة." : "All Rights Reserved."}
          </p>
          <div className="flex items-center gap-5">
            <Link to="/terms"   className="text-[11px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors">{t("termsConditions")}</Link>
            <span className="text-white/10">·</span>
            <Link to="/privacy" className="text-[11px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors">{t("privacyPolicy")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}