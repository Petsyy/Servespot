import React from "react";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import Footer from "../components/layout/Footer";
import HowItWorks from "../components/sections/HowItWorks";
import BadgesPoints from "../components/sections/Badges";
import CTASection from "../components/sections/CTASection";
import RoleSelection from "../components/sections/RoleSelection";
import WhyChoose from "../components/sections/WhyChoose";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <RoleSelection />
      <HowItWorks />
      <WhyChoose />
      <BadgesPoints />
      <CTASection />
      <Footer />
    </div>
  );
}
