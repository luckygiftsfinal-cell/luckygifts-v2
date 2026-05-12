import { Twitter, Instagram, Youtube, Mail, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
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
             <p className="text-sm text-white/40 leading-relaxed mb-6">World's premier Buy & Win luxury platform.</p>
             <div className="mt-4 flex flex-col gap-2">
               <Link to="/about" className="inline-block text-xs font-bold text-[#FFD700] hover:text-white uppercase tracking-widest transition-colors">
                 About Us &rarr;
               </Link>
               <Link to="/trust" className="inline-block text-xs font-bold text-[#FFD700] hover:text-white uppercase tracking-widest transition-colors mt-2">
                 Why Trust Us &rarr;
               </Link>
             </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">Explore</h4>
            <ul className="text-xs font-bold text-white/40 space-y-4">
              <li><Link to="/store" className="hover:text-white transition-colors">Dream Store</Link></li>
              <li><Link to="/prizes" className="hover:text-white transition-colors">Prize Draws</Link></li>
              <li><Link to="/winners" className="hover:text-white transition-colors">Recent Winners</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/vip" className="hover:text-white transition-colors">VIP Membership</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">Support</h4>
            <ul className="text-xs font-bold text-white/40 space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Work With Us</a></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ Center</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8">Connect</h4>
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
            <span className="flex items-center gap-2"><Shield size={12} className="text-gold" /> SSL SECURED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
