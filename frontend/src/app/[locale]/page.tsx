import { Metadata } from "next";
import LandingPage from "./LandingClient";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isMl = params.locale === 'ml';
  return {
    title: isMl ? "കാറ്റിൽഒഎസ് | സ്മാർട്ട് കന്നുകാലി മാനേജ്‌മെന്റ് പ്ലാറ്റ്‌ഫോം" : "CattleOS | Smart Cattle Management Platform",
    description: isMl 
      ? "ക്ഷീരകർഷകർക്കായി നിർമ്മിച്ച അത്യാധുനിക പ്ലാറ്റ്‌ഫോം. ആരോഗ്യം, പാൽ ഉൽപ്പാദനം, ഡിജിറ്റൽ പാസ്‌പോർട്ട് എന്നിവ ട്രാക്ക് ചെയ്യുക."
      : "The modern agritech SaaS for dairy farmers. Track health, milk production, and digital passports.",
    alternates: {
      canonical: `/${params.locale}`,
    },
  };
}

export default function Page() {
  return <LandingPage />;
}
