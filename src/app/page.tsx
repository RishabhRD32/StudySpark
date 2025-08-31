import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Features } from "@/components/landing/features";
import { PublicSearch } from "@/components/landing/public-search";
import { FeedbackSection } from "@/components/landing/feedback";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <PublicSearch />
        <FeedbackSection />
      </main>
      <LandingFooter />
    </div>
  );
}
