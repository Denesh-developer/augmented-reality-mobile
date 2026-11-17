import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Features } from '../components/Features';
import { GestureGuide } from '../components/GestureGuide';
import { SupportedPhones } from '../components/SupportedPhones';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
export const LandingPage = () => {
    return (<div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Features />
        <GestureGuide />
        <SupportedPhones />
        <FinalCTA />
      </main>
      <Footer />
    </div>);
};
