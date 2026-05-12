import { motion } from "framer-motion";

export default function ReadyToChange() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 blur-[120px] rounded-full" />
      
      <div className="container relative z-10 text-center">
        <div className="mb-12">
          <span className="text-4xl mb-6 block">🎰</span>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Ready to Change <br /> Your Life?
          </h2>
          <p className="text-xl text-white/40 font-medium">
            Join 248,000+ members who shop, enter, and win every week.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary py-5 px-16 text-xl rounded-full shadow-[0_0_50px_rgba(255,215,0,0.3)]"
        >
          View Active Prize Draws
        </motion.button>
      </div>
    </section>
  );
}
