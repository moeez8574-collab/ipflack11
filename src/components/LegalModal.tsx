import React from "react";
import { X, Shield, FileText, Scale, Info, HelpCircle, Mail, MapPin, Building, Globe } from "lucide-react";

interface LegalModalProps {
  pageId: string;
  onClose: () => void;
}

export default function LegalModal({ pageId, onClose }: LegalModalProps) {
  const getPageContent = () => {
    switch (pageId) {
      case "about":
        return {
          title: "About IPFLACK",
          icon: <Building className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <p>
                <strong>IPFLACK</strong> is a premier, full-suite fintech and link infrastructure platform built specifically for modern creators, influencers, and digital publishers. We empower creators to maximize their affiliate marketing earnings through advanced tracking, dynamic multi-affiliate routing, and instantaneous transparent payouts.
              </p>
              <h4 className="text-white font-bold text-sm mt-4">Our Vision</h4>
              <p>
                To provide creators with the structural financial integrity and tools they need to treat their content as a scalable business. We bypass complex affiliate setups and bring direct, premium merchant access directly to your dashboard.
              </p>
              <h4 className="text-white font-bold text-sm mt-4">The IPFLACK Advantage</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>No-Code Link Shortening</strong>: Turn messy affiliate URLs into crisp, trusted, conversion-optimized links.</li>
                <li><strong>Multi-Affiliate Commission Engine</strong>: Automatic matching of clicks with top global networks (Amazon, Walmart, Target, etc.).</li>
                <li><strong>Fair Split Policy</strong>: Transparent 60/40 revenue division directly on actual network commission received, never computed on arbitrary product prices.</li>
                <li><strong>Fintech Withdrawal</strong>: Seamless cashout directly into verified localized channels.</li>
              </ul>
            </div>
          )
        };
      case "contact":
        return {
          title: "Contact Us",
          icon: <Mail className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <p>
                Have questions about your earnings, integration setups, or customized merchant rules? Our support and partnership teams are ready to assist you.
              </p>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold">General Support</span>
                    <a href="mailto:support@ipflack.online" className="text-indigo-400 font-mono hover:underline">support@ipflack.online</a>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-4 italic">
                Typical response time for verified creator accounts is under 12 hours.
              </p>
            </div>
          )
        };
      case "privacy":
        return {
          title: "Privacy Policy",
          icon: <Shield className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
              <p className="text-[11px] text-gray-400 font-mono">Last Updated: July 17, 2026</p>
              <p>
                At IPFLACK, we take your privacy and the security of your analytical datasets seriously. This Privacy Policy describes how we collect, process, and safeguard data when you use our platform, including our shortening links.
              </p>
              <h4 className="text-white font-bold text-sm">1. Information We Collect</h4>
              <p>
                <strong>Creator Data</strong>: Email addresses, hashed credentials, billing channels (e.g. Easypaisa, Bank details), and voluntary profile information.
              </p>
              <p>
                <strong>Visitor Click Data</strong>: When visitors click on an IPFLACK short link, we collect non-identifiable parameters including referrer networks, geolocation country codes, operating systems, and timestamp data solely for analytics rendering.
              </p>
              <h4 className="text-white font-bold text-sm">2. Use of Information</h4>
              <p>
                We do not sell user or visitor tracking databases. Information is processed strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Generate and short link routing targets.</li>
                <li>Calculate revenue share splits and creator wallets ledger.</li>
                <li>Identify and prevent click-fraud or bot abuse.</li>
              </ul>
              <h4 className="text-white font-bold text-sm">3. Direct Data Storage</h4>
              <p>
                All databases and transaction logs are stored securely behind enterprise firewalls with high-grade transport layer encryption (TLS).
              </p>
            </div>
          )
        };
      case "terms":
        return {
          title: "Terms of Service",
          icon: <Scale className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
              <p className="text-[11px] text-gray-400 font-mono">Last Updated: July 17, 2026</p>
              <p>
                Welcome to IPFLACK. By registering an account or utilizing our shortening links infrastructure, you agree to comply with the following Terms of Service.
              </p>
              <h4 className="text-white font-bold text-sm">1. Creator Account Obligations</h4>
              <p>
                You must provide accurate verification credentials. You are responsible for keeping your API tokens and authentication credentials fully secure. Any traffic originating from your shortened links is your sole responsibility.
              </p>
              <h4 className="text-white font-bold text-sm">2. Acceptable Link Usage</h4>
              <p>
                Creators are strictly forbidden from utilizing IPFLACK links for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-red-300">
                <li>Spam, malware distribution, or adult content redirect gates.</li>
                <li>Artificially inflating click totals using bots or click-farms.</li>
                <li>Deceptive URL masking violating affiliate network policies.</li>
              </ul>
              <h4 className="text-white font-bold text-sm">3. Financial Distributions & Splits</h4>
              <p>
                Earnings are processed dynamically in accordance with our 60/40 platform split. Payouts require manual verification of confirmed affiliate network receipts. IPFLACK reserves the right to hold payouts in case of program reversals or audit anomalies.
              </p>
            </div>
          )
        };
      case "disclosure":
        return {
          title: "Affiliate Disclosure",
          icon: <Info className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <p>
                In compliance with the FTC and global consumer protection guidelines, IPFLACK provides this comprehensive Affiliate Disclosure.
              </p>
              <p>
                IPFLACK short links and redirect systems are built explicitly to convert standard commerce URLs into affiliate URLs containing tracking parameters (e.g., Amazon Associates tag <code>muhammadis0ff-20</code> or Walmart Impact links).
              </p>
              <p>
                When a visitor clicks on an IPFLACK short link and completes a transaction at the final destination merchant (such as Amazon, Walmart, or Target), the platform and the creator receive a small affiliate commission at absolutely zero additional cost to the buyer.
              </p>
              <p className="text-indigo-400 font-semibold bg-white/5 p-3 rounded-lg">
                Important: Creators utilizing IPFLACK links are highly encouraged to append their own clear disclosures (e.g. "#Ad", "#Affiliate") on social media channels to maintain complete trust with their audience.
              </p>
            </div>
          )
        };
      case "cookies":
        return {
          title: "Cookie Policy",
          icon: <FileText className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <p className="text-[11px] text-gray-400 font-mono">Last Updated: July 17, 2026</p>
              <p>
                We use cookies and comparable local storage structures to deliver a lightning-fast and individualized experience on IPFLACK.
              </p>
              <h4 className="text-white font-bold text-sm">What Cookies Do We Set?</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Authentication Cookies</strong>: Keeps you securely logged into your creator dashboard session.</li>
                <li><strong>Routing Cookies</strong>: Temporarily matches short code redirects to avoid circular loops.</li>
                <li><strong>Analytics Cookies</strong>: Aggregates anonymous traffic sources and referrer networks.</li>
              </ul>
              <p>
                You can configure your browser to block cookies, but doing so will prevent you from logging into your secure IPFLACK creator console.
              </p>
            </div>
          )
        };
      case "disclaimer":
        return {
          title: "Legal Disclaimer",
          icon: <HelpCircle className="w-5 h-5 text-indigo-400" />,
          content: (
            <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
              <p>
                <strong>No Financial Advice</strong>: All financial calculations, analytics charts, historical commission rates, and prospective payout estimates displayed inside the IPFLACK console or sandbox simulator are for informational and educational purposes only. They do not constitute guaranteed future earnings.
              </p>
              <p>
                <strong>Third-Party Merchants</strong>: IPFLACK is an independent link shortener platform. We are not legally affiliated with, endorsed by, or partners with Amazon, Walmart, Target, eBay, or other merchants except as participants in their respective public affiliate marketing programs.
              </p>
              <p>
                <strong>Liability</strong>: IPFLACK is provided "as is" and shall not be liable for any temporary network downtime, commission tracking discrepancies caused by cookies blocked on client browsers, or affiliate program closures.
              </p>
            </div>
          )
        };
      default:
        return {
          title: "Legal Information",
          icon: <FileText className="w-5 h-5 text-indigo-400" />,
          content: <p>Information not found.</p>
        };
    }
  };

  const { title, icon, content } = getPageContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel bg-gray-950/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
