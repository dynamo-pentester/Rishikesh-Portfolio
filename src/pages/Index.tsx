import { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import FallingParticles from '@/components/particles/FallingParticles';
import { useProfile } from '@/contexts/ProfileContext';
import sakuraPetal from '@/assets/sakura-petal.png';
import mapleLeaf from '@/assets/maple-leaf.png';

const AboutSection = lazy(() => import('@/components/sections/AboutSection'));
const SkillsSection = lazy(() => import('@/components/sections/SkillsSection'));
const ProjectsSection = lazy(() => import('@/components/sections/ProjectsSection'));
const ExperienceSection = lazy(() => import('@/components/sections/ExperienceSection'));
const CertificatesSection = lazy(() => import('@/components/sections/CertificatesSection'));
const CTFSection = lazy(() => import('@/components/sections/CTFSection'));
const ContactSection = lazy(() => import('@/components/sections/ContactSection'));

function SectionLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const Index = () => {
  const { mode } = useProfile();
  const isBackend = mode === 'backend';

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />
      <div className="noise-overlay" />

      {/* Global falling particles across entire page */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`global-particles-${mode}`}
          className="fixed inset-0 z-[5] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <FallingParticles
            imageSrc={isBackend ? sakuraPetal : mapleLeaf}
            count={30}
            blendMode={isBackend ? 'multiply' : 'screen'}
          />
        </motion.div>
      </AnimatePresence>

      <Navigation />

      <main>
        <HeroSection />
        <Suspense fallback={<SectionLoader />}><AboutSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><SkillsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ProjectsSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ExperienceSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CertificatesSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><CTFSection /></Suspense>
        <Suspense fallback={<SectionLoader />}><ContactSection /></Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
