import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f0ece4] pt-32 pb-24 font-['Outfit']">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      <div className="container relative z-10 max-w-4xl px-4">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.4em] mb-4 block">Legal Documentation</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-white/40 font-medium max-w-2xl mx-auto">
            Please read our privacy policy carefully to understand how we collect, use, and protect your information.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
          
          <div className="prose prose-invert prose-gold max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4 mt-0">Introduction</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              At Lucky Gifts, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how Lucky Gifts collects, uses, stores, and protects user data when accessing our website, services, campaigns, and promotional activities.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              By using Lucky Gifts, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Information We Collect</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Lucky Gifts may collect personal and non-personal information from users in order to provide services, improve platform functionality, and ensure a secure experience. The information we may collect includes:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Full name</li>
              <li>Email address</li>
              <li>Username or profile information</li>
              <li>Shipping and billing address</li>
              <li>Phone number</li>
              <li>Device information and browser type</li>
              <li>IP address and approximate location</li>
              <li>Usage activity on the platform</li>
              <li>Participation history in campaigns and giveaways</li>
              <li>Payment-related information when applicable</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              We may also collect additional information voluntarily provided by users through forms, surveys, customer support requests, or promotional activities.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">How We Use Your Information</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Lucky Gifts uses collected information for various operational and service-related purposes, including:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Creating and managing user accounts</li>
              <li>Processing giveaway entries and campaign participation</li>
              <li>Verifying user eligibility and preventing fraud</li>
              <li>Delivering prizes and rewards</li>
              <li>Improving website functionality and user experience</li>
              <li>Sending important notifications and updates</li>
              <li>Responding to customer support inquiries</li>
              <li>Monitoring platform security and preventing abuse</li>
              <li>Conducting analytics and performance measurements</li>
              <li>Complying with legal obligations and regulations</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              We may also use user information to personalize content, recommendations, or promotional opportunities.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Cookies & Tracking Technologies</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Lucky Gifts may use cookies, analytics tools, and similar tracking technologies to enhance user experience and improve platform performance. Cookies help us:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Remember user preferences</li>
              <li>Maintain secure sessions</li>
              <li>Analyze website traffic and performance</li>
              <li>Improve functionality and loading speed</li>
              <li>Understand user engagement and activity trends</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              Users may disable cookies through browser settings; however, certain features of the platform may not function correctly afterward.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Sharing of Information</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Lucky Gifts does not sell personal information to third parties. However, we may share information with trusted service providers and partners when necessary for operational purposes, including:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Payment processors</li>
              <li>Shipping and delivery providers</li>
              <li>Cloud hosting services</li>
              <li>Analytics providers</li>
              <li>Fraud prevention and security services</li>
              <li>Marketing or communication tools</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              Information may also be disclosed when required by law, legal process, government request, or to protect the rights, security, and integrity of Lucky Gifts and its users.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Data Protection & Security</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Lucky Gifts takes reasonable technical and organizational measures to protect user information against unauthorized access, misuse, loss, disclosure, or alteration. Security measures may include:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Encrypted connections</li>
              <li>Secure servers and hosting environments</li>
              <li>Access restrictions and authentication controls</li>
              <li>Fraud detection systems</li>
              <li>Security monitoring and risk prevention tools</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              Despite our efforts, no online system or electronic storage method can guarantee complete security. Users are encouraged to use strong passwords and maintain secure devices when accessing the platform.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Rights</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Depending on local laws and regulations, users may have certain rights regarding their personal information, including the right to:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Access personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of data</li>
              <li>Withdraw consent where applicable</li>
              <li>Restrict certain types of processing</li>
              <li>Request a copy of stored information</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              Users may contact Lucky Gifts support to request assistance regarding their privacy rights.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Data Retention</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Lucky Gifts may retain user information for as long as necessary to:
            </p>
            <ul className="list-disc pl-5 mb-8 text-white/70 space-y-2 marker:text-[#FFD700]">
              <li>Provide services and maintain accounts</li>
              <li>Fulfill legal and regulatory obligations</li>
              <li>Prevent fraud and abuse</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain operational and security records</li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-8">
              Certain information may remain stored temporarily even after account deletion where legally required or operationally necessary.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Third-Party Services</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts may contain links, integrations, or services provided by third parties. These external services operate under their own privacy policies and terms.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts is not responsible for the privacy practices, content, or operations of third-party platforms or websites. Users are encouraged to review external privacy policies independently.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Children’s Privacy</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts is not intended for children under the age of 18 without parental or legal guardian supervision. We do not knowingly collect personal information from minors in violation of applicable laws.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              If we become aware that personal information from a child has been collected improperly, appropriate steps may be taken to remove the information.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">International Users</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Users accessing Lucky Gifts from different countries understand that their information may be processed, transferred, or stored in locations where data protection laws may differ from those in their own jurisdiction.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              By using the platform, users consent to such transfers when necessary for operational purposes.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Changes to This Privacy Policy</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Lucky Gifts reserves the right to modify or update this Privacy Policy at any time. Updated versions become effective immediately after publication unless stated otherwise.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Users are encouraged to review this page periodically to remain informed about how their information is handled.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Information</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              For privacy-related questions, requests, or concerns, users may contact Lucky Gifts through official support channels available on the platform.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              Official communications published by Lucky Gifts take precedence over unofficial or third-party statements.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Final Notice</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              By continuing to use Lucky Gifts, users acknowledge that they have read, understood, and agreed to this Privacy Policy and the practices described within it.
            </p>
            <p className="text-white/70 leading-relaxed font-bold text-gold">
              Thank you for trusting Lucky Gifts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
