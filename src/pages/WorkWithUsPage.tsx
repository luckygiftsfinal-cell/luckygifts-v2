import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { isValidPhone, isValidEmail } from "../lib/validation";
import { useLanguage } from "../context/LanguageContext";

export default function WorkWithUsPage() {
  const { lang } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.position || !formData.message) {
      toast.error(lang === 'AR' ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error(lang === 'AR' ? "بريد إلكتروني غير صالح" : "Invalid email address");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error(lang === 'AR' ? "رقم هاتف غير صالح" : "Invalid phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("work_applications").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        message: formData.message,
        status: "pending"
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success(lang === 'AR' ? "تم إرسال طلبك بنجاح!" : "Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
          {lang === 'AR' ? "شكراً لاهتمامك!" : "Thank You For Your Interest!"}
        </h2>
        <p className="text-white/40 mb-8 max-w-sm leading-relaxed">
          {lang === 'AR' 
            ? "لقد تلقينا طلبك وسيقوم فريقنا بمراجعته والتواصل معك قريباً." 
            : "We have received your application. Our team will review it and get back to you shortly."}
        </p>
        <button 
          onClick={() => window.location.href = "/"}
          className="btn-primary px-8"
        >
          {lang === 'AR' ? "العودة للرئيسية" : "Back to Home"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ece4] font-['Outfit'] pt-32 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full px-4 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Briefcase size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Careers at LuckyGifts</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6 text-center">
            {lang === 'AR' ? "انضم إلى فريقنا" : "Work With Us"}
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed text-center">
            {lang === 'AR' 
              ? "هل أنت مستعد لتغيير قواعد اللعبة في عالم الفخامة؟ نحن نبحث دائماً عن المبدعين للانضمام إلى رحلتنا." 
              : "Ready to redefine luxury and winning? We're always looking for talented individuals to join our visionary team."}
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#12121a] border border-white/10 rounded-3xl p-10 shadow-2xl relative"
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-6 px-6 text-base text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-6 px-6 text-base text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+971 50 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-6 px-6 text-base text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Position / Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Influencer, Developer..."
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-6 px-6 text-base text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Your Message / Experience</label>
                  <textarea 
                    rows={6}
                    placeholder="Tell us about yourself and why you'd be a great fit..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-6 px-6 text-base text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-[#FFD700] text-black font-black uppercase tracking-widest text-base rounded-2xl flex items-center justify-center gap-3 hover:bg-[#f0d060] transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(255,215,0,0.15)]"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        <div className="w-full flex justify-center my-24">
          <div className="w-full max-w-5xl h-px bg-white/10" />
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Why Join Us?</h3>
              <ul className="space-y-8">
                {[
                  { title: "Visionary Team", desc: "Work with the best in Dubai's luxury startup scene." },
                  { title: "Growth", desc: "Accelerate your career in a fast-paced environment." },
                  { title: "Innovation", desc: "Be part of the future of digital luxury commerce." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white uppercase tracking-wider">{item.title}</h4>
                      <p className="text-sm text-white/40 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-3xl p-10">
              <p className="text-sm text-[#FFD700] font-black uppercase tracking-widest mb-3">Direct Contact</p>
              <p className="text-white/60 text-base leading-relaxed">
                Have questions? Reach out to our HR department at careers@luckygifts.ae
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
