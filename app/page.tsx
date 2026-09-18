import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import ChiefGuestSpotlight from "@/components/chief-guest-spotlight";
import StatsBand from "@/components/stats-band";
import EventsCarousel from "@/components/events-carousel";
import SpotlightSection from "@/components/spotlight-section";
import TimelineBento from "@/components/timeline-bento";
import SponsorsPrizes from "@/components/sponsors-prizes";
import CommunityCTA from "@/components/community-cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero />
      <ChiefGuestSpotlight />
      <StatsBand />
      <EventsCarousel />
      <SpotlightSection />
      <TimelineBento />
      <SponsorsPrizes />
      <CommunityCTA />
      <Footer />
    </main>
  );
}
