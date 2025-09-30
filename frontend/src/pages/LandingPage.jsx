import React from "react";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/sections/Hero";
import Footer from "../components/layout/Footer";
import HowItWorks from "../components/home/sections/HowItWorks";
import BadgesPoints from "../components/home/sections/Badges";
import CTASection from "../components/home/sections/CTASection";
import RoleSelection from "../components/home/sections/RoleSelection";
import WhyChoose from "../components/home/sections/WhyChoose";

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
