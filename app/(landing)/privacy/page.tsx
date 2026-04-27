import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | TaxComPro",
  description: "Learn how TaxComPro collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const sections = [
    { title: "1. Information We Collect", body: `We collect information you provide directly (name, email, professional credentials, payment info), information generated through use of the Platform (messages, posts, activity logs), and technical data (IP address, browser type, device identifiers, cookies). We do not sell your personal data.` },
    { title: "2. How We Use Your Information", body: `We use your data to: provide and improve our services; process payments securely via Stripe; send service-related notifications; personalize your experience; enforce our Terms of Service; comply with legal obligations; and communicate about your account. We do not use your data for third-party advertising.` },
    { title: "3. Data Sharing", body: `We share data only with: (a) service providers under strict confidentiality agreements (e.g. Stripe for payments, Vercel for hosting); (b) other users only as necessary for platform features (e.g., your public profile); (c) law enforcement when legally required. We never sell personal data to third parties.` },
    { title: "4. Cookies & Tracking", body: `We use essential cookies for authentication and security, and analytics cookies to improve platform performance. You can manage cookie preferences via your browser settings. Disabling essential cookies may affect platform functionality. See our Cookie Policy for full details.` },
    { title: "5. Data Security", body: `We implement industry-standard security including TLS encryption, hashed passwords, access controls, and regular security audits. However, no system is 100% secure. You are responsible for keeping your account credentials confidential. Notify us immediately of any suspected breach.` },
    { title: "6. Data Retention", body: `We retain your account data for as long as your account is active. After account deletion, we may retain certain data for up to 90 days for legal and audit purposes, and anonymized analytics data indefinitely. Financial transaction records are retained as required by law (typically 7 years).` },
    { title: "7. Your Rights", body: `Depending on your location, you may have rights to: access your personal data; correct inaccurate data; request deletion; restrict processing; data portability; and withdraw consent. To exercise rights, contact privacy@taxcompro.com. We will respond within 30 days.` },
    { title: "8. Children's Privacy", body: `TaxComPro is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has provided us data, please contact us immediately and we will delete it promptly.` },
    { title: "9. Third-Party Links", body: `The Platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies before providing any personal information.` },
    { title: "10. Changes to This Policy", body: `We may update this Privacy Policy periodically. We will notify you of material changes via email or an in-platform notice. Continued use after changes constitutes acceptance. The effective date at the top reflects the latest revision.` },
    { title: "11. Contact Us", body: `For privacy-related questions or requests, contact: privacy@taxcompro.com. For general support: support@taxcompro.com.` },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#0a1628] pt-24 pb-16 px-6 text-center">
        <p className="text-[#d4a017] font-bold text-sm uppercase tracking-widest mb-4">Legal</p>
        <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
        <p className="text-white/50 text-sm">Effective date: January 1, 2025</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
          <strong>Summary:</strong> We collect only what we need, never sell your data, protect it with industry-standard security, and give you full control over your information.
        </div>
        {sections.map(s => (
          <div key={s.title}>
            <h2 className="text-lg font-black text-[#0a1628] mb-3">{s.title}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-8 text-center text-slate-400 text-xs">
          Last updated: January 2025 · <a href="mailto:privacy@taxcompro.com" className="hover:text-[#0a1628] transition-colors">privacy@taxcompro.com</a>
        </div>
      </section>
    </main>
  );
}
