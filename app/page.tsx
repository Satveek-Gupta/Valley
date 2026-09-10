import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import StatsBand from "@/components/stats-band";
import EventsCarousel from "@/components/events-carousel";
import SpotlightSection from "@/components/spotlight-section";
import LeaderboardSection from "@/components/leaderboard-section";
import TimelineBento from "@/components/timeline-bento";
import SponsorsPrizes from "@/components/sponsors-prizes";
import CommunityCTA from "@/components/community-cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero />
      <StatsBand />
      <EventsCarousel />
      <SpotlightSection />
      <LeaderboardSection />
      <TimelineBento />
      <SponsorsPrizes />
      <CommunityCTA />
      <Footer />
    </main>
  );
}
