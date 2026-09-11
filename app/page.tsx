import type { Metadata } from "next";
import { Navbar } from "../components/navigation/Navbar";
import { HeroBand } from "../sections/hero-band";
import { LandingEventsBand } from "../sections/landing-events";
import { AboutCollage } from "../sections/about-collage";
import { ImpactStat } from "../sections/impact-stat";
import { DiscoverTeam } from "../sections/discover-team";
import { TestimonialBand } from "../sections/testimonial-band";
import { FAQ } from "../sections/faq";
import { CTABand } from "../sections/cta-band";
import { Footer } from "../components/navigation/Footer";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} | Chiromo Campus Tech Club · University of Nairobi`,
  },
  description: SITE_CONFIG.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_CONFIG.name} — Tech Club at Chiromo, UoN`,
    description: SITE_CONFIG.description,
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroBand />
        <LandingEventsBand />
        <AboutCollage />
        <ImpactStat />
        <DiscoverTeam />
        <TestimonialBand />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
