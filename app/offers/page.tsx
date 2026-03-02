import FeaturesBreakdownSection from "@/components/offers/FeaturesBreakdownSection";
import FaqSection from "@/components/offers/FaqSection";
import HowItWorksSection from "@/components/offers/HowItWorksSection";
import OffersHeroSection from "@/components/offers/OffersHeroSection";
import PricingSection from "@/components/offers/PricingSection";
import ReliabilitySection from "@/components/offers/ReliabilitySection";
import WhoItsForSection from "@/components/offers/WhoItsForSection";

function Page() {
    return (
        <main className="bg-purple-100 dark:bg-slate-950/90">
            <OffersHeroSection />
            <HowItWorksSection />
            <FeaturesBreakdownSection />
            <ReliabilitySection />
            <PricingSection />
            <WhoItsForSection />
            <FaqSection />
        </main>
    );
}

export default Page;
