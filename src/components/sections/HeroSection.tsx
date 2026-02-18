import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '@/components/ui/AnimatedText';
import MagneticButton from '@/components/ui/MagneticButton';
import { useProfile } from '@/contexts/ProfileContext';
import FallingParticles from '@/components/particles/FallingParticles';
import sakuraPetal from '@/assets/sakura-petal.png';
import mapleLeaf from '@/assets/maple-leaf.png';
import sakuraBranch from '@/assets/sakura-branch.png';

function TypewriterText({ roles }: { roles: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setDisplayText('');
    setIsDeleting(false);
  }, [roles]);

  useEffect(() => {
    const currentRole = roles[currentIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentRole.length) {
            setDisplayText(currentRole.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % roles.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, roles]);

  return (
    <span className="font-mono text-primary">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
      />
    </span>
  );
}

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { profile, mode, toggleMode } = useProfile();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const nameParts = profile.heroTitle?.split(' ') ?? ['Rishikesh', 'R'];
  const isBackend = mode === 'backend';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Layer 1: Background gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {isBackend ? (
            /* Sakura morning sky */
            <div className="absolute inset-0 bg-gradient-to-b from-[#c9e6f0] via-[#e8d5e0] to-[#f5e6d3]" />
          ) : (
            /* Red moon night */
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0008] via-[#140010] to-[#0d0000]" />
              {/* Red moon glow */}
              <div
                className="absolute top-[10%] right-[15%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsla(0,80%,40%,0.4) 0%, hsla(0,80%,30%,0.15) 40%, transparent 70%)',
                }}
              />
              <div
                className="absolute top-[12%] right-[17%] w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsla(0,70%,50%,0.7) 0%, hsla(0,80%,35%,0.3) 60%, transparent 100%)',
                  boxShadow: '0 0 80px hsla(0,80%,40%,0.5), 0 0 160px hsla(0,70%,30%,0.3)',
                }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Sakura branch or ambient mist */}
      <AnimatePresence mode="wait">
        {isBackend ? (
          <motion.div
            key="sakura-branch"
            className="absolute top-0 right-0 z-[5] pointer-events-none"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 0.7, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 1.5 }}
          >
            <img
              src={sakuraBranch}
              alt=""
              className="w-[280px] md:w-[400px] lg:w-[500px] h-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="night-mist"
            className="absolute inset-0 z-[5] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Atmospheric fog/mist layers */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#0a0008]/80 to-transparent" />
            <div className="absolute top-[30%] left-[10%] w-[500px] h-[200px] bg-[hsla(0,60%,20%,0.05)] rounded-full blur-[100px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 3: Falling particles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`particles-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <FallingParticles
            imageSrc={isBackend ? sakuraPetal : mapleLeaf}
            count={22}
            blendMode={isBackend ? 'multiply' : 'screen'}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient fade to background color at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[15] pointer-events-none" />

      {/* Layer 4: Hero content */}
      <div className="relative z-20 section-container text-center">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              key={profile.heroSubtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Pre-title */}
              <motion.p
                key={profile.heroSubtitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`font-mono text-sm md:text-base mb-6 tracking-widest uppercase ${
                  isBackend ? 'text-[#8b5a6b]' : 'text-primary'
                }`}
              >
                {profile.heroSubtitle}
              </motion.p>

              {/* Main name */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 tracking-tight">
                <motion.span
                  key={profile.heroTitle}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className={isBackend ? 'text-[#4a3040]' : 'gradient-text'}
                >
                  {nameParts[0]}
                </motion.span>
                <span className={isBackend ? 'text-[#6b4f5e]' : 'text-foreground'}> </span>
                <motion.span
                  key={profile.heroTitle + '-last'}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={isBackend ? 'text-[#6b4f5e]' : 'text-foreground'}
                >
                  {nameParts[1]}
                </motion.span>
              </h1>

              {/* Subtitle with typewriter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mb-12 flex flex-col items-center gap-3"
              >
                <div className={`text-xl md:text-2xl lg:text-3xl ${
                  isBackend ? 'text-[#7a5a6a]' : 'text-muted-foreground'
                }`}>
                  <TypewriterText roles={profile.roles} />
                </div>

                <motion.button
                  onClick={toggleMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                    isBackend
                      ? 'text-[#8b5a6b]/60 hover:text-[#8b5a6b]'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {mode === 'backend'
                    ? 'Switch to Security Profile'
                    : 'Switch to Backend Profile'}
                </motion.button>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <MagneticButton
                  variant="primary"
                  size="lg"
                  onClick={() => scrollToSection('projects')}
                >
                  View My Work
                </MagneticButton>
                <MagneticButton
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('contact')}
                >
                  Get in Touch
                </MagneticButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection('about')}
        >
          <span className={`text-xs font-mono uppercase tracking-widest ${
            isBackend ? 'text-[#8b5a6b]/60' : 'text-muted-foreground'
          }`}>
            Scroll
          </span>
          <div className="scroll-indicator" />
        </motion.div>
      </motion.div>
    </section>
  );
}
