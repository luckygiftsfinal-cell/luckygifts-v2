import { Twitter, Instagram, Youtube, Mail, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
             <div className="flex items-center gap-3 mb-6">
                <span className="text-xl font-black">
                  <span className="text-[#E5E4E2]">LUCKY</span>
                  <span className="text-gold">GIFTS</span>
                </span>
             </div>
             <p className="text-sm text-white/40 leading-relaxed mb-6">{t("footerDesc")}</p>
             <div className="mt-4 flex flex-col gap-2">
               <Link to="/about" className="inline-block text-xs font-bold text-[#FFD700] hover:text-white uppercase tracking-widest transition-colors">
                 {t("aboutUs")} &rarr;
               </Link>
               <Link to="/trust" className="inline-block text-xs font-bold text-[#FFD700] hover:text-white uppercase tracking-widest transition-colors mt-2">
                 {t("whyTrustUs")} &rarr;
               </Link>
             </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">{t("explore")}</h4>
            <ul className="text-xs font-bold text-white/40 space-y-4">
              <li><Link to="/store" className="hover:text-white transition-colors">{t("dreamStore")}</Link></li>
              <li><Link to="/prizes" className="hover:text-white transition-colors">{t("prizes")}</Link></li>
              <li><Link to="/winners" className="hover:text-white transition-colors">{t("winners")}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">{t("howItWorks")}</Link></li>
              <li><Link to="/vip" className="hover:text-white transition-colors">{t("vipMember")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">{t("support")}</h4>
            <ul className="text-xs font-bold text-white/40 space-y-4">
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('contactUs')}</Link></li>
              <li><Link to="/work-with-us" className="hover:text-white transition-colors">{t('workWithUs')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t("faqCenter")}</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">{t("termsConditions")}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t("privacyPolicy")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">{t("connect")}</h4>
            <div className="text-xs font-bold text-white/40 space-y-5">
              <div className="flex items-center gap-3"><Mail size={16} className="text-white/20" /> support@luckygifts.com</div>
              <div className="flex items-center gap-3"><span className="w-4 flex justify-center text-white/20">📞</span> +971 50 000 0000</div>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-white/20" /> Dubai, United Arab Emirates</div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/20 uppercase tracking-widest">&copy; 2026 LuckyGifts. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Shield size={12} className="text-gold" /> {t("sslSecured")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
