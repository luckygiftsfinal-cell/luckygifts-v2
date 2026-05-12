import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Ahmed Al-Maktoum",
      prize: "Won $1,000,000 Cash",
      image: "/images/winner_ahmad.png",
      text: "I bought a luxury pen, completely forgetting about the draw. A week later, I got the call that changed my life. LuckyGifts is incredibly transparent and professional.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      prize: "Won Range Rover Defender",
      image: "/images/winner_ava.png",
      text: "I couldn't believe my eyes when my name appeared on the live draw. The car delivery process was smooth, and the team treated me like absolute royalty.",
      rating: 5,
    },
    {
      id: 3,
      name: "Tariq Mansour",
      prize: "Won Rolex Datejust 41",
      image: "/images/winner_luke.png",
      text: "A completely seamless experience from start to finish. The watch is authentic and breathtaking. Buying a simple wallet got me the watch of my dreams!",
      rating: 5,
    }
  ];

  return (
    <section className="py-24 relative bg-[#0a0a0a] overflow-hidden border-t border-white/5">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 px-4">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Voices of Success</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">What Our Lucky Winners Say</h2>
          <p className="text-white/50 max-w-xl mx-auto font-medium">Real people, real prizes, life-changing moments. Don't just take our word for it—listen to our winners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div 
              key={t.id} 
              className="relative p-8 rounded-3xl bg-gradient-to-b from-[#161616] to-[#0a0a0a] border border-white/10 hover:border-[#FFD700]/30 transition-all duration-500 shadow-xl group hover:-translate-y-2"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 group-hover:text-[#FFD700] transition-all">
                <Quote size={48} />
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, index) => (
                  <Star key={index} size={16} fill="#FFD700" className="text-[#FFD700]" />
                ))}
              </div>

              <p className="text-white/80 leading-relaxed mb-8 italic relative z-10 text-sm">
                "{t.text}"
              </p>

              <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-6">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#FFD700]/20 p-0.5"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${t.name}&background=FFD700&color=000&bold=true`;
                  }}
                />
                <div>
                  <h4 className="text-white font-black text-base">{t.name}</h4>
                  <div className="text-[#FFD700] text-xs font-bold uppercase tracking-wider">{t.prize}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
