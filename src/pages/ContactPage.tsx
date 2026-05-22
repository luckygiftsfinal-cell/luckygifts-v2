import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { sendContactEmail } from "../lib/emailService";
import { isValidPhone, isValidEmail } from "../lib/validation";
import { useLanguage } from "../context/LanguageContext";

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
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
      const result = await sendContactEmail(formData);
      if (result.success) {
        setIsSubmitted(true);
        toast.success(lang === 'AR' ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!");
      } else {
        toast.error(lang === 'AR' ? "فشل إرسال الرسالة. يرجى المحاولة لاحقاً." : "Failed to send message. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred");
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
          {lang === 'AR' ? "وصلت رسالتك!" : "Message Received!"}
        </h2>
        <p className="text-white/40 mb-8 max-w-sm leading-relaxed">
          {lang === 'AR' 
            ? "شكراً لتواصلك معنا. سيقوم فريق الدعم لدينا بالرد عليك في أقرب وقت ممكن." 
            : "Thank you for contacting us. Our support team will get back to you as soon as possible."}
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
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full px-4 relative z-10">
        {/* Header - PERFECTLY CENTERED */}
        <div className="text-center mb-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <HelpCircle size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Support Center</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6 text-center">
            {t('contactUs')}
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed text-center">
            {lang === 'AR' 
              ? "هل لديك استفسار أو تحتاج إلى مساعدة؟ فريقنا متواجد دائماً لخدمتك." 
              : "Have a question or need assistance? Our team is always here to help you."}
          </p>
        </div>

        {/* Form - CENTERED */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#12121a] border border-white/10 rounded-3xl p-8 shadow-2xl relative"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-5 px-5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-5 px-5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+971 50 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-5 px-5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-5 px-5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-5 px-5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#FFD700] transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#FFD700] text-black font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-[#f0d060] transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(255,215,0,0.15)]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
