import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, ChevronDown, Ticket, Crown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { translations } from "../translations";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t, isRTL } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { user, isAuthenticated, isAdmin, setModalOpen, logout, earnedTickets } = useAuth();
  const { setIsCartOpen, totalItems } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const { pathname } = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `text-[14px] font-black uppercase tracking-[0.1em] transition-colors flex items-center gap-2 ${
      isActive ? "text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" : "text-white/90 hover:text-[#FFD700]"
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
      <div className="fixed top-0 left-0 right-0 z-[1002] h-6 ticker-wrap">
        <div className="ticker-inner h-full flex items-center">
          {[1, 2].map((group) => (
            <div key={group} className="flex items-center">
              {[
                t("freeShipping"),
                t("verifiedWinners"),
                t("securePayments"),
              ].map((text, i) => (
                <span key={i} className="text-[9px] font-black text-black px-10 uppercase tracking-wider whitespace-nowrap">{text}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <nav className={`fixed top-6 left-0 right-0 z-[1001] transition-all duration-300 ${scrolled ? 'glass' : 'bg-[#0A0A0A]'}`}>
        <div className="container py-4">
          <div className="flex items-center gap-8 mb-6">
            <Link to="/" className={`flex-shrink-0 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <img src="/images/logo.png" alt="Icon" className="h-12 w-auto" />
              <div className={`flex flex-col ${isRTL ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="text-2xl font-black italic tracking-tighter leading-none">
                    <span className="text-white">LUCKY</span>
                    <span className="text-[#FFD700]">GIFTS</span>
                  </div>
                  <motion.div 
                    animate={{ opacity: [1, 0.6, 1], scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-[#00C853]/10 border border-[#00C853]/50 shadow-[0_0_15px_rgba(0,200,83,0.3)] rounded px-2 py-0.5 flex items-center gap-1 ml-2"
                  >
                    <span className="text-[#00C853] text-[9px] font-black uppercase tracking-widest">★ {t("trustedStore")}</span>
                  </motion.div>
                </div>
                <div className="flex items-center gap-2 mt-1 w-full">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
                  <span className="text-[8px] font-black text-[#FFD700] uppercase tracking-[0.2em] whitespace-nowrap">Shop Now & Win Big</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
                </div>
              </div>
            </Link>

            <div className="flex-1 hidden lg:flex items-center relative">
              <input 
                type="text" 
                placeholder={t("search")}
                dir={isRTL ? "rtl" : "ltr"}
                className={`w-full bg-white rounded-full py-2.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm text-black focus:outline-none`}
              />
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={18} />
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
                  <span className="text-[8px] font-black text-[#FFD700]/70 uppercase tracking-widest leading-none mb-0.5">
                    {lang === 'AR' ? 'تذاكرك' : 'Earned'}
                  </span>
                  <span className="text-sm font-black text-[#FFD700] leading-none uppercase tracking-tight">
                    {earnedTickets} {lang === 'AR' ? 'تذكرة' : 'TICKETS'}
                  </span>
                </div>
              </div>

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
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-white whitespace-nowrap hidden md:block">{user?.name}</span>
                    <ChevronDown size={14} className={`text-white/60 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 py-2 z-[2000]">
                      <div className="px-4 py-2 border-b border-white/5 mb-2">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm text-white font-black truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-black text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors border-b border-white/5">
                          Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm font-bold text-white hover:bg-white/5 transition-colors">Order History</Link>
                      <button 
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-[#FF4500] hover:bg-[#FF4500]/10 transition-colors mt-2 border-t border-white/5 pt-2"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => setIsCartOpen(true)}
                className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/5 transition-colors relative"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD700] text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className={`hidden lg:flex items-center gap-8 border-t border-white/5 pt-5 pb-2 ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
            <Link to="/" className={getLinkClass("/")}>{t("home")}</Link>
            <Link to="/store" className={getLinkClass("/store")}>{t("dreamStore")}</Link>
            <Link to="/vip" className={getLinkClass("/vip")}>
              <Crown size={16} className={pathname === "/vip" ? "text-[#FFD700]" : "text-[#FFD700]/70"} /> {t("vipMember")}
            </Link>
            <Link to="/how-it-works" className={getLinkClass("/how-it-works")}>{t("howItWorks")}</Link>
            <Link to="/prizes" className={getLinkClass("/prizes")}>{t("prizes")}</Link>
            <Link to="/faq" className={getLinkClass("/faq")}>{t("faq")}</Link>
            <Link to="/winners" className={getLinkClass("/winners")}>{t("winners")}</Link>
          </div>
        </div>
      </nav>
      <div className="h-[160px]" />
    </>
  );
}
