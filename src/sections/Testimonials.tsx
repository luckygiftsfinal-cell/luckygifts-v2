import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Ahmed Al-Maktoum",
      prize: "Won $1,000,000 Cash",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      verified: "instagram",
      text: "I bought a luxury pen, completely forgetting about the draw. A week later, I got the call that changed my life. LuckyGifts is incredibly transparent and professional.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      prize: "Won Range Rover Defender",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
      verified: "facebook",
      text: "I couldn't believe my eyes when my name appeared on the live draw. The car delivery process was smooth, and the team treated me like absolute royalty.",
      rating: 5,
    },
    {
      id: 3,
      name: "Tariq Mansour",
      prize: "Won Rolex Datejust 41",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      verified: "instagram",
      text: "A completely seamless experience from start to finish. The watch is authentic and breathtaking. Buying a simple wallet got me the watch of my dreams!",
      rating: 5,
    }
  ];

  const VerifiedBadge = ({ platform }: { platform: string }) => (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
      platform === "instagram"
        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300"
        : "bg-blue-500/20 border border-blue-500/30 text-blue-300"
    }`}>
      {platform === "instagram" ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      Verified
    </div>
  );

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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#FFD700] flex-shrink-0">
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = "#FFD700";
                          parent.style.display = "flex";
                          parent.style.alignItems = "center";
                          parent.style.justifyContent = "center";
                          parent.innerHTML = `<span style="color:#000;font-weight:900;font-size:14px">${t.name.split(" ").map((n: string) => n[0]).join("")}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">{t.name}</h4>
                    <div className="text-[#FFD700] text-xs font-black uppercase tracking-wider">{t.prize}</div>
                  </div>
                </div>
                <VerifiedBadge platform={t.verified} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
