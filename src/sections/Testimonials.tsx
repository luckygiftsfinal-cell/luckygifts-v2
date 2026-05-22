import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Ahmed Al-Maktoum",
      prize: "Won $1,000,000 Cash",
      initials: "AM",
      text: "I bought a luxury pen, completely forgetting about the draw. A week later, I got the call that changed my life. LuckyGifts is incredibly transparent and professional.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      prize: "Won Range Rover Defender",
      initials: "SJ",
      text: "I couldn't believe my eyes when my name appeared on the live draw. The car delivery process was smooth, and the team treated me like absolute royalty.",
      rating: 5,
    },
    {
      id: 3,
      name: "Tariq Mansour",
      prize: "Won Rolex Datejust 41",
      initials: "TM",
      text: "A completely seamless experience from start to finish. The watch is authentic and breathtaking. Buying a simple wallet got me the watch of my dreams!",
      rating: 5,
    }
  ];

  return (
    <section className="py-24 relative bg-[#0a0a0a] overflow-hidden">
      <div className="container relative z-10 px-4">
        <div className="flex flex-col items-center mb-16">
          <span className="text-xs font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block text-center">Voices of Success</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 text-center">What Our Lucky Winners Say</h2>
          <p className="text-white/50 max-w-2xl font-medium leading-relaxed text-center">
            Real people, real prizes, life-changing moments. Don't just take our word for it—listen to our winners.
          </p>
        </div>

        {/* CARDS CENTERED */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          {testimonials.map((t) => (
            <div 
              key={t.id} 
              className="relative p-6 rounded-2xl bg-[#111111] border border-[#222222] hover:border-[#333333] transition-all duration-300 w-full max-w-[380px]"
            >
              <div className="absolute top-6 right-6 opacity-20">
                <Quote size={40} className="text-white" />
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, index) => (
                  <Star key={index} size={16} fill="#FFD700" className="text-[#FFD700]" />
                ))}
              </div>

              <p className="text-white/70 leading-relaxed mb-8 italic text-sm font-medium">
                "{t.text}"
              </p>

              <div className="border-t border-white/5 mb-5" />

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-black text-sm border-2 border-[#FFD700]">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-white font-black text-sm">{t.name}</h4>
                  <div className="text-[#FFD700] text-xs font-black uppercase tracking-wider">{t.prize}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}