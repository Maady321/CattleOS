import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CattleOS",
  description: "Learn how CattleOS protects your farm data, cattle records, and personal information with enterprise-grade security.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-ivory min-h-screen pt-32 pb-20">
      <article className="max-w-4xl mx-auto px-6 md:px-8 bg-white p-12 md:p-24 rounded-[40px] border border-black/5 shadow-premium prose prose-slate prose-lg">
        <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Privacy Policy</h1>
        <p className="text-black/40 font-bold uppercase tracking-widest text-xs mb-16">Last Updated: May 8, 2026</p>
        
        <section className="space-y-8">
          <h2 className="text-2xl font-black">1. Introduction</h2>
          <p className="text-black/60 font-medium">
            CattleOS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by CattleOS.
          </p>

          <h2 className="text-2xl font-black">2. Information We Collect</h2>
          <p className="text-black/60 font-medium">
            We collect information that you provide directly to us when you create an account, register your cattle, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-6 text-black/60 font-medium space-y-4">
            <li>Account Information: Name, email, phone number, and farm location.</li>
            <li>Livestock Data: Cattle profiles, health records, milk production logs, and breeding history.</li>
            <li>Usage Data: Information about how you use the CattleOS platform.</li>
          </ul>

          <h2 className="text-2xl font-black">3. How We Use Your Information</h2>
          <p className="text-black/60 font-medium">
            We use the information we collect to provide, maintain, and improve our services, including:
          </p>
          <ul className="list-disc pl-6 text-black/60 font-medium space-y-4">
            <li>Generating digital cattle passports and QR profiles.</li>
            <li>Providing milk production analytics and AI health insights.</li>
            <li>Sending vaccination and health reminders.</li>
            <li>Facilitating secure farm management across devices.</li>
          </ul>

          <h2 className="text-2xl font-black">4. Data Security</h2>
          <p className="text-black/60 font-medium">
            We implement enterprise-grade security measures (AES-256 encryption) to protect your data. Your cattle records are stored on secure cloud servers with restricted access.
          </p>

          <h2 className="text-2xl font-black">5. Contact Us</h2>
          <p className="text-black/60 font-medium">
            If you have any questions about this Privacy Policy, please contact us at privacy@cattleos.com.
          </p>
        </section>
      </article>
    </div>
  );
}
