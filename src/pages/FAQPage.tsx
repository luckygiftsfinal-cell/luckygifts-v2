import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Mail } from "lucide-react";
import SEO from "../components/SEO";

const FAQ_ITEMS = [
  { q: "How do I enter a draw?", a: "Simply purchase any product from our Dream Store and you'll automatically receive complimentary tickets for the associated prize draw." },
  { q: "When are the winners announced?", a: "Winners are announced during our Live Draws, which are broadcasted on our social channels. The date for each draw is shown on the prize card." },
  { q: "Is the payment secure?", a: "Yes, we use bank-level 256-bit encryption and are fully PCI-DSS compliant. Your payment information is 100% secure." },
  { q: "How will I know if I won?", a: "If your ticket is drawn, we will contact you immediately via phone and email using the details provided during checkout." },
  { q: "Can I enter from outside the UAE?", a: "Yes! LuckyGifts is a global platform and we ship luxury prizes worldwide." }
];

function FAQAccordion({ items }: { items: typeof FAQ_ITEMS }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-0">
      <SEO
        title="FAQ — Frequently Asked Questions"
        description="Find answers to all your questions about LuckyGifts. Learn about draws, tickets, shipping, payments and more."
        url="/faq"
        keywords="LuckyGifts FAQ, prize draw questions, how to enter draw UAE"
      />
      {items.map((item, i) => (
        <div 
          key={i} 
          className="border-b border-white/10"
        >
          <button 
            onClick={() => setOpen(open === i ? null : i)} 
            className="w-full py-6 flex items-center justify-between gap-4 text-left group"
          >
            <span className="font-bold text-white text-base md:text-lg">{item.q}</span>
            <ChevronDown 
              size={20} 
              className={`text-[#FFD700] shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} 
            />
          </button>
          <motion.div
            initial={false}
            animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-white/60 text-sm md:text-base leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ece4] font-['Outfit'] pt-32 pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full px-4 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <HelpCircle size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Help Center</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6 text-center">
            FAQ
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed text-center">
            Find answers to the most common questions about LuckyGifts.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#12121a] border border-white/10 rounded-3xl p-8 md:p-10"
            >
              <FAQAccordion items={FAQ_ITEMS} />
            </motion.div>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-3xl p-8 md:p-10">
                <p className="text-white font-bold text-lg mb-4">Still have questions?</p>
                <p className="text-white/40 text-sm mb-6">
                  Our support team is ready to help you with any inquiries.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD700] text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-[#f0d060] transition-colors"
                >
                  <Mail size={18} />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
