import React from "react";
import { Search, Trophy, ShieldCheck, Zap, Users, BookOpen, MessageCircle, Sparkles } from "lucide-react";

export default function WhyTrustUsPage() {
  const sections = [
    { icon: <Search size={24} />, title: "Transparent Prize System", text: "At LuckyGifts, transparency is our top priority. Every draw is conducted using a fair and verifiable system to ensure that all participants have an equal chance of winning. We clearly display the number of entries, the draw dates, and the winners for every prize." },
    { icon: <Trophy size={24} />, title: "Real Winners – Real Rewards", text: "Our platform is built on real experiences. Winners are announced publicly, and many of them share their stories with our community. We believe that seeing real people win real prizes is the best proof of trust." },
    { icon: <ShieldCheck size={24} />, title: "Secure Payments", text: "We use trusted and secure payment technologies to protect every transaction. Your personal and payment information is encrypted and handled with strict security standards." },
    { icon: <Zap size={24} />, title: "Instant Entry with Every Purchase", text: "Every purchase you make automatically gives you entries into our prize draws. There are no hidden steps or complicated rules. Buy a product you like, and you are instantly entered into the draw." },
    { icon: <Users size={24} />, title: "Trusted by a Growing Community", text: "Thousands of users join our platform to try their luck every day. Our community continues to grow because people enjoy the excitement of winning while receiving real products in return." },
    { icon: <BookOpen size={24} />, title: "Fair and Clear Rules", text: "All draws follow clear rules that are available to everyone. We make sure that the process is simple, honest, and easy to understand so that users always know how everything works." },
    { icon: <MessageCircle size={24} />, title: "Customer Support", text: "Our support team is always ready to help. Whether you have a question about an order, a draw, or your account, you can contact us and receive assistance quickly." },
    { icon: <Sparkles size={24} />, title: "A New Way to Win Big", text: "LuckyGifts offers a unique experience where small purchases can lead to life-changing prizes such as cash rewards, luxury cars, electronics, and more." },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0ece4] pt-32 pb-24 font-['Outfit']">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <div className="container relative z-10 max-w-6xl px-4">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Our Commitment</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">Why Trust Us</h1>
          <p className="text-white/40 font-medium max-w-2xl mx-auto">
            Discover the values and practices that make LuckyGifts the most trusted platform for luxury prize draws.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s, i) => (
            <div 
              key={i} 
              className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,215,0,0.05)] hover:border-[#FFD700]/20 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-150 group-hover:bg-[#FFD700]/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-center w-14 h-14 bg-[#FFD700]/10 rounded-2xl mb-6 text-[#FFD700] shadow-[inset_0_0_20px_rgba(255,215,0,0.05)] border border-[#FFD700]/10 group-hover:scale-110 group-hover:bg-[#FFD700]/20 group-hover:border-[#FFD700]/30 transition-all">
                  {s.icon}
                </div>
                <h2 className="text-xl font-bold text-white mb-4 tracking-wide group-hover:text-[#FFD700] transition-colors">{s.title}</h2>
                <p className="text-white/60 leading-relaxed text-[15px]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
