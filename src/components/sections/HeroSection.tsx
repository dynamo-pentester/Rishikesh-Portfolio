import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '@/components/ui/MagneticButton';
import { useProfile } from '@/contexts/ProfileContext';
import sakuraBranch from '@/assets/sakura-branch.png';

/* ── Typewriter ─────────────────────────────────────────── */
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

/* ── Backend: Sakura morning bg ─────────────────────────── */
function BackendBackground() {
  return (
    <>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #fff6fb, #ffeef5, #f8e8f0)',
        }}
      />
      {/* Soft sun circle */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          width: 'clamp(220px, 30vw, 420px)',
          height: 'clamp(220px, 30vw, 420px)',
          right: 'clamp(5%, 12%, 15%)',
          top: '18%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,100,150,0.35) 0%, rgba(255,150,180,0.15) 50%, transparent 75%)',
          filter: 'blur(1px)',
          opacity: 0.8,
        }}
      />
      {/* Sakura branch — desktop right, scaled mobile */}
      <motion.img
        src={sakuraBranch}
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          bottom: '-10%',
          right: '-5%',
          height: 'clamp(40vh, 65vh, 85vh)',
          width: 'auto',
          opacity: 0.82,
          mixBlendMode: 'multiply',
        }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 0.82, x: 0 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />
    </>
  );
}

/* ── Security: Red moon night bg ────────────────────────── */
function SecurityBackground() {
  return (
    <>
      {/* Dark sky */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #050505, #0d0000, #050505)' }}
      />
      {/* Moon glow aura */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          width: 'clamp(240px, 32vw, 520px)',
          height: 'clamp(240px, 32vw, 520px)',
          right: 'clamp(-10%, 8%, 12%)',
          top: '12%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,0,0.18) 0%, rgba(180,0,0,0.08) 50%, transparent 70%)',
        }}
      />
      {/* Moon disc */}
      <motion.div
        className="absolute pointer-events-none select-none"
        style={{
          width: 'clamp(140px, 18vw, 280px)',
          height: 'clamp(140px, 18vw, 280px)',
          right: 'clamp(-5%, 10%, 13%)',
          top: '15%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,40,40,0.92) 0%, rgba(200,0,0,0.75) 55%, rgba(120,0,0,0.4) 100%)',
          boxShadow:
            '0 0 80px rgba(255,0,0,0.6), 0 0 160px rgba(255,0,0,0.35), 0 0 280px rgba(200,0,0,0.2)',
        }}
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Subtle red horizon fog */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '35%',
          background: 'linear-gradient(to top, rgba(60,0,0,0.3), transparent)',
        }}
      />
      {/* Matrix scanline accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.015) 2px, rgba(0,255,0,0.015) 4px)',
        }}
      />
    </>
  );
}

/* ── Main HeroSection ───────────────────────────────────── */
export default function HeroSection() {
  const { profile, mode, toggleMode } = useProfile();
  const isBackend = mode === 'backend';

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const nameParts = profile.heroTitle?.split(' ') ?? ['Rishikesh', 'R'];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* z-0 ── Background layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${mode}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {isBackend ? <BackendBackground /> : <SecurityBackground />}
        </motion.div>
      </AnimatePresence>

      {/* z-15 ── Bottom fade into page body */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[15] pointer-events-none"
        style={{ height: '140px', background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}
      />

      {/* z-20 ── Hero content */}
      <div className="relative z-20 section-container text-center w-full pt-24 pb-12 px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7 }}
          >
            {/* Pre-title */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-mono text-xs sm:text-sm md:text-base mb-5 tracking-[0.25em] uppercase text-primary"
            >
              {profile.heroSubtitle}
            </motion.p>

            {/* Name */}
            <h1 className="font-display font-bold mb-6 tracking-tight leading-none"
              style={{ fontSize: 'clamp(2.8rem, 10vw, 8rem)' }}
            >
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="gradient-text"
              >
                {nameParts[0]}
              </motion.span>
              <span style={{ color: 'hsl(var(--foreground))' }}> </span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {nameParts[1]}
              </motion.span>
            </h1>

            {/* Typewriter + mode switch */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mb-10 flex flex-col items-center gap-4"
            >
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl">
                <TypewriterText roles={profile.roles} />
              </div>

              {/* Mode toggle pill */}
              <motion.button
                onClick={toggleMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border transition-all duration-300"
                style={{
                  borderColor: 'hsl(var(--primary) / 0.4)',
                  color: 'hsl(var(--primary))',
                  background: 'hsl(var(--primary) / 0.06)',
                }}
              >
                {mode === 'backend' ? '⚔ Switch to Security Profile' : '⚙ Switch to Backend Profile'}
              </motion.button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
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
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection('about')}
        >
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Scroll
          </span>
          <div className="scroll-indicator" />
        </motion.div>
      </motion.div>
    </section>
  );
}
