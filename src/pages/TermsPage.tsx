import React from "react";
import { motion } from "framer-motion";
import { FileText, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ece4] pt-32 pb-24 font-['Outfit'] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFD700]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full px-4 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <FileText size={14} className="text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Legal Documentation</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6 text-center">
            Terms & Conditions
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed text-center">
            Please read these terms and conditions carefully before using the LuckyGifts platform.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#12121a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />

              <div className="prose prose-invert prose-gold max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4 mt-0">Introduction</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Welcome to Lucky Gifts. By accessing or using our website, services, campaigns, or promotional activities, you agree to comply with these Terms & Conditions. Lucky Gifts is an online platform created to provide entertainment, giveaways, reward campaigns, and promotional opportunities for users around the world.
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Lucky Gifts reserves the right to modify, update, suspend, or discontinue any part of the platform at any time without prior notice. Continued use of the platform after any modifications indicates acceptance of the updated terms.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Eligibility & User Accounts</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Users must be at least 18 years old or meet the minimum legal age required in their country or region to participate in Lucky Gifts campaigns. By registering an account, users confirm that all information provided is accurate, complete, and up to date.
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Each individual is permitted to maintain only one active account unless explicitly approved by Lucky Gifts. Duplicate accounts, fake identities, or automated registrations are strictly prohibited.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Giveaway Participation Rules</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Lucky Gifts organizes various promotional campaigns, giveaways, contests, and reward-based activities. Participation in each campaign may require users to complete specific actions, follow instructions, or meet eligibility requirements stated in the campaign details.
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Entries that contain fraudulent information, automated participation methods, spam activity, or manipulation attempts may be removed without warning. Any attempt to exploit bugs, loopholes, or technical vulnerabilities for unfair advantage may result in immediate disqualification.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Prizes & Rewards</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  All prizes, rewards, digital items, or promotional gifts offered through Lucky Gifts are subject to availability. Lucky Gifts reserves the right to replace or substitute prizes with alternatives of equal value when necessary.
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Prizes are non-transferable and may not be exchanged for cash unless specifically stated otherwise. Delivery times may vary depending on the user's location, shipping providers, customs procedures, or regional restrictions.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Conduct</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Users are expected to behave respectfully and responsibly while using the platform. Harassment, hate speech, threats, abusive language, discrimination, or harmful behavior toward other users or Lucky Gifts staff is strictly prohibited.
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Users may not upload malicious software, attempt unauthorized access, interfere with platform operations, or use automated bots or scripts. Spam, fake engagement, manipulated referrals, and fraudulent activity are also prohibited.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Intellectual Property</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  All content available on Lucky Gifts, including logos, branding, graphics, website layouts, text, promotional materials, and design elements, remains the intellectual property of Lucky Gifts or its licensors.
                </p>
                <p className="text-white/70 leading-relaxed mb-8">
                  Users may not reproduce, distribute, copy, sell, or commercially exploit any platform content without prior written permission.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Privacy & Data Protection</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Lucky Gifts values user privacy and takes reasonable measures to protect personal information. By using the platform, users consent to the collection, processing, and storage of information necessary for account management, campaign participation, security monitoring, and service improvement.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Platform Availability</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Lucky Gifts strives to maintain reliable access to its services; however, uninterrupted availability cannot be guaranteed. Technical issues, maintenance periods, internet disruptions, system upgrades, or unforeseen circumstances may temporarily affect platform access.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Security</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Users are encouraged to use strong passwords, secure devices, and updated browsers when accessing Lucky Gifts. Sharing account information with others is discouraged.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Limitation of Liability</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Lucky Gifts shall not be held responsible for indirect losses, delays, technical failures, third-party service interruptions, shipping issues, or damages resulting from platform usage beyond what is required by applicable law.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Changes to Terms</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Lucky Gifts reserves the right to update or revise these Terms & Conditions at any time. Updated versions become effective immediately after publication unless otherwise stated.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact & Support</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  Users may contact Lucky Gifts support channels for assistance, questions, or clarification regarding campaigns, accounts, rewards, or platform policies.
                </p>

                <h2 className="text-2xl font-bold text-white mb-4 mt-8">Final Agreement</h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  By continuing to access or use Lucky Gifts, you confirm that you have read, understood, and agreed to these Terms & Conditions.
                </p>
                <p className="text-white/70 leading-relaxed font-bold text-[#FFD700]">
                  Thank you for being part of Lucky Gifts.
                </p>
              </div>
            </motion.div>

            <div className="mt-12 text-center">
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
  );
}
