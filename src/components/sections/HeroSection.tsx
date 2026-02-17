import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '@/components/ui/AnimatedText';
import MagneticButton from '@/components/ui/MagneticButton';
import { useProfile } from '@/contexts/ProfileContext';

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

/* Animated grid/particle background instead of 3D */
function GridBackground() {
  const { mode } = useProfile();

  const particles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />

      {/* Security mode: scanline effect */}
      {mode === 'security' && (
        <div className="absolute inset-0 matrix-scanline pointer-events-none" />
      )}
    </div>
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <GridBackground />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

      {/* Content */}
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
                className="font-mono text-sm md:text-base text-primary mb-6 tracking-widest uppercase"
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
    className="gradient-text"
  >
    {nameParts[0]}
  </motion.span>

  <span className="text-foreground"> </span>

  <motion.span
    key={profile.heroTitle + "-last"}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="text-foreground"
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
  <div className="text-xl md:text-2xl lg:text-3xl text-muted-foreground">
    <TypewriterText roles={profile.roles} />
  </div>

  <motion.button
    onClick={toggleMode}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.5 }}
    whileHover={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="
      font-mono
      text-xs
      uppercase
      tracking-[0.2em]
      text-muted-foreground
      hover:text-primary
      transition-colors
    "
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
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Scroll
          </span>
          <div className="scroll-indicator" />
        </motion.div>
      </motion.div>
    </section>
  );
}
