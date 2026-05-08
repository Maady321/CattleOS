import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CattleOS",
  description: "Read the terms and conditions for using the CattleOS platform, including account responsibilities, data ownership, and service usage.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="bg-ivory min-h-screen pt-32 pb-20">
      <article className="max-w-4xl mx-auto px-6 md:px-8 bg-white p-12 md:p-24 rounded-[40px] border border-black/5 shadow-premium prose prose-slate prose-lg">
        <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Terms of Service</h1>
        <p className="text-black/40 font-bold uppercase tracking-widest text-xs mb-16">Last Updated: May 8, 2026</p>
        
        <section className="space-y-8">
          <h2 className="text-2xl font-black">1. Acceptance of Terms</h2>
          <p className="text-black/60 font-medium">
            By accessing or using CattleOS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-black">2. User Accounts</h2>
          <p className="text-black/60 font-medium">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when registering.
          </p>

          <h2 className="text-2xl font-black">3. Data Ownership</h2>
          <p className="text-black/60 font-medium">
            You retain all rights and ownership to the livestock and farm data you input into CattleOS. We grant you a license to use the platform as intended by these terms.
          </p>

          <h2 className="text-2xl font-black">4. Service Usage</h2>
          <p className="text-black/60 font-medium">
            CattleOS provides tools for farm management, but final decisions regarding animal health and production remain the responsibility of the farm owner and qualified veterinary professionals.
          </p>

          <h2 className="text-2xl font-black">5. Termination</h2>
          <p className="text-black/60 font-medium">
            We reserve the right to terminate or suspend your account if you violate these terms or engage in any fraudulent activity on the platform.
          </p>

          <h2 className="text-2xl font-black">6. Governing Law</h2>
          <p className="text-black/60 font-medium">
            These terms are governed by the laws of India, specifically the jurisdiction of Kerala.
          </p>
        </section>
      </article>
    </div>
  );
}
