import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { IdentityStrip } from '../components/home/IdentityStrip';
import { AboutSection } from '../components/home/AboutSection';
import { VisionSection } from '../components/home/VisionSection';
import { EventsPreview } from '../components/home/EventsPreview';
import { MovementCTA } from '../components/home/MovementCTA';
import { Newsletter } from '../components/home/Newsletter';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero is full-screen and handles its own top padding */}
        <Hero />
        <IdentityStrip />
        <AboutSection />
        <VisionSection />
        <EventsPreview />
        <MovementCTA />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};
