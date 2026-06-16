import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ShoppingCart, User, ChevronDown, Ticket, Crown, Menu, X, Globe, Coins, Calendar } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t, isRTL } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { user, isAuthenticated, isAdmin, setModalOpen, logout, earnedTickets } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `text-[14px] font-black uppercase tracking-[0.1em] transition-colors flex items-center gap-2 ${isActive ? "text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" : "text-white/90 hover:text-[#FFD700]"
      }`;
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  const languages = [
    { code: "EN", name: "English" },
    { code: "AR", name: "Arabic" },
    { code: "ES", name: "Spanish" },
    { code: "FR", name: "French" },
    { code: "HI", name: "Hindi" }
  ] as const;

  const currencies = ["USD", "EUR", "AED"] as const;
  const currencyNames = {
    USD: "USD ($)",
    EUR: "EUR (€)",
    AED: "AED"
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[1002] h-5 lg:h-6 ticker-wrap">
        <div className="ticker-inner h-full flex items-center">
          {[1, 2, 3, 4].map((group) => (
            <div key={group} className="flex items-center shrink-0">
              {[
                t("freeShipping"),
                t("verifiedWinners"),
                t("securePayments"),
              ].map((text, i) => (
                <span key={i} className="flex items-center text-xs font-black text-black uppercase tracking-wider whitespace-nowrap">
                  <span className="px-6">{text}</span>
                  <span className="text-black/40 text-sm">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <nav className={`fixed top-5 lg:top-6 left-0 right-0 z-[1001] transition-all duration-300 ${scrolled ? 'glass' : 'bg-[#0A0A0A]'}`}>
        <div className="container mx-auto px-4 py-2 lg:py-4">
          <div className="flex items-center gap-3 lg:gap-8 mb-2 lg:mb-6">
            <Link to="/" className={`flex-shrink-0 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <img src="/images/logo.png" alt="Icon" className="h-8 lg:h-12 w-auto" />
              <div className={`flex flex-col ${isRTL ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-1.5 lg:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="text-lg lg:text-2xl font-black italic tracking-tighter leading-none">
                    <span className="text-white">LUCKY</span>
                    <span className="text-[#FFD700]">GIFTS</span>
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0.6, 1], scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-[#00C853]/10 border border-[#00C853]/50 shadow-[0_0_15px_rgba(0,200,83,0.3)] rounded px-2 py-0.5 flex items-center gap-1 ml-2"
                  >
                    <span className="text-[#00C853] text-xs font-black uppercase tracking-widest">★ {t("trustedStore")}</span>
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 mt-1 w-full">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
                  <span className="text-xs font-black text-[#FFD700] uppercase tracking-[0.2em] whitespace-nowrap">{t("shopAndWin")}</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
                </div>
              </div>
            </Link>

            {/* TAGLINE: One Step Away From Your Dream */}
            <div className="flex-1 hidden lg:flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.span 
                  animate={{ 
                    textShadow: [
                      "0 0 5px rgba(255,255,255,0.3)",
                      "0 0 20px rgba(255,255,255,0.6)",
                      "0 0 5px rgba(255,255,255,0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-sm font-black text-white uppercase tracking-[0.3em] whitespace-nowrap"
                >
                  One Step Away From Your Dream
                </motion.span>
              </motion.div>
            </div>

            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="hidden lg:flex items-center gap-2">
                <div className="relative">
                  <div
                    onClick={() => setLangOpen(!langOpen)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white flex items-center gap-1 cursor-pointer hover:bg-white/10"
                  >
                    {lang} <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {langOpen && (
                    <div className="absolute top-full right-0 mt-2 w-32 glass rounded-xl overflow-hidden shadow-2xl border border-white/10 py-1 z-[2000]">
                      {languages.map((l) => (
                        <div
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setLangOpen(false);
                          }}
                          className="px-4 py-2 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/5 cursor-pointer flex items-center justify-between"
                        >
                          {l.name}
                          {lang === l.code && <div className="w-1 h-1 bg-[#FFD700] rounded-full" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div
                    onClick={() => setCurrOpen(!currOpen)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white flex items-center gap-1 cursor-pointer hover:bg-white/10"
                  >
                    {currencyNames[currency]} <ChevronDown size={12} className={`transition-transform ${currOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {currOpen && (
                    <div className="absolute top-full right-0 mt-2 w-32 glass rounded-xl overflow-hidden shadow-2xl border border-white/10 py-1 z-[2000]">
                      {currencies.map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            setCurrency(c);
                            setCurrOpen(false);
                          }}
                          className="px-4 py-2 text-[10px] font-black text-white/60 hover:text-white hover:bg-white/5 cursor-pointer flex items-center justify-between"
                        >
                          {currencyNames[c]}
                          {currency === c && <div className="w-1 h-1 bg-[#FFD700] rounded-full" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg px-3 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center text-black shadow-sm">
                  <Ticket size={14} />
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-xs font-black text-[#FFD700]/70 uppercase tracking-widest leading-none mb-0.5">
                    {t("earned")}
                  </span>
                  <span className="text-sm font-black text-[#FFD700] leading-none uppercase tracking-tight">
                    {earnedTickets} <span className="hidden sm:inline">{t("tickets")}</span>
                  </span>
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD700] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {!isAuthenticated ? (
                <motion.div
                  onClick={() => setModalOpen(true)}
                  animate={{ boxShadow: ["0 0 0px rgba(255, 215, 0, 0)", "0 0 15px rgba(255, 215, 0, 0.4)", "0 0 0px rgba(255, 215, 0, 0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gold border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all shadow-lg active:scale-95"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-black">
                    <User size={18} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-black text-black whitespace-nowrap">{t("login")}</span>
                </motion.div>
              ) : (
                <div className="relative">
                  <div
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center text-black font-black text-xs">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-bold text-white whitespace-nowrap hidden md:block">{user?.name}</span>
                    <ChevronDown size={14} className={`text-white/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 py-2 z-[2000]">
                      <div className="px-4 py-2 border-b border-white/5 mb-2">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t("signedInAs")}</p>
                        <p className="text-sm text-white font-black truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-black text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors border-b border-white/5">
                          {t("adminDashboard")}
                        </Link>
                      )}
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-bold text-white hover:bg-white/5 transition-colors">{t("orderHistory")}</Link>
                      <button
                        onClick={async () => {
                          await logout();
                          setProfileOpen(false);
                          window.location.href = "/";
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-[#FF4500] hover:bg-[#FF4500]/10 transition-colors mt-2 border-t border-white/5 pt-2"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className={`hidden lg:flex items-center gap-8 border-t border-white/5 pt-5 pb-2 ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
            <Link to="/" className={getLinkClass("/")}>{t("home")}</Link>
            <Link to="/store" className={getLinkClass("/store")}>
              <ShoppingCart size={16} className={pathname === "/store" ? "text-[#FFD700]" : "text-[#FFD700]/70"} /> {t("dreamStore")}
            </Link>
            <Link to="/vip" className={getLinkClass("/vip")}>
              <Crown size={16} className={pathname === "/vip" ? "text-[#FFD700]" : "text-[#FFD700]/70"} /> {t("vipMember")}
            </Link>
            <Link to="/how-it-works" className={getLinkClass("/how-it-works")}>{t("howItWorks")}</Link>
            <Link to="/prizes" className={getLinkClass("/prizes")}>{t("prizes")}</Link>
            <Link to="/events" className={getLinkClass("/events")}>
              <Calendar size={16} className={pathname === "/events" ? "text-[#FFD700]" : "text-[#FFD700]/70"} /> Active Events
            </Link>
            <Link to="/faq" className={getLinkClass("/faq")}>{t("faq")}</Link>
            <Link to="/winners" className={getLinkClass("/winners")}>{t("winners")}</Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/10 overflow-hidden bg-[#0A0A0A]"
            >
              <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex flex-col gap-4">
                  {[
                    { path: "/", label: t("home") },
                    { path: "/store", label: t("dreamStore"), icon: ShoppingCart },
                    { path: "/vip", label: t("vipMember"), icon: Crown },
                    { path: "/how-it-works", label: t("howItWorks") },
                    { path: "/prizes", label: t("prizes") },
                    { path: "/events", label: "Active Events", icon: Calendar },
                    { path: "/faq", label: t("faq") },
                    { path: "/winners", label: t("winners") },
                  ].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-black uppercase tracking-widest flex items-center gap-3 py-2 ${pathname === link.path ? "text-[#FFD700]" : "text-white"
                        }`}
                    >
                      {link.icon && <link.icon size={18} className="text-[#FFD700]" />}
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={12} /> {t("language")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {languages.map(l => (
                        <button
                          key={l.code}
                          onClick={() => setLang(l.code)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l.code ? "bg-[#FFD700] text-black" : "bg-white/5 text-white/60"
                            }`}
                        >
                          {l.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Coins size={12} /> {t("currency")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currencies.map(c => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${currency === c ? "bg-[#FFD700] text-black" : "bg-white/5 text-white/60"
                            }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-0" />
    </>
  );
}
