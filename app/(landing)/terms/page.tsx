import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | TaxComPro",
  description: "Read the Terms of Service governing your use of the TaxComPro platform.",
};

export default function TermsPage() {
  const sections = [
    { title: "1. Acceptance of Terms", body: `By accessing or using TaxComPro ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform. These Terms apply to all visitors, users, and others who access or use the Platform.` },
    { title: "2. Description of Services", body: `TaxComPro provides an online professional community platform for tax professionals and taxpayers, including a marketplace for professional services, Pro Hub communities, Atlas AI tax assistance, messaging, courses, and other features. Services are provided "as is" and may change over time.` },
    { title: "3. User Accounts", body: `You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.` },
    { title: "4. Professional Disclaimer", body: `TaxComPro is a community and marketplace platform. Content provided by users, professionals, or Atlas AI does not constitute legal, financial, or tax advice. Always consult a licensed tax professional for advice specific to your situation. TaxComPro is not responsible for actions taken based on platform content.` },
    { title: "5. Marketplace & Payments", body: `Marketplace transactions are between buyers and sellers. TaxComPro facilitates payments via Stripe but is not a party to the transaction. Sellers are solely responsible for services delivered. Subscription billing is recurring and can be cancelled at any time. Refund policies are handled case-by-case.` },
    { title: "6. Prohibited Conduct", body: `You may not: (a) use the Platform for unlawful purposes; (b) impersonate others or misrepresent credentials; (c) upload harmful, fraudulent, or misleading content; (d) attempt to gain unauthorized access to systems; (e) scrape or harvest data without permission; (f) violate any applicable laws or regulations.` },
    { title: "7. Intellectual Property", body: `All Platform content, branding, and software are owned by TaxComPro or its licensors. User-generated content remains your property, but you grant TaxComPro a non-exclusive, worldwide license to display and distribute it within the Platform. You may not reproduce Platform materials without written permission.` },
    { title: "8. Limitation of Liability", body: `To the maximum extent permitted by law, TaxComPro shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.` },
    { title: "9. Termination", body: `We reserve the right to suspend or terminate your account at any time for violations of these Terms, at our sole discretion. Upon termination, your right to use the Platform ceases immediately. Provisions that by nature should survive termination will do so.` },
    { title: "10. Changes to Terms", body: `We may update these Terms from time to time. We will notify you of material changes via email or platform notification. Continued use after changes constitutes acceptance. If you disagree with updated Terms, please discontinue use and contact us.` },
    { title: "11. Governing Law", body: `These Terms are governed by the laws of the United States and the State of Delaware, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Delaware, and you consent to personal jurisdiction in those courts.` },
    { title: "12. Contact", body: `For questions about these Terms, please contact us at: legal@taxcompro.com` },
  ];

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[#0a1628] pt-24 pb-16 px-6 text-center">
        <p className="text-[#d4a017] font-bold text-sm uppercase tracking-widest mb-4">Legal</p>
        <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
        <p className="text-white/50 text-sm">Effective date: January 1, 2025</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        {sections.map(s => (
          <div key={s.title}>
            <h2 className="text-lg font-black text-[#0a1628] mb-3">{s.title}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-8 text-center text-slate-400 text-xs">
          Last updated: January 2025 · <a href="mailto:legal@taxcompro.com" className="hover:text-[#0a1628] transition-colors">legal@taxcompro.com</a>
        </div>
      </section>
    </main>
  );
}
