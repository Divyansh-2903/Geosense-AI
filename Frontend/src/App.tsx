/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CropHealthDashboard from "./components/CropHealthDashboard";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

const DashboardApp = lazy(() => import("../prodash-builder/src/App"));

const DashboardFallback = () => (
  <div className="min-h-screen bg-brand-bg text-brand-forest flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-brand-forest border-t-transparent animate-spin" />
      <span className="text-xs font-bold tracking-widest font-mono">LOADING FARM SYSTEM...</span>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigateToDashboard = () => {
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        {view === 'dashboard' ? (
          <Suspense fallback={<DashboardFallback />}>
            <DashboardApp onBackToLanding={handleBackToLanding} />
          </Suspense>
        ) : (
          <div className="bg-background text-on-background font-body-md antialiased overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col">
            {/* Navbar overlay */}
            <Navbar onScrollTo={handleScrollTo} onNavigateToDashboard={handleNavigateToDashboard} />

            {/* Main Page Chapters */}
            <main className="flex-grow">
              {/* Hero constellation area */}
              <Hero onScrollTo={handleScrollTo} />

              {/* Feature Bento grids */}
              <Features />

              {/* Dynamic Crop health index & checklist dashboards */}
              <CropHealthDashboard />

              {/* Flexible simple pricing packages */}
              <Pricing />

              {/* Common questions and accordions */}
              <FAQ onScrollTo={handleScrollTo} />
            </main>

            {/* Visual device previews & links footer */}
            <Footer onScrollTo={handleScrollTo} />
          </div>
        )}
      </AuthProvider>
    </LanguageProvider>
  );
}
