import { Navbar } from "../components/navigation/Navbar";
import { HeroBand } from "../sections/hero-band";
import { AboutCollage } from "../sections/about-collage";
import { ImpactStat } from "../sections/impact-stat";
import { DiscoverTeam } from "../sections/discover-team";
import { TestimonialBand } from "../sections/testimonial-band";
import { FAQ } from "../sections/faq";
import { CTABand } from "../sections/cta-band";
import { Footer } from "../components/navigation/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroBand />
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
