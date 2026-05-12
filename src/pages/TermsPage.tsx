import React from "react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f0ece4] pt-32 pb-24 font-['Outfit']">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <div className="container relative z-10 max-w-4xl px-4">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Legal Documentation</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">Terms & Conditions</h1>
          <p className="text-white/40 font-medium max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using the LuckyGifts platform.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
          
          <div className="prose prose-invert prose-gold max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4 mt-0">Introduction</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Welcome to Lucky Gifts. By accessing or using our website, services, campaigns, or promotional activities, you agree to comply with these Terms & Conditions. Lucky Gifts is an online platform created to provide entertainment, giveaways, reward campaigns, and promotional opportunities for users around the world. These terms are intended to ensure a fair, secure, and transparent experience for all participants.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts reserves the right to modify, update, suspend, or discontinue any part of the platform at any time without prior notice. Continued use of the platform after any modifications indicates acceptance of the updated terms.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Eligibility & User Accounts</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Users must be at least 18 years old or meet the minimum legal age required in their country or region to participate in Lucky Gifts campaigns. By registering an account, users confirm that all information provided is accurate, complete, and up to date. Providing false or misleading information may result in account suspension or permanent removal from the platform.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Each individual is permitted to maintain only one active account unless explicitly approved by Lucky Gifts. Duplicate accounts, fake identities, or automated registrations are strictly prohibited. Lucky Gifts reserves the right to verify user identity through documentation or additional verification procedures whenever necessary.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users are responsible for maintaining the confidentiality of their account credentials. Sharing passwords or allowing unauthorized access to accounts is not permitted. Any activity performed through a registered account will be considered the responsibility of the account owner.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Giveaway Participation Rules</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts organizes various promotional campaigns, giveaways, contests, and reward-based activities. Participation in each campaign may require users to complete specific actions, follow instructions, or meet eligibility requirements stated in the campaign details.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Some giveaways may be based on random selection, while others may involve user engagement, creativity, referrals, or skill-based participation. Lucky Gifts reserves the right to determine the winner selection process for each campaign.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Entries that contain fraudulent information, automated participation methods, spam activity, or manipulation attempts may be removed without warning. Any attempt to exploit bugs, loopholes, or technical vulnerabilities for unfair advantage may result in immediate disqualification and possible account termination.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Winners are typically notified through email, social media, or the communication methods associated with their accounts. If a selected winner fails to respond within the required timeframe, Lucky Gifts may choose another winner.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Prizes & Rewards</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              All prizes, rewards, digital items, or promotional gifts offered through Lucky Gifts are subject to availability. Lucky Gifts reserves the right to replace or substitute prizes with alternatives of equal value when necessary.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Prizes are non-transferable and may not be exchanged for cash unless specifically stated otherwise. Delivery times may vary depending on the user's location, shipping providers, customs procedures, or regional restrictions.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users are responsible for providing accurate shipping information. Lucky Gifts is not responsible for failed deliveries caused by incorrect addresses or incomplete user details. Winners may also be responsible for customs fees, import taxes, or other local charges depending on their country’s regulations.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Digital rewards may be delivered electronically and may require valid contact information to receive them successfully.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Conduct</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Users are expected to behave respectfully and responsibly while using the platform. Harassment, hate speech, threats, abusive language, discrimination, or harmful behavior toward other users or Lucky Gifts staff is strictly prohibited.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users may not upload malicious software, attempt unauthorized access, interfere with platform operations, or use automated bots or scripts. Spam, fake engagement, manipulated referrals, and fraudulent activity are also prohibited.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts reserves the right to suspend or permanently ban accounts involved in activities that violate community standards or threaten the integrity of the platform.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Intellectual Property</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              All content available on Lucky Gifts, including logos, branding, graphics, website layouts, text, promotional materials, and design elements, remains the intellectual property of Lucky Gifts or its licensors.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users may not reproduce, distribute, copy, sell, or commercially exploit any platform content without prior written permission. Unauthorized use of Lucky Gifts branding or the creation of fake pages impersonating the platform is strictly prohibited.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users retain ownership of content they submit to the platform but grant Lucky Gifts the right to display, use, reproduce, and promote such content in connection with platform operations and promotional activities.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Privacy & Data Protection</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts values user privacy and takes reasonable measures to protect personal information. By using the platform, users consent to the collection, processing, and storage of information necessary for account management, campaign participation, security monitoring, and service improvement.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              The platform may use cookies, analytics tools, and tracking technologies to improve functionality and user experience. Users may disable cookies through browser settings, though some features may not function properly afterward.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts may store certain information for security, legal compliance, fraud prevention, or operational purposes. User information will not be sold unlawfully to third parties.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Platform Availability</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts strives to maintain reliable access to its services; however, uninterrupted availability cannot be guaranteed. Technical issues, maintenance periods, internet disruptions, system upgrades, or unforeseen circumstances may temporarily affect platform access.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts reserves the right to modify, pause, restrict, or discontinue any features, campaigns, or services without prior notice. The platform is provided on an “as is” and “as available” basis.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users acknowledge that online services may occasionally experience bugs, errors, delays, or technical interruptions.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Security</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Users are encouraged to use strong passwords, secure devices, and updated browsers when accessing Lucky Gifts. Sharing account information with others is discouraged.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts may implement additional verification procedures, fraud detection systems, or security monitoring tools to protect the platform and its users. Suspicious activities may trigger temporary restrictions or account reviews.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users should report phishing attempts, fake giveaway pages, or suspicious communications claiming to represent Lucky Gifts.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts shall not be held responsible for indirect losses, delays, technical failures, third-party service interruptions, shipping issues, or damages resulting from platform usage beyond what is required by applicable law.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Participation in giveaways and promotional activities is voluntary and conducted at the user’s own discretion. Certain jurisdictions may not allow some liability limitations, therefore some exclusions may not apply to all users.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Changes to Terms</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts reserves the right to update or revise these Terms & Conditions at any time. Updated versions become effective immediately after publication unless otherwise stated.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users are encouraged to review these terms periodically to remain informed about their rights and responsibilities while using the platform.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact & Support</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Users may contact Lucky Gifts support channels for assistance, questions, or clarification regarding campaigns, accounts, rewards, or platform policies. Response times may vary depending on support availability and operational conditions.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Official announcements and updates published by Lucky Gifts take precedence over unofficial statements or third-party information.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Final Agreement</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              By continuing to access or use Lucky Gifts, you confirm that you have read, understood, and agreed to these Terms & Conditions. These terms represent the complete agreement between Lucky Gifts and its users regarding platform usage, participation rules, and community standards.
            </p>
            <p className="text-white/70 leading-relaxed font-bold text-gold">
              Thank you for being part of Lucky Gifts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
