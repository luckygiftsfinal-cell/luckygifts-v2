import React from "react";
import { Search, Banknote, Shield, Zap } from "lucide-react";

export default function AboutUsPage() {
  const differentiators = [
    { icon: <Search size={24} />, label: "Transparent Draws" },
    { icon: <Banknote size={24} />, label: "Real Cash Prizes" },
    { icon: <Shield size={24} />, label: "Secure Platform" },
    { icon: <Zap size={24} />, label: "Simple Participation" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ece4] pt-32 pb-24 font-['Outfit'] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-4xl px-4" style={{marginLeft: 'auto', marginRight: 'auto'}}>
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Get To Know Us</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">About Us</h1>
          <p className="text-white/40 font-medium max-w-2xl mx-auto">
            Discover the vision and the mission behind the world's premier Buy & Win luxury platform.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden mb-16">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
          
          <h2 className="text-2xl font-bold text-[#FFD700] mb-6">Welcome</h2>
          
          <div className="prose prose-invert prose-gold max-w-none">
            <p className="text-white/80 leading-relaxed mb-6 text-lg">
              Welcome to our platform — where opportunity meets excitement.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              We are a platform specialized in organizing large-scale events at the global level. Our mission is to create and manage festivals for our partners, organize competitions for participants, and ensure the highest possible chances of winning.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              Our mission is simple: to give everyone the chance to win life-changing cash prizes while enjoying a transparent, fair, and exciting experience.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              Every draw is designed with fairness and transparency.
            </p>
            <p className="text-[#FFD700] leading-relaxed font-bold text-xl mt-8">
              We believe that dreams should be within reach.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-white mb-10 uppercase tracking-widest">What makes us different?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {differentiators.map((item, i) => (
            <div 
              key={i} 
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#FFD700]/40 group"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-[#FFD700]/10 rounded-xl mx-auto mb-6 text-[#FFD700] group-hover:scale-110 group-hover:bg-[#FFD700]/20 transition-all">
                {item.icon}
              </div>
              <div className="font-bold text-lg text-white group-hover:text-[#FFD700] transition-colors">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
