import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Stats } from '../components/Stats';
import { ApplicationGrid } from '../components/ApplicationGrid';
import { ApplicationSearch } from '../components/ApplicationSearch';
import { Testimonials } from '../components/Testimonials';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { AnimatedGridBackground } from '../components/AnimatedGridBackground';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <AnimatedGridBackground />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
        <Features />
        <ApplicationSearch />
        <ApplicationGrid />
        <Testimonials />
        <CTA />
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

